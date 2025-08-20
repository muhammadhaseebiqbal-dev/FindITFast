import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserRequest } from '../types';

export interface CreateUserRequestData {
  requestType: 'new_store' | 'new_item';
  userId?: string;
  userEmail?: string;
  title: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  storeName?: string;
  itemName?: string;
  storeId?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: {
    images?: string[];
    additionalInfo?: Record<string, any>;
  };
}

export class UserRequestService {
  private static collectionName = 'userRequests';

  static async create(data: CreateUserRequestData): Promise<string> {
    try {
      const requestData = {
        ...data,
        requestedAt: serverTimestamp(),
        status: 'pending' as const,
        priority: data.priority || 'medium' as const
      };

      const docRef = await addDoc(collection(db, this.collectionName), requestData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user request:', error);
      throw new Error('Failed to create request');
    }
  }

  static async getAll(): Promise<UserRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      })) as UserRequest[];
    } catch (error) {
      console.error('Error fetching user requests:', error);
      return [];
    }
  }

  static async getByStatus(status: UserRequest['status']): Promise<UserRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      })) as UserRequest[];
    } catch (error) {
      console.error('Error fetching user requests by status:', error);
      return [];
    }
  }

  static async updateStatus(
    requestId: string, 
    status: UserRequest['status'], 
    reviewedBy?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      const updateData: any = {
        status,
        reviewedAt: serverTimestamp()
      };

      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
      }

      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating user request status:', error);
      throw new Error('Failed to update request status');
    }
  }
}
