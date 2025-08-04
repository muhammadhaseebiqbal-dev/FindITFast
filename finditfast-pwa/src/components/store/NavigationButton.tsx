import React, { useState } from 'react';
import { MapsService } from '../../services/mapsService';
import type { Store } from '../../types';

interface NavigationButtonProps {
  store: Store;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({ store }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      await MapsService.navigate(store.address);
    } catch (error) {
      console.error('Error navigating to store:', error);
    } finally {
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 2000);
    }
  };

  return (
    <button
      onClick={handleNavigate}
      disabled={isNavigating}
      className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm ${
        isNavigating 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white`}
      aria-label={`Get directions to ${store.name}`}
    >
      <div className="w-6 h-6">
        {isNavigating ? (
          <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="text-lg">
        {isNavigating ? 'Opening Maps...' : 'Get Directions'}
      </span>
      {!isNavigating && (
        <div className="w-5 h-5">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </button>
  );
};