import { Timestamp } from 'firebase/firestore';
import { ItemService } from './firestoreService';
import type { Item } from '../types';

export interface ItemVerificationData {
  verified: boolean;
  verifiedAt: Timestamp;
  updatedAt: Timestamp;
}

export class ItemVerificationService {
  /**
   * Mark an item as verified by store owner
   * @param itemId - The item ID to verify
   * @returns Promise<void>
   */
  static async verifyItem(itemId: string): Promise<void> {
    const now = new Date();
    const verificationData: Partial<Item> = {
      verified: true,
      verifiedAt: now as any, // Firebase will convert to Timestamp
      updatedAt: now as any,
    };

    await ItemService.update(itemId, verificationData);
  }

  /**
   * Mark an item as unverified (e.g., due to reports)
   * @param itemId - The item ID to unverify
   * @returns Promise<void>
   */
  static async unverifyItem(itemId: string): Promise<void> {
    const now = new Date();
    const verificationData: Partial<Item> = {
      verified: false,
      updatedAt: now as any,
    };

    await ItemService.update(itemId, verificationData);
  }

  /**
   * Create a new item with automatic verification (for owner uploads)
   * @param itemData - Item data without verification fields
   * @returns Promise<string> - The created item ID
   */
  static async createVerifiedItem(itemData: Omit<Item, 'id' | 'verified' | 'verifiedAt' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const verifiedItemData: Omit<Item, 'id'> = {
      ...itemData,
      verified: true,
      verifiedAt: now as any,
      createdAt: now as any,
      updatedAt: now as any,
    };

    return await ItemService.create(verifiedItemData);
  }

  /**
   * Get verification status for an item
   * @param itemId - The item ID to check
   * @returns Promise<ItemVerificationData | null>
   */
  static async getVerificationStatus(itemId: string): Promise<ItemVerificationData | null> {
    const item = await ItemService.getById(itemId);
    if (!item) return null;

    return {
      verified: item.verified,
      verifiedAt: item.verifiedAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * Check if an item needs re-verification based on report count
   * @param item - The item to check
   * @param reportThreshold - Number of reports that trigger re-verification (default: 3)
   * @returns boolean
   */
  static shouldRequireReVerification(item: Item, reportThreshold: number = 3): boolean {
    return item.reportCount >= reportThreshold && item.verified;
  }

  /**
   * Get items that need verification review
   * @param storeId - Store ID to filter by
   * @param reportThreshold - Report threshold for flagging items
   * @returns Promise<Item[]>
   */
  static async getItemsNeedingReview(storeId: string, reportThreshold: number = 3): Promise<Item[]> {
    const storeItems = await ItemService.getByStore(storeId);
    
    return storeItems.filter(item => 
      this.shouldRequireReVerification(item, reportThreshold)
    );
  }

  /**
   * Update item verification timestamp (for periodic re-verification)
   * @param itemId - The item ID to update
   * @returns Promise<void>
   */
  static async refreshVerification(itemId: string): Promise<void> {
    const now = new Date();
    const updateData: Partial<Item> = {
      verifiedAt: now as any,
      updatedAt: now as any,
    };

    await ItemService.update(itemId, updateData);
  }

  /**
   * Get verification statistics for a store
   * @param storeId - Store ID to get stats for
   * @returns Promise<{total: number, verified: number, unverified: number, needsReview: number}>
   */
  static async getVerificationStats(storeId: string): Promise<{
    total: number;
    verified: number;
    unverified: number;
    needsReview: number;
  }> {
    const storeItems = await ItemService.getByStore(storeId);
    
    const stats = {
      total: storeItems.length,
      verified: 0,
      unverified: 0,
      needsReview: 0,
    };

    storeItems.forEach(item => {
      if (item.verified) {
        stats.verified++;
        if (this.shouldRequireReVerification(item)) {
          stats.needsReview++;
        }
      } else {
        stats.unverified++;
      }
    });

    return stats;
  }

  /**
   * Batch verify multiple items
   * @param itemIds - Array of item IDs to verify
   * @returns Promise<void>
   */
  static async batchVerifyItems(itemIds: string[]): Promise<void> {
    const now = new Date();
    const verificationData: Partial<Item> = {
      verified: true,
      verifiedAt: now as any,
      updatedAt: now as any,
    };

    const updatePromises = itemIds.map(itemId => 
      ItemService.update(itemId, verificationData)
    );

    await Promise.all(updatePromises);
  }

  /**
   * Check if verification is expired (older than specified days)
   * @param item - The item to check
   * @param maxDays - Maximum days before verification expires (default: 30)
   * @returns boolean
   */
  static isVerificationExpired(item: Item, maxDays: number = 30): boolean {
    if (!item.verified || !item.verifiedAt) return false;

    const verifiedDate = item.verifiedAt.toDate();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - maxDays);

    return verifiedDate < expirationDate;
  }

  /**
   * Get items with expired verification
   * @param storeId - Store ID to filter by
   * @param maxDays - Maximum days before verification expires
   * @returns Promise<Item[]>
   */
  static async getExpiredVerifications(storeId: string, maxDays: number = 30): Promise<Item[]> {
    const storeItems = await ItemService.getByStore(storeId);
    
    return storeItems.filter(item => 
      this.isVerificationExpired(item, maxDays)
    );
  }
}

// Export convenience methods
export const verifyItem = ItemVerificationService.verifyItem;
export const createVerifiedItem = ItemVerificationService.createVerifiedItem;
export const getVerificationStats = ItemVerificationService.getVerificationStats;