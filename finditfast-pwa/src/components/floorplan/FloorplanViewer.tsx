import React, { useState, useRef } from 'react';
import { FloorplanImage } from './FloorplanImage';
import { ItemPin } from './ItemPin';
import { ItemInfo } from './ItemInfo';
import { usePermissions } from '../../hooks/usePermissions';
import type { Store, Item } from '../../types';

interface FloorplanViewerProps {
  store: Store;
  items: Item[];
  selectedItemId?: string;
  onItemSelect?: (item: Item) => void;
  className?: string;
}

export const FloorplanViewer: React.FC<FloorplanViewerProps> = ({
  store,
  items,
  selectedItemId,
  onItemSelect,
  className = ''
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { canEditStoreItems, isUser } = usePermissions();



  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoaded(false);
    setImageError(true);
  };

  const handleItemClick = (item: Item) => {
    onItemSelect?.(item);
  };

  // Filter items that belong to this store
  const storeItems = items.filter(item => item.storeId === store.id);

  if (!store.floorplanUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg min-h-64 ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Floorplan Available</h3>
          <p className="text-gray-600">
            This store hasn't uploaded a floorplan yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Floorplan Container */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] min-h-64 max-h-96"
      >
        <FloorplanImage
          src={store.floorplanUrl}
          alt={`${store.name} floorplan`}
          className="w-full h-full"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Item Pins Overlay */}
        {isImageLoaded && !imageError && storeItems.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {storeItems.map((item) => (
                <ItemPin
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                  isSelected={item.id === selectedItemId}
                  allowInteraction={canEditStoreItems(store.id) || isUser}
                />
              ))}
            </div>
          </div>
        )}

        {/* Items Count Badge */}
        {isImageLoaded && !imageError && storeItems.length > 0 && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
            {storeItems.length} item{storeItems.length !== 1 ? 's' : ''} located
          </div>
        )}

        {/* No Items Message */}
        {isImageLoaded && !imageError && storeItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">No items located yet</p>
              <p className="text-sm text-gray-500 mt-1">Items will appear as red pins when added</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {isImageLoaded && !imageError && storeItems.length > 0 && !selectedItemId && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border border-red-600"></div>
                <span className="text-gray-700">Item location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                <span className="text-gray-700">Verified</span>
              </div>
            </div>
            <div className="text-gray-500">
              Tap pins for details
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Information */}
      {selectedItemId && (
        <div className="mt-4">
          {(() => {
            const selectedItem = storeItems.find(item => item.id === selectedItemId);
            return selectedItem ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Item Details</h4>
                  <button
                    onClick={() => onItemSelect?.(selectedItem)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Close
                  </button>
                </div>
                <ItemInfo item={selectedItem} store={store} />
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};