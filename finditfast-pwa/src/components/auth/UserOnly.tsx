import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const UserOnly: React.FC<UserOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isUser } = usePermissions();

  // If not a regular user, show fallback or nothing
  if (!isUser) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};