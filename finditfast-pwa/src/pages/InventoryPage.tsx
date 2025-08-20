import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrivedAtStore } from '../components/inventory/ArrivedAtStore';
import { ItemLocationViewer } from '../components/inventory/ItemLocationViewer';
import { ItemMissingReport } from '../components/inventory/ItemMissingReport';
import { UserContributionForm } from '../components/inventory/UserContributionForm';
import { StorePlanService, ItemService, StoreService } from '../services/firestoreService';
import type { SearchResult } from '../types/search';
import type { StorePlan } from '../types';

export const InventoryPage: React.FC = () => {
  const { itemId, storeId } = useParams<{ itemId: string; storeId: string }>();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<'navigate' | 'arrived' | 'report' | 'contribute'>('navigate');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, [itemId, storeId]);

  const loadInventoryData = async () => {
    if (!itemId || !storeId) {
      setError('Invalid item or store ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get item by ID from ItemService
      const [item, store] = await Promise.all([
        ItemService.getById(itemId),
        StoreService.getById(storeId)
      ]);
      
      if (!item || !store) {
        setError('Item or store not found');
        setIsLoading(false);
        return;
      }

      // Create SearchResult from item and store data
      const result: SearchResult = {
        ...item,
        store
      };

      setSearchResult(result);

      // Load store plan
      try {
        const plans = await StorePlanService.getByStore(storeId);
        const activePlan = plans.find((plan: StorePlan) => plan.isActive);
        setStorePlan(activePlan || null);
      } catch (planError) {
        console.warn('Could not load store plan:', planError);
        // Continue without store plan - user can still see item info
      }

    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Failed to load item information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrivedAtStore = () => {
    setCurrentView('arrived');
  };

  const handleItemMissing = () => {
    setCurrentView('report');
  };

  const handleUserUpload = () => {
    setCurrentView('contribute');
  };

  const handleCloseModal = () => {
    setCurrentView('arrived');
  };

  const handleReported = () => {
    setCurrentView('arrived');
    // Could show a success message or refresh data
  };

  const handleContributed = () => {
    setCurrentView('arrived');
    // Could show a success message or refresh data
  };

  const handleBack = () => {
    navigate('/search');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item information...</p>
        </div>
      </div>
    );
  }

  if (error || !searchResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The requested item could not be found.'}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      {currentView === 'navigate' && (
        <ArrivedAtStore
          searchResult={searchResult}
          onArrived={handleArrivedAtStore}
          onDirections={() => {
            // Handled within ArrivedAtStore component
          }}
        />
      )}

      {currentView === 'arrived' && (
        <ItemLocationViewer
          searchResult={searchResult}
          storePlan={storePlan || undefined}
          onItemMissing={handleItemMissing}
          onUserUpload={handleUserUpload}
        />
      )}

      {/* Modals */}
      {currentView === 'report' && (
        <ItemMissingReport
          searchResult={searchResult}
          onClose={handleCloseModal}
          onReported={handleReported}
        />
      )}

      {currentView === 'contribute' && (
        <UserContributionForm
          searchResult={{
            id: searchResult.id,
            name: searchResult.name,
            store: {
              id: searchResult.storeId,
              name: searchResult.store.name
            }
          }}
          onClose={handleCloseModal}
          onContributed={handleContributed}
        />
      )}

      {/* Back Button (visible in arrived view) */}
      {currentView === 'arrived' && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={handleBack}
            className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow border"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};
