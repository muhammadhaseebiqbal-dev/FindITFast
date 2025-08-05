// Quick fix to set the missing firebaseUid field
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQVAw1XuFZl-D7R-0Z1YbGSgZW3d6HZXE",
  authDomain: "finditfastapp.firebaseapp.com", 
  projectId: "finditfastapp",
  storageBucket: "finditfastapp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixOwnerFirebaseUid() {
  try {
    // The owner document ID is the same as the Firebase UID: GFBy3Rd7zVTl9zqwAmnCHtcFXN82
    const ownerId = 'GFBy3Rd7zVTl9zqwAmnCHtcFXN82';
    
    console.log('🔧 Fixing firebaseUid for owner:', ownerId);
    
    await updateDoc(doc(db, 'storeOwners', ownerId), {
      firebaseUid: ownerId, // Set firebaseUid to the same value as the document ID
      updatedAt: new Date()
    });
    
    console.log('✅ Successfully updated firebaseUid for owner:', ownerId);
    
  } catch (error) {
    console.error('❌ Error fixing firebaseUid:', error);
  }
}

// Run the fix
fixOwnerFirebaseUid().then(() => {
  console.log('🎉 Fix completed! The owner profile should now be found.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix failed:', error);
  process.exit(1);
});
