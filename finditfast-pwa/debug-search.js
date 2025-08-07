import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 10)}...` : 'missing'
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugSearch() {
  try {
    console.log('🔍 Checking items collection...');
    
    // First, get all items to see what exists
    const allItemsSnapshot = await getDocs(collection(db, 'items'));
    console.log(`📦 Total items found: ${allItemsSnapshot.size}`);
    
    if (allItemsSnapshot.size > 0) {
      console.log('\n📋 Items in database:');
      allItemsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name} (${data.category || 'no category'}) in store: ${data.storeId}`);
      });
    }

    // Now test searching for "watch"
    console.log('\n🔍 Testing search for "watch"...');
    const searchTerm = 'watch';
    const searchQuery = query(
      collection(db, 'items'),
      where('name', '>=', searchTerm.toLowerCase()),
      where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('name'),
      limit(20)
    );
    
    const searchSnapshot = await getDocs(searchQuery);
    console.log(`🎯 Search results for "${searchTerm}": ${searchSnapshot.size} items`);
    
    searchSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`✨ Found: ${data.name} (${data.category || 'no category'})`);
    });

    // Also test case-insensitive search
    console.log('\n🔍 Testing case-insensitive search...');
    const allItems = [];
    allItemsSnapshot.forEach(doc => {
      allItems.push({ id: doc.id, ...doc.data() });
    });
    
    const manualSearch = allItems.filter(item => 
      item.name.toLowerCase().includes('watch') || 
      (item.category && item.category.toLowerCase().includes('watch'))
    );
    
    console.log(`🎯 Manual search results: ${manualSearch.length} items`);
    manualSearch.forEach(item => {
      console.log(`✨ Manual found: ${item.name} (${item.category || 'no category'})`);
    });
    
  } catch (error) {
    console.error('❌ Error during search debug:', error);
  }
}

debugSearch().then(() => {
  console.log('✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
