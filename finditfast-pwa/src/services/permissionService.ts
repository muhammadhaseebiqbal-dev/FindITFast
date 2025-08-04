import type { User } from 'firebase/auth';
import type { StoreOwner, UserRole, UserPermissions } from '../types';

export class PermissionService {
  /**
   * Determine user role based on authentication state
   */
  static getUserRole(user: User | null, ownerProfile: StoreOwner | null): UserRole {
    if (user && ownerProfile) {
      return 'owner';
    }
    return 'user';
  }

  /**
   * Get permissions for a user based on their role
   */
  static getUserPermissions(role: UserRole): UserPermissions {
    switch (role) {
      case 'owner':
        return {
          canEditItems: true,
          canMoveItems: true,
          canUploadFloorplan: true,
          canManageStore: true,
          canReportItems: true,
          canRequestStores: false, // Owners don't need to request stores
        };
      case 'user':
      default:
        return {
          canEditItems: false,
          canMoveItems: false,
          canUploadFloorplan: false,
          canManageStore: false,
          canReportItems: true,
          canRequestStores: true,
        };
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(
    user: User | null,
    ownerProfile: StoreOwner | null,
    permission: keyof UserPermissions
  ): boolean {
    const role = this.getUserRole(user, ownerProfile);
    const permissions = this.getUserPermissions(role);
    return permissions[permission];
  }

  /**
   * Check if user can edit items in a specific store
   */
  static canEditStoreItems(
    user: User | null,
    ownerProfile: StoreOwner | null,
    storeId: string
  ): boolean {
    const role = this.getUserRole(user, ownerProfile);
    
    // Only owners can edit items
    if (role !== 'owner' || !ownerProfile) {
      return false;
    }

    // Owners can only edit items in their own store
    return ownerProfile.storeId === storeId;
  }

  /**
   * Check if user can manage a specific store
   */
  static canManageStore(
    user: User | null,
    ownerProfile: StoreOwner | null,
    storeId: string
  ): boolean {
    const role = this.getUserRole(user, ownerProfile);
    
    // Only owners can manage stores
    if (role !== 'owner' || !ownerProfile) {
      return false;
    }

    // Owners can only manage their own store
    return ownerProfile.storeId === storeId;
  }

  /**
   * Get user-friendly role display name
   */
  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'owner':
        return 'Store Owner';
      case 'user':
      default:
        return 'Customer';
    }
  }
}