/**
 * Create App Admin Account
 * Creates a dedicated admin account for managing store requests
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: "finditfastapp.firebaseapp.com",
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.firebasestorage.app",
  messagingSenderId: "120028303360",
  appId: "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('👤 Creating App Admin Account...');

async function createAppAdmin() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const adminEmail = 'admin@finditfast.com';
    const adminPassword = 'AdminPassword123!';
    
    console.log('🔐 Creating Firebase Auth account...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth account created:', user.uid);
    
    // Create admin profile in Firestore
    const adminProfile = {
      name: 'FindItFast Admin',
      email: adminEmail,
      role: 'admin',
      permissions: {
        canApproveStores: true,
        canManageUsers: true,
        canViewAllData: true,
        canDeleteStores: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'admins', user.uid), adminProfile);
    
    console.log('✅ Admin profile created in Firestore');
    
    console.log('\n🎉 App Admin Account Created Successfully!');
    console.log('==================================');
    console.log('🔑 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('🔗 Login URLs:');
    console.log('   Admin Dashboard: http://localhost:5174/admin/auth');
    console.log('   Store Approval: http://localhost:5174/admin');
    console.log('');
    console.log('⚠️  This is different from store owners:');
    console.log('   Store owners manage their own stores');
    console.log('   App admin approves new store requests');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin account already exists!');
      console.log('🔑 Login with: admin@finditfast.com / AdminPassword123!');
    } else {
      console.error('❌ Error creating admin account:', error.message);
    }
  }
}

createAppAdmin();
