// Temporary fix for stores collection - add proper store data
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function fixStoreData() {
  try {
    // Add a proper store with real location data
    const storeData = {
      id: 'test-store-001',
      name: 'Tech Plaza Store',
      address: '123 Main Street, New York, NY 10001',
      location: {
        latitude: 40.7589, // Manhattan coordinates
        longitude: -73.9851
      },
      ownerId: 'test-owner-001',
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Electronics and gadgets store',
      phone: '+1-555-0123',
      email: 'contact@techplaza.com'
    };

    await setDoc(doc(db, 'stores', 'test-store-001'), storeData);
    console.log('✅ Added proper store data');

    // Update any existing dummy store
    const dummyStoreData = {
      id: 'dummy-store',
      name: 'Electronics Hub',
      address: '456 Broadway, New York, NY 10013',
      location: {
        latitude: 40.7209, // SoHo coordinates  
        longitude: -74.0007
      },
      ownerId: 'dummy-owner',
      approved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'Your neighborhood electronics store',
      phone: '+1-555-0456',
      email: 'info@electronicshub.com'
    };

    await setDoc(doc(db, 'stores', 'dummy-store'), dummyStoreData);
    console.log('✅ Updated dummy store with proper location data');

  } catch (error) {
    console.error('❌ Error fixing store data:', error);
  }
}

fixStoreData();
