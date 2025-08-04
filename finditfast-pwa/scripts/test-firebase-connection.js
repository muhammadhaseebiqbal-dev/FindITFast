/**
 * Firebase Connection Test Script
 * Tests Firebase services connectivity and configuration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Load environment variables

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 Firebase Connection Test');
console.log('============================');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Test Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  // Test Auth
  const auth = getAuth(app);
  console.log('✅ Authentication initialized');
  
  // Test basic Firestore query
  try {
    const storesRef = collection(db, 'stores');
    const snapshot = await getDocs(storesRef);
    console.log(`✅ Firestore connection successful - Found ${snapshot.size} stores`);
  } catch (error) {
    console.log('⚠️  Firestore query failed:', error.message);
  }
  
  console.log('\n📋 Configuration Check:');
  console.log('- Project ID:', firebaseConfig.projectId);
  console.log('- Auth Domain:', firebaseConfig.authDomain);
  console.log('- API Key:', firebaseConfig.apiKey ? 'Present' : 'Missing');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
}
