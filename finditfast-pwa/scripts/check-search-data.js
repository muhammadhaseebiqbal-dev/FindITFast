import fetch from 'node-fetch';

const PROJECT_ID = 'finditfast-pwa';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAh2s9XSTiamCOYJx_RA1lEhZoAq8iAAgs';

async function checkSearchData() {
  try {
    console.log('=== CHECKING STORES COLLECTION ===');
    const storesResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/stores`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (storesResponse.ok) {
      const storesData = await storesResponse.json();
      console.log('Stores data:', JSON.stringify(storesData, null, 2));
    } else {
      console.log('Stores response status:', storesResponse.status);
      console.log('Stores response:', await storesResponse.text());
    }

    console.log('\n=== CHECKING ITEMS COLLECTION ===');
    const itemsResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/items`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (itemsResponse.ok) {
      const itemsData = await itemsResponse.json();
      console.log('Items data:', JSON.stringify(itemsData, null, 2));
    } else {
      console.log('Items response status:', itemsResponse.status);
      console.log('Items response:', await itemsResponse.text());
    }

  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkSearchData();
