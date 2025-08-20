/**
 * Migrate Store to StoreRequests
 * This script moves stores from the stores collection to storeRequests with approved status
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

console.log('🔄 Migrating Stores to StoreRequests...');

async function migrateStores() {
  try {
    // Get all stores from stores collection
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    
    console.log(`Found ${storesSnapshot.size} stores in stores collection`);
    
    if (storesSnapshot.size === 0) {
      console.log('No stores to migrate');
      return;
    }

    // Migrate each store
    for (const storeDoc of storesSnapshot.docs) {
      const storeData = storeDoc.data();
      let storeId = storeDoc.id;
      
      // Remove virtual_ prefix if present
      if (storeId.startsWith('virtual_')) {
        storeId = storeId.replace('virtual_', '');
      }
      
      console.log(`\n🔄 Migrating store: ${storeData.name || 'Unknown'}`);
      console.log(`   Original ID: ${storeDoc.id}`);
      console.log(`   New ID: ${storeId}`);
      
      // Create the store request with approved status
      const storeRequestData = {
        ...storeData,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'migration-script',
        migratedFrom: 'stores-collection'
      };
      
      // Add to storeRequests collection
      await setDoc(doc(db, 'storeRequests', storeId), storeRequestData);
      console.log(`   ✅ Added to storeRequests with ID: ${storeId}`);
      
      // Note: We're not deleting from stores collection yet for safety
      // You can do this manually later if needed
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('📝 Next steps:');
    console.log('   1. Test the search functionality');
    console.log('   2. If working correctly, you can clean up the stores collection');
    console.log('   3. Update any items that still reference virtual_ store IDs');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
migrateStores()
  .then(() => {
    console.log('\n✅ Migration script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
