#!/usr/bin/env node

/**
 * Test Data Manager
 * 
 * Simple CLI tool to manage test data for the FindItFast PWA.
 * 
 * Usage:
 *   node scripts/test-data-manager.js populate
 *   node scripts/test-data-manager.js clean
 *   node scripts/test-data-manager.js status
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TEST_STORE_IDS = ['test-store-1', 'test-store-2', 'test-store-3'];

async function checkTestDataStatus() {
  console.log('📊 Checking test data status...\n');
  
  try {
    // Check stores
    let testStoreCount = 0;
    for (const storeId of TEST_STORE_IDS) {
      const storeQuery = query(collection(db, 'stores'), where('__name__', '==', storeId));
      const storeSnapshot = await getDocs(storeQuery);
      if (!storeSnapshot.empty) testStoreCount++;
    }

    // Check items
    let testItemCount = 0;
    for (const storeId of TEST_STORE_IDS) {
      const itemQuery = query(collection(db, 'items'), where('storeId', '==', storeId));
      const itemSnapshot = await getDocs(itemQuery);
      testItemCount += itemSnapshot.size;
    }

    // Check owners
    const ownerQuery = query(collection(db, 'owners'));
    const ownerSnapshot = await getDocs(ownerQuery);
    let testOwnerCount = 0;
    ownerSnapshot.forEach(doc => {
      if (doc.data().email && doc.data().email.includes('@test.com')) {
        testOwnerCount++;
      }
    });

    // Check reports
    let testReportCount = 0;
    for (const storeId of TEST_STORE_IDS) {
      const reportQuery = query(collection(db, 'reports'), where('storeId', '==', storeId));
      const reportSnapshot = await getDocs(reportQuery);
      testReportCount += reportSnapshot.size;
    }

    console.log('📋 Test Data Status:');
    console.log(`   🏪 Test Stores: ${testStoreCount}/${TEST_STORE_IDS.length}`);
    console.log(`   📦 Test Items: ${testItemCount}`);
    console.log(`   👤 Test Owners: ${testOwnerCount}`);
    console.log(`   📋 Test Reports: ${testReportCount}`);

    const hasTestData = testStoreCount > 0 || testItemCount > 0 || testOwnerCount > 0;
    
    if (hasTestData) {
      console.log('\n✅ Test data is present in the database');
    } else {
      console.log('\n❌ No test data found in the database');
    }

    return hasTestData;

  } catch (error) {
    console.error('❌ Error checking test data status:', error.message);
    return false;
  }
}

function showHelp() {
  console.log('🔧 FindItFast Test Data Manager\n');
  console.log('Available commands:');
  console.log('  populate  - Add test data to the database');
  console.log('  clean     - Remove test data from the database');
  console.log('  status    - Check current test data status');
  console.log('  help      - Show this help message\n');
  console.log('Examples:');
  console.log('  node scripts/test-data-manager.js populate');
  console.log('  node scripts/test-data-manager.js clean');
  console.log('  npm run test:populate');
  console.log('  npm run test:clean');
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'populate':
      console.log('🚀 Importing populate script...');
      const { default: populateModule } = await import('./populate-test-data.js');
      break;
      
    case 'clean':
      console.log('🧹 Importing clean script...');
      const { default: cleanModule } = await import('./clean-test-data.js');
      break;
      
    case 'status':
      await checkTestDataStatus();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.log('❌ Unknown command:', command || '(none)');
      console.log('');
      showHelp();
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
}
