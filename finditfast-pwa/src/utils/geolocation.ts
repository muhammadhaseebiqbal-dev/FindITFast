/**
 * Geolocation utilities for distance calculation and user location
 * Compatible with iOS, Android, and web browsers
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  success: boolean;
  location?: Location;
  error?: string;
  errorCode?: string;
}

export interface GeolocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point  
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two Location objects
 * @param location1 - First location
 * @param location2 - Second location
 * @returns Distance in kilometers
 */
export function calculateDistanceBetweenLocations(location1: Location, location2: Location): number {
  return calculateDistance(
    location1.latitude,
    location1.longitude,
    location2.latitude,
    location2.longitude
  );
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Show in meters for distances less than 1km
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m away`;
  } else if (distanceKm < 10) {
    // Show one decimal place for distances less than 10km
    return `${distanceKm.toFixed(1)}km away`;
  } else {
    // Show whole numbers for longer distances
    return `${Math.round(distanceKm)}km away`;
  }
}

/**
 * Get user's current location using Geolocation API
 * Compatible with iOS, Android, and web browsers
 * @param options - Geolocation options
 * @returns Promise with geolocation result
 */
export async function getUserLocation(options: GeolocationOptions = {}): Promise<GeolocationResult> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by this browser',
      errorCode: 'UNSUPPORTED'
    };
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000, // 10 seconds
    maximumAge: options.maximumAge ?? 300000, // 5 minutes
  };

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        let errorCode = 'UNKNOWN';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            errorCode = 'PERMISSION_DENIED';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            errorCode = 'POSITION_UNAVAILABLE';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            errorCode = 'TIMEOUT';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
            errorCode = 'UNKNOWN';
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
          errorCode
        });
      },
      defaultOptions
    );
  });
}

/**
 * Check if geolocation permissions are granted
 * @returns Promise with permission status
 */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Unable to check geolocation permission:', error);
    return 'unsupported';
  }
}

/**
 * Request geolocation permission (for browsers that support it)
 * @returns Promise with permission result
 */
export async function requestGeolocationPermission(): Promise<GeolocationResult> {
  // On mobile browsers, permissions are typically requested when getCurrentPosition is called
  // This function serves as a wrapper to make the request more explicit
  return getUserLocation({
    timeout: 5000,
    enableHighAccuracy: false, // Use less accurate but faster location for permission check
    maximumAge: 600000 // 10 minutes
  });
}

/**
 * Get distance from user to a store
 * @param storeLocation - Store's location
 * @param options - Geolocation options
 * @returns Promise with distance result
 */
export async function getDistanceToStore(
  storeLocation: Location,
  options: GeolocationOptions = {}
): Promise<{ success: boolean; distance?: number; formattedDistance?: string; error?: string }> {
  const userLocationResult = await getUserLocation(options);

  if (!userLocationResult.success || !userLocationResult.location) {
    return {
      success: false,
      error: userLocationResult.error
    };
  }

  const distance = calculateDistanceBetweenLocations(userLocationResult.location, storeLocation);
  
  return {
    success: true,
    distance,
    formattedDistance: formatDistance(distance)
  };
}

/**
 * Sort stores by distance from user location
 * @param stores - Array of stores with location data
 * @param userLocation - User's current location
 * @returns Stores sorted by distance (closest first)
 */
export function sortStoresByDistance<T extends { location: Location }>(
  stores: T[],
  userLocation: Location
): Array<T & { distance: number; formattedDistance: string }> {
  return stores
    .map(store => {
      const distance = calculateDistanceBetweenLocations(userLocation, store.location);
      return {
        ...store,
        distance,
        formattedDistance: formatDistance(distance)
      };
    })
    .sort((a, b) => a.distance - b.distance);
}