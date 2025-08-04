import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoreService } from '../../services/firestoreService';
import { StoreRequestService } from '../../services/storeRequestService';
import type { Store, StoreRequest } from '../../types';

export const OwnerStoreManager: React.FC = () => {
  const { user, ownerProfile } = useAuth();
  const [ownedStores, setOwnedStores] = useState<Store[]>([]);
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOwnerData();
  }, [user, ownerProfile]);

  const loadOwnerData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load stores owned by this user
      const stores = await StoreService.getAll();
      const userStores = stores.filter(store => store.ownerId === user.uid);
      setOwnedStores(userStores);

      // Load store requests made by this user
      const requests = await StoreRequestService.getStoreRequestsByUser(user.uid);
      console.log('Store requests loaded:', requests);
      setStoreRequests(requests);

    } catch (err: any) {
      setError(err?.message || 'Failed to load store data');
      console.error('Error loading owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={loadOwnerData}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Stores</h2>
        <p className="text-gray-600">Manage your stores and track request status.</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-800">Active Stores</div>
            <div className="text-2xl font-bold text-blue-900">{ownedStores.length}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="font-medium text-yellow-800">Pending Requests</div>
            <div className="text-2xl font-bold text-yellow-900">
              {storeRequests.filter(r => r.status === 'pending').length}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-800">Approved Requests</div>
            <div className="text-2xl font-bold text-green-900">
              {storeRequests.filter(r => r.status === 'approved').length}
            </div>
          </div>
        </div>
      </div>

      {/* Active Stores */}
      {ownedStores.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              🏪 Your Active Stores ({ownedStores.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {ownedStores.map((store) => (
              <div key={store.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {store.name}
                    </h4>
                    <p className="text-gray-600 mb-2">
                      📍 {store.address}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      🆔 Store ID: {store.id}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      📅 Created: {store.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.floorplanUrl 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {store.floorplanUrl ? '✅ Floorplan Uploaded' : '📋 Floorplan Needed'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => window.open(`/owner/dashboard`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      🔧 Manage Store
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Requests Status */}
      {storeRequests.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              📋 Your Store Requests ({storeRequests.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {storeRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {request.storeName}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRequestStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)} {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      📍 {request.address}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      📅 Requested: {request.requestedAt.toLocaleDateString()} at {request.requestedAt.toLocaleTimeString()}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        💬 <strong>Notes:</strong> {request.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status-specific information */}
                {request.status === 'pending' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-yellow-600">⏳</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">Pending Review</h4>
                        <p className="text-sm text-yellow-700">
                          Your store request is being reviewed by our admin team. You'll be notified once it's approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-green-600">✅</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">Approved!</h4>
                        <p className="text-sm text-green-700">
                          Your store request has been approved! A store record has been created and you can now manage it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-600">❌</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">Request Rejected</h4>
                        <p className="text-sm text-red-700">
                          Your store request was not approved. You can submit a new request with updated information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {ownedStores.length === 0 && storeRequests.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Stores Yet</h3>
          <p className="text-gray-600 mb-4">
            You don't have any stores or requests yet. Start by requesting a new store from your dashboard.
          </p>
        </div>
      )}
    </div>
  );
};
