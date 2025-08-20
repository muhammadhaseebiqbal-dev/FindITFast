import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAh2s9XSTiamCOYJx_RA1lEhZoAq8iAAgs",
  authDomain: "finditfast-pwa.firebaseapp.com",
  databaseURL: "https://finditfast-pwa-default-rtdb.firebaseio.com",
  projectId: "finditfast-pwa",
  storageBucket: "finditfast-pwa.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAllCollections() {
  console.log('=== CHECKING ALL COLLECTIONS ===\n');

  // Check items collection
  try {
    console.log('📦 ITEMS COLLECTION:');
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    if (itemsSnapshot.empty) {
      console.log('  No items found');
    } else {
      itemsSnapshot.forEach(doc => {
        console.log(`  Item ID: ${doc.id}`);
        const data = doc.data();
        console.log(`  Data:`, JSON.stringify(data, null, 4));
        console.log('  ---');
      });
    }
  } catch (error) {
    console.log('  Error accessing items:', error.message);
  }

  // Check stores collection
  try {
    console.log('\n🏪 STORES COLLECTION:');
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    if (storesSnapshot.empty) {
      console.log('  No stores found');
    } else {
      storesSnapshot.forEach(doc => {
        console.log(`  Store ID: ${doc.id}`);
        const data = doc.data();
        console.log(`  Data:`, JSON.stringify(data, null, 4));
        console.log('  ---');
      });
    }
  } catch (error) {
    console.log('  Error accessing stores:', error.message);
  }

  // Check storeRequests collection
  try {
    console.log('\n📋 STORE REQUESTS COLLECTION:');
    const storeRequestsSnapshot = await getDocs(collection(db, 'storeRequests'));
    if (storeRequestsSnapshot.empty) {
      console.log('  No store requests found');
    } else {
      storeRequestsSnapshot.forEach(doc => {
        console.log(`  Store Request ID: ${doc.id}`);
        const data = doc.data();
        console.log(`  Data:`, JSON.stringify(data, null, 4));
        console.log('  ---');
      });
    }
  } catch (error) {
    console.log('  Error accessing storeRequests:', error.message);
  }

  // Check storeOwners collection
  try {
    console.log('\n👤 STORE OWNERS COLLECTION:');
    const storeOwnersSnapshot = await getDocs(collection(db, 'storeOwners'));
    if (storeOwnersSnapshot.empty) {
      console.log('  No store owners found');
    } else {
      storeOwnersSnapshot.forEach(doc => {
        console.log(`  Store Owner ID: ${doc.id}`);
        const data = doc.data();
        console.log(`  Data:`, JSON.stringify(data, null, 4));
        console.log('  ---');
      });
    }
  } catch (error) {
    console.log('  Error accessing storeOwners:', error.message);
  }
}

checkAllCollections().catch(console.error);
