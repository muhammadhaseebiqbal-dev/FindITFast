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
   * Calculate distance between two points using Vincenty's formulae for maximum accuracy
   * Accurate to within millimeters for distances up to 20,000 km
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // WGS-84 ellipsoid parameters
    const a = 6378137; // Semi-major axis in meters
    const b = 6356752.314245; // Semi-minor axis in meters
    const f = 1 / 298.257223563; // Flattening

    const L = this.toRadians(lon2 - lon1);
    const U1 = Math.atan((1 - f) * Math.tan(this.toRadians(lat1)));
    const U2 = Math.atan((1 - f) * Math.tan(this.toRadians(lat2)));
    
    const sinU1 = Math.sin(U1);
    const cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2);
    const cosU2 = Math.cos(U2);
    
    let lambda = L;
    let lambdaP = 2 * Math.PI;
    let iterLimit = 100;
    let cosSqAlpha = 0;
    let sinSigma = 0;
    let cos2SigmaM = 0;
    let cosSigma = 0;
    let sigma = 0;
    
    while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
      const sinLambda = Math.sin(lambda);
      const cosLambda = Math.cos(lambda);
      
      sinSigma = Math.sqrt(
        (cosU2 * sinLambda) * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
      );
      
      if (sinSigma === 0) return 0; // Co-incident points
      
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      
      const sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      cosSqAlpha = 1 - sinAlpha * sinAlpha;
      
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
      if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // Equatorial line
      
      const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      
      lambdaP = lambda;
      lambda = L + (1 - C) * f * sinAlpha * (
        sigma + C * sinSigma * (
          cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)
        )
      );
    }
    
    if (iterLimit === 0) {
      // Fallback to Haversine if Vincenty fails to converge
      return this.haversineDistance(lat1, lon1, lat2, lon2);
    }
    
    const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    
    const deltaSigma = B * sinSigma * (
      cos2SigmaM + B / 4 * (
        cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)
      )
    );
    
    const distance = b * A * (sigma - deltaSigma);
    
    // Convert from meters to kilometers and round to 3 decimal places
    return Math.round((distance / 1000) * 1000) / 1000;
  }

  /**
   * Fallback Haversine formula for cases where Vincenty fails to converge
   */
  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 1000) / 1000;
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