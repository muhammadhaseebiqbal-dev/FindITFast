import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { StoreRequestForm } from './StoreRequestForm';

interface UserActionsProps {
  className?: string;
}

export const UserActions: React.FC<UserActionsProps> = ({ className = '' }) => {
  const { isUser } = usePermissions();
  const [showStoreRequestForm, setShowStoreRequestForm] = useState(false);

  // Only show for regular users
  if (!isUser) {
    return null;
  }

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
        {/* Store Request Feature */}
        <button
          onClick={() => setShowStoreRequestForm(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Request New Store</span>
          </div>
        </button>
        <p className="text-xs text-center text-gray-500">
          Can't find your local store? Request it to be added to the app
        </p>

        <div className="text-center space-y-2 pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Are you a store owner?{' '}
            <a
              href="/owner/auth"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </a>
          </p>
          <p className="text-sm text-gray-500">
            App administrator?{' '}
            <a
              href="/admin/auth"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Admin login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};