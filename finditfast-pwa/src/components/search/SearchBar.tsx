import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "Search for items...",
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        onSearch(searchQuery.trim());
      } else if (searchQuery.trim().length === 0) {
        onSearch(''); // Clear results when query is empty
      }
    }, 300);
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center input-field transition-all duration-300
          ${isLoading ? 'opacity-75' : ''}
        `}>
          {/* Search Icon */}
          <div className="absolute left-6 flex items-center pointer-events-none">
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <svg 
                className="w-6 h-6 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}

            placeholder={placeholder}
            disabled={isLoading}
            className="
              w-full pl-16 pr-16 py-5 bg-transparent border-none outline-none
              disabled:cursor-not-allowed text-base font-medium
              placeholder:text-slate-400 placeholder:font-normal
            "
            aria-label="Search for items"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="
                absolute right-6 p-2 rounded-xl transition-all duration-200
                hover:bg-slate-100 icon-button border-0 shadow-none
              "
              aria-label="Clear search"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search hint */}
        {query.length > 0 && query.length < 2 && (
          <div className="mt-4 text-center slide-up">
            <p className="text-sm text-muted">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </form>
    </div>
  );
};