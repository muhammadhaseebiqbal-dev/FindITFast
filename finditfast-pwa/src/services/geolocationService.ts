export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class GeolocationService {
  private static currentLocation: LocationCoordinates | null = null;
  private static watchId: number | null = null;
  private static locationCallbacks: ((location: LocationCoordinates | null) => void)[] = [];

  /**
   * Check if geolocation is supported
   */
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission and get current position
   */
  static async getCurrentLocation(): Promise<LocationCoordinates | null> {
    if (!this.isSupported()) {
      console.warn('Geolocation is not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
          resolve(location);
        },
        (error) => {
          console.warn('Geolocation error:', this.getErrorMessage(error));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Start watching user location for updates
   */
  static startWatching(): void {
    if (!this.isSupported() || this.watchId !== null) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        this.currentLocation = location;
        this.notifyLocationCallbacks(location);
      },
      (error) => {
        console.warn('Geolocation watch error:', this.getErrorMessage(error));
        this.notifyLocationCallbacks(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000 // 10 minutes
      }
    );
  }

  /**
   * Stop watching user location
   */
  static stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get the last known location
   */
  static getLastKnownLocation(): LocationCoordinates | null {
    return this.currentLocation;
  }

  /**
   * Subscribe to location updates
   */
  static onLocationChange(callback: (location: LocationCoordinates | null) => void): () => void {
    this.locationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check location permission status
   */
  static async checkPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.warn('Permission query failed:', error);
      }
    }

    // Fallback: try to get location to determine permission
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve('denied');
          } else {
            resolve('prompt');
          }
        },
        { timeout: 1000 }
      );
    });
  }

  /**
   * Request location permission
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const location = await this.getCurrentLocation();
      return location !== null;
    } catch (error) {
      console.warn('Failed to request location permission:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied by user';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable';
      case error.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'Unknown location error';
    }
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Notify all location callbacks
   */
  private static notifyLocationCallbacks(location: LocationCoordinates | null): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.warn('Location callback error:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    this.stopWatching();
    this.locationCallbacks = [];
    this.currentLocation = null;
  }
}