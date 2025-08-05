import { 
  doc, 
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
   * Approve a store request (store already exists, just update status)
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

      // Store should already exist with the storeId from the request
      const storeId = request.storeId;
      if (!storeId) {
        throw new Error('Store request missing storeId - this should not happen');
      }

      // Verify the store exists
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      if (!storeDoc.exists()) {
        throw new Error(`Store ${storeId} not found - data integrity issue`);
      }

      // Update the store request status
      await StoreRequestService.updateStoreRequestStatus(
        requestId, 
        'approved',
        adminNotes || `Store approved with ID: ${storeId}`
      );

      // Try to link to existing owner if requestedBy matches an owner account
      let linked = false;
      let ownerUpdated = false;

      if (request.requestedBy) {
        try {
          ownerUpdated = await this.linkStoreToOwner(request.requestedBy, storeId);
          linked = ownerUpdated;
        } catch (error) {
          console.warn('Could not auto-link store to owner:', error);
        }
      }

      const existingStore: Store = {
        id: storeId,
        ...storeDoc.data(),
        createdAt: storeDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: storeDoc.data().updatedAt?.toDate() || new Date()
      } as Store;

      return {
        storeId,
        store: existingStore,
        linked,
        ownerUpdated
      };

    } catch (error) {
      console.error('Error approving store request:', error);
      throw new Error(`Failed to approve store request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Link a store to an existing owner account
   */
  static async linkStoreToOwner(ownerUid: string, storeId: string): Promise<boolean> {
    try {
      console.log('🔗 Linking store', storeId, 'to owner UID:', ownerUid);
      
      // Find owner by firebaseUid in storeOwners collection
      const ownerQuery = query(
        collection(db, 'storeOwners'),
        where('firebaseUid', '==', ownerUid)
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      if (ownerSnapshot.empty) {
        console.warn(`❌ No store owner found with firebaseUid: ${ownerUid}`);
        return false;
      }

      // Update the first matching owner with the store ID
      const ownerDocRef = ownerSnapshot.docs[0].ref;
      const ownerData = ownerSnapshot.docs[0].data();
      
      console.log('✅ Found owner record:', ownerSnapshot.docs[0].id, 'Email:', ownerData.email);
      
      await updateDoc(ownerDocRef, {
        storeId: storeId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Successfully linked store', storeId, 'to owner', ownerSnapshot.docs[0].id);
      return true;

    } catch (error) {
      console.error('❌ Error linking store to owner:', error);
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
      throw new Error(`Failed to reject store request: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
