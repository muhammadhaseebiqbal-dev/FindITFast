import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Migrates all store requests to use the requestedBy field (from ownerId)
 * for compatibility with updated Firestore rules
 */
export async function migrateStoreRequests() {
  try {
    console.log('Starting store request migration...');
    
    // Get all store requests
    const requestsSnapshot = await getDocs(collection(db, 'storeRequests'));
    
    if (requestsSnapshot.empty) {
      console.log('No store requests found to migrate.');
      return;
    }
    
    console.log(`Found ${requestsSnapshot.size} store requests to process.`);
    
    // Process each document
    let migratedCount = 0;
    
    for (const requestDoc of requestsSnapshot.docs) {
      const requestData = requestDoc.data();
      const requestId = requestDoc.id;
      
      // Check if document needs migration (has ownerId but no requestedBy)
      if (requestData.ownerId && !requestData.requestedBy) {
        console.log(`Migrating request ${requestId}...`);
        
        // Update the document to add requestedBy field
        await updateDoc(doc(db, 'storeRequests', requestId), {
          requestedBy: requestData.ownerId
        });
        
        console.log(`Successfully migrated request ${requestId}`);
        migratedCount++;
      }
    }
    
    console.log(`Migration completed. Updated ${migratedCount} documents.`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}
