/**
 * Check Data Consistency
 * This script checks the consistency between collections
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

console.log('🔍 Checking Data Consistency...');

async function checkDataConsistency() {
  try {
    // Check all collections
    const [itemsSnapshot, storesSnapshot, storeRequestsSnapshot, storeOwnersSnapshot] = await Promise.all([
      db.collection('items').get(),
      db.collection('stores').get(), 
      db.collection('storeRequests').get(),
      db.collection('storeOwners').get()
    ]);

    console.log('\n📊 Collection Sizes:');
    console.log(`Items: ${itemsSnapshot.size}`);
    console.log(`Stores: ${storesSnapshot.size}`);
    console.log(`Store Requests: ${storeRequestsSnapshot.size}`);
    console.log(`Store Owners: ${storeOwnersSnapshot.size}`);

    // Check approved stores in storeRequests
    const approvedStores = [];
    const pendingStores = [];
    
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedStores.push({ id: doc.id, name: data.name, ownerId: data.ownerId });
      } else {
        pendingStores.push({ id: doc.id, name: data.name, status: data.status });
      }
    });

    console.log(`\n✅ Approved Stores: ${approvedStores.length}`);
    approvedStores.forEach(store => {
      console.log(`   - ${store.name} (ID: ${store.id}, Owner: ${store.ownerId})`);
    });

    console.log(`\n⏳ Pending Stores: ${pendingStores.length}`);
    pendingStores.forEach(store => {
      console.log(`   - ${store.name} (ID: ${store.id}, Status: ${store.status})`);
    });

    // Check items and their store references
    const itemStoreRefs = new Set();
    const itemsByStore = {};
    
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      const storeId = data.storeId;
      
      if (storeId) {
        // Handle virtual prefix
        const actualStoreId = storeId.startsWith('virtual_') ? storeId.replace('virtual_', '') : storeId;
        itemStoreRefs.add(actualStoreId);
        
        if (!itemsByStore[actualStoreId]) {
          itemsByStore[actualStoreId] = [];
        }
        itemsByStore[actualStoreId].push({
          id: doc.id,
          name: data.name,
          originalStoreId: storeId
        });
      }
    });

    console.log(`\n📦 Items Analysis:`);
    console.log(`Total Items: ${itemsSnapshot.size}`);
    console.log(`Stores Referenced by Items: ${itemStoreRefs.size}`);

    // Check which item store references exist in storeRequests
    const approvedStoreIds = new Set(approvedStores.map(s => s.id));
    const orphanedItems = [];
    const validItems = [];

    for (const [storeId, items] of Object.entries(itemsByStore)) {
      if (approvedStoreIds.has(storeId)) {
        validItems.push({ storeId, items });
        console.log(`\n   ✅ Store "${storeId}" has ${items.length} items:`);
        items.forEach(item => {
          console.log(`      - ${item.name} (Original storeId: ${item.originalStoreId})`);
        });
      } else {
        orphanedItems.push({ storeId, items });
        console.log(`\n   ❌ Store "${storeId}" NOT FOUND in approved stores, has ${items.length} items:`);
        items.forEach(item => {
          console.log(`      - ${item.name} (Original storeId: ${item.originalStoreId})`);
        });
      }
    }

    // Check stores collection content
    console.log(`\n🏪 Stores Collection Analysis:`);
    if (storesSnapshot.size === 0) {
      console.log('   ℹ️ Stores collection is empty');
    } else {
      storesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - Store: ${data.name || 'Unknown'} (ID: ${doc.id})`);
      });
    }

    // Summary
    console.log(`\n📋 Summary:`);
    console.log(`   ✅ Valid item-store links: ${validItems.length} stores`);
    console.log(`   ❌ Orphaned items: ${orphanedItems.length} store references`);
    console.log(`   📍 Recommendation: ${storesSnapshot.size > 0 ? 'Clean up stores collection' : 'Stores collection is clean'}`);
    
    if (orphanedItems.length > 0) {
      console.log(`\n🔧 Action Required:`);
      console.log(`   - Check if orphaned store IDs should be approved in storeRequests`);
      console.log(`   - Or update item storeIds to point to approved stores`);
    }

  } catch (error) {
    console.error('❌ Failed to check data consistency:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDataConsistency();
