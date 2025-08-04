import React, { useState, useEffect } from 'react';
import { SearchService } from '../../services/searchService';

interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSearchSelect }) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const searches = SearchService.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  const handleClearHistory = () => {
    SearchService.clearSearchHistory();
    setRecentSearches([]);
  };

  if (recentSearches.length === 0) {
    return (
      <div className="mt-8">
        <div className="text-center py-12">
          <svg 
            className="w-16 h-16 mx-auto mb-4" 
            style={{ color: '#cbd5e0' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <h3 className="font-medium mb-2" style={{ color: '#4a5568' }}>Start Searching</h3>
          <p className="text-sm" style={{ color: '#a0aec0' }}>
            Search for items like "shampoo", "bread", or "batteries"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: '#4a5568' }}>Recent Searches</h3>
        <button
          onClick={handleClearHistory}
          className="text-xs hover:underline transition-colors"
          style={{ color: '#a0aec0' }}
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-3">
        {recentSearches.map((search, index) => (
          <button
            key={`${search}-${index}`}
            onClick={() => onSearchSelect(search)}
            className="
              w-full text-left px-4 py-3 bg-white rounded-xl border transition-all duration-200
              hover:shadow-sm focus:outline-none
            "
            style={{ 
              borderColor: '#f1f5f9',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-3 flex-shrink-0" 
                style={{ color: '#cbd5e0' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-sm truncate" style={{ color: '#4a5568' }}>{search}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};