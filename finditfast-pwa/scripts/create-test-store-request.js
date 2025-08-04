/**
 * Create Test Store Request
 * Creates a sample store request for testing the approval system
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: "finditfastapp.firebaseapp.com",
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.firebasestorage.app",
  messagingSenderId: "120028303360",
  appId: "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('🏪 Creating Test Store Request...');

async function createTestStoreRequest() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const testRequest = {
      storeName: 'Downtown Electronics',
      address: '456 Main Street, Downtown City, State 12345',
      location: {
        latitude: 40.7580,
        longitude: -73.9855
      },
      requestedBy: 'test-user-123',
      requestedAt: Timestamp.now(),
      status: 'pending',
      notes: 'Popular electronics store in the downtown area. High customer demand for this location.'
    };
    
    const docRef = await addDoc(collection(db, 'storeRequests'), testRequest);
    
    console.log('✅ Test store request created successfully!');
    console.log('📋 Request Details:');
    console.log(`   - Store Name: ${testRequest.storeName}`);
    console.log(`   - Address: ${testRequest.address}`);
    console.log(`   - Status: ${testRequest.status}`);
    console.log(`   - Request ID: ${docRef.id}`);
    console.log('');
    console.log('🔗 To approve this request:');
    console.log('   1. Visit: http://localhost:5174/admin');
    console.log('   2. Login as store owner');
    console.log('   3. Review and approve/reject the request');
    console.log('');
    console.log('🔑 Test Owner Login:');
    console.log('   Email: owner1@test.com');
    console.log('   Password: TestPassword123!');
    
  } catch (error) {
    console.error('❌ Error creating test store request:', error.message);
  }
}

createTestStoreRequest();
