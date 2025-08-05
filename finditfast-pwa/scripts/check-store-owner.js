import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/services/firebase.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkAndCreateStoreOwner() {
  try {
    // You'll need to provide credentials for the current user
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Signed in as:', user.email);
    
    // Check if storeOwner document exists
    const storeOwnerRef = doc(db, 'storeOwners', user.uid);
    const storeOwnerDoc = await getDoc(storeOwnerRef);
    
    if (storeOwnerDoc.exists()) {
      console.log('Store owner document exists:', storeOwnerDoc.data());
    } else {
      console.log('Store owner document does not exist. Creating one...');
      
      // Create store owner document
      await setDoc(storeOwnerRef, {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        isActive: true,
        role: 'store_owner'
      });
      
      console.log('Store owner document created successfully!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndCreateStoreOwner();
