import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { StoreRequestForm } from './StoreRequestForm';

interface UserActionsProps {
  className?: string;
}

export const UserActions: React.FC<UserActionsProps> = ({ className = '' }) => {
  const { hasPermission, isUser } = usePermissions();
  const [showStoreRequestForm, setShowStoreRequestForm] = useState(false);
  const navigate = useNavigate();

  // Only show for regular users
  if (!isUser) {
    return null;
  }

  const canRequestStores = hasPermission('canRequestStores');

  if (showStoreRequestForm) {
    return (
      <div className={className}>
        <StoreRequestForm
          onSuccess={() => setShowStoreRequestForm(false)}
          onCancel={() => setShowStoreRequestForm(false)}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Role Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Customer View</h3>
            <p className="text-sm text-blue-600">
              You can search for items and report issues to help keep information accurate.
            </p>
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="space-y-3">
        {canRequestStores && (
          <button
            onClick={() => navigate('/request-store')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Request a New Store
          </button>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Are you a store owner?{' '}
            <a
              href="/owner/auth"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};