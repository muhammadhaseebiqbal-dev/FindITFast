import { describe, it, expect } from 'vitest';
import { PermissionService } from '../../services/permissionService';
import type { User } from 'firebase/auth';
import type { StoreOwner } from '../../types';

// Mock user and owner data
const mockUser: User = {
  uid: 'user123',
  email: 'owner@example.com',
  emailVerified: true,
} as User;

const mockOwnerProfile: StoreOwner = {
  id: 'owner123',
  name: 'John Doe',
  email: 'owner@example.com',
  phone: '+1234567890',
  storeName: 'Test Store',
  storeId: 'store123',
  createdAt: new Date() as any,
};

describe('PermissionService', () => {
  describe('getUserRole', () => {
    it('should return "owner" when user has owner profile', () => {
      const role = PermissionService.getUserRole(mockUser, mockOwnerProfile);
      expect(role).toBe('owner');
    });

    it('should return "user" when user exists but no owner profile', () => {
      const role = PermissionService.getUserRole(mockUser, null);
      expect(role).toBe('user');
    });

    it('should return "user" when no user is authenticated', () => {
      const role = PermissionService.getUserRole(null, null);
      expect(role).toBe('user');
    });

    it('should return "user" when no user but owner profile exists (edge case)', () => {
      const role = PermissionService.getUserRole(null, mockOwnerProfile);
      expect(role).toBe('user');
    });
  });

  describe('getUserPermissions', () => {
    it('should return owner permissions for owner role', () => {
      const permissions = PermissionService.getUserPermissions('owner');
      
      expect(permissions).toEqual({
        canEditItems: true,
        canMoveItems: true,
        canUploadFloorplan: true,
        canManageStore: true,
        canReportItems: true,
        canRequestStores: false,
      });
    });

    it('should return user permissions for user role', () => {
      const permissions = PermissionService.getUserPermissions('user');
      
      expect(permissions).toEqual({
        canEditItems: false,
        canMoveItems: false,
        canUploadFloorplan: false,
        canManageStore: false,
        canReportItems: true,
        canRequestStores: true,
      });
    });
  });

  describe('hasPermission', () => {
    it('should return true for owner with owner permissions', () => {
      const canEdit = PermissionService.hasPermission(mockUser, mockOwnerProfile, 'canEditItems');
      expect(canEdit).toBe(true);
    });

    it('should return false for user with owner permissions', () => {
      const canEdit = PermissionService.hasPermission(mockUser, null, 'canEditItems');
      expect(canEdit).toBe(false);
    });

    it('should return true for user with user permissions', () => {
      const canReport = PermissionService.hasPermission(mockUser, null, 'canReportItems');
      expect(canReport).toBe(true);
    });

    it('should return false for owner with user-only permissions', () => {
      const canRequest = PermissionService.hasPermission(mockUser, mockOwnerProfile, 'canRequestStores');
      expect(canRequest).toBe(false);
    });
  });

  describe('canEditStoreItems', () => {
    it('should return true for owner editing their own store items', () => {
      const canEdit = PermissionService.canEditStoreItems(mockUser, mockOwnerProfile, 'store123');
      expect(canEdit).toBe(true);
    });

    it('should return false for owner editing other store items', () => {
      const canEdit = PermissionService.canEditStoreItems(mockUser, mockOwnerProfile, 'other-store');
      expect(canEdit).toBe(false);
    });

    it('should return false for regular user', () => {
      const canEdit = PermissionService.canEditStoreItems(mockUser, null, 'store123');
      expect(canEdit).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      const canEdit = PermissionService.canEditStoreItems(null, null, 'store123');
      expect(canEdit).toBe(false);
    });

    it('should return false when owner profile is missing', () => {
      const canEdit = PermissionService.canEditStoreItems(mockUser, null, 'store123');
      expect(canEdit).toBe(false);
    });
  });

  describe('canManageStore', () => {
    it('should return true for owner managing their own store', () => {
      const canManage = PermissionService.canManageStore(mockUser, mockOwnerProfile, 'store123');
      expect(canManage).toBe(true);
    });

    it('should return false for owner managing other store', () => {
      const canManage = PermissionService.canManageStore(mockUser, mockOwnerProfile, 'other-store');
      expect(canManage).toBe(false);
    });

    it('should return false for regular user', () => {
      const canManage = PermissionService.canManageStore(mockUser, null, 'store123');
      expect(canManage).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      const canManage = PermissionService.canManageStore(null, null, 'store123');
      expect(canManage).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return "Store Owner" for owner role', () => {
      const displayName = PermissionService.getRoleDisplayName('owner');
      expect(displayName).toBe('Store Owner');
    });

    it('should return "Customer" for user role', () => {
      const displayName = PermissionService.getRoleDisplayName('user');
      expect(displayName).toBe('Customer');
    });
  });
});