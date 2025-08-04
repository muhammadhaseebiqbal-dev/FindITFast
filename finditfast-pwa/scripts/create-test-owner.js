#!/usr/bin/env node

/**
 * Create Test Owner for test@gmail.com
 * This creates the specific owner account for testing authentication
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createTestOwner() {
  console.log('🚀 Creating test owner for test@gmail.com...');
  
  const testOwnerEmail = 'test@gmail.com';
  const testOwnerPassword = 'Test123!';
  const testOwnerId = 'test-owner-main';
  
  try {
    // Create auth user
    console.log('👤 Creating authentication account...');
    const userCredential = await createUserWithEmailAndPassword(auth, testOwnerEmail, testOwnerPassword);
    const user = userCredential.user;
    console.log('✅ Auth account created with UID:', user.uid);
    
    // Create owner document in Firestore
    console.log('📄 Creating owner document in Firestore...');
    await setDoc(doc(db, 'owners', testOwnerId), {
      uid: user.uid,
      email: testOwnerEmail,
      name: 'Test Owner',
      phone: '+1-555-TEST',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Owner document created');
    
    // Create a test store for this owner
    console.log('🏪 Creating test store...');
    await setDoc(doc(db, 'stores', 'test-store-main'), {
      name: 'Test Store',
      address: '123 Test Street, Test City, TC 12345',
      ownerId: testOwnerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Test store created');
    
    console.log('\n🎉 Test owner setup completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${testOwnerEmail}`);
    console.log(`   Password: ${testOwnerPassword}`);
    console.log(`   Owner ID: ${testOwnerId}`);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  test@gmail.com already exists. Checking if owner document exists...');
      
      try {
        // Just create/update the owner document
        const existingUser = await signInWithEmailAndPassword(auth, testOwnerEmail, testOwnerPassword);
        
        await setDoc(doc(db, 'owners', testOwnerId), {
          uid: existingUser.user.uid,
          email: testOwnerEmail,
          name: 'Test Owner',
          phone: '+1-555-TEST',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ Owner document created/updated for existing user');
        
      } catch (docError) {
        console.error('❌ Error updating owner document:', docError.message);
      }
      
    } else {
      console.error('❌ Error creating test owner:', error.message);
      process.exit(1);
    }
  }
}

// Run the script
createTestOwner()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
