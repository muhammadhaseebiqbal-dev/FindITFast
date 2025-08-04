import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FloorplanUpload, ItemManager } from '../components/owner';
import { StoreService, ItemService } from '../services/firestoreService';
import type { Store, Item } from '../types';

export const OwnerDashboard: React.FC = () => {
  const { user, ownerProfile, signOut } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load store data and items
  useEffect(() => {
    const loadStoreData = async () => {
      if (ownerProfile?.storeId) {
        try {
          const [storeData, storeItems] = await Promise.all([
            StoreService.getById(ownerProfile.storeId),
            ItemService.getByStore(ownerProfile.storeId)
          ]);
          setStore(storeData);
          setItems(storeItems);
        } catch (error) {
          console.error('Error loading store data:', error);
          setError('Failed to load store data');
        }
      }
      setLoading(false);
    };

    loadStoreData();
  }, [ownerProfile?.storeId]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleUploadSuccess = (url: string) => {
    setUploadSuccess('Floorplan uploaded successfully!');
    // Update store state
    if (store) {
      setStore({ ...store, floorplanUrl: url });
    }
    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setError(error);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleItemAdded = (newItem: Item) => {
    setItems(prev => [...prev, newItem]);
    setUploadSuccess('Item added successfully!');
    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Store Owner Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your store and inventory
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome back, {ownerProfile?.name || user?.email}!
              </h2>
              
              {ownerProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Store Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{ownerProfile.storeName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{ownerProfile.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-sm text-gray-900">{ownerProfile.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Store ID</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {ownerProfile.storeId || 'Not assigned'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700">{uploadSuccess}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Floorplan Management */}
          {!loading && ownerProfile?.storeId && (
            <div className="mb-6">
              <FloorplanUpload
                storeId={ownerProfile.storeId}
                currentFloorplanUrl={store?.floorplanUrl}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {/* Item Management */}
          {!loading && ownerProfile?.storeId && store?.floorplanUrl && (
            <div className="mb-6">
              <ItemManager
                storeId={ownerProfile.storeId}
                floorplanUrl={store.floorplanUrl}
                existingItems={items}
                onItemAdded={handleItemAdded}
                onError={handleError}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Manage Store</h3>
                      <p className="text-sm text-gray-600">Update store information</p>
                    </div>
                  </div>
                </button>

                <button 
                  className={`${
                    store?.floorplanUrl 
                      ? 'bg-green-50 hover:bg-green-100 border-green-200' 
                      : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  } border rounded-lg p-4 text-left transition-colors`}
                  disabled={!store?.floorplanUrl}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className={`h-6 w-6 ${store?.floorplanUrl ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${store?.floorplanUrl ? 'text-gray-900' : 'text-gray-500'}`}>
                        Manage Inventory
                      </h3>
                      <p className={`text-sm ${store?.floorplanUrl ? 'text-gray-600' : 'text-gray-400'}`}>
                        {store?.floorplanUrl ? 'Add and update items' : 'Upload floorplan first'}
                      </p>
                    </div>
                  </div>
                </button>

                <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
                      <p className="text-sm text-gray-600">Check customer feedback</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};