import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MapsService } from '../../services/mapsService';

// Mock window.open and window.location
const mockWindowOpen = vi.fn();
const mockLocationHref = vi.fn();

Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: {
    _href: '',
    get href() {
      return this._href;
    },
    set href(value) {
      this._href = value;
      mockLocationHref(value);
    },
  },
  writable: true,
});

// Mock navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    writable: true,
  });
};

describe('MapsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockReturnValue({ closed: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPlatform', () => {
    it('should detect iOS platform', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(MapsService.getPlatform()).toBe('ios');
    });

    it('should detect Android platform', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(MapsService.getPlatform()).toBe('android');
    });

    it('should detect desktop platform', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(MapsService.getPlatform()).toBe('desktop');
    });
  });

  describe('isGoogleMapsAppAvailable', () => {
    it('should return true for mobile platforms', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(MapsService.isGoogleMapsAppAvailable()).toBe(true);

      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      expect(MapsService.isGoogleMapsAppAvailable()).toBe(true);
    });

    it('should return false for desktop', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(MapsService.isGoogleMapsAppAvailable()).toBe(false);
    });
  });

  describe('generateMapsUrls', () => {
    it('should generate correct URLs for iOS', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      const urls = MapsService.generateMapsUrls('123 Main St, City, State');

      expect(urls.googleMapsApp).toBe('comgooglemaps://?daddr=123%20Main%20St%2C%20City%2C%20State&directionsmode=driving');
      expect(urls.appleMaps).toBe('http://maps.apple.com/?daddr=123%20Main%20St%2C%20City%2C%20State');
      expect(urls.googleMapsWeb).toBe('https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20City%2C%20State');
      expect(urls.googleMapsSearch).toBe('https://www.google.com/maps/search/123%20Main%20St%2C%20City%2C%20State');
    });

    it('should generate correct URLs for Android', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
      const urls = MapsService.generateMapsUrls('123 Main St, City, State');

      expect(urls.googleMapsApp).toBe('google.navigation:q=123%20Main%20St%2C%20City%2C%20State');
      expect(urls.appleMaps).toBe('http://maps.apple.com/?daddr=123%20Main%20St%2C%20City%2C%20State');
      expect(urls.googleMapsWeb).toBe('https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20City%2C%20State');
      expect(urls.googleMapsSearch).toBe('https://www.google.com/maps/search/123%20Main%20St%2C%20City%2C%20State');
    });
  });

  describe('openWebMaps', () => {
    it('should open web maps in new window', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      const result = MapsService.openWebMaps('123 Main St');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St',
        '_blank'
      );
      expect(result).toBe(true);
    });

    it('should fallback to current window if popup blocked', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      mockWindowOpen.mockReturnValue(null); // Simulate popup blocked

      const result = MapsService.openWebMaps('123 Main St');

      expect(mockLocationHref).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St'
      );
      expect(result).toBe(true);
    });
  });

  describe('openFallbackMaps', () => {
    it('should open fallback maps search', () => {
      MapsService.openFallbackMaps('123 Main St');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/123%20Main%20St',
        '_blank'
      );
    });

    it('should fallback to current window if popup blocked', () => {
      mockWindowOpen.mockReturnValue(null);

      MapsService.openFallbackMaps('123 Main St');

      expect(mockLocationHref).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/123%20Main%20St'
      );
    });
  });

  describe('navigate', () => {
    it('should call openWebMaps for desktop platform', async () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await MapsService.navigate('123 Main St');

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St',
        '_blank'
      );
    });

    it('should handle errors gracefully', async () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Test error');
      });

      // Should not throw
      await expect(MapsService.navigate('123 Main St')).resolves.toBeUndefined();

      // Should fallback to search
      expect(mockLocationHref).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/123%20Main%20St'
      );
    });
  });
});