import { describe, it, expect, vi } from 'vitest';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from 'firebase/auth';
import type { StoreOwner } from '../../types';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as any;

// Simple test wrapper to avoid React DOM issues
const testHook = (mockAuthReturn: any) => {
  mockUseAuth.mockReturnValue(mockAuthReturn);
  
  // Create a mock component that uses the hook
  let hookResult: any;
  const TestComponent = () => {
    hookResult = usePermissions();
    return null;
  };
  
  // Simulate the hook execution
  TestComponent();
  return { result: { current: hookResult } };
};

// Mock user and owner data
const mockUser: User = {
  uid: 'user123',
  email: 'owner@example.com',
  emailVerified: true,
} as User;

const mockOwnerProfile: StoreOwner = {
  id: 'owner123',
  firebaseUid: 'user123',
  name: 'John Doe',
  email: 'owner@example.com',
  phone: '+1234567890',
  storeId: 'store123',
  createdAt: new Date() as any,
};

describe('usePermissions', () => {
  it('should return owner permissions when user has owner profile', () => {
    const { result } = testHook({
      user: mockUser,
      ownerProfile: mockOwnerProfile,
    });

    expect(result.current.role).toBe('owner');
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isUser).toBe(false);
    expect(result.current.permissions.canEditItems).toBe(true);
    expect(result.current.permissions.canRequestStores).toBe(false);
  });

  it('should return user permissions when user has no owner profile', () => {
    const { result } = testHook({
      user: mockUser,
      ownerProfile: null,
    });

    expect(result.current.role).toBe('user');
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isUser).toBe(true);
    expect(result.current.permissions.canEditItems).toBe(false);
    expect(result.current.permissions.canRequestStores).toBe(true);
  });

  it('should return user permissions when no user is authenticated', () => {
    const { result } = testHook({
      user: null,
      ownerProfile: null,
    });

    expect(result.current.role).toBe('user');
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isUser).toBe(true);
    expect(result.current.permissions.canEditItems).toBe(false);
    expect(result.current.permissions.canRequestStores).toBe(true);
  });

  it('should correctly check specific permissions', () => {
    const { result } = testHook({
      user: mockUser,
      ownerProfile: mockOwnerProfile,
    });

    expect(result.current.hasPermission('canEditItems')).toBe(true);
    expect(result.current.hasPermission('canRequestStores')).toBe(false);
  });

  it('should correctly check store-specific permissions', () => {
    const { result } = testHook({
      user: mockUser,
      ownerProfile: mockOwnerProfile,
    });

    // Owner can edit items in their own store
    expect(result.current.canEditStoreItems('store123')).toBe(true);
    // Owner cannot edit items in other stores
    expect(result.current.canEditStoreItems('other-store')).toBe(false);

    // Owner can manage their own store
    expect(result.current.canManageStore('store123')).toBe(true);
    // Owner cannot manage other stores
    expect(result.current.canManageStore('other-store')).toBe(false);
  });
});