import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FloorplanUpload } from './FloorplanUpload';
import type { Store } from '../../types';

interface ApprovedStoreRequest {
  id: string;
  storeName: string;
  storeType?: string;
  address: string;
  status: 'approved';
  approvedAt: Date;
  storeId?: string; // Reference to the actual store if created
}

export const FloorplanManager: React.FC = () => {
  const { user } = useAuth();
  const [approvedRequests, setApprovedRequests] = useState<ApprovedStoreRequest[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadApprovedStores();
  }, [user]);

  const loadApprovedStores = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Get approved store requests
      const requestsQuery = query(
        collection(db, 'storeRequests'),
        where('requestedBy', '==', user.uid),
        where('status', '==', 'approved')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const approvedRequestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        approvedAt: doc.data().approvedAt?.toDate() || new Date(),
      })) as ApprovedStoreRequest[];

      setApprovedRequests(approvedRequestsData);

      // Get actual stores created from these requests
      if (approvedRequestsData.length > 0) {
        const storesQuery = query(
          collection(db, 'stores'),
          where('ownerId', '==', user.uid)
        );
        
        const storesSnapshot = await getDocs(storesQuery);
        const storesData = storesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Store[];

        setStores(storesData);
      }

    } catch (err) {
      console.error('Error loading approved stores:', err);
      setError('Failed to load your approved stores');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (url: string, storeName: string) => {
    setUploadSuccess(`Floorplan uploaded successfully for ${storeName}!`);
    setTimeout(() => setUploadSuccess(null), 5000);
    // Refresh store data to get updated floorplan URLs
    loadApprovedStores();
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const getStoreForRequest = (requestId: string): Store | undefined => {
    // Try to match store by name and owner
    const request = approvedRequests.find(req => req.id === requestId);
    if (!request) return undefined;
    
    return stores.find(store => 
      store.name === request.storeName && 
      store.ownerId === user?.uid
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <span className="ml-3 text-gray-600">Loading your stores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Stores</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadApprovedStores}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (approvedRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Stores</h3>
          <p className="text-gray-600 mb-4">
            You need to have approved store requests before you can upload floorplans.
          </p>
          <button
            onClick={() => window.location.href = '/owner/dashboard?tab=requests'}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-900 transition-colors"
          >
            Submit Store Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">{uploadSuccess}</p>
          </div>
        </div>
      )}

      {/* Store Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Floorplan Management</h2>
            <p className="text-gray-600">Upload and manage floorplans for your approved stores</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Approved Stores</p>
            <p className="text-2xl font-bold text-gray-900">{approvedRequests.length}</p>
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedRequests.map((request) => {
            const store = getStoreForRequest(request.id);
            const hasFloorplan = store?.floorplanUrl;
            
            return (
              <div
                key={request.id}
                className={`border rounded-xl p-4 transition-all cursor-pointer ${
                  selectedStore === request.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedStore(selectedStore === request.id ? null : request.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{request.storeName}</h3>
                    <p className="text-sm text-gray-600">{request.storeType || 'Store'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {request.address.length > 40 ? request.address.substring(0, 40) + '...' : request.address}
                    </p>
                  </div>
                  <div className="ml-3 flex flex-col items-end">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                      ✅ Approved
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hasFloorplan 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hasFloorplan ? '🏗️ Floorplan Ready' : '📋 Needs Floorplan'}
                    </div>
                  </div>
                </div>
                
                {/* Store Preview */}
                {hasFloorplan && store?.floorplanUrl && (
                  <div className="mt-3">
                    <img
                      src={store.floorplanUrl}
                      alt={`${request.storeName} floorplan`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Approved: {request.approvedAt.toLocaleDateString()}</span>
                    {store?.id && <span>Store ID: {store.id.substring(0, 8)}...</span>}
                  </div>
                </div>
                
                {selectedStore === request.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">
                      Click to {hasFloorplan ? 'update' : 'upload'} floorplan below ↓
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floorplan Upload Component */}
      {selectedStore && (
        <div className="bg-white rounded-xl shadow-sm">
          {(() => {
            const request = approvedRequests.find(req => req.id === selectedStore);
            const store = request ? getStoreForRequest(request.id) : undefined;
            
            if (!request) return null;
            
            return (
              <div className="p-6">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {store?.floorplanUrl ? 'Update' : 'Upload'} Floorplan: {request.storeName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {request.address}
                  </p>
                  {!store?.id && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        ⚠️ Store record is being created. You can upload the floorplan now, and it will be associated with your store once it's ready.
                      </p>
                    </div>
                  )}
                </div>
                
                <FloorplanUpload
                  storeId={store?.id || `temp_${request.id}`} // Use temp ID if store not created yet
                  currentFloorplanUrl={store?.floorplanUrl}
                  onUploadSuccess={(url) => handleUploadSuccess(url, request.storeName)}
                  onUploadError={handleUploadError}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">How to upload floorplans:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click on any store card above to select it</li>
              <li>• Use "Take Photo" to capture the floorplan with your camera</li>
              <li>• Use "Choose from Gallery" to upload an existing image</li>
              <li>• Supported formats: JPEG, PNG, WebP (max 10MB)</li>
              <li>• High-quality images work best for item placement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
