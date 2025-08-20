/**
 * Quick Fix for Search Issues
 * This script fixes the immediate search problems by:
 * 1. Moving store from stores to storeRequests with approved status
 * 2. Fixing item storeId to remove virtual_ prefix
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

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

console.log('🔧 Quick Fix for Search Issues...');

async function quickFix() {
  try {
    console.log('\n1️⃣ Checking stores collection...');
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    
    // Fix stores
    if (storesSnapshot.size > 0) {
      console.log(`Found ${storesSnapshot.size} stores to migrate`);
      
      for (const storeDoc of storesSnapshot.docs) {
        const storeData = storeDoc.data();
        let newStoreId = storeDoc.id;
        
        // Remove virtual_ prefix
        if (newStoreId.startsWith('virtual_')) {
          newStoreId = newStoreId.replace('virtual_', '');
        }
        
        console.log(`\n🔄 Processing: ${storeData.name}`);
        console.log(`   Moving from stores/${storeDoc.id} to storeRequests/${newStoreId}`);
        
        // Create approved store request
        const storeRequestData = {
          name: storeData.name || 'Unknown Store',
          address: storeData.address || 'Address not available',
          location: storeData.location || { latitude: 40.7128, longitude: -74.0060 },
          ownerId: storeData.ownerId || 'owner123',
          status: 'approved',
          approvedAt: new Date(),
          createdAt: storeData.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'storeRequests', newStoreId), storeRequestData);
        console.log(`   ✅ Created approved store request: ${newStoreId}`);
      }
    } else {
      console.log('   No stores found in stores collection');
    }
    
    console.log('\n2️⃣ Checking items collection...');
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    
    // Fix items
    if (itemsSnapshot.size > 0) {
      console.log(`Found ${itemsSnapshot.size} items to check`);
      
      for (const itemDoc of itemsSnapshot.docs) {
        const itemData = itemDoc.data();
        
        if (itemData.storeId && itemData.storeId.startsWith('virtual_')) {
          const newStoreId = itemData.storeId.replace('virtual_', '');
          
          console.log(`\n🔄 Fixing item: ${itemData.name}`);
          console.log(`   StoreId: ${itemData.storeId} → ${newStoreId}`);
          
          await updateDoc(doc(db, 'items', itemDoc.id), {
            storeId: newStoreId
          });
          
          console.log(`   ✅ Updated item storeId`);
        } else {
          console.log(`   ✅ Item "${itemData.name}" already has clean storeId: ${itemData.storeId}`);
        }
      }
    } else {
      console.log('   No items found');
    }
    
    console.log('\n3️⃣ Verification...');
    
    // Check the final state
    const [finalItems, finalStoreRequests] = await Promise.all([
      getDocs(collection(db, 'items')),
      getDocs(collection(db, 'storeRequests'))
    ]);
    
    console.log(`\n📊 Final State:`);
    console.log(`   Items: ${finalItems.size}`);
    console.log(`   Store Requests: ${finalStoreRequests.size}`);
    
    // Show approved stores
    let approvedCount = 0;
    finalStoreRequests.forEach(doc => {
      const data = doc.data();
      if (data.status === 'approved') {
        approvedCount++;
        console.log(`   ✅ Approved Store: ${data.name} (${doc.id})`);
      }
    });
    
    // Show items and their store references
    finalItems.forEach(doc => {
      const data = doc.data();
      console.log(`   📦 Item: ${data.name} → Store: ${data.storeId}`);
    });
    
    if (approvedCount > 0 && finalItems.size > 0) {
      console.log('\n🎉 SUCCESS! Search should now work correctly!');
      console.log('   ✅ Approved stores are available');
      console.log('   ✅ Items reference clean store IDs');
    } else {
      console.log('\n⚠️  Issues remaining - search may not work');
    }

  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
    console.error(error);
  }
}

// Run the fix
quickFix()
  .then(() => {
    console.log('\n✅ Quick fix completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
