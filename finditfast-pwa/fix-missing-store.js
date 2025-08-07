import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixMissingStore() {
  try {
    console.log('🔍 Checking stores collection...');
    
    // Check existing stores
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    console.log(`📦 Found ${storesSnapshot.size} stores`);
    
    storesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name} at ${data.location?.address || 'no address'}`);
    });

    // Check the specific store ID that the item references
    const missingStoreId = 'virtual_BH0EzH7YqEMmWJbETerJ';
    
    console.log(`\n🔍 Looking for store: ${missingStoreId}`);
    const storeExists = storesSnapshot.docs.find(doc => doc.id === missingStoreId);
    
    if (!storeExists) {
      console.log(`❌ Store ${missingStoreId} not found. Creating it...`);
      
      // Create the missing virtual store
      const virtualStore = {
        id: missingStoreId,
        name: 'Virtual Demo Store',
        description: 'A virtual store for demo items',
        address: '123 Demo Street, Demo City',
        phone: '+1-555-DEMO',
        email: 'demo@finditfast.com',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Demo Street, Demo City'
        },
        ownerId: 'demo-owner',
        approved: true,
        createdAt: new Date(),
        floorPlan: {
          imageUrl: '',
          width: 800,
          height: 600,
          items: []
        },
        operatingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '12:00', close: '16:00', closed: false }
        }
      };

      await setDoc(doc(db, 'stores', missingStoreId), virtualStore);
      console.log('✅ Virtual store created successfully!');
      
    } else {
      console.log('✅ Store exists');
    }

    // Verify the fix
    console.log('\n🔍 Verifying stores after fix...');
    const updatedStoresSnapshot = await getDocs(collection(db, 'stores'));
    console.log(`📦 Total stores now: ${updatedStoresSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error fixing missing store:', error);
  }
}

fixMissingStore().then(() => {
  console.log('✅ Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
