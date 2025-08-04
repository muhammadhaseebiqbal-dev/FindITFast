import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, SearchResults } from '../components/search';
import { RecentSearches } from '../components/search/RecentSearches';
import { UserActions } from '../components/user/UserActions';
import { SearchService } from '../services/searchService';
import { GeolocationService } from '../services/geolocationService';
import type { SearchResult, SearchState } from '../types/search';
import type { LocationCoordinates } from '../services/geolocationService';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false
  });
  
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Initialize geolocation on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      const permission = await GeolocationService.checkPermission();
      
      if (permission === 'granted') {
        setLocationPermission('granted');
        const location = await GeolocationService.getCurrentLocation();
        setUserLocation(location);
        
        // Start watching for location updates
        GeolocationService.startWatching();
        
        // Subscribe to location changes
        const unsubscribe = GeolocationService.onLocationChange((location) => {
          setUserLocation(location);
        });
        
        return unsubscribe;
      } else if (permission === 'denied') {
        setLocationPermission('denied');
      }
    };

    const cleanup = initializeLocation();
    
    return () => {
      GeolocationService.cleanup();
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    // Clear results if query is empty
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        query: '',
        results: [],
        error: null,
        hasSearched: false
      }));
      return;
    }

    // Set loading state
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null,
      hasSearched: true
    }));

    try {
      // Use the search service with user location if available
      const results = await SearchService.searchItems(query, userLocation || undefined);
      
      setSearchState(prev => ({
        ...prev,
        results,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed. Please try again.'
      }));
    }
  }, [userLocation]);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('Result clicked:', result);
    navigate(`/store/${result.store.id}`);
  }, [navigate]);

  const handleLocationRequest = useCallback(async () => {
    const granted = await GeolocationService.requestPermission();
    if (granted) {
      setLocationPermission('granted');
      const location = await GeolocationService.getCurrentLocation();
      setUserLocation(location);
      GeolocationService.startWatching();
    } else {
      setLocationPermission('denied');
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center mb-8 fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg" 
                 style={{ 
                   background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                   boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)'
                 }}>
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-heading">
              FindItFast
            </h1>
            <p className="text-muted text-lg">
              Find Items. Fast.
            </p>
          </div>
          <div className="slide-up">
            <SearchBar
              onSearch={handleSearch}
              isLoading={searchState.isLoading}
              placeholder="Search for items..."
            />
          </div>
        </div>
      </header>

      {/* Location Permission Banner */}
      {locationPermission === 'unknown' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 slide-up">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Enable Location</p>
                  <p className="text-xs text-blue-700">Get better search results</p>
                </div>
              </div>
              <button
                onClick={handleLocationRequest}
                className="btn-secondary text-sm px-4 py-2 min-h-10"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {locationPermission === 'denied' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50 slide-up">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Location Disabled</p>
                <p className="text-xs text-amber-700">Distances won't be shown</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pb-8">
        {/* Recent Searches */}
        {!searchState.hasSearched && !searchState.isLoading && (
          <RecentSearches onSearchSelect={handleSearch} />
        )}

        <SearchResults
          results={searchState.results}
          isLoading={searchState.isLoading}
          error={searchState.error}
          hasSearched={searchState.hasSearched}
          query={searchState.query}
          onResultClick={handleResultClick}
        />

        {/* User Actions - Only show when not searching or when no results */}
        {(!searchState.hasSearched || (searchState.hasSearched && searchState.results.length === 0 && !searchState.isLoading)) && (
          <div className="mt-8">
            <UserActions />
          </div>
        )}
      </main>
    </div>
  );
};