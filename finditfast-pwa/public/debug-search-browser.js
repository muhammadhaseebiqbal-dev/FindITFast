// Debug search functionality in browser console
// Paste this into your browser's developer console while on the FindItFast app

async function debugSearch() {
  console.log('🔍 Starting search debug...');
  
  try {
    // Test 1: Direct Firebase query
    console.log('Test 1: Direct Firebase query');
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const { db } = await import('./src/services/firebase.js');
    
    const searchTerm = 'watch';
    const directQuery = query(
      collection(db, 'items'),
      where('name', '>=', searchTerm.toLowerCase()),
      where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('name'),
      limit(20)
    );
    
    const directSnapshot = await getDocs(directQuery);
    console.log(`Direct Firebase query results: ${directSnapshot.size} items`);
    directSnapshot.forEach(doc => {
      console.log('  ->', doc.id, doc.data());
    });

    // Test 2: ItemService.search
    console.log('\nTest 2: ItemService.search');
    const { ItemService } = await import('./src/services/firestoreService.js');
    const itemResults = await ItemService.search(searchTerm);
    console.log(`ItemService.search results: ${itemResults.length} items`);
    itemResults.forEach(item => {
      console.log('  ->', item.id, item.name, item.storeId);
    });

    // Test 3: StoreService.getAll
    console.log('\nTest 3: StoreService.getAll');
    const { StoreService } = await import('./src/services/firestoreService.js');
    const stores = await StoreService.getAll();
    console.log(`StoreService.getAll results: ${stores.length} stores`);
    stores.forEach(store => {
      console.log('  ->', store.id, store.name, store.location);
    });

    // Test 4: Full SearchService.searchItems
    console.log('\nTest 4: SearchService.searchItems');
    const { SearchService } = await import('./src/services/SearchService.js');
    const searchResults = await SearchService.searchItems(searchTerm);
    console.log(`SearchService.searchItems results: ${searchResults.length} items`);
    searchResults.forEach(result => {
      console.log('  ->', result.id, result.name, result.store?.name);
    });

  } catch (error) {
    console.error('Debug failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the debug
debugSearch();
