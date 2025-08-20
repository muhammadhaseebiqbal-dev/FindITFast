import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "finditfastapp.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "finditfastapp",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "finditfastapp.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "120028303360",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:120028303360:web:446a06f68b93c7cd2c88e5"
};

console.log('🔧 Using Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function examineCollection(collectionName) {
  console.log(`\n📁 EXAMINING COLLECTION: ${collectionName.toUpperCase()}`);
  console.log('=' + '='.repeat(50));
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`❌ Collection '${collectionName}' is empty or doesn't exist`);
      return { collection: collectionName, count: 0, documents: [] };
    }
    
    console.log(`📊 Found ${snapshot.size} documents in '${collectionName}' collection:`);
    
    const documents = [];
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      const docInfo = { id: doc.id, data };
      documents.push(docInfo);
      
      console.log(`\n📄 Document ${index + 1}: ${doc.id}`);
      
      // Pretty print the data with better formatting
      const prettyData = JSON.stringify(data, (key, value) => {
        // Format timestamps
        if (value && typeof value === 'object' && value._seconds !== undefined) {
          return new Date(value._seconds * 1000).toISOString();
        }
        return value;
      }, 2);
      
      console.log('   Data:', prettyData.replace(/\n/g, '\n   '));
    });
    
    return { collection: collectionName, count: snapshot.size, documents };
    
  } catch (error) {
    console.error(`❌ Error examining collection '${collectionName}':`, error.message);
    return { collection: collectionName, count: 0, documents: [], error: error.message };
  }
}

async function authenticateAndExamine() {
  console.log('🔍 COMPREHENSIVE FIREBASE DATA EXAMINATION WITH AUTHENTICATION');
  console.log('='.repeat(70));
  console.log('📅 Date:', new Date().toLocaleString());
  
  try {
    // Authenticate anonymously to access Firestore
    console.log('🔐 Authenticating...');
    await signInAnonymously(auth);
    console.log('✅ Authentication successful');
    
    // List of collections to examine
    const collections = [
      'items',
      'reports', 
      'storeOwners',
      'storePlans',
      'storeRequests',
      'stores'
    ];
    
    const results = [];
    
    for (const collectionName of collections) {
      const result = await examineCollection(collectionName);
      results.push(result);
    }
    
    // Enhanced Analysis
    console.log('\n🎯 COMPREHENSIVE SEARCH ANALYSIS');
    console.log('=' + '='.repeat(40));
    
    const storeRequestsResult = results.find(r => r.collection === 'storeRequests');
    const itemsResult = results.find(r => r.collection === 'items');
    const storeOwnersResult = results.find(r => r.collection === 'storeOwners');
    
    if (storeRequestsResult && storeRequestsResult.documents.length > 0) {
      console.log('\n📈 Store Requests Analysis:');
      
      let approvedStores = 0;
      let pendingStores = 0;
      let rejectedStores = 0;
      
      storeRequestsResult.documents.forEach(doc => {
        const status = doc.data.status;
        if (status === 'approved') approvedStores++;
        else if (status === 'pending') pendingStores++;
        else if (status === 'rejected') rejectedStores++;
        
        console.log(`   🏪 ${doc.data.name || 'Unnamed'} (${doc.id}): ${status}`);
        if (doc.data.location) {
          console.log(`      📍 Location: ${doc.data.location.latitude}, ${doc.data.location.longitude}`);
        }
        if (doc.data.address) {
          console.log(`      📮 Address: ${doc.data.address}`);
        }
      });
      
      console.log(`\n📊 Status Summary:`);
      console.log(`   ✅ Approved: ${approvedStores}`);
      console.log(`   ⏳ Pending: ${pendingStores}`);
      console.log(`   ❌ Rejected: ${rejectedStores}`);
    }
    
    if (itemsResult && itemsResult.documents.length > 0) {
      console.log('\n📦 Items Analysis:');
      
      const storeIdCounts = {};
      const searchableItems = [];
      
      itemsResult.documents.forEach(doc => {
        const storeId = doc.data.storeId;
        storeIdCounts[storeId] = (storeIdCounts[storeId] || 0) + 1;
        
        console.log(`   📦 ${doc.data.name} (${doc.id})`);
        console.log(`      🏪 Store: ${storeId}`);
        console.log(`      🏷️ Category: ${doc.data.category || 'N/A'}`);
        console.log(`      💰 Price: ${doc.data.price || 'N/A'}`);
        
        // Add to searchable items for testing
        searchableItems.push({
          id: doc.id,
          name: doc.data.name,
          storeId: storeId,
          category: doc.data.category
        });
      });
      
      console.log(`\n🔗 Store ID Distribution:`);
      Object.entries(storeIdCounts).forEach(([storeId, count]) => {
        console.log(`   ${storeId}: ${count} items`);
      });
      
      // Test search scenarios
      console.log('\n🔍 Search Test Scenarios:');
      const searchTerms = ['watch', 'phone', 'laptop', 'book', 'clothing'];
      
      searchTerms.forEach(term => {
        const matches = searchableItems.filter(item => 
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(term.toLowerCase()))
        );
        
        if (matches.length > 0) {
          console.log(`   ✅ "${term}": ${matches.length} matches`);
          matches.forEach(match => {
            console.log(`      - ${match.name} in store ${match.storeId}`);
          });
        } else {
          console.log(`   ❌ "${term}": No matches found`);
        }
      });
    }
    
    if (storeOwnersResult && storeOwnersResult.documents.length > 0) {
      console.log('\n👥 Store Owners Analysis:');
      storeOwnersResult.documents.forEach(doc => {
        console.log(`   👤 ${doc.data.name || 'Unnamed'} (${doc.id})`);
        console.log(`      📧 Email: ${doc.data.email || 'N/A'}`);
        console.log(`      🆔 Firebase UID: ${doc.data.firebaseUid || 'N/A'}`);
        console.log(`      🏪 Store ID: ${doc.data.storeId || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Comprehensive examination completed successfully!');
    
  } catch (error) {
    console.error('💥 Authentication or examination failed:', error);
    process.exit(1);
  }
}

// Run the authenticated examination
authenticateAndExamine().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
