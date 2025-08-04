import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface SearchLog {
  userId?: string;
  storeId?: string;
  storeName?: string;
  searchQuery: string;
  resultsCount: number;
  timestamp: Date;
  userAgent?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserActivityLog {
  userId: string;
  action: 'login' | 'logout' | 'search' | 'view_store' | 'request_store' | 'upload_floorplan' | 'add_item';
  metadata?: any;
  timestamp: Date;
  userAgent?: string;
}

export const analyticsService = {
  // Log search activity
  logSearch: async (searchData: Omit<SearchLog, 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'searchLogs'), {
        ...searchData,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  },

  // Log user activity
  logUserActivity: async (activityData: Omit<UserActivityLog, 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'userActivity'), {
        ...activityData,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  },

  // Get search analytics
  getSearchAnalytics: async (storeId?: string, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let searchQuery = query(
        collection(db, 'searchLogs'),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      if (storeId) {
        searchQuery = query(
          collection(db, 'searchLogs'),
          where('storeId', '==', storeId),
          where('timestamp', '>=', startDate),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshot = await getDocs(searchQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as (SearchLog & { id: string })[];
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return [];
    }
  },

  // Get user activity analytics
  getUserActivityAnalytics: async (userId?: string, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let activityQuery = query(
        collection(db, 'userActivity'),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      if (userId) {
        activityQuery = query(
          collection(db, 'userActivity'),
          where('userId', '==', userId),
          where('timestamp', '>=', startDate),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshot = await getDocs(activityQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as (UserActivityLog & { id: string })[];
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  },

  // Get popular search terms
  getPopularSearchTerms: async (limit_count = 20) => {
    try {
      const searchQuery = query(
        collection(db, 'searchLogs'),
        orderBy('timestamp', 'desc'),
        limit(1000) // Get recent searches to analyze
      );

      const snapshot = await getDocs(searchQuery);
      const searches = snapshot.docs.map(doc => doc.data().searchQuery);
      
      // Count frequency of search terms
      const termCounts: { [key: string]: number } = {};
      searches.forEach((query: string) => {
        const terms = query.toLowerCase().split(/\s+/);
        terms.forEach((term: string) => {
          if (term.length > 2) { // Only count terms longer than 2 characters
            termCounts[term] = (termCounts[term] || 0) + 1;
          }
        });
      });

      return Object.entries(termCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit_count)
        .map(([term, count]) => ({ term, count }));
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  },

  // Get store performance metrics
  getStorePerformance: async (storeId: string) => {
    try {
      const searches = await analyticsService.getSearchAnalytics(storeId);
      const activities = await analyticsService.getUserActivityAnalytics();
      
      const storeActivities = activities.filter(activity => 
        activity.metadata?.storeId === storeId || 
        activity.metadata?.storeName === storeId
      );

      return {
        totalSearches: searches.length,
        uniqueSearchers: new Set(searches.map(s => s.userId).filter(Boolean)).size,
        avgResultsPerSearch: searches.length > 0 
          ? searches.reduce((sum, s) => sum + (s.resultsCount || 0), 0) / searches.length 
          : 0,
        totalViews: storeActivities.filter(a => a.action === 'view_store').length,
        popularSearchTerms: searches.reduce((terms: { [key: string]: number }, search) => {
          const term = search.searchQuery.toLowerCase();
          terms[term] = (terms[term] || 0) + 1;
          return terms;
        }, {})
      };
    } catch (error) {
      console.error('Error getting store performance:', error);
      return null;
    }
  }
};

// Helper function to track page views
export const trackPageView = (userId: string, page: string, metadata?: any) => {
  analyticsService.logUserActivity({
    userId,
    action: 'view_store', // You can extend this for different page types
    metadata: {
      page,
      ...metadata
    }
  });
};

// Helper function to track searches
export const trackSearch = (searchData: {
  userId?: string;
  storeId?: string;
  storeName?: string;
  searchQuery: string;
  resultsCount: number;
  location?: { latitude: number; longitude: number };
}) => {
  analyticsService.logSearch(searchData);
};

export default analyticsService;
