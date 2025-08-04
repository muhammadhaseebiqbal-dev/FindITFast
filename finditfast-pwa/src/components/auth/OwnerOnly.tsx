import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface OwnerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  storeId?: string; // If provided, checks if owner can manage this specific store
}

export const OwnerOnly: React.FC<OwnerOnlyProps> = ({
  children,
  fallback = null,
  storeId
}) => {
  const { isOwner, canManageStore } = usePermissions();

  // If not an owner, show fallback or nothing
  if (!isOwner) {
    return <>{fallback}</>;
  }

  // If storeId is provided, check if owner can manage this specific store
  if (storeId && !canManageStore(storeId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};