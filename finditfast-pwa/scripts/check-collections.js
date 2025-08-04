/**
 * Simple Firestore Data Check
 * Check what collections exist without authentication requirements
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: "finditfastapp.firebaseapp.com",
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.firebasestorage.app",
  messagingSenderId: "120028303360",
  appId: "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('🔍 Checking Firestore Collections...');

async function checkCollections() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Test reading stores (should be allowed per rules)
    try {
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      console.log(`✅ Stores: ${storesSnapshot.size} documents`);
      
      if (storesSnapshot.size > 0) {
        storesSnapshot.forEach(doc => {
          console.log(`   - Store: ${doc.data().name} (${doc.id})`);
        });
      }
    } catch (error) {
      console.log(`❌ Error reading stores: ${error.code}`);
    }
    
    // Test reading items (should be allowed per rules)
    try {
      const itemsSnapshot = await getDocs(collection(db, 'items'));
      console.log(`✅ Items: ${itemsSnapshot.size} documents`);
      
      if (itemsSnapshot.size > 0) {
        let count = 0;
        itemsSnapshot.forEach(doc => {
          if (count < 3) { // Show first 3
            console.log(`   - Item: ${doc.data().name} ($${doc.data().price})`);
            count++;
          }
        });
        if (itemsSnapshot.size > 3) {
          console.log(`   ... and ${itemsSnapshot.size - 3} more items`);
        }
      }
    } catch (error) {
      console.log(`❌ Error reading items: ${error.code}`);
    }
    
    // Test reading owners (this might fail due to rules)
    try {
      const ownersSnapshot = await getDocs(collection(db, 'owners'));
      console.log(`✅ Owners: ${ownersSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Error reading owners: ${error.code}`);
    }
    
    // Test reading storeOwners (this is what the rules expect)
    try {
      const storeOwnersSnapshot = await getDocs(collection(db, 'storeOwners'));
      console.log(`✅ StoreOwners: ${storeOwnersSnapshot.size} documents`);
    } catch (error) {
      console.log(`❌ Error reading storeOwners: ${error.code}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to check collections:', error.message);
  }
}

checkCollections();
