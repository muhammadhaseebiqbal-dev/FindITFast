import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

// Firebase config - replace with your actual config
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

async function testLocationBasedSearch() {
  console.log('🧪 Testing Location-Based Search Functionality...\n');

  try {
    // Step 1: Check approved stores
    console.log('1️⃣ Checking approved stores from storeRequests...');
    const storeRequestsRef = collection(db, 'storeRequests');
    const approvedStoresQuery = query(storeRequestsRef, where('status', '==', 'approved'));
    const approvedStoresSnapshot = await getDocs(approvedStoresQuery);
    
    console.log(`✅ Found ${approvedStoresSnapshot.size} approved stores:`);
    const approvedStores = [];
    approvedStoresSnapshot.forEach(doc => {
      const store = { id: doc.id, ...doc.data() };
      approvedStores.push(store);
      console.log(`   - ${store.name} (${store.id}) at ${store.address}`);
      if (store.location) {
        console.log(`     Location: ${store.location.latitude}, ${store.location.longitude}`);
      }
    });

    if (approvedStores.length === 0) {
      console.log('❌ No approved stores found. Need at least one approved store to test search.');
      return;
    }

    // Step 2: Check items that reference these stores
    console.log('\n2️⃣ Checking items in approved stores...');
    const itemsRef = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    
    const itemsInApprovedStores = [];
    itemsSnapshot.forEach(doc => {
      const item = { id: doc.id, ...doc.data() };
      
      // Clean store ID (remove virtual_ prefix)
      let storeId = item.storeId;
      if (storeId && storeId.startsWith('virtual_')) {
        storeId = storeId.replace('virtual_', '');
      }
      
      // Check if item is in an approved store
      const approvedStore = approvedStores.find(store => store.id === storeId);
      if (approvedStore) {
        itemsInApprovedStores.push({
          ...item,
          cleanStoreId: storeId,
          storeName: approvedStore.name
        });
        console.log(`   ✅ "${item.name}" in ${approvedStore.name} (${storeId})`);
      } else {
        console.log(`   ❌ "${item.name}" in non-approved store (${item.storeId})`);
      }
    });

    console.log(`\n📊 Summary: ${itemsInApprovedStores.length} items found in ${approvedStores.length} approved stores`);

    // Step 3: Test search scenarios
    console.log('\n3️⃣ Testing search scenarios...');
    
    const searchTerms = ['watch', 'phone', 'laptop', 'book'];
    
    for (const term of searchTerms) {
      console.log(`\n🔍 Searching for "${term}":`);
      
      const matchingItems = itemsInApprovedStores.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(term.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(term.toLowerCase()))
      );
      
      if (matchingItems.length > 0) {
        console.log(`   ✅ Found ${matchingItems.length} matching items:`);
        matchingItems.forEach(item => {
          console.log(`      - ${item.name} in ${item.storeName}`);
        });
      } else {
        console.log(`   ❌ No items found for "${term}"`);
      }
    }

    // Step 4: Test distance calculation simulation
    console.log('\n4️⃣ Testing distance calculation...');
    const userLocation = { latitude: 40.7128, longitude: -74.0060 }; // NYC coordinates
    
    console.log(`User location: ${userLocation.latitude}, ${userLocation.longitude}`);
    
    const storesWithDistance = approvedStores
      .filter(store => store.location && store.location.latitude && store.location.longitude)
      .map(store => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.location.latitude,
          store.location.longitude
        );
        return { ...store, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    console.log('Stores sorted by distance:');
    storesWithDistance.forEach(store => {
      console.log(`   ${store.name}: ${store.distance.toFixed(2)} km`);
    });

    console.log('\n✅ Location-based search test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Distance calculation function (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

// Run the test
testLocationBasedSearch().catch(console.error);
