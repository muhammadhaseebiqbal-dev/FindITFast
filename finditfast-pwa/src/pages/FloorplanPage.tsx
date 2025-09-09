import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FloorplanViewer } from '../components/floorplan/FloorplanViewer';
import { MobileLayout, MobileHeader, MobileContent } from '../components/common/MobileLayout';
import { GestureHandler } from '../components/common/MobileInteraction';
import { useViewport, useOrientation } from '../hooks/useResponsive';
import { firestoreService } from '../services/firestoreService';
import type { Store, Item } from '../types';

export const FloorplanPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLandscape } = useOrientation();
  const { isMobile } = useViewport();
  
  console.log('🏪 FloorplanPage: Component rendered with storeId:', storeId);
  
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the item ID and mode from URL params if provided
  const itemIdFromUrl = searchParams.get('itemId');
  const mode = searchParams.get('mode'); // 'relocate' mode for item relocation
  
  console.log('🔗 FloorplanPage: URL params:', { storeId, itemIdFromUrl, mode });

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
        
        // Load store data - try multiple collections
        console.log('🏪 FloorplanPage: Attempting to load store with ID:', storeId);
        
        // Try storeRequests collection first (current implementation)
        let storeData = await firestoreService.getStore(storeId);
        console.log('🏪 FloorplanPage: Store data from storeRequests:', storeData);
        console.log('🏪 FloorplanPage: Store properties:', Object.keys(storeData || {}));
        const storeDataAny = storeData as any;
        console.log('🏪 FloorplanPage: Store name fields:', {
          name: storeData?.name,
          storeName: storeDataAny?.storeName,
          ownerName: storeDataAny?.ownerName
        });
        console.log('🏪 FloorplanPage: Store floorplan fields:', {
          floorplanUrl: storeData?.floorplanUrl,
          floorPlanUrl: storeDataAny?.floorPlanUrl,
          imageUrl: storeDataAny?.imageUrl
        });
        
        // If not found in storeRequests, try stores collection
        if (!storeData) {
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('../services/firebase');
            const storeDocRef = doc(db, 'stores', storeId);
            const storeSnapshot = await getDoc(storeDocRef);
            
            if (storeSnapshot.exists()) {
              storeData = { id: storeSnapshot.id, ...storeSnapshot.data() } as Store;
              console.log('🏪 FloorplanPage: Store data from stores collection:', storeData);
            }
          } catch (error) {
            console.error('Error loading from stores collection:', error);
          }
        }
        
        if (!storeData) {
          setError('Store not found');
          return;
        }
        
        // Check for active floorplan from storePlans collection
        let floorplanUrl = storeData.floorplanUrl || (storeData as any).floorPlanUrl;
        
        // If no direct floorplanUrl, check storePlans collection
        if (!floorplanUrl) {
          try {
            const { StorePlanService } = await import('../services/firestoreService');
            
            // Try multiple store ID variations including prefixes
            const storeIdVariations = [storeId, `temp_${storeId}`, `virtual_${storeId}`];
            let activeStorePlans: any[] = [];
            
            console.log('🔍 FloorplanPage: Trying store ID variations:', storeIdVariations);
            
            for (const storeIdVariant of storeIdVariations) {
              console.log('🔍 FloorplanPage: Checking storeId variant:', storeIdVariant);
              activeStorePlans = await StorePlanService.getActiveByStore(storeIdVariant);
              if (activeStorePlans.length > 0) {
                console.log('✅ FloorplanPage: Found active store plans for:', storeIdVariant);
                break;
              }
            }
            
            console.log('🏪 FloorplanPage: Active store plans found:', activeStorePlans.length);
            
            if (activeStorePlans.length > 0) {
              const activePlan = activeStorePlans[0];
              console.log('🏪 FloorplanPage: Active plan data:', {
                id: activePlan.id,
                hasImageData: activePlan.hasImageData,
                fileName: activePlan.fileName
              });
              
              // Check if base64 data is available directly in the document
              if (activePlan.base64) {
                floorplanUrl = `data:${activePlan.type || 'image/jpeg'};base64,${activePlan.base64}`;
                console.log('🏪 FloorplanPage: Created floorplan URL from base64 data');
              } else if (activePlan.hasImageData) {
                // Fallback to storage if base64 is not available
                const { getStorage, ref, getDownloadURL } = await import('firebase/storage');
                const storage = getStorage();
                const imageRef = ref(storage, `storePlans/${activePlan.id}/${activePlan.fileName}`);
                
                try {
                  floorplanUrl = await getDownloadURL(imageRef);
                  console.log('🏪 FloorplanPage: Got floorplan URL from storage:', floorplanUrl);
                } catch (storageError) {
                  console.error('🏪 FloorplanPage: Failed to get floorplan from storage:', storageError);
                }
              }
            }
          } catch (error) {
            console.error('🏪 FloorplanPage: Failed to load store plans:', error);
          }
        }
        
        // Map storeRequest properties to Store interface if needed
        const mappedStore: Store = {
          id: storeData.id,
          name: (storeData as any).storeName || (storeData as any).name || 'Unnamed Store',
          address: storeData.address || 'No address',
          location: storeData.location || { latitude: 0, longitude: 0 },
          floorplanUrl: floorplanUrl,
          ownerId: storeData.ownerId || (storeData as any).ownerEmail || '',
          createdAt: storeData.createdAt,
          updatedAt: storeData.updatedAt
        };
        
        console.log('🏪 FloorplanPage: Final mapped store:', {
          id: mappedStore.id,
          name: mappedStore.name,
          hasFloorplanUrl: !!mappedStore.floorplanUrl,
          floorplanUrl: mappedStore.floorplanUrl
        });
        setStore(mappedStore);

        // Load items for this store
        const storeItems = await firestoreService.getStoreItems(storeId);
        console.log('🗂️ FloorplanPage: Loaded store items:', {
          storeId,
          itemsCount: storeItems.length,
          items: storeItems.map(item => ({
            id: item.id,
            name: item.name,
            storeId: item.storeId,
            position: item.position
          }))
        });
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
    // In relocate mode, don't allow selecting different items
    if (mode === 'relocate') {
      return;
    }
    
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

  // Handle location selection for relocate mode
  const handleLocationSelect = async (position: { x: number; y: number }) => {
    if (mode === 'relocate' && itemIdFromUrl) {
      try {
        // Update the item's position in Firestore
        const { ItemService } = await import('../services/firestoreService');
        const { Timestamp } = await import('firebase/firestore');
        await ItemService.update(itemIdFromUrl, {
          position: position,
          updatedAt: Timestamp.now()
        });
        
        console.log('🎯 Item location updated:', { itemId: itemIdFromUrl, newPosition: position });
        
        // Show success message
        alert('Item location updated successfully!');
        
        // Navigate back to the report page
        navigate(-1);
      } catch (error) {
        console.error('Failed to update item location:', error);
        alert('Failed to update location. Please try again.');
      }
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
    <MobileLayout className={`${isLandscape ? 'landscape:flex landscape:flex-row' : ''}`}>
      <MobileHeader
        title={store.name}
        subtitle={store.address}
        showBack={true}
        onBack={handleBack}
      />
      
      <MobileContent className="flex-1 space-y-6">
        <GestureHandler
          onSwipeRight={handleBack}
          onDoubleTap={() => setSelectedItemId(undefined)}
          className="h-full"
        >
          {(() => {
            console.log('🎯 FloorplanPage: About to render FloorplanViewer with:', {
              store: store ? { id: store.id, name: store.name, floorplanUrl: store.floorplanUrl } : null,
              itemsCount: items.length,
              selectedItemId,
              itemIdFromUrl
            });
            return (
              <FloorplanViewer
                store={store}
                items={items}
                selectedItemId={selectedItemId}
                onItemSelect={handleItemSelect}
                onLocationSelect={mode === 'relocate' ? handleLocationSelect : undefined}
                mode={mode || undefined}
                className="rounded-2xl overflow-hidden shadow-lg"
              />
            );
          })()}
        </GestureHandler>

        {/* Mobile-optimized Help Text */}
        {!selectedItemId && items.length > 0 && isMobile && (
          <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">How to use</h3>
                <p className="text-sm text-blue-800">
                  Tap on the red pins to see item details. Swipe right to go back or double-tap to clear selection.
                </p>
              </div>
            </div>
          </div>
        )}
      </MobileContent>
    </MobileLayout>
  );
};