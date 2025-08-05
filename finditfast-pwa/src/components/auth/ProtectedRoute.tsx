import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
  allowAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOwner = false,
  allowAdmin = false  
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    // Redirect to appropriate auth page based on route
    const redirectTo = location.pathname.startsWith('/admin') ? '/admin/auth' : '/owner/auth';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if this is an admin user
  const isAdmin = user.email === 'admin@finditfast.com';
  
  // If admin access is allowed and user is admin, allow access
  if (allowAdmin && isAdmin) {
    return <>{children}</>;
  }

  // For owner routes, allow access if user is authenticated
  if (requireOwner && !isAdmin) {
    return <>{children}</>;
  }

  return <>{children}</>;
};