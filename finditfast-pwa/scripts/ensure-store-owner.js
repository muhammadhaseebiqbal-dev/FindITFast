import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase config - you'll need to update this with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "finditfastapp",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function ensureStoreOwner() {
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log('No user is currently authenticated');
      return;
    }

    console.log('Current user:', user.email, user.uid);

    // Check if user has a storeOwners document
    const storeOwnerRef = doc(db, 'storeOwners', user.uid);
    const storeOwnerDoc = await getDoc(storeOwnerRef);

    if (!storeOwnerDoc.exists()) {
      console.log('Creating storeOwners document for user...');
      
      // Create the storeOwners document
      await setDoc(storeOwnerRef, {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'Store Owner',
        createdAt: new Date(),
        status: 'active',
        role: 'owner'
      });

      console.log('✅ StoreOwners document created successfully!');
    } else {
      console.log('✅ StoreOwners document already exists');
      console.log('Data:', storeOwnerDoc.data());
    }

  } catch (error) {
    console.error('❌ Error ensuring store owner:', error);
  }
}

// Run the script
ensureStoreOwner();
