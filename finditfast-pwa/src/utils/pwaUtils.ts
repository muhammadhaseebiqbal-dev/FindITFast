// PWA utility functions

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Check if the app is running as a PWA
export const isPWA = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;
  
  return isStandalone || isInWebAppiOS || isInWebAppChrome;
};

// Check if PWA installation is supported
export const isPWAInstallSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Get PWA display mode
export const getPWADisplayMode = (): string => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
};

// Register service worker with error handling
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  // In development mode, try to register the dev service worker
  const swPath = import.meta.env.DEV ? '/sw-dev.js' : '/sw.js';

  try {
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully:', registration);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Unregister service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('Service Worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

// Check for app updates
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return false;
  }
};

// Get network status
export const getNetworkStatus = (): {
  online: boolean;
  connection?: any;
} => {
  const online = navigator.onLine;
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online,
    connection
  };
};

// Cache management utilities
export const clearAppCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('App cache cleared');
  }
};

// Get cache storage estimate
export const getCacheStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      return await navigator.storage.estimate();
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
      return null;
    }
  }
  return null;
};

// PWA analytics helper
export const trackPWAEvent = (eventName: string, properties?: Record<string, any>): void => {
  // This would integrate with your analytics service (Firebase Analytics, etc.)
  console.log('PWA Event:', eventName, properties);
  
  // Example: Send to Firebase Analytics
  // if (window.gtag) {
  //   window.gtag('event', eventName, properties);
  // }
};

// Handle PWA installation
export const handlePWAInstall = async (deferredPrompt: PWAInstallPrompt): Promise<boolean> => {
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    trackPWAEvent('pwa_install_prompt_result', { outcome });
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('PWA installation failed:', error);
    trackPWAEvent('pwa_install_error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};