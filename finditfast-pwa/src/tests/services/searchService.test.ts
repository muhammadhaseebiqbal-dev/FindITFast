import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchService } from '../../services/searchService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the Firestore services
vi.mock('../../services/firestoreService', () => ({
  ItemService: {
    search: vi.fn(() => Promise.resolve([])),
  },
  StoreService: {
    getAll: vi.fn(() => Promise.resolve([])),
  },
}));

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchItems', () => {
    it('returns empty array for empty query', async () => {
      const results = await SearchService.searchItems('');
      expect(results).toEqual([]);
    });

    it('returns empty array for whitespace query', async () => {
      const results = await SearchService.searchItems('   ');
      expect(results).toEqual([]);
    });

    it('saves search to history when searching', async () => {
      await SearchService.searchItems('test query');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'finditfast_search_history',
        expect.stringContaining('test query')
      );
    });
  });

  describe('getSearchHistory', () => {
    it('returns empty array when no history exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const history = SearchService.getSearchHistory();
      expect(history).toEqual([]);
    });

    it('returns parsed history from localStorage', () => {
      const mockHistory = [
        { id: '1', query: 'test', timestamp: new Date().toISOString() }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const history = SearchService.getSearchHistory();
      expect(history).toHaveLength(1);
      expect(history[0].query).toBe('test');
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const history = SearchService.getSearchHistory();
      expect(history).toEqual([]);
    });
  });

  describe('clearSearchHistory', () => {
    it('removes search history from localStorage', () => {
      SearchService.clearSearchHistory();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('finditfast_search_history');
    });
  });

  describe('getRecentSearches', () => {
    it('returns recent search queries', () => {
      const mockHistory = [
        { id: '1', query: 'recent1', timestamp: new Date().toISOString() },
        { id: '2', query: 'recent2', timestamp: new Date().toISOString() },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const recent = SearchService.getRecentSearches();
      expect(recent).toEqual(['recent1', 'recent2']);
    });

    it('limits results to 5 items', () => {
      const mockHistory = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        query: `query${i}`,
        timestamp: new Date().toISOString()
      }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
      
      const recent = SearchService.getRecentSearches();
      expect(recent).toHaveLength(5);
    });
  });
});