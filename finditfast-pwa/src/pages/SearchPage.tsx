import React, { useState, useCallback, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { SearchResults } from '../components/search';
import { MobileLayout, MobileContent } from '../components/common/MobileLayout';
import { LazyLoad } from '../components/performance/LazyLoading';
import { SearchService } from '../services/searchService';
import type { SearchResult, SearchState } from '../types/search';

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
  const defaultBannerText = 'Welcome to FindItFast! Browse our latest deals and featured stores. Check back often for new updates and announcements.';
  const [bannerText, setBannerText] = useState<string>(defaultBannerText);
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Location services removed - search works without location data

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
      const results = await SearchService.searchItems(query, undefined);
      
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
  }, [saveToRecentSearches]);

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
  }, [debouncedSearchInput, performSearch]);

  // Location services removed - search works without location data

  // Subscribe to global banner text from Firestore
  useEffect(() => {
    const configRef = doc(db, 'appConfig', 'public');
    const unsubscribe = onSnapshot(
      configRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && typeof data.homeBannerText === 'string' && data.homeBannerText.trim()) {
              setBannerText(data.homeBannerText.trim());
            } else {
              setBannerText(defaultBannerText);
            }
          } else {
            setBannerText(defaultBannerText);
          }
        } catch (error) {
          console.error('Error loading home banner config:', error);
          setBannerText(defaultBannerText);
        }
      },
      (error) => {
        console.error('Error in home banner listener:', error);
        setBannerText(defaultBannerText);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchInput(query);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    // Use the store request document ID for navigation, not the item's storeId
    navigate(`/item/${result.id}/store/${result.store.id}`);
  }, [navigate]);

  // Location request handler removed

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-40 pt-safe-top">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium text-white">FindItFast</h1>
          <button
            onClick={() => navigate('/admin/auth')}
            className="p-2 rounded-2xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search for an item..."
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-2xl bg-white text-gray-900 placeholder-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Welcome Banner - Hidden during search */}
          {!searchInput.trim() && (
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  {bannerText}
                </p>
              </div>
            </div>
          )}

          {/* Admin Panel section removed - accessible via gear icon in navigation bar */}

          {/* Store Owners Section - Hidden during search */}
          {!searchInput.trim() && (
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-5 shadow-lg border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-green-800">Store Owners</h2>
                </div>
                <p className="text-sm text-green-700 mb-5 font-medium">
                  Join our platform to upload your store layout and help customers find products easily.
                </p>
                <button 
                  onClick={() => navigate('/owner/auth?mode=signup')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Store Owner Sign Up
                </button>
              </div>
            </div>
          )}





          {/* Recently Searched Section - Hidden during search */}
          {!searchInput.trim() && recentSearches.length > 0 && (
            <div className="px-4 mb-6">
              <h3 className="text-xl font-bold text-purple-800 mb-4">Recently Searched</h3>
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center bg-gradient-to-r from-white to-purple-50 rounded-2xl p-4 shadow-md w-full text-left hover:from-purple-50 hover:to-purple-100 transition-all transform hover:scale-105 border border-purple-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-purple-800 font-semibold">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Permission Banner removed - search works without location permissions */}

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