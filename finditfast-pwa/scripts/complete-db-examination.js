import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'finditfastapp';
const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk';

console.log('🔧 Using Firebase project:', projectId);

async function fetchAllDocuments(collectionName) {
  try {
    console.log(`\n📁 FETCHING ALL DOCUMENTS FROM: ${collectionName.toUpperCase()}`);
    
    const listUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: collectionName }]
      }
    };
    
    const response = await fetch(`${listUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Failed to fetch ${collectionName}:`, errorText);
      return { collection: collectionName, count: 0, documents: [], error: errorText };
    }
    
    const queryResults = await response.json();
    
    if (!queryResults || queryResults.length === 0) {
      console.log(`❌ Collection '${collectionName}' is empty`);
      return { collection: collectionName, count: 0, documents: [] };
    }
    
    console.log(`✅ Found ${queryResults.length} documents in '${collectionName}'`);
    
    const documents = [];
    
    queryResults.forEach((result, index) => {
      if (result.document) {
        const doc = result.document;
        const docId = doc.name.split('/').pop();
        const data = convertFirestoreData(doc.fields || {});
        
        console.log(`\n📄 Document ${index + 1}: ${docId}`);
        console.log('   Data:', JSON.stringify(data, null, 2).replace(/\n/g, '\n   '));
        
        documents.push({ id: docId, data });
      }
    });
    
    return { collection: collectionName, count: documents.length, documents };
    
  } catch (error) {
    console.error(`❌ Error fetching ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, documents: [], error: error.message };
  }
}

function convertFirestoreData(fields) {
  const result = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = parseInt(value.integerValue);
    } else if (value.doubleValue !== undefined) {
      result[key] = parseFloat(value.doubleValue);
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.timestampValue !== undefined) {
      result[key] = new Date(value.timestampValue).toISOString();
    } else if (value.geoPointValue !== undefined) {
      result[key] = {
        latitude: value.geoPointValue.latitude,
        longitude: value.geoPointValue.longitude
      };
    } else if (value.mapValue && value.mapValue.fields) {
      result[key] = convertFirestoreData(value.mapValue.fields);
    } else if (value.arrayValue && value.arrayValue.values) {
      result[key] = value.arrayValue.values.map(v => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue);
        if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
        if (v.booleanValue !== undefined) return v.booleanValue;
        return v;
      });
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

async function examineAllCollections() {
  console.log('🔍 COMPLETE FIREBASE DATABASE EXAMINATION');
  console.log('=' + '='.repeat(50));
  console.log('📅 Date:', new Date().toLocaleString());
  
  const collections = [
    'items',
    'reports', 
    'storeOwners',
    'storePlans',
    'storeRequests',  // This is the REAL store data
    'stores'          // This has dummy data - will be deleted
  ];
  
  const results = [];
  
  for (const collectionName of collections) {
    const result = await examineAllDocuments(collectionName);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analysis and Data Structure Recommendations
  console.log('\n🎯 DATABASE STRUCTURE ANALYSIS');
  console.log('=' + '='.repeat(40));
  
  results.forEach(result => {
    console.log(`📊 ${result.collection}: ${result.count} documents`);
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
  });
  
  // Store Requests Analysis (REAL store data)
  const storeRequestsResult = results.find(r => r.collection === 'storeRequests');
  if (storeRequestsResult && storeRequestsResult.documents.length > 0) {
    console.log('\n🏪 STORE REQUESTS (REAL STORE DATA):');
    
    let approved = 0, pending = 0, rejected = 0;
    
    storeRequestsResult.documents.forEach(doc => {
      const status = doc.data.status || 'unknown';
      console.log(`   ${doc.data.name || 'Unnamed'} (${doc.id}): ${status}`);
      console.log(`      Address: ${doc.data.address || 'No address'}`);
      console.log(`      Owner: ${doc.data.ownerId || 'No owner'}`);
      
      if (status === 'approved') approved++;
      else if (status === 'pending') pending++;
      else if (status === 'rejected') rejected++;
    });
    
    console.log(`\n📈 Store Status Breakdown:`);
    console.log(`   ✅ Approved: ${approved}`);
    console.log(`   ⏳ Pending: ${pending}`);
    console.log(`   ❌ Rejected: ${rejected}`);
  } else {
    console.log('\n❌ NO STORE REQUESTS FOUND - This is the problem!');
  }
  
  // Items Analysis
  const itemsResult = results.find(r => r.collection === 'items');
  if (itemsResult && itemsResult.documents.length > 0) {
    console.log('\n📦 ITEMS ANALYSIS:');
    
    const storeIdCounts = {};
    itemsResult.documents.forEach(doc => {
      const storeId = doc.data.storeId || 'unknown';
      storeIdCounts[storeId] = (storeIdCounts[storeId] || 0) + 1;
      console.log(`   📦 "${doc.data.name || 'Unnamed'}" → Store: ${storeId}`);
      console.log(`      Category: ${doc.data.category || 'No category'}`);
      console.log(`      Price: ${doc.data.price || 'No price'}`);
    });
    
    console.log(`\n🔗 Items per Store:`);
    Object.entries(storeIdCounts).forEach(([storeId, count]) => {
      console.log(`   ${storeId}: ${count} items`);
    });
    
    // Validate store references
    if (storeRequestsResult) {
      console.log(`\n🔍 VALIDATING ITEM-STORE REFERENCES:`);
      const storeRequestIds = new Set(storeRequestsResult.documents.map(doc => doc.id));
      
      Object.keys(storeIdCounts).forEach(storeId => {
        const cleanStoreId = storeId.startsWith('virtual_') ? storeId.replace('virtual_', '') : storeId;
        if (storeRequestIds.has(cleanStoreId)) {
          console.log(`   ✅ ${storeId} → Found in storeRequests`);
        } else {
          console.log(`   ❌ ${storeId} → NOT found in storeRequests (BROKEN LINK)`);
        }
      });
    }
  }
  
  // Store Owners Analysis
  const storeOwnersResult = results.find(r => r.collection === 'storeOwners');
  if (storeOwnersResult && storeOwnersResult.documents.length > 0) {
    console.log('\n👥 STORE OWNERS ANALYSIS:');
    storeOwnersResult.documents.forEach(doc => {
      console.log(`   👤 ${doc.data.name || 'Unnamed'} (${doc.id})`);
      console.log(`      📧 Email: ${doc.data.email || 'No email'}`);
      console.log(`      🆔 Firebase UID: ${doc.data.firebaseUid || 'No UID'}`);
      console.log(`      🏪 Store ID: ${doc.data.storeId || 'No store ID'}`);
    });
  }
  
  // Stores Collection (Dummy Data)
  const storesResult = results.find(r => r.collection === 'stores');
  if (storesResult && storesResult.documents.length > 0) {
    console.log('\n🗑️ STORES COLLECTION (DUMMY DATA - TO BE DELETED):');
    storesResult.documents.forEach(doc => {
      console.log(`   🏪 ${doc.data.name || 'Unnamed'} (${doc.id}) - DUMMY DATA`);
    });
  }
  
  console.log('\n📋 RECOMMENDED DATABASE STRUCTURE:');
  console.log('1. ❌ DELETE stores collection (contains dummy data)');
  console.log('2. ✅ USE storeRequests as the single source of truth for stores');
  console.log('3. ✅ UPDATE search service to use storeRequests with status="approved"');
  console.log('4. ✅ FIX item storeId references to match storeRequests document IDs');
  
  console.log('\n✅ Complete database examination finished!');
}

async function examineAllDocuments(collectionName) {
  return await fetchAllDocuments(collectionName);
}

// Run the complete examination
examineAllCollections().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
