/**
 * React hook for geolocation functionality
 * Provides user location, distance calculations, and permission management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserLocation,
  checkGeolocationPermission,
  calculateDistanceBetweenLocations,
  formatDistance,
  type Location,
  type GeolocationOptions,
  type GeolocationResult
} from '../utils/geolocation';

interface UseGeolocationState {
  userLocation: Location | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported' | 'unknown';
}

interface UseGeolocationReturn extends UseGeolocationState {
  requestLocation: () => Promise<GeolocationResult>;
  calculateDistanceToLocation: (targetLocation: Location) => number | null;
  getFormattedDistance: (targetLocation: Location) => string | null;
  clearError: () => void;
  isLocationAvailable: boolean;
}

/**
 * Hook for geolocation functionality
 * @param autoRequest - Automatically request location on mount (default: false)
 * @param options - Geolocation options
 */
export function useGeolocation(
  autoRequest: boolean = false,
  options: GeolocationOptions = {}
): UseGeolocationReturn {
  const [state, setState] = useState<UseGeolocationState>({
    userLocation: null,
    loading: false,
    error: null,
    errorCode: null,
    permission: 'unknown'
  });

  // Check permission status on mount
  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      const permissionStatus = await checkGeolocationPermission();
      if (mounted) {
        setState(prev => ({ ...prev, permission: permissionStatus }));
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-request location if enabled
  useEffect(() => {
    if (autoRequest && state.permission === 'granted') {
      requestLocation();
    }
  }, [autoRequest, state.permission]);

  /**
   * Request user's current location
   */
  const requestLocation = useCallback(async (): Promise<GeolocationResult> => {
    setState(prev => ({ ...prev, loading: true, error: null, errorCode: null }));

    try {
      const result = await getUserLocation(options);

      setState(prev => ({
        ...prev,
        loading: false,
        userLocation: result.success ? result.location || null : null,
        error: result.success ? null : result.error || 'Unknown error',
        errorCode: result.success ? null : result.errorCode || 'UNKNOWN',
        permission: result.success ? 'granted' : 
                   result.errorCode === 'PERMISSION_DENIED' ? 'denied' : prev.permission
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        errorCode: 'UNKNOWN'
      }));

      return {
        success: false,
        error: errorMessage,
        errorCode: 'UNKNOWN'
      };
    }
  }, [options]);

  /**
   * Calculate distance to a target location
   */
  const calculateDistanceToLocation = useCallback((targetLocation: Location): number | null => {
    if (!state.userLocation) {
      return null;
    }

    return calculateDistanceBetweenLocations(state.userLocation, targetLocation);
  }, [state.userLocation]);

  /**
   * Get formatted distance to a target location
   */
  const getFormattedDistance = useCallback((targetLocation: Location): string | null => {
    const distance = calculateDistanceToLocation(targetLocation);
    return distance !== null ? formatDistance(distance) : null;
  }, [calculateDistanceToLocation]);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, errorCode: null }));
  }, []);

  return {
    ...state,
    requestLocation,
    calculateDistanceToLocation,
    getFormattedDistance,
    clearError,
    isLocationAvailable: state.userLocation !== null
  };
}

/**
 * Hook for calculating distance to multiple stores
 * @param stores - Array of stores with location data
 * @param userLocation - User's current location (optional, will use geolocation if not provided)
 */
export function useStoreDistances<T extends { id: string; location: Location }>(
  stores: T[],
  userLocation?: Location | null
) {
  const geolocation = useGeolocation();
  const [storesWithDistance, setStoresWithDistance] = useState<Array<T & { 
    distance?: number; 
    formattedDistance?: string 
  }>>([]);

  const effectiveUserLocation = userLocation || geolocation.userLocation;

  useEffect(() => {
    if (!effectiveUserLocation || !stores.length) {
      setStoresWithDistance(stores.map(store => ({ ...store })));
      return;
    }

    const storesWithDistanceData = stores.map(store => {
      const distance = calculateDistanceBetweenLocations(effectiveUserLocation, store.location);
      return {
        ...store,
        distance,
        formattedDistance: formatDistance(distance)
      };
    });

    // Sort by distance (closest first)
    storesWithDistanceData.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    setStoresWithDistance(storesWithDistanceData);
  }, [stores, effectiveUserLocation]);

  return {
    storesWithDistance,
    isCalculating: geolocation.loading,
    geolocation
  };
}