// Script to check and create store owner record
// Run this in the browser console when logged in to the app

async function checkAndCreateStoreOwner() {
  // Get the current user from Firebase Auth
  const auth = window.firebase?.auth?.() || window.auth;
  const db = window.firebase?.firestore?.() || window.db;
  
  if (!auth || !db) {
    console.error('Firebase auth or firestore not available');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user signed in');
    return;
  }
  
  console.log('Checking store owner record for:', user.email, user.uid);
  
  try {
    // Check if storeOwner document exists
    const storeOwnerRef = db.collection('storeOwners').doc(user.uid);
    const storeOwnerDoc = await storeOwnerRef.get();
    
    if (storeOwnerDoc.exists) {
      console.log('Store owner document exists:', storeOwnerDoc.data());
    } else {
      console.log('Store owner document does not exist. Creating one...');
      
      // Create store owner document
      await storeOwnerRef.set({
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        isActive: true,
        role: 'store_owner'
      });
      
      console.log('Store owner document created successfully!');
    }
    
    // Test access to storePlans collection
    console.log('Testing access to storePlans collection...');
    const storePlansRef = db.collection('storePlans').where('ownerId', '==', user.uid);
    const storePlansSnapshot = await storePlansRef.get();
    console.log('StorePlans access successful. Found documents:', storePlansSnapshot.size);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// If using modern Firebase SDK (v9+)
async function checkAndCreateStoreOwnerV9() {
  const { getAuth } = await import('firebase/auth');
  const { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } = await import('firebase/firestore');
  
  const auth = getAuth();
  const db = getFirestore();
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user signed in');
    return;
  }
  
  console.log('Checking store owner record for:', user.email, user.uid);
  
  try {
    // Check if storeOwner document exists
    const storeOwnerRef = doc(db, 'storeOwners', user.uid);
    const storeOwnerDoc = await getDoc(storeOwnerRef);
    
    if (storeOwnerDoc.exists()) {
      console.log('Store owner document exists:', storeOwnerDoc.data());
    } else {
      console.log('Store owner document does not exist. Creating one...');
      
      // Create store owner document
      await setDoc(storeOwnerRef, {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        isActive: true,
        role: 'store_owner'
      });
      
      console.log('Store owner document created successfully!');
    }
    
    // Test access to storePlans collection
    console.log('Testing access to storePlans collection...');
    const storePlansQuery = query(collection(db, 'storePlans'), where('ownerId', '==', user.uid));
    const storePlansSnapshot = await getDocs(storePlansQuery);
    console.log('StorePlans access successful. Found documents:', storePlansSnapshot.size);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Try both versions
console.log('Run checkAndCreateStoreOwner() or checkAndCreateStoreOwnerV9() in the console');
window.checkAndCreateStoreOwner = checkAndCreateStoreOwner;
window.checkAndCreateStoreOwnerV9 = checkAndCreateStoreOwnerV9;
