import React from 'react';
import { ResultCard } from './ResultCard';
import type { SearchResult } from '../../types/search';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
  hasSearched,
  query,
  onResultClick
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="text-center py-12 fade-in">
          <div className="loading-spinner mx-auto mb-6" style={{ width: '32px', height: '32px' }} />
          <p className="text-body text-lg">Searching for "{query}"...</p>
          <div className="progress-bar mt-4 max-w-xs mx-auto">
            <div className="progress-fill" style={{ width: '60%' }} />
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="result-card animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-3" />
                  <div className="h-5 bg-slate-200 rounded-lg w-1/2 mb-3" />
                  <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
                </div>
                <div className="ml-6 w-20 h-20 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <svg 
            className="w-8 h-8 text-red-500 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h3 className="text-red-800 font-medium mb-1">Search Error</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-2">Please try again</p>
        </div>
      </div>
    );
  }

  // No search performed yet
  if (!hasSearched) {
    return (
      <div className="w-full max-w-md mx-auto mt-12">
        <div className="text-center py-16 fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-heading">Find Items in Stores</h3>
          <p className="text-body text-lg leading-relaxed max-w-sm mx-auto">
            Search for any item to see which stores have it and where it's located
          </p>
        </div>
      </div>
    );
  }

  // Empty results
  if (results.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="text-center py-8">
          <svg 
            className="w-16 h-16 text-gray-300 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.563M15 9.34c-1.17-1.17-2.73-1.82-4.5-1.82s-3.33.65-4.5 1.82" 
            />
          </svg>
          <h3 className="text-gray-600 font-medium mb-2">No Items Found</h3>
          <p className="text-gray-500 text-sm mb-4">
            We couldn't find "{query}" in any stores
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Try searching for:</p>
            <p>• Different spelling or keywords</p>
            <p>• More general terms (e.g., "shampoo" instead of brand names)</p>
            <p>• Common product categories</p>
          </div>
        </div>
      </div>
    );
  }

  // Results found
  return (
    <div className="w-full max-w-md mx-auto mt-6">
      {/* Results header */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {results.map((result) => (
          <ResultCard
            key={`${result.id}-${result.storeId}`}
            result={result}
            onClick={onResultClick}
          />
        ))}
      </div>

      {/* Results footer */}
      {results.length >= 20 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Showing first 20 results. Try a more specific search for better results.
          </p>
        </div>
      )}
    </div>
  );
};