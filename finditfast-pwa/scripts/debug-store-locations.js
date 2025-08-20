// Debug script to check store locations and calculate distances manually
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAh2s9XSTiamCOYJx_RA1lEhZoAq8iAAgs",
  authDomain: "finditfast-pwa.firebaseapp.com",
  databaseURL: "https://finditfast-pwa-default-rtdb.firebaseio.com",
  projectId: "finditfast-pwa",
  storageBucket: "finditfast-pwa.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your actual location in Lahore, Pakistan
const userLocation = {
  latitude: 31.585075,
  longitude: 74.389914
};

// Australia coordinates (approximate - Sydney)  
const australiaLocation = {
  latitude: -33.8688,
  longitude: 151.2093
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  // WGS-84 ellipsoid parameters
  const a = 6378137; // Semi-major axis in meters
  const b = 6356752.314245; // Semi-minor axis in meters
  const f = 1 / 298.257223563; // Flattening

  const L = toRadians(lon2 - lon1);
  const U1 = Math.atan((1 - f) * Math.tan(toRadians(lat1)));
  const U2 = Math.atan((1 - f) * Math.tan(toRadians(lat2)));
  
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);
  
  let lambda = L;
  let lambdaP = 2 * Math.PI;
  let iterLimit = 100;
  let cosSqAlpha = 0;
  let sinSigma = 0;
  let cos2SigmaM = 0;
  let cosSigma = 0;
  let sigma = 0;
  
  while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) * (cosU2 * sinLambda) +
      (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
    );
    
    if (sinSigma === 0) return 0;
    
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    
    const sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
    if (isNaN(cos2SigmaM)) cos2SigmaM = 0;
    
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha * (
      sigma + C * sinSigma * (
        cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)
      )
    );
  }
  
  if (iterLimit === 0) {
    // Fallback to Haversine
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  
  const deltaSigma = B * sinSigma * (
    cos2SigmaM + B / 4 * (
      cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)
    )
  );
  
  const distance = b * A * (sigma - deltaSigma);
  return distance / 1000; // Convert to kilometers
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function debugStoreLocations() {
  try {
    console.log('=== DEBUGGING STORE LOCATIONS ===');
    
    // Get items with "watch" in the name
    console.log('\n📦 CHECKING ITEMS:');
    const itemsRef = collection(db, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    
    const watchItems = [];
    itemsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes('watch')) {
        console.log(`📦 Item: ${data.name} (${doc.id})`);
        console.log(`   Store ID: ${data.storeId}`);
        watchItems.push({ id: doc.id, ...data });
      }
    });

    // Get store requests (approved)
    console.log('\n🏪 CHECKING STORE REQUESTS:');
    const storeRequestsRef = collection(db, 'storeRequests');
    const storeRequestsQuery = query(storeRequestsRef, where('status', '==', 'approved'));
    const storeRequestsSnapshot = await getDocs(storeRequestsQuery);
    
    const stores = [];
    storeRequestsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`🏪 Store: ${data.storeName || data.name} (${doc.id})`);
      console.log(`   Location: ${JSON.stringify(data.storeLocation || data.location)}`);
      stores.push({ id: doc.id, ...data });
    });

    // Calculate distances for each watch item
    console.log('\n📏 DISTANCE CALCULATIONS:');
    console.log('User location (Lahore, Pakistan):', userLocation);
    
    watchItems.forEach(item => {
      let storeId = item.storeId;
      if (storeId?.startsWith('virtual_')) {
        storeId = storeId.replace('virtual_', '');
      }
      
      const store = stores.find(s => s.id === storeId);
      if (store) {
        const storeLocation = store.storeLocation || store.location;
        console.log(`\n📏 Item: ${item.name}`);
        console.log(`   Store: ${store.storeName || store.name}`);
        console.log(`   Store Location: ${JSON.stringify(storeLocation)}`);
        
        if (storeLocation?.latitude && storeLocation?.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            storeLocation.latitude,
            storeLocation.longitude
          );
          console.log(`   Distance from Lahore: ${distance.toFixed(3)} km`);
        } else {
          console.log(`   ⚠️ No valid location data`);
        }
      } else {
        console.log(`\n📏 Item: ${item.name}`);
        console.log(`   ⚠️ Store not found for ID: ${storeId}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugStoreLocations();
