/**
 * Approve Store Requests
 * This script helps approve pending store requests
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://finditfastapp.firebaseio.com'
});

const db = admin.firestore();

console.log('✅ Store Request Approval Tool...');

async function approveStoreRequests() {
  try {
    // Get all pending store requests
    const storeRequestsSnapshot = await db.collection('storeRequests').get();
    
    const pendingStores = [];
    const approvedStores = [];
    
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedStores.push({ id: doc.id, name: data.name });
      } else {
        pendingStores.push({ id: doc.id, name: data.name, status: data.status || 'pending' });
      }
    });
    
    console.log(`\n📊 Current Status:`);
    console.log(`   Approved stores: ${approvedStores.length}`);
    console.log(`   Pending stores: ${pendingStores.length}`);
    
    if (approvedStores.length > 0) {
      console.log(`\n✅ Approved Stores:`);
      approvedStores.forEach(store => {
        console.log(`   - ${store.name} (${store.id})`);
      });
    }
    
    if (pendingStores.length > 0) {
      console.log(`\n⏳ Pending Stores:`);
      pendingStores.forEach(store => {
        console.log(`   - ${store.name} (${store.id}) - Status: ${store.status}`);
      });
      
      // Auto-approve all pending stores (you can modify this logic)
      console.log(`\n🔧 Auto-approving all pending stores...`);
      const batch = db.batch();
      
      for (const store of pendingStores) {
        const storeRef = db.collection('storeRequests').doc(store.id);
        batch.update(storeRef, { 
          status: 'approved',
          approvedAt: admin.firestore.Timestamp.now(),
          approvedBy: 'admin-script'
        });
        console.log(`   ✅ Approving: ${store.name}`);
      }
      
      await batch.commit();
      console.log(`\n🎉 Successfully approved ${pendingStores.length} stores!`);
    } else {
      console.log(`\n✅ No pending stores to approve`);
    }
    
    // Final status check
    const finalSnapshot = await db.collection('storeRequests').get();
    let finalApproved = 0;
    let finalPending = 0;
    
    finalSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        finalApproved++;
      } else {
        finalPending++;
      }
    });
    
    console.log(`\n📊 Final Status:`);
    console.log(`   Approved stores: ${finalApproved}`);
    console.log(`   Pending stores: ${finalPending}`);
    
  } catch (error) {
    console.error('❌ Failed to approve store requests:', error.message);
  } finally {
    process.exit(0);
  }
}

approveStoreRequests();
