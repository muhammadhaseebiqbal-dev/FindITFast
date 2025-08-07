import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
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

async function updateStoreAddress() {
  try {
    const storeId = 'virtual_BH0EzH7YqEMmWJbETerJ';
    
    console.log(`🏪 Updating store ${storeId} address...`);
    
    // First, let's see what the current address is
    const storeDoc = await getDoc(doc(db, 'stores', storeId));
    if (storeDoc.exists()) {
      const currentData = storeDoc.data();
      console.log('Current store data:');
      console.log('- Name:', currentData.name);
      console.log('- Address:', currentData.address);
      console.log('- Location:', currentData.location);
    }
    
    // Update with a more realistic address
    const updatedStoreData = {
      name: 'TechHub Electronics Store',
      description: 'Your one-stop shop for electronics and gadgets',
      address: '1234 Main Street, Downtown, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'info@techhub-electronics.com',
      location: {
        latitude: 40.7589,  // Manhattan coordinates
        longitude: -73.9851,
        address: '1234 Main Street, Downtown, New York, NY 10001'
      },
      operatingHours: {
        monday: { open: '09:00', close: '19:00', closed: false },
        tuesday: { open: '09:00', close: '19:00', closed: false },
        wednesday: { open: '09:00', close: '19:00', closed: false },
        thursday: { open: '09:00', close: '19:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '10:00', close: '18:00', closed: false },
        sunday: { open: '11:00', close: '17:00', closed: false }
      }
    };

    await updateDoc(doc(db, 'stores', storeId), updatedStoreData);
    
    console.log('✅ Store address updated successfully!');
    console.log('New address:', updatedStoreData.address);
    console.log('New coordinates:', `${updatedStoreData.location.latitude}, ${updatedStoreData.location.longitude}`);
    
  } catch (error) {
    console.error('❌ Failed to update store address:', error);
  }
}

updateStoreAddress().then(() => {
  console.log('✅ Update completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
