#!/usr/bin/env node

/**
 * Demo Test Data Script
 * 
 * This is a demo version that shows what the populate script would do
 * without actually connecting to Firebase. Useful for testing the script structure.
 */

console.log('🚀 Demo: Starting test data population...');

// Simulate the test data that would be created
const testStores = [
  {
    id: 'test-store-1',
    name: 'SuperMart Downtown',
    address: '123 Main Street, Downtown, City 12345',
    location: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: 'test-store-2', 
    name: 'Fresh Market Plaza',
    address: '456 Oak Avenue, Midtown, City 12346',
    location: { latitude: 40.7589, longitude: -73.9851 }
  },
  {
    id: 'test-store-3',
    name: 'Corner Grocery',
    address: '789 Pine Street, Uptown, City 12347',
    location: { latitude: 40.7831, longitude: -73.9712 }
  }
];

const testItems = [
  { name: 'Organic Milk', price: 4.99, storeId: 'test-store-1' },
  { name: 'Whole Wheat Bread', price: 3.49, storeId: 'test-store-1' },
  { name: 'Free Range Eggs', price: 5.99, storeId: 'test-store-1' },
  { name: 'Greek Yogurt', price: 1.99, storeId: 'test-store-1' },
  { name: 'Artisan Coffee', price: 12.99, storeId: 'test-store-2' },
  { name: 'Organic Bananas', price: 2.49, storeId: 'test-store-2' },
  { name: 'Almond Butter', price: 8.99, storeId: 'test-store-2' },
  { name: 'Quinoa Pasta', price: 4.79, storeId: 'test-store-2' },
  { name: 'Local Honey', price: 7.99, storeId: 'test-store-3' },
  { name: 'Sourdough Bread', price: 4.49, storeId: 'test-store-3' },
  { name: 'Craft Beer', price: 9.99, storeId: 'test-store-3' }
];

const testOwners = [
  { email: 'owner1@test.com', name: 'John Smith', phone: '+1-555-0101' },
  { email: 'owner2@test.com', name: 'Sarah Johnson', phone: '+1-555-0102' }
];

// Simulate the population process
console.log('\n👤 Demo: Creating test owner accounts...');
testOwners.forEach(owner => {
  console.log(`✅ Would create owner: ${owner.name} (${owner.email})`);
});

console.log('\n🏪 Demo: Creating test stores...');
testStores.forEach(store => {
  console.log(`✅ Would create store: ${store.name}`);
});

console.log('\n📦 Demo: Creating test items...');
testItems.forEach(item => {
  const store = testStores.find(s => s.id === item.storeId);
  console.log(`✅ Would create item: ${item.name} ($${item.price}) at ${store?.name}`);
});

console.log('\n🔍 Demo: Creating sample search history...');
const searchTerms = ['milk', 'bread', 'coffee', 'eggs', 'banana'];
searchTerms.forEach(term => {
  console.log(`✅ Would add search history: ${term}`);
});

console.log('\n📋 Demo: Creating test reports...');
console.log('✅ Would create report: item-missing for test-item-1');
console.log('✅ Would create report: item-moved for test-item-2');

console.log('\n🎉 Demo: Test data population completed successfully!');
console.log('\n📋 Summary:');
console.log(`   • ${testOwners.length} owner accounts would be created`);
console.log(`   • ${testStores.length} stores would be created`); 
console.log(`   • ${testItems.length} items would be created`);
console.log(`   • ${searchTerms.length} search history entries would be created`);
console.log(`   • 2 test reports would be created`);

console.log('\n🔐 Test Owner Credentials:');
testOwners.forEach(owner => {
  console.log(`   • ${owner.email} : TestPassword123!`);
});

console.log('\n✨ Demo script completed successfully!');
console.log('\n💡 To run the actual population script with Firebase:');
console.log('   1. Configure your .env file with Firebase credentials');
console.log('   2. Run: npm run test:populate');
console.log('   3. Or run: node scripts/populate-test-data.js');
