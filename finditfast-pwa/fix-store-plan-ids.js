import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixStorePlanIds() {
  try {
    console.log('🔧 Fixing store plan IDs...\n');
    
    // Get all store plans
    const plansSnapshot = await getDocs(collection(db, 'storePlans'));
    console.log(`Found ${plansSnapshot.size} store plans to check:`);
    
    for (const planDoc of plansSnapshot.docs) {
      const data = planDoc.data();
      const currentStoreId = data.storeId;
      
      console.log(`- Plan ${planDoc.id}: storeId = ${currentStoreId}`);
      
      // Check if this is a temp_ ID that needs to be updated
      if (currentStoreId === 'temp_BH0EzH7YqEMmWJbETerJ') {
        const correctStoreId = 'virtual_BH0EzH7YqEMmWJbETerJ';
        console.log(`  🔄 Updating to: ${correctStoreId}`);
        
        await updateDoc(doc(db, 'storePlans', planDoc.id), {
          storeId: correctStoreId
        });
        
        console.log(`  ✅ Updated plan ${planDoc.id}`);
      } else {
        console.log(`  ⏭️  No update needed`);
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedPlansSnapshot = await getDocs(collection(db, 'storePlans'));
    updatedPlansSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Plan ${doc.id}: storeId = ${data.storeId}`);
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixStorePlanIds().then(() => {
  console.log('\n✅ Fix completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
