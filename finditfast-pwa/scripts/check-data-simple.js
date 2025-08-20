/**
 * Check Data Consistency (Web SDK Version)
 * This script checks the consistency between collections using Firebase Web SDK
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Use the same Firebase config as your app
const firebaseConfig = {
  apiKey: "AIzaSyBXcNNhpAMGJg7JRKxd8CfQ-mV_8LWVzr4",
  authDomain: "finditfastapp.firebaseapp.com", 
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔍 Checking Data Consistency...');

async function checkDataConsistency() {
  try {
    // Check all collections
    console.log('\n📊 Fetching collection data...');
    
    const [itemsSnapshot, storesSnapshot, storeRequestsSnapshot] = await Promise.all([
      getDocs(collection(db, 'items')),
      getDocs(collection(db, 'stores')), 
      getDocs(collection(db, 'storeRequests'))
    ]);

    console.log('\n📊 Collection Sizes:');
    console.log(`Items: ${itemsSnapshot.size}`);
    console.log(`Stores: ${storesSnapshot.size}`);
    console.log(`Store Requests: ${storeRequestsSnapshot.size}`);

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
          originalStoreId: storeId,
          price: data.price
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
          console.log(`      - ${item.name} ($${item.price}) [Original storeId: ${item.originalStoreId}]`);
        });
      } else {
        orphanedItems.push({ storeId, items });
        console.log(`\n   ❌ Store "${storeId}" NOT FOUND in approved stores, has ${items.length} items:`);
        items.forEach(item => {
          console.log(`      - ${item.name} ($${item.price}) [Original storeId: ${item.originalStoreId}]`);
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
    console.log(`   ✅ Valid item-store links: ${validItems.length} stores with items`);
    console.log(`   ❌ Orphaned items: ${orphanedItems.length} store references`);
    console.log(`   📍 Recommendation: ${storesSnapshot.size > 0 ? 'Clean up stores collection' : 'Stores collection is clean'}`);
    
    // Search readiness check
    console.log(`\n🔍 Search Readiness:`);
    if (approvedStores.length > 0 && validItems.length > 0) {
      console.log(`   ✅ Search should work! Found ${validItems.length} stores with items`);
    } else if (approvedStores.length === 0) {
      console.log(`   ❌ No approved stores found - items won't appear in search`);
    } else if (validItems.length === 0) {
      console.log(`   ❌ No items linked to approved stores - search will return empty`);
    }
    
    if (orphanedItems.length > 0) {
      console.log(`\n🔧 Action Required:`);
      console.log(`   - ${orphanedItems.length} store(s) need to be approved in storeRequests`);
      console.log(`   - Or update item storeIds to point to approved stores`);
      
      // Show which stores need approval
      const storesNeedingApproval = new Set();
      orphanedItems.forEach(group => {
        storesNeedingApproval.add(group.storeId);
      });
      
      console.log(`\n   Stores needing approval:`);
      for (const storeId of storesNeedingApproval) {
        // Check if this store exists in storeRequests but not approved
        const storeRequest = storeRequestsSnapshot.docs.find(doc => doc.id === storeId);
        if (storeRequest) {
          const data = storeRequest.data();
          console.log(`     - ${data.name} (${storeId}) - Status: ${data.status || 'pending'}`);
        } else {
          console.log(`     - Store ${storeId} - NOT FOUND in storeRequests`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to check data consistency:', error.message);
  }
}

// Run the check
checkDataConsistency()
  .then(() => {
    console.log('\n✅ Data consistency check completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
