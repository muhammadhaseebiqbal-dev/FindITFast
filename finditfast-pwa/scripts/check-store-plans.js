import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrKMaXKhUYLqSSKa6ZKyPWiNhLBePSWRs",
  authDomain: "finditfastapp.firebaseapp.com",
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.firebasestorage.app",
  messagingSenderId: "1027992994128",
  appId: "1:1027992994128:web:c42b66b8421c27e1c5e6ee",
  measurementId: "G-XMGXBF7VVN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStorePlans() {
  try {
    console.log('🔍 Checking store plans...');
    
    // Get all store plans
    const storePlansSnapshot = await getDocs(collection(db, 'storePlans'));
    console.log(`📊 Total store plans: ${storePlansSnapshot.size}`);
    
    if (storePlansSnapshot.size > 0) {
      console.log('\n📋 Store Plans Details:');
      storePlansSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  Plan ID: ${doc.id}`);
        console.log(`  Store ID: ${data.storeId}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Type: ${data.type}`);
        console.log(`  Active: ${data.isActive}`);
        console.log(`  Size: ${data.size} bytes`);
        console.log('  ---');
      });
    }
    
    // Get all store requests to see which stores exist
    console.log('\n🏪 Checking store requests...');
    const storeRequestsSnapshot = await getDocs(collection(db, 'storeRequests'));
    console.log(`📊 Total store requests: ${storeRequestsSnapshot.size}`);
    
    const approvedStores = [];
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedStores.push({
          id: doc.id,
          name: data.name,
          address: data.address
        });
      }
    });
    
    console.log(`\n✅ Approved stores: ${approvedStores.length}`);
    approvedStores.forEach(store => {
      console.log(`  ${store.name} (ID: ${store.id}) - ${store.address}`);
    });
    
    // Check which stores have plans
    console.log('\n🗺️ Store Plan Coverage:');
    const storePlansData = [];
    storePlansSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.isActive) {
        storePlansData.push(data.storeId);
      }
    });
    
    approvedStores.forEach(store => {
      const hasFloorplan = storePlansData.includes(store.id);
      console.log(`  ${store.name}: ${hasFloorplan ? '✅ Has floorplan' : '❌ No floorplan'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking store plans:', error);
  }
}

checkStorePlans();
