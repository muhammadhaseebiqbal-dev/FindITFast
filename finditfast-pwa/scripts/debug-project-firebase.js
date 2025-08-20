// Debug Firebase data by copying the configuration from the project
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Copy the Firebase config from the project's firebase.ts file
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEF123456"
};

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '***configured***' : 'NOT SET'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugProjectFirebaseData() {
  console.log('🔍 Project Firebase Data Debug - Step by Step Analysis\n');

  try {
    // Step 1: Check all collections using the project's Firebase config
    const collections = ['storeRequests', 'stores', 'items', 'storeOwners', 'storePlans', 'reports'];
    
    for (const collectionName of collections) {
      console.log(`\n📊 === COLLECTION: ${collectionName.toUpperCase()} ===`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        console.log(`📦 Total documents: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
          console.log('📝 Sample documents:');
          
          let docCount = 0;
          snapshot.forEach((doc) => {
            if (docCount < 3) { // Show first 3 documents
              const data = doc.data();
              console.log(`\n   Document ID: ${doc.id}`);
              
              // Show key fields based on collection
              if (collectionName === 'storeRequests') {
                console.log(`   Name: ${data.name || 'NO NAME'}`);
                console.log(`   Status: ${data.status || 'NO STATUS'}`);
                console.log(`   Address: ${data.address || 'NO ADDRESS'}`);
                console.log(`   Location: ${data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'NO LOCATION'}`);
                console.log(`   Owner ID: ${data.ownerId || 'NO OWNER ID'}`);
              }
              
              if (collectionName === 'items') {
                console.log(`   Name: ${data.name || 'NO NAME'}`);
                console.log(`   Category: ${data.category || 'NO CATEGORY'}`);
                console.log(`   Store ID: ${data.storeId || 'NO STORE ID'}`);
                console.log(`   Description: ${data.description || 'NO DESCRIPTION'}`);
                console.log(`   Price: ${data.price || 'NO PRICE'}`);
              }
              
              if (collectionName === 'stores') {
                console.log(`   Name: ${data.name || 'NO NAME'}`);
                console.log(`   Owner ID: ${data.ownerId || 'NO OWNER ID'}`);
                console.log(`   Address: ${data.address || 'NO ADDRESS'}`);
                console.log(`   Location: ${data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'NO LOCATION'}`);
              }
              
              if (collectionName === 'storeOwners') {
                console.log(`   Name: ${data.name || 'NO NAME'}`);
                console.log(`   Email: ${data.email || 'NO EMAIL'}`);
                console.log(`   Firebase UID: ${data.firebaseUid || 'NO FIREBASE UID'}`);
              }
              
              docCount++;
            }
          });
          
          if (snapshot.size > 3) {
            console.log(`   ... and ${snapshot.size - 3} more documents`);
          }
        } else {
          console.log('❌ Collection is empty');
        }
        
      } catch (error) {
        console.error(`❌ Error accessing ${collectionName}:`, error.message);
      }
    }

    // Step 2: Focus on storeRequests with status breakdown
    console.log(`\n\n🎯 === STORE REQUESTS STATUS BREAKDOWN ===`);
    try {
      const storeRequestsRef = collection(db, 'storeRequests');
      const allStoreRequests = await getDocs(storeRequestsRef);
      
      console.log(`📊 Total store requests: ${allStoreRequests.size}`);
      
      if (allStoreRequests.size > 0) {
        const statusCount = { pending: 0, approved: 0, rejected: 0, other: 0 };
        const storesByStatus = { pending: [], approved: [], rejected: [], other: [] };
        
        allStoreRequests.forEach(doc => {
          const data = doc.data();
          const status = data.status || 'other';
          
          if (statusCount.hasOwnProperty(status)) {
            statusCount[status]++;
            storesByStatus[status].push({
              id: doc.id,
              name: data.name || 'Unnamed',
              address: data.address || 'No address',
              location: data.location
            });
          } else {
            statusCount.other++;
            storesByStatus.other.push({
              id: doc.id,
              name: data.name || 'Unnamed',
              status: status
            });
          }
        });
        
        console.log('\n📊 Status breakdown:');
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`   ${status.toUpperCase()}: ${count}`);
        });
        
        // Show approved stores in detail
        if (storesByStatus.approved.length > 0) {
          console.log('\n✅ APPROVED STORES:');
          storesByStatus.approved.forEach(store => {
            console.log(`   - ${store.name} (${store.id})`);
            console.log(`     Address: ${store.address}`);
            if (store.location) {
              console.log(`     Location: ${store.location.latitude}, ${store.location.longitude}`);
            }
          });
        } else {
          console.log('\n❌ NO APPROVED STORES FOUND!');
          console.log('   This is likely why search returns no results.');
        }
        
        // Show pending stores
        if (storesByStatus.pending.length > 0) {
          console.log('\n⏳ PENDING STORES:');
          storesByStatus.pending.slice(0, 3).forEach(store => {
            console.log(`   - ${store.name} (${store.id})`);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error analyzing store requests:', error.message);
    }

    // Step 3: Items analysis with store ID mapping
    console.log(`\n\n📦 === ITEMS ANALYSIS ===`);
    try {
      const itemsRef = collection(db, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      console.log(`📊 Total items: ${itemsSnapshot.size}`);
      
      if (itemsSnapshot.size > 0) {
        const itemsByStore = {};
        const searchableItems = [];
        
        itemsSnapshot.forEach(doc => {
          const data = doc.data();
          const storeId = data.storeId || 'NO_STORE_ID';
          
          // Group by store
          if (!itemsByStore[storeId]) {
            itemsByStore[storeId] = [];
          }
          itemsByStore[storeId].push({
            id: doc.id,
            name: data.name || 'Unnamed item',
            category: data.category || 'No category',
            description: data.description || ''
          });
          
          // Add to searchable items
          searchableItems.push({
            id: doc.id,
            name: data.name || '',
            category: data.category || '',
            description: data.description || '',
            storeId: storeId
          });
        });
        
        console.log('\n📊 Items by Store ID:');
        Object.entries(itemsByStore).forEach(([storeId, items]) => {
          const cleanStoreId = storeId.startsWith('virtual_') ? storeId.replace('virtual_', '') : storeId;
          console.log(`\n   Store ID: ${storeId}`);
          if (storeId.startsWith('virtual_')) {
            console.log(`   Clean ID: ${cleanStoreId}`);
          }
          console.log(`   Items: ${items.length}`);
          items.slice(0, 2).forEach(item => {
            console.log(`     - ${item.name} (${item.category})`);
          });
        });
        
        // Test search for common terms
        console.log('\n\n🔍 SEARCH TEST:');
        const searchTerms = ['watch', 'phone', 'laptop', 'book', 'test', 'item'];
        
        searchTerms.forEach(term => {
          const matches = searchableItems.filter(item => {
            const searchText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
            return searchText.includes(term.toLowerCase());
          });
          
          console.log(`\n   "${term}": ${matches.length} matches`);
          matches.slice(0, 2).forEach(match => {
            console.log(`     - ${match.name} in store ${match.storeId}`);
          });
        });
      }
      
    } catch (error) {
      console.error('❌ Error analyzing items:', error.message);
    }

    // Step 4: Cross-reference check
    console.log(`\n\n🔗 === CROSS-REFERENCE CHECK ===`);
    try {
      // Get approved stores
      const storeRequestsRef = collection(db, 'storeRequests');
      const approvedQuery = query(storeRequestsRef, where('status', '==', 'approved'));
      const approvedSnapshot = await getDocs(approvedQuery);
      
      const approvedStoreIds = new Set();
      approvedSnapshot.forEach(doc => {
        approvedStoreIds.add(doc.id);
      });
      
      console.log(`✅ Approved store IDs: [${Array.from(approvedStoreIds).join(', ')}]`);
      
      if (approvedStoreIds.size === 0) {
        console.log('\n❌ CRITICAL ISSUE: No approved stores found!');
        console.log('   This explains why search returns no results.');
        console.log('   You need to approve at least one store in storeRequests collection.');
        return;
      }
      
      // Check items that reference approved stores
      const itemsRef = collection(db, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      let itemsInApprovedStores = 0;
      let itemsInPendingStores = 0;
      
      console.log('\n📊 Item-Store mapping:');
      itemsSnapshot.forEach(doc => {
        const data = doc.data();
        let storeId = data.storeId;
        
        // Clean virtual_ prefix
        if (storeId && storeId.startsWith('virtual_')) {
          storeId = storeId.replace('virtual_', '');
        }
        
        if (approvedStoreIds.has(storeId)) {
          itemsInApprovedStores++;
          console.log(`   ✅ "${data.name}" → Approved store (${storeId})`);
        } else {
          itemsInPendingStores++;
          console.log(`   ⏳ "${data.name}" → Non-approved store (${data.storeId})`);
        }
      });
      
      console.log(`\n📊 Final tally:`);
      console.log(`   ✅ Items in approved stores: ${itemsInApprovedStores}`);
      console.log(`   ⏳ Items in non-approved stores: ${itemsInPendingStores}`);
      
      if (itemsInApprovedStores === 0) {
        console.log('\n❌ CRITICAL ISSUE: No items found in approved stores!');
        console.log('   This is why search returns "No Items Found".');
        console.log('   Either approve more stores or add items to approved stores.');
      }
      
    } catch (error) {
      console.error('❌ Error in cross-reference check:', error.message);
    }

    console.log(`\n\n✅ Debug analysis completed!`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the debug
debugProjectFirebaseData().catch(console.error);
