import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// Firebase config - you'll need to update this with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyC-kFMCGv9F8DRVH-6oWlr48Q9AiWVfPoo",
  authDomain: "finditfast-app.firebaseapp.com",
  projectId: "finditfast-app",
  storageBucket: "finditfast-app.firebasestorage.app",
  messagingSenderId: "1059257570527",
  appId: "1:1059257570527:web:80e1f1d9b4e5e37bf7cb8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleReports = [
  {
    itemId: 'sample-item-1',
    itemName: 'Apple watch ultra',
    storeId: 'temp_IS19PLGyB8cQUuvITsmk',
    storeName: 'Electronics Plus',
    reportType: 'missing',
    description: 'Item was not found at the indicated location on the store map',
    reportedBy: 'anonymous_user_1',
    status: 'pending',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    priority: 'medium',
    location: {
      section: 'Electronics',
      aisle: 'A3',
      shelf: 'Top'
    }
  },
  {
    itemId: 'sample-item-2',
    itemName: 'Bluetooth Headphones',
    storeId: 'temp_IS19PLGyB8cQUuvITsmk',
    storeName: 'Electronics Plus',
    reportType: 'moved',
    description: 'Item location has changed - found in different aisle',
    reportedBy: 'anonymous_user_2',
    status: 'pending',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    priority: 'low',
    location: {
      section: 'Electronics',
      aisle: 'B2',
      shelf: 'Middle'
    }
  },
  {
    itemId: 'sample-item-3',
    itemName: 'Phone Charger',
    storeId: 'temp_IS19PLGyB8cQUuvITsmk',
    storeName: 'Electronics Plus',
    reportType: 'found',
    description: 'Item was found after being marked as missing',
    reportedBy: 'anonymous_user_3',
    status: 'resolved',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    priority: 'low',
    location: {
      section: 'Electronics',
      aisle: 'A1',
      shelf: 'Bottom'
    }
  },
  {
    itemId: 'sample-item-4',
    itemName: 'Laptop Stand',
    storeId: 'temp_IS19PLGyB8cQUuvITsmk',
    storeName: 'Electronics Plus',
    reportType: 'missing',
    description: 'Multiple customers unable to locate this item',
    reportedBy: 'anonymous_user_4',
    status: 'pending',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    priority: 'high',
    location: {
      section: 'Electronics',
      aisle: 'C1',
      shelf: 'Top'
    }
  },
  {
    itemId: 'sample-item-5',
    itemName: 'USB Cable',
    storeId: 'temp_IS19PLGyB8cQUuvITsmk',
    storeName: 'Electronics Plus',
    reportType: 'missing',
    description: 'Out of stock but still shown on map',
    reportedBy: 'anonymous_user_5',
    status: 'dismissed',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    priority: 'medium',
    location: {
      section: 'Electronics',
      aisle: 'A2',
      shelf: 'Bottom'
    }
  }
];

async function createSampleReports() {
  try {
    console.log('🔧 Creating sample reports...');
    
    // Check if reports already exist
    const existingReports = await getDocs(collection(db, 'reports'));
    if (existingReports.size > 0) {
      console.log(`ℹ️ Found ${existingReports.size} existing reports. Skipping creation.`);
      console.log('To recreate reports, manually delete them from Firebase Console first.');
      return;
    }
    
    // Create sample reports
    for (const report of sampleReports) {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created report: ${report.itemName} (${report.reportType}) - ID: ${docRef.id}`);
    }
    
    console.log('🎉 Successfully created all sample reports!');
    console.log('📊 Reports summary:');
    console.log(`- Total reports: ${sampleReports.length}`);
    console.log(`- Pending: ${sampleReports.filter(r => r.status === 'pending').length}`);
    console.log(`- Resolved: ${sampleReports.filter(r => r.status === 'resolved').length}`);
    console.log(`- Dismissed: ${sampleReports.filter(r => r.status === 'dismissed').length}`);
    console.log(`- Missing items: ${sampleReports.filter(r => r.reportType === 'missing').length}`);
    console.log(`- Moved items: ${sampleReports.filter(r => r.reportType === 'moved').length}`);
    console.log(`- Found items: ${sampleReports.filter(r => r.reportType === 'found').length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample reports:', error);
  }
}

// Run the script
createSampleReports().then(() => {
  console.log('📋 Sample reports creation completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
