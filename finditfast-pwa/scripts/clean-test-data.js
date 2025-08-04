#!/usr/bin/env node

/**
 * Clean Test Data Script
 * 
 * This script removes all test data from the Firestore database.
 * It deletes test stores, items, owners, and related data.
 * 
 * Usage: node scripts/clean-test-data.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';

// Firebase configuration - update with your actual config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test data identifiers
const TEST_STORE_IDS = ['test-store-1', 'test-store-2', 'test-store-3'];
const TEST_OWNER_IDS = ['test-owner-1', 'test-owner-2'];
const TEST_OWNER_EMAILS = ['owner1@test.com', 'owner2@test.com'];

async function confirmDeletion() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  WARNING: This will permanently delete all test data from the database!');
    console.log('   This includes:');
    console.log('   • Test stores and their items');
    console.log('   • Test owner accounts');
    console.log('   • Test reports and search history');
    console.log('   • All related data\n');
    
    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function deleteCollectionDocuments(collectionName, whereConditions = null) {
  console.log(`🗑️  Cleaning ${collectionName} collection...`);
  let deletedCount = 0;
  
  try {
    let querySnapshot;
    
    if (whereConditions) {
      const q = query(collection(db, collectionName), ...whereConditions);
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(collection(db, collectionName));
    }

    if (querySnapshot.empty) {
      console.log(`   No documents found in ${collectionName}`);
      return 0;
    }

    // Use batch for better performance
    const batch = writeBatch(db);
    
    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      deletedCount++;
    });

    await batch.commit();
    console.log(`   ✅ Deleted ${deletedCount} documents from ${collectionName}`);
    
  } catch (error) {
    console.error(`   ❌ Error deleting from ${collectionName}:`, error.message);
  }
  
  return deletedCount;
}

async function deleteSpecificDocuments(collectionName, docIds) {
  console.log(`🗑️  Deleting specific documents from ${collectionName}...`);
  let deletedCount = 0;
  
  for (const docId of docIds) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      deletedCount++;
      console.log(`   ✅ Deleted ${docId} from ${collectionName}`);
    } catch (error) {
      if (error.code === 'not-found') {
        console.log(`   ⚠️  Document ${docId} not found in ${collectionName}`);
      } else {
        console.error(`   ❌ Error deleting ${docId} from ${collectionName}:`, error.message);
      }
    }
  }
  
  return deletedCount;
}

async function cleanTestData() {
  console.log('🧹 Starting test data cleanup...\n');
  
  try {
    let totalDeleted = 0;

    // Delete items from test stores
    console.log('📦 Cleaning test items...');
    for (const storeId of TEST_STORE_IDS) {
      const deleted = await deleteCollectionDocuments('items', [where('storeId', '==', storeId)]);
      totalDeleted += deleted;
    }

    // Delete test stores
    console.log('\n🏪 Cleaning test stores...');
    const storesDeleted = await deleteSpecificDocuments('stores', TEST_STORE_IDS);
    totalDeleted += storesDeleted;

    // Delete test owners from Firestore
    console.log('\n👤 Cleaning test owners from Firestore...');
    const ownersDeleted = await deleteSpecificDocuments('owners', TEST_OWNER_IDS);
    totalDeleted += ownersDeleted;

    // Clean reports related to test data
    console.log('\n📋 Cleaning test reports...');
    for (const storeId of TEST_STORE_IDS) {
      const deleted = await deleteCollectionDocuments('reports', [where('storeId', '==', storeId)]);
      totalDeleted += deleted;
    }

    // Clean search history (optional - remove if you want to keep all search history)
    console.log('\n🔍 Cleaning anonymous search history...');
    const searchDeleted = await deleteCollectionDocuments('searchHistory', [where('userId', '==', 'anonymous')]);
    totalDeleted += searchDeleted;

    // Clean store requests that might be test data
    console.log('\n📝 Cleaning test store requests...');
    const requestsDeleted = await deleteCollectionDocuments('storeRequests', [where('status', '==', 'test')]);
    totalDeleted += requestsDeleted;

    console.log('\n🎉 Test data cleanup completed successfully!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    
    console.log('\n⚠️  Note: Firebase Auth users need to be deleted manually from the Firebase Console');
    console.log('   Test user emails to delete:');
    TEST_OWNER_EMAILS.forEach(email => {
      console.log(`   • ${email}`);
    });

  } catch (error) {
    console.error('❌ Error during test data cleanup:', error);
    process.exit(1);
  }
}

async function cleanupWithConfirmation() {
  const confirmed = await confirmDeletion();
  
  if (!confirmed) {
    console.log('❌ Cleanup cancelled by user.');
    process.exit(0);
  }
  
  await cleanTestData();
}

// Additional utility function to clean ALL data (use with extreme caution!)
async function nukeAllData() {
  console.log('☢️  NUCLEAR OPTION: Deleting ALL data from database...');
  
  const collections = ['items', 'stores', 'owners', 'reports', 'searchHistory', 'storeRequests'];
  let totalDeleted = 0;
  
  for (const collectionName of collections) {
    const deleted = await deleteCollectionDocuments(collectionName);
    totalDeleted += deleted;
  }
  
  console.log(`💀 Nuclear cleanup completed. Total documents deleted: ${totalDeleted}`);
}

// Command line argument handling
const args = process.argv.slice(2);

if (args.includes('--nuke') || args.includes('--nuclear')) {
  console.log('⚠️  DANGER ZONE: Nuclear cleanup mode activated!');
  console.log('   This will delete ALL data from ALL collections!');
  
  confirmDeletion().then((confirmed) => {
    if (confirmed) {
      nukeAllData().then(() => {
        console.log('✨ Nuclear cleanup completed successfully!');
        process.exit(0);
      }).catch((error) => {
        console.error('💥 Nuclear cleanup failed:', error);
        process.exit(1);
      });
    } else {
      console.log('❌ Nuclear cleanup cancelled.');
      process.exit(0);
    }
  });
} else {
  // Normal cleanup
  if (import.meta.url === `file://${process.argv[1]}`) {
    cleanupWithConfirmation()
      .then(() => {
        console.log('\n✨ Cleanup script completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Cleanup script failed:', error);
        process.exit(1);
      });
  }
}
