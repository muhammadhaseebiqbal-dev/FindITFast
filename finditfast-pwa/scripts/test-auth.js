/**
 * Quick Authentication Test
 * Tests if Firebase Authentication is working and data was populated
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Load environment variables (for Node.js testing)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "finditfastapp.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "finditfastapp",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "finditfastapp.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "120028303360",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('🔥 Firebase Authentication & Data Test');
console.log('=======================================');

async function testFirebaseSetup() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Check if data was populated
    console.log('\n📊 Testing Data Population...');
    
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    const ownersSnapshot = await getDocs(collection(db, 'owners'));
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    
    console.log(`✅ Found ${storesSnapshot.size} stores`);
    console.log(`✅ Found ${ownersSnapshot.size} owners`);
    console.log(`✅ Found ${itemsSnapshot.size} items`);
    
    if (storesSnapshot.size === 0) {
      console.log('⚠️  No stores found - test data may not have been populated');
      console.log('💡 Run: npm run test:populate');
      return;
    }
    
    // Test 2: Try authentication
    console.log('\n🔐 Testing Authentication...');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, 'owner1@test.com', 'TestPassword123!');
      console.log('✅ Authentication successful!');
      console.log(`✅ Logged in as: ${userCredential.user.email}`);
      
      // Sign out
      await auth.signOut();
      console.log('✅ Sign out successful');
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
      if (authError.code === 'auth/user-not-found') {
        console.log('💡 Test accounts may not exist. Run: npm run test:populate');
      }
    }
    
    console.log('\n🎉 Test completed!');
    console.log('🌐 Visit http://localhost:5174 to test the app');
    
  } catch (error) {
    console.error('❌ Firebase setup test failed:', error.message);
  }
}

testFirebaseSetup();
