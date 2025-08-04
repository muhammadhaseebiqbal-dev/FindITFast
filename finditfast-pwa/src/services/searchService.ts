import { ItemService, StoreService } from './firestoreService';
import { trackSearch } from './analyticsService';
// Import types are used in JSDoc comments and type annotations
import type { SearchResult, SearchHistory } from '../types/search';

export class SearchService {
  private static readonly SEARCH_HISTORY_KEY = 'finditfast_search_history';
  private static readonly MAX_HISTORY_ITEMS = 10;

  /**
   * Search for items across all stores
   */
  static async searchItems(query: string, userLocation?: { latitude: number; longitude: number }): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      // Search for items using the existing search method
      const items = await ItemService.search(query.toLowerCase());
      
      // Get all stores to join with items
      const stores = await StoreService.getAll();
      const storeMap = new Map(stores.map(store => [store.id, store]));

      // Combine items with their store information
      const searchResults: SearchResult[] = items
        .map(item => {
          const store = storeMap.get(item.storeId);
          if (!store) return null;

          const result: SearchResult = {
            ...item,
            store,
            distance: userLocation ? this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              store.location.latitude,
              store.location.longitude
            ) : undefined
          };

          return result;
        })
        .filter((result): result is SearchResult => result !== null);

      // Rank and sort results
      const rankedResults = this.rankSearchResults(searchResults);

      // Track search analytics
      try {
        trackSearch({
          searchQuery: query,
          resultsCount: rankedResults.length,
          location: userLocation
        });
      } catch (error) {
        console.log('Analytics tracking failed:', error);
      }

      // Save search to history
      this.saveSearchToHistory(query);

      return rankedResults;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search items. Please try again.');
    }
  }

  /**
   * Rank search results by relevance
   * Priority: verified items first, then by proximity if location available
   */
  private static rankSearchResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      // First priority: verified items
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Second priority: fewer reports (more reliable)
      if (a.reportCount !== b.reportCount) {
        return a.reportCount - b.reportCount;
      }

      // Third priority: distance (if available)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }

      // Fourth priority: more recent verification
      if (a.verified && b.verified) {
        const aTime = a.verifiedAt?.toDate?.()?.getTime() || 0;
        const bTime = b.verifiedAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime; // More recent first
      }

      // Finally: alphabetical by item name
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get user's current location
   */
  static async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Save search query to local storage history
   */
  private static saveSearchToHistory(query: string): void {
    try {
      const history = this.getSearchHistory();
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date()
      };

      // Remove duplicate if exists
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new entry at the beginning
      const updatedHistory = [newEntry, ...filteredHistory]
        .slice(0, this.MAX_HISTORY_ITEMS);

      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * Get search history from local storage
   */
  static getSearchHistory(): SearchHistory[] {
    try {
      const historyJson = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (!historyJson) return [];

      const history = JSON.parse(historyJson);
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }

  /**
   * Get recent searches (last 5)
   */
  static getRecentSearches(): string[] {
    const history = this.getSearchHistory();
    return history.slice(0, 5).map(item => item.query);
  }

  /**
   * Search with enhanced filtering and location awareness
   */
  static async searchWithFilters(
    query: string,
    options: {
      verifiedOnly?: boolean;
      maxDistance?: number;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ): Promise<SearchResult[]> {
    const { verifiedOnly = false, maxDistance, userLocation } = options;

    // Get base search results
    const results = await this.searchItems(query, userLocation);

    // Apply filters
    let filteredResults = results;

    if (verifiedOnly) {
      filteredResults = filteredResults.filter(result => result.verified);
    }

    if (maxDistance && userLocation) {
      filteredResults = filteredResults.filter(result => 
        result.distance === undefined || result.distance <= maxDistance
      );
    }

    return filteredResults;
  }
}