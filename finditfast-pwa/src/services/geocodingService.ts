export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface GeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

export class GeocodingService {
  private static readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  private static readonly GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  /**
   * Convert an address string to latitude/longitude coordinates
   */
  static async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    if (!address.trim()) {
      throw new Error('Address cannot be empty');
    }

    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured. Using mock coordinates.');
      // Return mock coordinates for development
      return {
        latitude: 40.7128,
        longitude: -74.0060,
        formattedAddress: address.trim()
      };
    }

    try {
      const encodedAddress = encodeURIComponent(address.trim());
      const url = `${this.GEOCODING_BASE_URL}?address=${encodedAddress}&key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeocodingResponse = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };
      } else if (data.status === 'ZERO_RESULTS') {
        throw new Error('No location found for the provided address. Please check the address and try again.');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('Geocoding service is temporarily unavailable. Please try again later.');
      } else if (data.status === 'REQUEST_DENIED') {
        throw new Error('Geocoding service access denied. Please contact support.');
      } else {
        throw new Error('Unable to find location for the provided address.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to geocode address. Please check your internet connection and try again.');
      }
    }
  }

  /**
   * Reverse geocode coordinates to get an address
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured for reverse geocoding.');
      return `${latitude}, ${longitude}`;
    }

    try {
      const url = `${this.GEOCODING_BASE_URL}?latlng=${latitude},${longitude}&key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeocodingResponse = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Validate if an address looks valid (basic check)
   */
  static validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    const trimmed = address.trim();
    
    // Basic validation: should have at least a few words
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
      return false;
    }

    // Should contain at least one number (for street address)
    const hasNumber = /\d/.test(trimmed);
    if (!hasNumber) {
      return false;
    }

    return true;
  }

  /**
   * Generate Google Maps link for directions
   */
  static generateMapsLink(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }

  /**
   * Generate Apple Maps link for directions
   */
  static generateAppleMapsLink(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `http://maps.apple.com/?daddr=${encodedAddress}`;
  }

  /**
   * Generate maps link based on user agent
   */
  static generateDirectionsLink(address: string): string {
    const userAgent = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    if (isIOS) {
      return this.generateAppleMapsLink(address);
    } else {
      return this.generateMapsLink(address);
    }
  }
}
