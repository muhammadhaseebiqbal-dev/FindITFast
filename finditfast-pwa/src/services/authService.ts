import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from './firebase';
import { StoreOwnerService } from './firestoreService';
import { generateUniqueOwnerId } from '../utils/idGenerator';
import type { StoreOwner } from '../types';

export interface OwnerRegistrationData {
  name: string;
  email: string;
  phone: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export class AuthService {
  /**
   * Register a new store owner
   */
  static async registerOwner(data: OwnerRegistrationData, password: string): Promise<UserCredential> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, password);
      
      // Generate custom short owner ID
      const customOwnerId = await generateUniqueOwnerId();
      
      // Create store owner profile in Firestore with custom ID as document ID
      const ownerData: Omit<StoreOwner, 'id'> = {
        firebaseUid: userCredential.user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        storeId: '', // Will be set when store is created
        createdAt: new Date() as any,
      };
      
      // Use the custom owner ID as the document ID
      await StoreOwnerService.createWithId(customOwnerId, ownerData);
      
      return userCredential;
    } catch (error: any) {
      console.error('Error registering owner:', error);
      throw this.formatAuthError(error);
    }
  }

  /**
   * Sign in store owner
   */
  static async signInOwner(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in owner:', error);
      throw this.formatAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOutOwner(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.formatAuthError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get store owner profile for current user
   */
  static async getCurrentOwnerProfile(): Promise<StoreOwner | null> {
    const user = this.getCurrentUser();
    if (!user) {
      console.log('❌ AuthService: No current user');
      return null;
    }

    try {
      console.log('🔍 AuthService: Querying owners for firebaseUid:', user.uid);
      // Query owner by Firebase UID field
      const owners = await StoreOwnerService.getAll();
      console.log('📋 AuthService: Found', owners.length, 'total owners');
      
      const matchingOwner = owners.find(owner => owner.firebaseUid === user.uid);
      console.log('🎯 AuthService: Matching owner:', matchingOwner ? `Found: ${matchingOwner.id}` : 'Not found');
      
      if (matchingOwner) {
        console.log('✅ AuthService: Owner details:', {
          id: matchingOwner.id,
          email: matchingOwner.email,
          firebaseUid: matchingOwner.firebaseUid,
          storeId: matchingOwner.storeId
        });
      }
      
      return matchingOwner || null;
    } catch (error) {
      console.error('❌ AuthService: Error getting owner profile:', error);
      return null;
    }
  }

  /**
   * Format Firebase Auth errors for user display
   */
  private static formatAuthError(error: any): AuthError {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    return {
      code: error.code || 'auth/unknown-error',
      message: errorMessages[error.code] || 'An unexpected error occurred. Please try again.',
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }
}