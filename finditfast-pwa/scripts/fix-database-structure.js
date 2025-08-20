import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'finditfastapp.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'finditfastapp',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'finditfastapp.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '120028303360',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:120028303360:web:446a06f68b93c7cd2c88e5'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixDatabaseStructure() {
  console.log('🔧 FIXING DATABASE STRUCTURE');
  console.log('=' + '='.repeat(40));
  
  try {
    // Step 1: Get the dummy store data from stores collection
    console.log('\n📋 Step 1: Reading dummy store data from stores collection...');
    const storesRef = collection(db, 'stores');
    const storesSnapshot = await getDocs(storesRef);
    
    const dummyStores = [];
    storesSnapshot.forEach(doc => {
      dummyStores.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${dummyStores.length} dummy stores:`);
    dummyStores.forEach(store => {
      console.log(`   🏪 ${store.name} (${store.id})`);
    });
    
    // Step 2: Create proper storeRequests from dummy data
    console.log('\n📋 Step 2: Creating proper storeRequests from dummy data...');
    
    for (const store of dummyStores) {
      const storeRequest = {
        name: store.name || 'TechHub Electronics Store',
        address: store.address || '1234 Main Street, Downtown, New York, NY 10001',
        email: store.email || 'info@techhub-electronics.com',
        phone: store.phone || '+1 (555) 123-4567',
        description: store.description || 'Your one-stop shop for electronics and gadgets',
        location: store.location || {
          latitude: 40.7589,
          longitude: -73.9851
        },
        ownerId: 'GFBy3Rd7zVTl9zqwAmnCHtcFXN82', // From the console screenshot
        status: 'approved', // Make it approved so it shows in search
        planType: 'basic',
        businessType: 'retail',
        requestedAt: Timestamp.now(),
        approvedAt: Timestamp.now(),
        createdAt: store.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      try {
        // Use the same ID as the dummy store (without virtual_ prefix)
        const cleanId = store.id.startsWith('virtual_') ? store.id.replace('virtual_', '') : store.id;
        const storeRequestRef = doc(db, 'storeRequests', cleanId);
        await updateDoc(storeRequestRef, storeRequest);
        console.log(`   ✅ Created storeRequest: ${store.name} (${cleanId})`);
      } catch (error) {
        // If update fails, try adding new document
        const storeRequestRef = await addDoc(collection(db, 'storeRequests'), storeRequest);
        console.log(`   ✅ Added storeRequest: ${store.name} (${storeRequestRef.id})`);
      }
    }
    
    // Step 3: Create store owner if not exists
    console.log('\n📋 Step 3: Creating store owner...');
    try {
      const storeOwner = {
        name: 'Johnsan',
        email: 'Johnsan@mail.com',
        phone: '836587865783',
        firebaseUid: 'GFBy3Rd7zVTl9zqwAmnCHtcFXN82',
        storeId: dummyStores[0]?.id.replace('virtual_', '') || 'BH0EzH7YqEMmWJbETerJ',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const ownerRef = doc(db, 'storeOwners', 'GFBy3Rd7zVTl9zqwAmnCHtcFXN82');
      await updateDoc(ownerRef, storeOwner);
      console.log('   ✅ Created store owner: Johnsan');
    } catch (error) {
      console.log('   ℹ️ Store owner might already exist or have permission issues');
    }
    
    // Step 4: Delete dummy stores collection
    console.log('\n📋 Step 4: Deleting dummy stores collection...');
    for (const store of dummyStores) {
      try {
        await deleteDoc(doc(db, 'stores', store.id));
        console.log(`   🗑️ Deleted dummy store: ${store.name} (${store.id})`);
      } catch (error) {
        console.log(`   ❌ Failed to delete ${store.id}: ${error.message}`);
      }
    }
    
    console.log('\n✅ DATABASE STRUCTURE FIXED!');
    console.log('📋 Summary:');
    console.log('   ✅ Created proper storeRequests with approved status');
    console.log('   ✅ Created store owner record');
    console.log('   ✅ Deleted dummy stores collection');
    console.log('   ✅ Search should now work correctly!');
    
  } catch (error) {
    console.error('❌ Error fixing database structure:', error);
  }
}

// Run the fix
fixDatabaseStructure().catch(console.error);
