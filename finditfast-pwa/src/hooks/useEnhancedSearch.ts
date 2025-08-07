import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Enhanced debounced search hook with better performance and features
 */
export const useEnhancedSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: {
    debounceDelay?: number;
    minQueryLength?: number;
    maxResults?: number;
    enableCaching?: boolean;
    cacheExpiry?: number; // in milliseconds
  } = {}
) => {
  const {
    debounceDelay = 300,
    minQueryLength = 2,
    maxResults = 20,
    enableCaching = true,
    cacheExpiry = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: T[]; timestamp: number }>>(new Map());

  const debouncedSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear results for empty query
    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    // Don't search if query is too short
    if (trimmedQuery.length < minQueryLength) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        // Check cache first
        if (enableCaching) {
          const cached = cacheRef.current.get(trimmedQuery);
          const now = Date.now();
          
          if (cached && (now - cached.timestamp) < cacheExpiry) {
            setResults(cached.data.slice(0, maxResults));
            setIsLoading(false);
            return;
          }
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const searchResults = await searchFunction(trimmedQuery);
        
        // Limit results
        const limitedResults = searchResults.slice(0, maxResults);
        
        // Cache results
        if (enableCaching) {
          cacheRef.current.set(trimmedQuery, {
            data: limitedResults,
            timestamp: Date.now()
          });
          
          // Clean up old cache entries (keep last 50 entries)
          if (cacheRef.current.size > 50) {
            const entries = Array.from(cacheRef.current.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            cacheRef.current.clear();
            entries.slice(0, 50).forEach(([key, value]) => {
              cacheRef.current.set(key, value);
            });
          }
        }
        
        setResults(limitedResults);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Search error:', err);
          setError(err instanceof Error ? err.message : 'Search failed');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceDelay);
  }, [searchFunction, debounceDelay, minQueryLength, maxResults, enableCaching, cacheExpiry]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsLoading(false);
    setError(null);
    setHasSearched(false);
    
    // Clear debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refreshSearch = useCallback(() => {
    if (query.trim()) {
      // Force refresh by clearing cache for this query
      if (enableCaching) {
        cacheRef.current.delete(query.trim());
      }
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, enableCaching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial search if query is provided - disabled to avoid unnecessary re-renders
  // useEffect(() => {
  //   if (query.trim() && query.trim().length >= minQueryLength) {
  //     debouncedSearch(query);
  //   }
  // }, []); // Only run on mount

  return {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    updateQuery,
    clearSearch,
    refreshSearch,
    // Utility functions
    getCacheSize: () => cacheRef.current.size,
    clearCache: () => cacheRef.current.clear()
  };
};
