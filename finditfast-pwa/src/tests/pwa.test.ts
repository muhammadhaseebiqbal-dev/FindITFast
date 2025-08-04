// PWA functionality tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  isPWA, 
  isPWAInstallSupported, 
  getPWADisplayMode,
  getNetworkStatus 
} from '../utils/pwaUtils';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock navigator
const mockNavigator = {
  onLine: true,
  serviceWorker: {
    register: vi.fn(),
    ready: Promise.resolve({
      addEventListener: vi.fn(),
      update: vi.fn(),
    }),
  },
};

Object.defineProperty(window, 'navigator', {
  writable: true,
  value: mockNavigator,
});

describe('PWA Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPWA', () => {
    it('should return true when running in standalone mode', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isPWA()).toBe(true);
    });

    it('should return false when running in browser mode', () => {
      mockMatchMedia.mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isPWA()).toBe(false);
    });
  });

  describe('isPWAInstallSupported', () => {
    it('should return true when service worker and BeforeInstallPromptEvent are supported', () => {
      (window as any).BeforeInstallPromptEvent = class {};
      expect(isPWAInstallSupported()).toBe(true);
    });

    it('should return false when service worker is not supported', () => {
      delete (window.navigator as any).serviceWorker;
      expect(isPWAInstallSupported()).toBe(false);
    });
  });

  describe('getPWADisplayMode', () => {
    it('should return "standalone" when in standalone mode', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPWADisplayMode()).toBe('standalone');
    });

    it('should return "browser" when no special display mode matches', () => {
      mockMatchMedia.mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPWADisplayMode()).toBe('browser');
    });
  });

  describe('getNetworkStatus', () => {
    it('should return online status', () => {
      const status = getNetworkStatus();
      expect(status.online).toBe(true);
    });

    it('should return offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const status = getNetworkStatus();
      expect(status.online).toBe(false);
    });
  });
});