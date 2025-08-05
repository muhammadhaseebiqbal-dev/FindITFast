/**
 * Authentication utility functions for handling auth state issues
 */

import { AuthService } from '../services/authService';

/**
 * Force clear all authentication state and storage
 * Useful when there's a mismatch between Firebase auth and user data
 */
export const forceClearAuthState = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await AuthService.signOutOwner();
  } catch (error) {
    console.warn('Error signing out:', error);
  }

  // Clear all browser storage
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB for Firebase (where auth tokens are stored)
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name?.includes('firebase')) {
            return new Promise<void>((resolve) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => resolve(); // Continue even if fails
            });
          }
          return Promise.resolve();
        })
      );
    }
  } catch (error) {
    console.warn('Error clearing storage:', error);
  }

  // Force reload to clear any in-memory state
  window.location.href = '/owner/auth';
};

/**
 * Check if user has valid auth state but missing profile data
 */
export const hasAuthInconsistency = (user: any, ownerProfile: any): boolean => {
  return !!(user && !ownerProfile);
};

/**
 * Show auth inconsistency warning to user
 */
export const showAuthInconsistencyWarning = (): void => {
  const message = `
🔄 Authentication Issue Detected

Your login session exists but your profile data is missing. 
This can happen if:
- Data was deleted from the database
- There's a browser cache issue
- Profile creation was incomplete

Click OK to clear all auth data and login again.
  `.trim();

  if (confirm(message)) {
    forceClearAuthState();
  }
};
