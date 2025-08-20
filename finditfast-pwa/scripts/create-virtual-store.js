/**
 * Create Store for Virtual Item
 * This script creates a proper store entry for the virtual store ID found in items
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: "finditfastapp.firebaseapp.com",
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.firebasestorage.app",
  messagingSenderId: "120028303360",
  appId: "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('🏪 Creating store for virtual item...');

async function createVirtualStore() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const virtualStoreId = 'virtual_BH0EzH7YqEMmWJbETerJ';
    
    // Create a proper store document with location data
    const storeData = {
      name: 'Demo Electronics Store',
      address: '123 Main Street, Demo City, DC 12345',
      location: {
        latitude: 40.7128,  // New York coordinates as example
        longitude: -74.0060
      },
      ownerId: 'demo_owner_001',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      verified: true,
      description: 'A demo store with electronics and gadgets',
      phone: '+1-555-DEMO-STORE',
      website: 'https://demo-electronics.example.com'
    };
    
    console.log(`Creating store with ID: ${virtualStoreId}`);
    console.log('Store data:', JSON.stringify(storeData, null, 2));
    
    // Create the store document
    const storeRef = doc(db, 'stores', virtualStoreId);
    await setDoc(storeRef, storeData);
    
    console.log('✅ Store created successfully!');
    console.log('Now the search should find items with their associated store.');
    
  } catch (error) {
    console.error('❌ Failed to create store:', error.message);
  }
}

createVirtualStore();
