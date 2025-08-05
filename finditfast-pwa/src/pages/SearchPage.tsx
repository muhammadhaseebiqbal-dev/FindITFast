import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResults } from '../components/search';
import { MobileLayout, MobileContent } from '../components/common/MobileLayout';
import { LazyLoad } from '../components/performance/LazyLoading';
import { SearchService } from '../services/searchService';
import { GeolocationService } from '../services/geolocationService';
import type { SearchResult, SearchState } from '../types/search';
import type { LocationCoordinates } from '../services/geolocationService';

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Debounce search input
  const debouncedSearchInput = useDebounce(searchInput, 300);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('finditfast_recent_searches');
    if (savedSearches) {
      try {
        const parsed = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, 5); // Keep only 5 recent searches
      
      // Save to localStorage
      localStorage.setItem('finditfast_recent_searches', JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchInput.trim()) {
      performSearch(debouncedSearchInput);
    } else {
      // Clear search results when input is empty
      setSearchState(prev => ({
        ...prev,
        query: '',
        results: [],
        isLoading: false,
        hasSearched: false
      }));
    }
  }, [debouncedSearchInput]);

  // Initialize geolocation on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      const permission = await GeolocationService.checkPermission();
      
      if (permission === 'granted') {
        setLocationPermission('granted');
        const location = await GeolocationService.getCurrentLocation();
        setUserLocation(location);
        GeolocationService.startWatching();
      } else if (permission === 'denied') {
        setLocationPermission('denied');
      }
    };

    initializeLocation();
    
    return () => {
      GeolocationService.cleanup();
    };
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null,
      hasSearched: true
    }));

    try {
      const results = await SearchService.searchItems(query, userLocation || undefined);
      
      setSearchState(prev => ({
        ...prev,
        results,
        isLoading: false
      }));

      // Save to recent searches after successful search
      saveToRecentSearches(query);
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, [userLocation, saveToRecentSearches]);

  const handleInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchInput(query);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('Result clicked:', result);
    navigate(`/inventory/${result.id}/${result.storeId}`);
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
    <MobileLayout>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-40 pt-safe-top">
        <div className="bg-gray-600 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium text-white">FindItFast</h1>
          <button
            onClick={() => navigate('/admin/auth')}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Admin Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      <MobileContent>
        <div className="flex flex-col min-h-full bg-gray-50">
          {/* Main Search Bar */}
          <div className="px-4 py-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search for an item..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Welcome Banner - Hidden during search */}
          {!searchInput.trim() && (
            <div className="px-4 mb-6">
              <div className="bg-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Welcome to FindItFast! Browse our latest deals and featured stores. Check back often for new updates and announcements.
                </p>
              </div>
            </div>
          )}

          {/* Store Owners Section - Hidden during search */}
          {!searchInput.trim() && (
            <div className="px-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Store Owners</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your store layout and items to help customers find products easily.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/owner/auth')}
                    className="w-full bg-gray-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-900 transition-colors"
                  >
                    Store Owner Login
                  </button>
                  <button 
                    onClick={() => navigate('/admin/auth')}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recently Searched Section - Hidden during search */}
          {!searchInput.trim() && recentSearches.length > 0 && (
            <div className="px-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Searched</h3>
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center bg-white rounded-xl p-4 shadow-sm w-full text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-900 font-medium">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Permission Banner */}
          {locationPermission === 'unknown' && (
            <div className="px-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Enable Location</p>
                      <p className="text-xs text-gray-600">Get better search results</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLocationRequest}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchState.query && (
            <div className="px-4">
              <LazyLoad>
                <SearchResults
                  results={searchState.results}
                  isLoading={searchState.isLoading}
                  error={searchState.error}
                  hasSearched={searchState.hasSearched}
                  query={searchState.query}
                  onResultClick={handleResultClick}
                />
              </LazyLoad>
            </div>
          )}
        </div>
      </MobileContent>
    </MobileLayout>
  );
};