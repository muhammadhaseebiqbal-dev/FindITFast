import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function debugStoreIssue() {
  try {
    console.log('🔍 Investigating store/item mismatch...\n');
    
    // 1. Check all items and their storeIds
    console.log('📦 Checking all items:');
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    console.log(`Found ${itemsSnapshot.size} items:`);
    
    const itemStoreIds = new Set();
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Item ${doc.id}: "${data.name}" -> storeId: ${data.storeId}`);
      itemStoreIds.add(data.storeId);
    });

    // 2. Check all actual stores
    console.log('\n🏪 Checking all stores:');
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    console.log(`Found ${storesSnapshot.size} stores:`);
    
    const actualStoreIds = new Set();
    storesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Store ${doc.id}: "${data.name}" (owner: ${data.ownerId})`);
      actualStoreIds.add(doc.id);
    });

    // 3. Find mismatched store IDs
    console.log('\n🔍 Store ID Analysis:');
    console.log('Item storeIds:', Array.from(itemStoreIds));
    console.log('Actual store IDs:', Array.from(actualStoreIds));
    
    const missingStores = Array.from(itemStoreIds).filter(id => !actualStoreIds.has(id));
    const orphanStores = Array.from(actualStoreIds).filter(id => !itemStoreIds.has(id));
    
    if (missingStores.length > 0) {
      console.log('❌ Items reference these missing stores:', missingStores);
    }
    
    if (orphanStores.length > 0) {
      console.log('⚠️  These stores have no items:', orphanStores);
    }

    // 4. Check store plans
    console.log('\n📋 Checking store plans:');
    const plansSnapshot = await getDocs(collection(db, 'storePlans'));
    console.log(`Found ${plansSnapshot.size} store plans:`);
    
    plansSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- Plan ${doc.id}: for storeId ${data.storeId}`);
    });

    // 5. Suggest fix
    if (missingStores.length > 0 && orphanStores.length > 0) {
      console.log('\n💡 Suggested fix:');
      console.log('It looks like items are referencing wrong store IDs.');
      console.log('Missing stores:', missingStores);
      console.log('Available stores:', orphanStores);
      console.log('Consider updating item storeIds to match actual store IDs.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugStoreIssue().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
