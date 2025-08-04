import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionService } from '../services/permissionService';
import type { UserRole, UserPermissions } from '../types';

export interface UsePermissionsReturn {
  role: UserRole;
  permissions: UserPermissions;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canEditStoreItems: (storeId: string) => boolean;
  canManageStore: (storeId: string) => boolean;
  isOwner: boolean;
  isUser: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user, ownerProfile } = useAuth();

  const role = useMemo(() => {
    return PermissionService.getUserRole(user, ownerProfile);
  }, [user, ownerProfile]);

  const permissions = useMemo(() => {
    return PermissionService.getUserPermissions(role);
  }, [role]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return PermissionService.hasPermission(user, ownerProfile, permission);
  };

  const canEditStoreItems = (storeId: string): boolean => {
    return PermissionService.canEditStoreItems(user, ownerProfile, storeId);
  };

  const canManageStore = (storeId: string): boolean => {
    return PermissionService.canManageStore(user, ownerProfile, storeId);
  };

  return {
    role,
    permissions,
    hasPermission,
    canEditStoreItems,
    canManageStore,
    isOwner: role === 'owner',
    isUser: role === 'user',
  };
};