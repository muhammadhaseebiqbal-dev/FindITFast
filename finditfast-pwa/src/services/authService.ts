import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { StoreOwnerService } from './firestoreService';
import type { StoreOwner } from '../types';

export interface OwnerRegistrationData {
  name: string;
  storeName: string;
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
      
      // Create store owner profile in Firestore with the Firebase Auth UID as the document ID
      const ownerData: Omit<StoreOwner, 'id'> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        storeName: data.storeName,
        storeId: '', // Will be set when store is created
        createdAt: new Date() as any,
      };
      
      // Use the Firebase Auth UID as the document ID for easier lookup
      await StoreOwnerService.createWithId(userCredential.user.uid, ownerData);
      
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
    if (!user) return null;

    try {
      // Try to get owner profile by Firebase Auth UID first
      const ownerProfile = await StoreOwnerService.getById(user.uid);
      if (ownerProfile) {
        return ownerProfile;
      }

      // Fallback: Find owner by email for existing records
      const owners = await StoreOwnerService.getAll();
      return owners.find(owner => owner.email === user.email) || null;
    } catch (error) {
      console.error('Error getting owner profile:', error);
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