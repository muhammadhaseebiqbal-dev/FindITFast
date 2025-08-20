/**
 * Fix Virtual Store IDs
 * This script removes the "virtual_" prefix from storeId fields in items
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://finditfastapp.firebaseio.com'
});

const db = admin.firestore();

console.log('🔧 Fixing Virtual Store IDs...');

async function fixVirtualStoreIds() {
  try {
    // Get all items with virtual_ prefix in storeId
    const itemsSnapshot = await db.collection('items').get();
    console.log(`📋 Found ${itemsSnapshot.size} items to check`);
    
    let fixedCount = 0;
    const batch = db.batch();
    
    for (const doc of itemsSnapshot.docs) {
      const data = doc.data();
      const storeId = data.storeId;
      
      if (storeId && storeId.startsWith('virtual_')) {
        const newStoreId = storeId.replace('virtual_', '');
        console.log(`🔄 Fixing item ${doc.id}: ${storeId} -> ${newStoreId}`);
        
        // Update the storeId
        batch.update(doc.ref, { storeId: newStoreId });
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      await batch.commit();
      console.log(`✅ Fixed ${fixedCount} items with virtual store IDs`);
    } else {
      console.log('ℹ️ No items found with virtual_ prefix in storeId');
    }
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    const updatedItemsSnapshot = await db.collection('items').get();
    let virtualCount = 0;
    
    updatedItemsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.storeId && data.storeId.startsWith('virtual_')) {
        virtualCount++;
      }
    });
    
    console.log(`📊 Items still with virtual_ prefix: ${virtualCount}`);
    
  } catch (error) {
    console.error('❌ Failed to fix virtual store IDs:', error.message);
  } finally {
    process.exit(0);
  }
}

fixVirtualStoreIds();
