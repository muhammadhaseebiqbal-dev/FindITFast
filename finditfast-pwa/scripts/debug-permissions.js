// Run this in the browser console to manually create a storeOwners document
// This is for debugging Firebase permissions issues

const createStoreOwnerRecord = async () => {
  try {
    // Import Firebase functions
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, doc, setDoc, getDoc } = await import('firebase/firestore');
    
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ No user is currently authenticated');
      return;
    }
    
    console.log('🔍 Current user:', user.email, user.uid);
    
    // Check if storeOwners document exists
    const storeOwnerRef = doc(db, 'storeOwners', user.uid);
    const storeOwnerDoc = await getDoc(storeOwnerRef);
    
    if (storeOwnerDoc.exists()) {
      console.log('✅ StoreOwners document already exists:', storeOwnerDoc.data());
      return;
    }
    
    // Create storeOwners document
    const storeOwnerData = {
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
      isActive: true,
      role: 'store_owner',
      name: user.displayName || user.email?.split('@')[0] || 'Store Owner'
    };
    
    console.log('📝 Creating storeOwners document with data:', storeOwnerData);
    
    await setDoc(storeOwnerRef, storeOwnerData);
    
    console.log('✅ StoreOwners document created successfully!');
    
    // Verify creation
    const verifyDoc = await getDoc(storeOwnerRef);
    if (verifyDoc.exists()) {
      console.log('✅ Verified storeOwners document:', verifyDoc.data());
    } else {
      console.log('❌ Failed to verify storeOwners document creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating storeOwners record:', error);
  }
};

// Also create a function to test StorePlan permissions
const testStorePlanPermissions = async () => {
  try {
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ No user is currently authenticated');
      return;
    }
    
    console.log('🔍 Testing StorePlan permissions for user:', user.email);
    
    // Try to query storePlans collection
    const storePlansQuery = query(
      collection(db, 'storePlans'),
      where('ownerId', '==', user.uid)
    );
    
    const snapshot = await getDocs(storePlansQuery);
    console.log('✅ Successfully queried storePlans collection. Found:', snapshot.docs.length, 'documents');
    
    snapshot.docs.forEach(doc => {
      console.log('📄 StorePlan document:', doc.id, doc.data());
    });
    
  } catch (error) {
    console.error('❌ Error testing StorePlan permissions:', error);
  }
};

// Export functions to window for easy access
window.createStoreOwnerRecord = createStoreOwnerRecord;
window.testStorePlanPermissions = testStorePlanPermissions;

console.log('🛠️ Debug utilities loaded!');
console.log('Run window.createStoreOwnerRecord() to create a storeOwners document');
console.log('Run window.testStorePlanPermissions() to test StorePlan permissions');
