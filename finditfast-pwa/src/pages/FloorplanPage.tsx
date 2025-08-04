import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FloorplanViewer } from '../components/floorplan/FloorplanViewer';
import { firestoreService } from '../services/firestoreService';
import type { Store, Item } from '../types';

export const FloorplanPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the item ID from URL params if provided
  const itemIdFromUrl = searchParams.get('itemId');

  useEffect(() => {
    const loadStoreAndItems = async () => {
      if (!storeId) {
        setError('Store ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Load store data
        const storeData = await firestoreService.getStore(storeId);
        if (!storeData) {
          setError('Store not found');
          return;
        }
        setStore(storeData);

        // Load items for this store
        const storeItems = await firestoreService.getStoreItems(storeId);
        setItems(storeItems);

        // Set selected item if provided in URL
        if (itemIdFromUrl && storeItems.some(item => item.id === itemIdFromUrl)) {
          setSelectedItemId(itemIdFromUrl);
        }
      } catch (err) {
        console.error('Error loading store and items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load store data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreAndItems();
  }, [storeId, itemIdFromUrl]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleItemSelect = (item: Item) => {
    // Toggle selection - if same item is clicked, deselect it
    if (selectedItemId === item.id) {
      setSelectedItemId(undefined);
      // Remove itemId from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('itemId');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    } else {
      setSelectedItemId(item.id);
      // Add itemId to URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('itemId', item.id);
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Store Floorplan</h1>
            </div>
          </div>
        </header>
        
        <main className="max-w-md mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Store Floorplan</h1>
            </div>
          </div>
        </header>
        
        <main className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Floorplan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="ml-4 min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-gray-900 truncate">{store.name}</h1>
              <p className="text-sm text-gray-600 truncate">{store.address}</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-md mx-auto px-4 py-6">
        <FloorplanViewer
          store={store}
          items={items}
          selectedItemId={selectedItemId}
          onItemSelect={handleItemSelect}
          className="mb-6"
        />

        {/* Help Text */}
        {!selectedItemId && items.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">How to use</h3>
                <p className="text-sm text-blue-800">
                  Tap on any red pin to see detailed information about that item, including price and verification status.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};