import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { StoreRequestService } from './storeRequestService';
import type { Store, StoreRequest } from '../types/index';

export interface StoreApprovalResult {
  storeId: string;
  store: Store;
  linked: boolean;
  ownerUpdated: boolean;
}

/**
 * Service for handling store request approvals and creating actual stores
 */
export class StoreApprovalService {
  
  /**
   * Approve a store request and create the actual store
   */
  static async approveStoreRequest(
    requestId: string, 
    adminNotes?: string
  ): Promise<StoreApprovalResult> {
    try {
      // Get the store request details
      const request = await this.getStoreRequest(requestId);
      if (!request) {
        throw new Error('Store request not found');
      }

      if (request.status !== 'pending') {
        throw new Error(`Store request is already ${request.status}`);
      }

      // Generate store ID
      const storeId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create the actual store record
      const storeData: Omit<Store, 'id'> = {
        name: request.storeName,
        address: request.address,
        location: request.location ? {
          latitude: request.location.latitude,
          longitude: request.location.longitude
        } : {
          latitude: 0,
          longitude: 0 // Default coordinates - should be updated by owner
        },
        ownerId: request.requestedBy || 'unassigned',
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      // Create store document
      await setDoc(doc(db, 'stores', storeId), storeData);

      // Update the store request status
      await StoreRequestService.updateStoreRequestStatus(
        requestId, 
        'approved',
        adminNotes || `Store approved and created with ID: ${storeId}`
      );

      // Try to link to existing owner if requestedBy matches an owner account
      let linked = false;
      let ownerUpdated = false;

      if (request.requestedBy) {
        try {
          const ownerUpdated = await this.linkStoreToOwner(request.requestedBy, storeId);
          linked = ownerUpdated;
        } catch (error) {
          console.warn('Could not auto-link store to owner:', error);
        }
      }

      const createdStore: Store = {
        id: storeId,
        ...storeData,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };

      return {
        storeId,
        store: createdStore,
        linked,
        ownerUpdated
      };

    } catch (error) {
      console.error('Error approving store request:', error);
      throw new Error(`Failed to approve store request: ${error.message}`);
    }
  }

  /**
   * Link a store to an existing owner account
   */
  static async linkStoreToOwner(ownerUid: string, storeId: string): Promise<boolean> {
    try {
      // Check if owner document exists
      const ownerDoc = await getDoc(doc(db, 'owners', ownerUid));
      
      if (!ownerDoc.exists()) {
        // Try finding owner by UID in storeOwners collection
        const ownerQuery = query(
          collection(db, 'storeOwners'),
          where('uid', '==', ownerUid)
        );
        const ownerSnapshot = await getDocs(ownerQuery);
        
        if (ownerSnapshot.empty) {
          console.warn(`No owner found with UID: ${ownerUid}`);
          return false;
        }

        // Update the first matching owner
        const ownerDocRef = ownerSnapshot.docs[0].ref;
        await updateDoc(ownerDocRef, {
          storeId: storeId,
          updatedAt: serverTimestamp()
        });

        return true;
      }

      // Update owner document with store ID
      await updateDoc(doc(db, 'owners', ownerUid), {
        storeId: storeId,
        updatedAt: serverTimestamp()
      });

      return true;

    } catch (error) {
      console.error('Error linking store to owner:', error);
      return false;
    }
  }

  /**
   * Get store request by ID
   */
  private static async getStoreRequest(requestId: string): Promise<StoreRequest | null> {
    try {
      const requestDoc = await getDoc(doc(db, 'storeRequests', requestId));
      
      if (!requestDoc.exists()) {
        return null;
      }

      return {
        id: requestDoc.id,
        ...requestDoc.data(),
        requestedAt: requestDoc.data().requestedAt?.toDate() || new Date()
      } as StoreRequest;

    } catch (error) {
      console.error('Error getting store request:', error);
      return null;
    }
  }

  /**
   * Reject a store request with reason
   */
  static async rejectStoreRequest(
    requestId: string, 
    reason: string
  ): Promise<void> {
    try {
      await StoreRequestService.updateStoreRequestStatus(
        requestId, 
        'rejected',
        reason
      );
    } catch (error) {
      console.error('Error rejecting store request:', error);
      throw new Error(`Failed to reject store request: ${error.message}`);
    }
  }

  /**
   * Get store creation summary for approved requests
   */
  static async getApprovalSummary(): Promise<{
    totalApproved: number;
    storesCreated: number;
    ownersLinked: number;
  }> {
    try {
      // This would require additional tracking - simplified for now
      return {
        totalApproved: 0,
        storesCreated: 0,
        ownersLinked: 0
      };
    } catch (error) {
      console.error('Error getting approval summary:', error);
      throw error;
    }
  }
}
