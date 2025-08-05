import { AuthService } from '../services/authService';

/**
 * Ensures that a store owner document exists for the given user
 * This is required for Firestore security rules to allow access to storePlans
 */
export const ensureStoreOwnerRecord = async (user: any): Promise<boolean> => {
  if (!user?.uid) {
    console.log('❌ No user provided to ensureStoreOwnerRecord');
    return false;
  }
  
  try {
    console.log('🔍 Checking store owner record for:', user.email, user.uid);
    
    // Use AuthService to get current owner profile
    const ownerProfile = await AuthService.getCurrentOwnerProfile();
    
    if (ownerProfile) {
      console.log('✅ Store owner record exists:', ownerProfile.id);
      return true;
    } else {
      console.log('❌ No store owner record found for user');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking store owner record:', error);
    return false;
  }
};
