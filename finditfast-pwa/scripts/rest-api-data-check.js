import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'finditfastapp';
const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk';

console.log('🔧 Using Firebase project:', projectId);

async function fetchCollection(collectionName) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`;
  
  try {
    console.log(`\n📁 FETCHING COLLECTION: ${collectionName.toUpperCase()}`);
    console.log('🌐 URL:', url);
    
    // Try with API key authentication
    const urlWithAuth = `${url}?key=${apiKey}`;
    const response = await fetch(urlWithAuth);
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      
      // Try alternative approach - list documents first
      const listUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
      const queryPayload = {
        structuredQuery: {
          from: [{ collectionId: collectionName }]
        }
      };
      
      const listResponse = await fetch(`${listUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryPayload)
      });
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.log('Alternative query failed:', errorText);
        return { collection: collectionName, count: 0, documents: [], error: `HTTP ${response.status}` };
      }
      
      const queryResults = await listResponse.json();
      if (!queryResults || queryResults.length === 0) {
        console.log(`❌ Collection '${collectionName}' is empty or doesn't exist`);
        return { collection: collectionName, count: 0, documents: [] };
      }
      
      console.log(`✅ Found ${queryResults.length} documents in '${collectionName}' via query:`);
      
      const processedDocs = queryResults.map((result, index) => {
        if (!result.document) return null;
        
        const doc = result.document;
        const docId = doc.name.split('/').pop();
        const processedData = processFirestoreFields(doc.fields || {});
        
        console.log(`\n📄 Document ${index + 1}: ${docId}`);
        console.log('   Data:', JSON.stringify(processedData, null, 2).replace(/\n/g, '\n   '));
        
        return { id: docId, data: processedData };
      }).filter(doc => doc !== null);
      
      return { collection: collectionName, count: processedDocs.length, documents: processedDocs };
    }
    
    const data = await response.json();
    
    if (!data.documents || data.documents.length === 0) {
      console.log(`❌ Collection '${collectionName}' is empty or doesn't exist`);
      return { collection: collectionName, count: 0, documents: [] };
    }
    
    console.log(`✅ Found ${data.documents.length} documents in '${collectionName}':`);
    
    const processedDocs = data.documents.map((doc, index) => {
      // Extract document ID from the name field
      const docId = doc.name.split('/').pop();
      const processedData = processFirestoreFields(doc.fields || {});
      
      console.log(`\n📄 Document ${index + 1}: ${docId}`);
      console.log('   Data:', JSON.stringify(processedData, null, 2).replace(/\n/g, '\n   '));
      
      return { id: docId, data: processedData };
    });
    
    return { collection: collectionName, count: data.documents.length, documents: processedDocs };
    
  } catch (error) {
    console.error(`❌ Error fetching collection '${collectionName}':`, error.message);
    return { collection: collectionName, count: 0, documents: [], error: error.message };
  }
}

function processFirestoreFields(fields) {
  // Process Firestore fields to readable format
  const processedData = {};
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (value.stringValue !== undefined) {
        processedData[key] = value.stringValue;
      } else if (value.integerValue !== undefined) {
        processedData[key] = parseInt(value.integerValue);
      } else if (value.doubleValue !== undefined) {
        processedData[key] = parseFloat(value.doubleValue);
      } else if (value.booleanValue !== undefined) {
        processedData[key] = value.booleanValue;
      } else if (value.timestampValue !== undefined) {
        processedData[key] = new Date(value.timestampValue);
      } else if (value.geoPointValue !== undefined) {
        processedData[key] = {
          latitude: value.geoPointValue.latitude,
          longitude: value.geoPointValue.longitude
        };
      } else if (value.mapValue !== undefined) {
        // Handle nested objects
        const nestedObj = {};
        if (value.mapValue.fields) {
          for (const [nestedKey, nestedValue] of Object.entries(value.mapValue.fields)) {
            if (nestedValue.stringValue !== undefined) {
              nestedObj[nestedKey] = nestedValue.stringValue;
            } else if (nestedValue.doubleValue !== undefined) {
              nestedObj[nestedKey] = parseFloat(nestedValue.doubleValue);
            } else if (nestedValue.integerValue !== undefined) {
              nestedObj[nestedKey] = parseInt(nestedValue.integerValue);
            } else if (nestedValue.booleanValue !== undefined) {
              nestedObj[nestedKey] = nestedValue.booleanValue;
            }
          }
        }
        processedData[key] = nestedObj;
      } else if (value.arrayValue !== undefined) {
        // Handle arrays
        processedData[key] = value.arrayValue.values?.map(v => {
          if (v.stringValue !== undefined) return v.stringValue;
          if (v.integerValue !== undefined) return parseInt(v.integerValue);
          if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
          if (v.booleanValue !== undefined) return v.booleanValue;
          return v;
        }) || [];
      } else {
        processedData[key] = value;
      }
    }
  }
  return processedData;
}

async function examineAllCollectionsREST() {
  console.log('🔍 FIREBASE DATA EXAMINATION VIA REST API');
  console.log('=' + '='.repeat(50));
  console.log('📅 Date:', new Date().toLocaleString());
  
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
    const result = await fetchCollection(collectionName);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analysis
  console.log('\n🎯 COMPREHENSIVE ANALYSIS');
  console.log('=' + '='.repeat(30));
  
  results.forEach(result => {
    console.log(`📊 ${result.collection}: ${result.count} documents`);
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
  });
  
  // Store Requests Analysis
  const storeRequestsResult = results.find(r => r.collection === 'storeRequests');
  if (storeRequestsResult && storeRequestsResult.documents.length > 0) {
    console.log('\n🏪 Store Requests Summary:');
    
    let approved = 0, pending = 0, rejected = 0;
    
    storeRequestsResult.documents.forEach(doc => {
      const status = doc.data.status || 'unknown';
      console.log(`   ${doc.data.name || 'Unnamed'} (${doc.id}): ${status}`);
      
      if (status === 'approved') approved++;
      else if (status === 'pending') pending++;
      else if (status === 'rejected') rejected++;
    });
    
    console.log(`\n📈 Status Breakdown:`);
    console.log(`   ✅ Approved: ${approved}`);
    console.log(`   ⏳ Pending: ${pending}`);
    console.log(`   ❌ Rejected: ${rejected}`);
  }
  
  // Items Analysis
  const itemsResult = results.find(r => r.collection === 'items');
  if (itemsResult && itemsResult.documents.length > 0) {
    console.log('\n📦 Items Summary:');
    
    const storeIdCounts = {};
    itemsResult.documents.forEach(doc => {
      const storeId = doc.data.storeId || 'unknown';
      storeIdCounts[storeId] = (storeIdCounts[storeId] || 0) + 1;
      console.log(`   📦 ${doc.data.name || 'Unnamed'} → Store: ${storeId}`);
    });
    
    console.log(`\n🔗 Items per Store:`);
    Object.entries(storeIdCounts).forEach(([storeId, count]) => {
      console.log(`   ${storeId}: ${count} items`);
    });
  }
  
  console.log('\n✅ REST API examination completed!');
}

// Run the REST API examination
examineAllCollectionsREST().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
