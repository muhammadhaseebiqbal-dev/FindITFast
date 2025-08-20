/**
 * Fix Data Consistency
 * This script ensures all collections are properly linked and consistent
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

console.log('🔧 Fixing Data Consistency...');

async function fixDataConsistency() {
  try {
    // 1. Check which stores should be approved
    console.log('\n1️⃣ Checking Store Requests...');
    const storeRequestsSnapshot = await db.collection('storeRequests').get();
    
    let approvedCount = 0;
    let pendingCount = 0;
    
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedCount++;
        console.log(`   ✅ Approved: ${data.name} (${doc.id})`);
      } else {
        pendingCount++;
        console.log(`   ⏳ Pending: ${data.name} (${doc.id}) - Status: ${data.status || 'unknown'}`);
      }
    });
    
    console.log(`\n   Summary: ${approvedCount} approved, ${pendingCount} pending`);

    // 2. Check items and their store references
    console.log('\n2️⃣ Checking Item-Store Links...');
    const itemsSnapshot = await db.collection('items').get();
    const approvedStoreIds = [];
    
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedStoreIds.push(doc.id);
      }
    });
    
    let validLinks = 0;
    let invalidLinks = 0;
    const itemsToFix = [];
    
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      let storeId = data.storeId;
      
      // Handle virtual prefix
      if (storeId && storeId.startsWith('virtual_')) {
        storeId = storeId.replace('virtual_', '');
      }
      
      if (approvedStoreIds.includes(storeId)) {
        validLinks++;
        console.log(`   ✅ Item "${data.name}" → Store "${storeId}" (VALID)`);
      } else {
        invalidLinks++;
        console.log(`   ❌ Item "${data.name}" → Store "${storeId}" (INVALID - store not approved)`);
        itemsToFix.push({
          itemId: doc.id,
          itemName: data.name,
          currentStoreId: data.storeId,
          cleanStoreId: storeId
        });
      }
    });
    
    console.log(`\n   Summary: ${validLinks} valid links, ${invalidLinks} invalid links`);

    // 3. Fix virtual store IDs in items
    if (itemsToFix.length > 0) {
      console.log('\n3️⃣ Fixing Virtual Store IDs...');
      const batch = db.batch();
      let fixedCount = 0;
      
      for (const item of itemsToFix) {
        if (item.currentStoreId.startsWith('virtual_')) {
          // Remove virtual prefix
          const itemRef = db.collection('items').doc(item.itemId);
          batch.update(itemRef, { storeId: item.cleanStoreId });
          console.log(`   🔧 Fixing "${item.itemName}": ${item.currentStoreId} → ${item.cleanStoreId}`);
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`   ✅ Fixed ${fixedCount} items with virtual store IDs`);
      }
    }

    // 4. Check if stores collection should be cleaned
    console.log('\n4️⃣ Checking Stores Collection...');
    const storesSnapshot = await db.collection('stores').get();
    
    if (storesSnapshot.size > 0) {
      console.log(`   Found ${storesSnapshot.size} documents in stores collection`);
      storesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name || 'Unknown'} (${doc.id})`);
      });
      
      console.log('\n   ⚠️  Recommendation: Consider cleaning up stores collection');
      console.log('      The search service now uses only approved stores from storeRequests');
    } else {
      console.log('   ✅ Stores collection is empty (good!)');
    }

    // 5. Final verification
    console.log('\n5️⃣ Final Verification...');
    const updatedItemsSnapshot = await db.collection('items').get();
    let remainingVirtual = 0;
    let totalItems = 0;
    
    updatedItemsSnapshot.forEach(doc => {
      const data = doc.data();
      totalItems++;
      if (data.storeId && data.storeId.startsWith('virtual_')) {
        remainingVirtual++;
      }
    });
    
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Items with virtual_ prefix: ${remainingVirtual}`);
    console.log(`   Approved stores available: ${approvedCount}`);
    
    if (remainingVirtual === 0 && approvedCount > 0) {
      console.log('\n🎉 Data consistency check completed successfully!');
      console.log('   - All items reference clean store IDs');
      console.log('   - Approved stores are available for search');
      console.log('   - Search service should now work correctly');
    } else {
      console.log('\n⚠️  Issues remaining:');
      if (remainingVirtual > 0) {
        console.log(`   - ${remainingVirtual} items still have virtual_ prefix`);
      }
      if (approvedCount === 0) {
        console.log('   - No approved stores available');
      }
    }

  } catch (error) {
    console.error('❌ Failed to fix data consistency:', error.message);
  } finally {
    process.exit(0);
  }
}

fixDataConsistency();
