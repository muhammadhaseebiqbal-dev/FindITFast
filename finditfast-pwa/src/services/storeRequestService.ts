import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { StoreRequest } from '../types/index';

export interface CreateStoreRequestData {
  storeName: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  requestedBy?: string;
  notes?: string;
}

export class StoreRequestService {
  private static readonly COLLECTION_NAME = 'storeRequests';

  /**
   * Submit a new store request
   */
  static async createStoreRequest(data: CreateStoreRequestData): Promise<string> {
    try {
      const requestData = {
        ...data,
        requestedAt: Timestamp.now(),
        status: 'pending' as const,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), requestData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating store request:', error);
      throw new Error('Failed to submit store request. Please try again.');
    }
  }

  /**
   * Get all store requests (admin function)
   */
  static async getAllStoreRequests(): Promise<StoreRequest[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('requestedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      })) as StoreRequest[];
    } catch (error) {
      console.error('Error fetching store requests:', error);
      throw new Error('Failed to fetch store requests.');
    }
  }

  /**
   * Get store requests by user (if authenticated)
   */
  static async getStoreRequestsByUser(userId: string): Promise<StoreRequest[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('requestedBy', '==', userId),
        orderBy('requestedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      })) as StoreRequest[];
    } catch (error) {
      console.error('Error fetching user store requests:', error);
      throw new Error('Failed to fetch your store requests.');
    }
  }

  /**
   * Update store request status (admin function)
   */
  static async updateStoreRequestStatus(
    requestId: string, 
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.COLLECTION_NAME, requestId);
      const updateData: any = { status };
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating store request status:', error);
      throw new Error('Failed to update store request status.');
    }
  }

  /**
   * Validate store request data
   */
  static validateStoreRequestData(data: CreateStoreRequestData): string[] {
    const errors: string[] = [];

    if (!data.storeName?.trim()) {
      errors.push('Store name is required');
    } else if (data.storeName.trim().length < 2) {
      errors.push('Store name must be at least 2 characters long');
    }

    if (!data.address?.trim()) {
      errors.push('Store address is required');
    } else if (data.address.trim().length < 5) {
      errors.push('Please provide a complete address');
    }

    if (data.location) {
      if (typeof data.location.latitude !== 'number' || 
          typeof data.location.longitude !== 'number') {
        errors.push('Invalid location coordinates');
      }
    }

    return errors;
  }
}