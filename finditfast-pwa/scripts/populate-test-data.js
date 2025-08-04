#!/usr/bin/env node

/**
 * Populate Test Data Script
 * 
 * This script populates the Firestore database with test data for development and testing.
 * It creates sample stores, items, and owner accounts.
 * 
 * Usage: node scripts/populate-test-data.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  GeoPoint 
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Test data
const testStores = [
  {
    id: 'test-store-1',
    name: 'SuperMart Downtown',
    address: '123 Main Street, Downtown, City 12345',
    location: new GeoPoint(40.7128, -74.0060), // New York coordinates
    ownerId: 'test-owner-1',
    floorplanUrl: 'https://example.com/floorplan1.jpg'
  },
  {
    id: 'test-store-2', 
    name: 'Fresh Market Plaza',
    address: '456 Oak Avenue, Midtown, City 12346',
    location: new GeoPoint(40.7589, -73.9851), // Times Square coordinates
    ownerId: 'test-owner-2',
    floorplanUrl: 'https://example.com/floorplan2.jpg'
  },
  {
    id: 'test-store-3',
    name: 'Corner Grocery',
    address: '789 Pine Street, Uptown, City 12347',
    location: new GeoPoint(40.7831, -73.9712), // Central Park coordinates
    ownerId: 'test-owner-1',
    floorplanUrl: 'https://example.com/floorplan3.jpg'
  }
];

const testItems = [
  // SuperMart Downtown items
  {
    name: 'Organic Milk',
    price: 4.99,
    storeId: 'test-store-1',
    position: { x: 150, y: 200 },
    verified: true,
    imageUrl: 'https://example.com/milk.jpg'
  },
  {
    name: 'Whole Wheat Bread',
    price: 3.49,
    storeId: 'test-store-1',
    position: { x: 300, y: 150 },
    verified: true,
    imageUrl: 'https://example.com/bread.jpg'
  },
  {
    name: 'Free Range Eggs',
    price: 5.99,
    storeId: 'test-store-1',
    position: { x: 200, y: 300 },
    verified: true,
    imageUrl: 'https://example.com/eggs.jpg'
  },
  {
    name: 'Greek Yogurt',
    price: 1.99,
    storeId: 'test-store-1',
    position: { x: 100, y: 250 },
    verified: false,
    reportCount: 1
  },

  // Fresh Market Plaza items
  {
    name: 'Artisan Coffee',
    price: 12.99,
    storeId: 'test-store-2',
    position: { x: 180, y: 120 },
    verified: true,
    imageUrl: 'https://example.com/coffee.jpg'
  },
  {
    name: 'Organic Bananas',
    price: 2.49,
    storeId: 'test-store-2',
    position: { x: 250, y: 180 },
    verified: true,
    imageUrl: 'https://example.com/bananas.jpg'
  },
  {
    name: 'Almond Butter',
    price: 8.99,
    storeId: 'test-store-2',
    position: { x: 320, y: 220 },
    verified: true,
    imageUrl: 'https://example.com/almond-butter.jpg'
  },
  {
    name: 'Quinoa Pasta',
    price: 4.79,
    storeId: 'test-store-2',
    position: { x: 150, y: 280 },
    verified: false,
    reportCount: 2
  },

  // Corner Grocery items
  {
    name: 'Local Honey',
    price: 7.99,
    storeId: 'test-store-3',
    position: { x: 160, y: 140 },
    verified: true,
    imageUrl: 'https://example.com/honey.jpg'
  },
  {
    name: 'Sourdough Bread',
    price: 4.49,
    storeId: 'test-store-3',
    position: { x: 220, y: 190 },
    verified: true,
    imageUrl: 'https://example.com/sourdough.jpg'
  },
  {
    name: 'Craft Beer',
    price: 9.99,
    storeId: 'test-store-3',
    position: { x: 280, y: 160 },
    verified: false,
    imageUrl: 'https://example.com/beer.jpg'
  }
];

const testOwners = [
  {
    id: 'test-owner-1',
    email: 'owner1@test.com',
    password: 'TestPassword123!',
    name: 'John Smith',
    phone: '+1-555-0101'
  },
  {
    id: 'test-owner-2', 
    email: 'owner2@test.com',
    password: 'TestPassword123!',
    name: 'Sarah Johnson',
    phone: '+1-555-0102'
  }
];

async function populateTestData() {
  console.log('🚀 Starting test data population...');
  
  try {
    // Create test owners
    console.log('👤 Creating test owner accounts...');
    for (const owner of testOwners) {
      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, owner.email, owner.password);
        const user = userCredential.user;
        
        // Create owner document in Firestore
        await setDoc(doc(db, 'owners', owner.id), {
          uid: user.uid,
          email: owner.email,
          name: owner.name,
          phone: owner.phone,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Created owner: ${owner.name} (${owner.email})`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  Owner ${owner.email} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating owner ${owner.email}:`, error.message);
        }
      }
    }

    // Create test stores
    console.log('\n🏪 Creating test stores...');
    for (const store of testStores) {
      try {
        await setDoc(doc(db, 'stores', store.id), {
          ...store,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created store: ${store.name}`);
      } catch (error) {
        console.error(`❌ Error creating store ${store.name}:`, error.message);
      }
    }

    // Create test items
    console.log('\n📦 Creating test items...');
    for (const item of testItems) {
      try {
        await addDoc(collection(db, 'items'), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          verifiedAt: item.verified ? serverTimestamp() : null
        });
        console.log(`✅ Created item: ${item.name} at ${testStores.find(s => s.id === item.storeId)?.name}`);
      } catch (error) {
        console.error(`❌ Error creating item ${item.name}:`, error.message);
      }
    }

    // Create some sample search history
    console.log('\n🔍 Creating sample search history...');
    const searchTerms = ['milk', 'bread', 'coffee', 'eggs', 'banana'];
    for (const term of searchTerms) {
      try {
        await addDoc(collection(db, 'searchHistory'), {
          query: term,
          timestamp: serverTimestamp(),
          userId: 'anonymous'
        });
        console.log(`✅ Added search history: ${term}`);
      } catch (error) {
        console.error(`❌ Error adding search history ${term}:`, error.message);
      }
    }

    // Create some test reports
    console.log('\n📋 Creating test reports...');
    const testReports = [
      {
        itemId: 'test-item-1',
        storeId: 'test-store-1',
        type: 'item-missing',
        description: 'Item not found in specified location',
        userId: 'anonymous'
      },
      {
        itemId: 'test-item-2',
        storeId: 'test-store-2', 
        type: 'item-moved',
        description: 'Item has been moved to different aisle',
        userId: 'anonymous'
      }
    ];

    for (const report of testReports) {
      try {
        await addDoc(collection(db, 'reports'), {
          ...report,
          createdAt: serverTimestamp(),
          status: 'pending'
        });
        console.log(`✅ Created report: ${report.type} for ${report.itemId}`);
      } catch (error) {
        console.error(`❌ Error creating report:`, error.message);
      }
    }

    console.log('\n🎉 Test data population completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${testOwners.length} owner accounts created`);
    console.log(`   • ${testStores.length} stores created`); 
    console.log(`   • ${testItems.length} items created`);
    console.log(`   • ${searchTerms.length} search history entries created`);
    console.log(`   • ${testReports.length} test reports created`);
    
    console.log('\n🔐 Test Owner Credentials:');
    testOwners.forEach(owner => {
      console.log(`   • ${owner.email} : ${owner.password}`);
    });

  } catch (error) {
    console.error('❌ Error during test data population:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  populateTestData()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}
