import React from 'react';
import type { Store } from '../../types';

interface StoreDetailsProps {
  store: Store;
}

export const StoreDetails: React.FC<StoreDetailsProps> = ({ store }) => {
  const handleFloorplanError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the image container if floorplan fails to load
    const target = e.currentTarget;
    const container = target.parentElement;
    if (container) {
      container.style.display = 'none';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Store Information */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h2>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-700 leading-relaxed">{store.address}</p>
        </div>
      </div>

      {/* Floorplan Preview */}
      {store.floorplanUrl && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Layout</h3>
            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={store.floorplanUrl}
                alt={`${store.name} floorplan`}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={handleFloorplanError}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Tap "I've Arrived" below to see item locations on this floorplan
            </p>
          </div>
        </div>
      )}

      {/* No Floorplan Message */}
      {!store.floorplanUrl && (
        <div className="border-t border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Floorplan Available</h3>
            <p className="text-gray-600">
              This store hasn't uploaded a floorplan yet. You can still navigate to the store location.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};