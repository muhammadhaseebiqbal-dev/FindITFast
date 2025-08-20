import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC_nU-jGqR5EDh_sKWD_0gKCHiYGsIp2fw",
  authDomain: "finditfast-a2e9b.firebaseapp.com",
  projectId: "finditfast-a2e9b",
  storageBucket: "finditfast-a2e9b.firebasestorage.app",
  messagingSenderId: "1029584426649",
  appId: "1:1029584426649:web:c55a17b6e00d68b0c42fb8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function debugFirebaseData() {
  console.log('🔍 Firebase Data Debug - Step by Step Analysis\n');

  try {
    // Step 1: Authenticate
    console.log('1️⃣ Authenticating with Firebase...');
    await signInAnonymously(auth);
    console.log('✅ Authentication successful\n');

    // Step 2: Check all collections
    const collections = ['storeRequests', 'stores', 'items', 'storeOwners', 'storePlans', 'reports'];
    
    for (const collectionName of collections) {
      console.log(`\n📊 === COLLECTION: ${collectionName.toUpperCase()} ===`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        console.log(`📦 Total documents: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
          console.log('📝 Sample documents:');
          
          snapshot.forEach((doc, index) => {
            if (index < 5) { // Show first 5 documents
              const data = doc.data();
              console.log(`\n   Document ID: ${doc.id}`);
              console.log(`   Data:`, JSON.stringify(data, null, 2));
              
              // Special analysis for key collections
              if (collectionName === 'storeRequests') {
                console.log(`   Status: ${data.status || 'NO STATUS'}`);
                console.log(`   Name: ${data.name || 'NO NAME'}`);
                console.log(`   Location: ${data.location ? 'YES' : 'NO'}`);
              }
              
              if (collectionName === 'items') {
                console.log(`   Item Name: ${data.name || 'NO NAME'}`);
                console.log(`   Store ID: ${data.storeId || 'NO STORE ID'}`);
                console.log(`   Category: ${data.category || 'NO CATEGORY'}`);
              }
              
              if (collectionName === 'stores') {
                console.log(`   Store Name: ${data.name || 'NO NAME'}`);
                console.log(`   Owner ID: ${data.ownerId || 'NO OWNER ID'}`);
                console.log(`   Location: ${data.location ? 'YES' : 'NO'}`);
              }
            }
          });
          
          if (snapshot.size > 5) {
            console.log(`   ... and ${snapshot.size - 5} more documents`);
          }
        } else {
          console.log('❌ No documents found in this collection');
        }
        
      } catch (error) {
        console.error(`❌ Error accessing ${collectionName}:`, error.message);
      }
    }

    // Step 3: Specific analysis for storeRequests
    console.log(`\n\n🎯 === DETAILED STORE REQUESTS ANALYSIS ===`);
    try {
      const storeRequestsRef = collection(db, 'storeRequests');
      
      // Check by status
      const statuses = ['pending', 'approved', 'rejected'];
      for (const status of statuses) {
        const statusQuery = query(storeRequestsRef, where('status', '==', status));
        const statusSnapshot = await getDocs(statusQuery);
        console.log(`📊 ${status.toUpperCase()} stores: ${statusSnapshot.size}`);
        
        if (statusSnapshot.size > 0) {
          statusSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.name || 'Unnamed'} (${doc.id})`);
            if (data.location) {
              console.log(`     Location: ${data.location.latitude}, ${data.location.longitude}`);
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in store requests analysis:', error.message);
    }

    // Step 4: Items analysis
    console.log(`\n\n📦 === DETAILED ITEMS ANALYSIS ===`);
    try {
      const itemsRef = collection(db, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      console.log(`📊 Total items: ${itemsSnapshot.size}`);
      
      // Group items by store ID
      const itemsByStore = {};
      itemsSnapshot.forEach(doc => {
        const data = doc.data();
        const storeId = data.storeId || 'NO_STORE_ID';
        
        if (!itemsByStore[storeId]) {
          itemsByStore[storeId] = [];
        }
        itemsByStore[storeId].push({
          id: doc.id,
          name: data.name,
          category: data.category
        });
      });
      
      console.log('\n📊 Items grouped by Store ID:');
      Object.entries(itemsByStore).forEach(([storeId, items]) => {
        console.log(`\n   Store ID: ${storeId}`);
        console.log(`   Items count: ${items.length}`);
        items.slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} (${item.category || 'No category'})`);
        });
        if (items.length > 3) {
          console.log(`     ... and ${items.length - 3} more items`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error in items analysis:', error.message);
    }

    // Step 5: Cross-reference check
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
      
      // Check items that reference approved stores
      const itemsRef = collection(db, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      let itemsInApprovedStores = 0;
      let itemsInNonApprovedStores = 0;
      const virtualStoreItems = [];
      
      itemsSnapshot.forEach(doc => {
        const data = doc.data();
        let storeId = data.storeId;
        
        if (storeId && storeId.startsWith('virtual_')) {
          const cleanStoreId = storeId.replace('virtual_', '');
          virtualStoreItems.push({
            itemId: doc.id,
            itemName: data.name,
            originalStoreId: storeId,
            cleanStoreId: cleanStoreId
          });
          
          if (approvedStoreIds.has(cleanStoreId)) {
            itemsInApprovedStores++;
          } else {
            itemsInNonApprovedStores++;
          }
        } else if (approvedStoreIds.has(storeId)) {
          itemsInApprovedStores++;
        } else {
          itemsInNonApprovedStores++;
        }
      });
      
      console.log(`\n📊 Items cross-reference results:`);
      console.log(`   ✅ Items in approved stores: ${itemsInApprovedStores}`);
      console.log(`   ❌ Items in non-approved stores: ${itemsInNonApprovedStores}`);
      console.log(`   🔄 Items with virtual_ prefix: ${virtualStoreItems.length}`);
      
      if (virtualStoreItems.length > 0) {
        console.log(`\n🔄 Virtual store items analysis:`);
        virtualStoreItems.slice(0, 5).forEach(item => {
          const isApproved = approvedStoreIds.has(item.cleanStoreId);
          console.log(`   - "${item.itemName}"`);
          console.log(`     Original: ${item.originalStoreId}`);
          console.log(`     Clean: ${item.cleanStoreId}`);
          console.log(`     Approved: ${isApproved ? '✅' : '❌'}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error in cross-reference check:', error.message);
    }

    // Step 6: Search simulation
    console.log(`\n\n🔍 === SEARCH SIMULATION ===`);
    try {
      const searchTerms = ['watch', 'phone', 'laptop', 'book', 'test'];
      
      for (const term of searchTerms) {
        console.log(`\n🔍 Simulating search for "${term}":`);
        
        const itemsRef = collection(db, 'items');
        const itemsSnapshot = await getDocs(itemsRef);
        
        const matchingItems = [];
        itemsSnapshot.forEach(doc => {
          const data = doc.data();
          const searchableText = `${data.name || ''} ${data.category || ''} ${data.description || ''}`.toLowerCase();
          
          if (searchableText.includes(term.toLowerCase())) {
            matchingItems.push({
              id: doc.id,
              name: data.name,
              storeId: data.storeId,
              category: data.category
            });
          }
        });
        
        console.log(`   Found ${matchingItems.length} items matching "${term}"`);
        matchingItems.slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} in store ${item.storeId}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error in search simulation:', error.message);
    }

    console.log(`\n\n✅ Firebase data debug completed!`);
    console.log(`\n💡 Summary:`);
    console.log(`   - Check if you have approved stores in storeRequests`);
    console.log(`   - Verify items reference correct store IDs`);
    console.log(`   - Look for virtual_ prefixes that need cleaning`);
    console.log(`   - Ensure search terms match your item names/categories`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the debug
debugFirebaseData().catch(console.error);
