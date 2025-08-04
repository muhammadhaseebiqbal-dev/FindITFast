import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Initialize Firebase (replace with your own config if running this script directly)
const firebaseConfig = {
  // Your Firebase config here
  // apiKey, authDomain, etc.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to migrate store requests
async function migrateStoreRequests() {
  console.log('Starting store requests migration...');
  
  try {
    // Get all store requests
    const requestsSnapshot = await getDocs(collection(db, 'storeRequests'));
    
    if (requestsSnapshot.empty) {
      console.log('No store requests found to migrate.');
      return;
    }
    
    console.log(`Found ${requestsSnapshot.size} store requests to process.`);
    
    // Counter for tracking migration progress
    let migratedCount = 0;
    let errorCount = 0;
    
    // Process each document
    for (const requestDoc of requestsSnapshot.docs) {
      const requestData = requestDoc.data();
      const requestId = requestDoc.id;
      
      try {
        // Check if document needs migration (has ownerId but no requestedBy)
        if (requestData.ownerId && !requestData.requestedBy) {
          console.log(`Migrating request ${requestId}...`);
          
          // Update the document to add requestedBy field
          await updateDoc(doc(db, 'storeRequests', requestId), {
            requestedBy: requestData.ownerId
          });
          
          console.log(`✅ Successfully migrated request ${requestId}`);
          migratedCount++;
        } else {
          console.log(`⏭️ Request ${requestId} already has correct fields or doesn't need migration`);
        }
      } catch (error) {
        console.error(`❌ Error migrating request ${requestId}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nMigration Summary:');
    console.log(`Total documents: ${requestsSnapshot.size}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Skipped: ${requestsSnapshot.size - migratedCount - errorCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateStoreRequests().then(() => {
  console.log('Migration process completed.');
}).catch((error) => {
  console.error('Fatal error during migration:', error);
});
