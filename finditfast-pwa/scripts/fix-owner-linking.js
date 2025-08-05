// Script to fix owner linking for approved store requests
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

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

async function fixOwnerLinking() {
  try {
    console.log('🔍 Finding approved store requests without proper owner linking...');
    
    // Get all approved store requests
    const requestsQuery = query(
      collection(db, 'storeRequests'),
      where('status', '==', 'approved')
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    
    console.log(`📋 Found ${requestsSnapshot.docs.length} approved requests`);
    
    for (const requestDoc of requestsSnapshot.docs) {
      const request = requestDoc.data();
      console.log(`🔍 Checking request ${requestDoc.id} for ${request.requestedBy}`);
      
      if (!request.requestedBy || !request.storeId) {
        console.log(`⚠️ Skipping incomplete request: ${requestDoc.id}`);
        continue;
      }
      
      // Find owner by firebaseUid
      const ownerQuery = query(
        collection(db, 'storeOwners'),
        where('firebaseUid', '==', request.requestedBy)
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      if (ownerSnapshot.empty) {
        console.log(`❌ No owner found for firebaseUid: ${request.requestedBy}`);
        continue;
      }
      
      const ownerDoc = ownerSnapshot.docs[0];
      const ownerData = ownerDoc.data();
      
      if (ownerData.storeId === request.storeId) {
        console.log(`✅ Owner ${ownerDoc.id} already linked to store ${request.storeId}`);
        continue;
      }
      
      // Update owner with store ID
      console.log(`🔗 Linking owner ${ownerDoc.id} to store ${request.storeId}`);
      await updateDoc(ownerDoc.ref, {
        storeId: request.storeId,
        updatedAt: new Date()
      });
      
      console.log(`✅ Successfully linked owner ${ownerDoc.id} (${ownerData.email}) to store ${request.storeId}`);
    }
    
    console.log('🎉 Owner linking fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing owner linking:', error);
  }
}

// Run the fix
fixOwnerLinking().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
