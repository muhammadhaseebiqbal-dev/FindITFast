import { describe, it, expect } from 'vitest';
import { PermissionService } from '../../services/permissionService';
import { StoreRequestService } from '../../services/storeRequestService';
import type { User } from 'firebase/auth';
import type { StoreOwner } from '../../types';

// Mock user and owner data
const mockUser: User = {
  uid: 'user123',
  email: 'user@example.com',
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

describe('Permission System Integration', () => {
  describe('User Access Control', () => {
    it('should allow regular users to report items but not edit them', () => {
      // Regular user (no owner profile)
      const userRole = PermissionService.getUserRole(mockUser, null);
      const userPermissions = PermissionService.getUserPermissions(userRole);

      expect(userRole).toBe('user');
      expect(userPermissions.canReportItems).toBe(true);
      expect(userPermissions.canEditItems).toBe(false);
      expect(userPermissions.canMoveItems).toBe(false);
      expect(userPermissions.canUploadFloorplan).toBe(false);
      expect(userPermissions.canManageStore).toBe(false);
      expect(userPermissions.canRequestStores).toBe(true);
    });

    it('should allow owners to edit items in their own store', () => {
      // Store owner
      const ownerRole = PermissionService.getUserRole(mockUser, mockOwnerProfile);
      const ownerPermissions = PermissionService.getUserPermissions(ownerRole);

      expect(ownerRole).toBe('owner');
      expect(ownerPermissions.canEditItems).toBe(true);
      expect(ownerPermissions.canMoveItems).toBe(true);
      expect(ownerPermissions.canUploadFloorplan).toBe(true);
      expect(ownerPermissions.canManageStore).toBe(true);
      expect(ownerPermissions.canReportItems).toBe(true);
      expect(ownerPermissions.canRequestStores).toBe(false);

      // Owner can edit items in their own store
      expect(PermissionService.canEditStoreItems(mockUser, mockOwnerProfile, 'store123')).toBe(true);
      // Owner cannot edit items in other stores
      expect(PermissionService.canEditStoreItems(mockUser, mockOwnerProfile, 'other-store')).toBe(false);
    });

    it('should prevent regular users from editing any store items', () => {
      // Regular user cannot edit items in any store
      expect(PermissionService.canEditStoreItems(mockUser, null, 'store123')).toBe(false);
      expect(PermissionService.canEditStoreItems(mockUser, null, 'any-store')).toBe(false);
    });

    it('should allow unauthenticated users to have basic user permissions', () => {
      // Unauthenticated user
      const guestRole = PermissionService.getUserRole(null, null);
      const guestPermissions = PermissionService.getUserPermissions(guestRole);

      expect(guestRole).toBe('user');
      expect(guestPermissions.canReportItems).toBe(true);
      expect(guestPermissions.canRequestStores).toBe(true);
      expect(guestPermissions.canEditItems).toBe(false);
      expect(guestPermissions.canManageStore).toBe(false);
    });
  });

  describe('Store Request System', () => {
    it('should validate store request data correctly', () => {
      const validData = {
        storeName: 'New Store',
        address: '123 Main St, City, State',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      };

      const errors = StoreRequestService.validateStoreRequestData(validData);
      expect(errors).toEqual([]);
    });

    it('should reject invalid store request data', () => {
      const invalidData = {
        storeName: '',
        address: '123',
      };

      const errors = StoreRequestService.validateStoreRequestData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Store name is required');
      expect(errors).toContain('Please provide a complete address');
    });

    it('should handle optional fields correctly', () => {
      const minimalData = {
        storeName: 'Minimal Store',
        address: '123 Main Street, City, State',
      };

      const errors = StoreRequestService.validateStoreRequestData(minimalData);
      expect(errors).toEqual([]);
    });
  });

  describe('Role-Based UI Logic', () => {
    it('should provide correct role display names', () => {
      expect(PermissionService.getRoleDisplayName('user')).toBe('Customer');
      expect(PermissionService.getRoleDisplayName('owner')).toBe('Store Owner');
    });

    it('should handle permission checks for specific actions', () => {
      // Test user permissions
      expect(PermissionService.hasPermission(mockUser, null, 'canReportItems')).toBe(true);
      expect(PermissionService.hasPermission(mockUser, null, 'canEditItems')).toBe(false);

      // Test owner permissions
      expect(PermissionService.hasPermission(mockUser, mockOwnerProfile, 'canEditItems')).toBe(true);
      expect(PermissionService.hasPermission(mockUser, mockOwnerProfile, 'canRequestStores')).toBe(false);
    });
  });
});