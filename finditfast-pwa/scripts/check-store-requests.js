/**
 * Check Store Requests Collection
 * This script checks what store requests exist in the database
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

console.log('🔍 Checking Store Requests Collection...');

async function checkStoreRequests() {
  try {
    // Check storeRequests collection
    const storeRequestsSnapshot = await db.collection('storeRequests').get();
    console.log(`✅ StoreRequests: ${storeRequestsSnapshot.size} documents`);
    
    if (storeRequestsSnapshot.size > 0) {
      storeRequestsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Store Request: ${data.name || 'Unknown'} | Status: ${data.status || 'Unknown'} | ID: ${doc.id}`);
        console.log(`     Owner ID: ${data.ownerId || 'Unknown'}`);
        if (data.address) console.log(`     Address: ${data.address}`);
      });
    }

    // Also check if there are any stores with virtual_ prefix in stores collection
    const storesSnapshot = await db.collection('stores').get();
    console.log(`\n✅ Stores: ${storesSnapshot.size} documents`);
    
    if (storesSnapshot.size > 0) {
      storesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Store: ${data.name || 'Unknown'} | ID: ${doc.id}`);
      });
    }

    // Check for the specific store ID from the item (without virtual prefix)
    const actualStoreId = 'BH0EzH7YqEMmWJbETerJ';
    const virtualStoreId = 'virtual_BH0EzH7YqEMmWJbETerJ';
    
    // Check in storeRequests with actual ID
    const storeRequestDoc = await db.collection('storeRequests').doc(actualStoreId).get();
    if (storeRequestDoc.exists) {
      console.log(`\n🎯 Found store in storeRequests: ${actualStoreId}`);
      console.log('   Data:', storeRequestDoc.data());
    } else {
      console.log(`\n❌ Store ${actualStoreId} not found in storeRequests`);
    }
    
    // Check in storeRequests with virtual ID
    const virtualStoreRequestDoc = await db.collection('storeRequests').doc(virtualStoreId).get();
    if (virtualStoreRequestDoc.exists) {
      console.log(`\n🎯 Found virtual store in storeRequests: ${virtualStoreId}`);
      console.log('   Data:', virtualStoreRequestDoc.data());
    } else {
      console.log(`\n❌ Virtual store ${virtualStoreId} not found in storeRequests`);
    }

    // Check in stores
    const virtualStoreDoc = await db.collection('stores').doc(virtualStoreId).get();
    if (virtualStoreDoc.exists) {
      console.log(`\n🎯 Found virtual store in stores: ${virtualStoreId}`);
      console.log('   Data:', virtualStoreDoc.data());
    } else {
      console.log(`\n❌ Virtual store ${virtualStoreId} not found in stores`);
    }

  } catch (error) {
    console.error('❌ Failed to check store requests:', error.message);
  } finally {
    process.exit(0);
  }
}

checkStoreRequests();
