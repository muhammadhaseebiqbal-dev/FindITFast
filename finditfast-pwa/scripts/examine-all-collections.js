import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Firebase config from your project
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

async function examineCollection(collectionName) {
  console.log(`\n📁 EXAMINING COLLECTION: ${collectionName.toUpperCase()}`);
  console.log('=' + '='.repeat(50));
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`❌ Collection '${collectionName}' is empty or doesn't exist`);
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} documents in '${collectionName}' collection:`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Document ${index + 1}: ${doc.id}`);
      console.log('   Data:', JSON.stringify(data, null, 2).replace(/\n/g, '\n   '));
    });
    
  } catch (error) {
    console.error(`❌ Error examining collection '${collectionName}':`, error.message);
  }
}

async function examineAllCollections() {
  console.log('🔍 COMPREHENSIVE FIREBASE DATA EXAMINATION');
  console.log('==========================================');
  console.log('📅 Date:', new Date().toLocaleString());
  
  // List of collections to examine based on your screenshot
  const collections = [
    'items',
    'reports', 
    'storeOwners',
    'storePlans',
    'storeRequests',
    'stores'
  ];
  
  for (const collectionName of collections) {
    await examineCollection(collectionName);
  }
  
  // Summary
  console.log('\n🎯 SEARCH ANALYSIS SUMMARY');
  console.log('=' + '='.repeat(30));
  
  try {
    // Check storeRequests for approved stores
    const storeRequestsRef = collection(db, 'storeRequests');
    const storeRequestsSnapshot = await getDocs(storeRequestsRef);
    
    let approvedStores = 0;
    let pendingStores = 0;
    let rejectedStores = 0;
    
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') approvedStores++;
      else if (data.status === 'pending') pendingStores++;
      else if (data.status === 'rejected') rejectedStores++;
    });
    
    console.log(`📈 Store Status Summary:`);
    console.log(`   ✅ Approved: ${approvedStores}`);
    console.log(`   ⏳ Pending: ${pendingStores}`);
    console.log(`   ❌ Rejected: ${rejectedStores}`);
    
    // Check items and their store references
    const itemsRef = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    
    let itemsWithValidStores = 0;
    let itemsWithInvalidStores = 0;
    const storeIds = new Set();
    
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.storeId) {
        storeIds.add(data.storeId);
        // For now, just count all items as we'll validate store references separately
        itemsWithValidStores++;
      } else {
        itemsWithInvalidStores++;
      }
    });
    
    console.log(`\n📦 Items Summary:`);
    console.log(`   📋 Total Items: ${itemsSnapshot.size}`);
    console.log(`   ✅ Items with Store ID: ${itemsWithValidStores}`);
    console.log(`   ❌ Items without Store ID: ${itemsWithInvalidStores}`);
    console.log(`   🏪 Unique Store IDs referenced: ${storeIds.size}`);
    
    // List all unique store IDs
    console.log(`\n🔗 Store IDs referenced by items:`);
    Array.from(storeIds).forEach(storeId => {
      console.log(`   - ${storeId}`);
    });
    
    // Check if referenced store IDs exist in storeRequests
    console.log(`\n🔍 Validating Store References:`);
    const storeRequestIds = new Set();
    storeRequestsSnapshot.forEach(doc => {
      storeRequestIds.add(doc.id);
    });
    
    Array.from(storeIds).forEach(storeId => {
      const cleanStoreId = storeId.startsWith('virtual_') ? storeId.replace('virtual_', '') : storeId;
      if (storeRequestIds.has(cleanStoreId)) {
        console.log(`   ✅ ${storeId} → Found in storeRequests`);
      } else {
        console.log(`   ❌ ${storeId} → NOT found in storeRequests`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error in summary analysis:', error);
  }
  
  console.log('\n✅ Examination completed!');
}

// Run the examination
examineAllCollections().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
