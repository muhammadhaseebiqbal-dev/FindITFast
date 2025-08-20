import React, { useState, useEffect } from 'react';
import { getOfflineData } from '../utils/pwaUtils';

interface OfflineManagerProps {
  children: React.ReactNode;
}

interface OfflineState {
  isOnline: boolean;
  hasOfflineData: boolean;
  lastSync: Date | null;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ children }) => {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    hasOfflineData: false,
    lastSync: null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: true }));
      // Sync data when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: false }));
    };

    // Check for existing offline data
    checkOfflineData();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOfflineData = async () => {
    try {
      const recentSearches = await getOfflineData('recent_searches');
      const favoriteStores = await getOfflineData('favorite_stores');
      const lastSyncStr = localStorage.getItem('last_sync');
      
      setOfflineState(prev => ({
        ...prev,
        hasOfflineData: !!(recentSearches || favoriteStores),
        lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
      }));
    } catch (error) {
      console.error('Failed to check offline data:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!offlineState.isOnline) return;

    try {
      // Here you would implement actual sync logic with your backend
      // For now, just update the last sync timestamp
      localStorage.setItem('last_sync', new Date().toISOString());
      setOfflineState(prev => ({
        ...prev,
        lastSync: new Date(),
      }));
      
      // Data synced successfully
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const renderOfflineBanner = () => {
    if (offlineState.isOnline) return null;

    return (
      <div className="bg-yellow-500 text-white px-4 py-2 text-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">You're offline</span>
            {offlineState.hasOfflineData && (
              <span className="opacity-90">• Using cached data</span>
            )}
          </div>
          {offlineState.lastSync && (
            <span className="text-xs opacity-75">
              Last synced: {offlineState.lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderOfflineIndicator = () => {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div 
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            offlineState.isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} 
          title={offlineState.isOnline ? 'Online' : 'Offline'}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {renderOfflineBanner()}
      {renderOfflineIndicator()}
      <div className={offlineState.isOnline ? '' : 'opacity-95'}>
        {children}
      </div>
    </div>
  );
};

export default OfflineManager;
