// Test search to debug store name and distance issues
import { AdvancedSearchService } from '../src/services/advancedSearchService.js';

// Mock user location (let's use a test location)
const testLocation = {
  latitude: 40.7128,  // New York City
  longitude: -74.0060
};

console.log('🧪 Testing search functionality...');
console.log('📍 Test location:', testLocation);

async function testSearch() {
  try {
    const results = await AdvancedSearchService.searchItems('watch', testLocation);
    
    console.log('\n📊 SEARCH RESULTS:');
    console.log('Results count:', results.length);
    
    results.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log('Item name:', result.name);
      console.log('Item description:', result.description);
      console.log('Item storeId:', result.storeId);
      console.log('Store object:', JSON.stringify(result.store, null, 2));
      console.log('Distance:', result.distance || 'Not calculated');
      console.log('Item location in result:', result.store?.location);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSearch();
