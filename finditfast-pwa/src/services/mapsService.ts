/**
 * Service for handling navigation to external maps applications
 */
export class MapsService {
  /**
   * Detect the current platform
   */
  static getPlatform(): 'ios' | 'android' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'desktop';
    }
  }

  /**
   * Check if Google Maps app is likely available
   */
  static isGoogleMapsAppAvailable(): boolean {
    const platform = this.getPlatform();
    // Assume Google Maps is available on mobile platforms
    return platform === 'ios' || platform === 'android';
  }

  /**
   * Generate Google Maps URLs for different platforms
   */
  static generateMapsUrls(address: string) {
    const encodedAddress = encodeURIComponent(address);
    const platform = this.getPlatform();

    return {
      // Native app URLs
      googleMapsApp: platform === 'ios' 
        ? `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`
        : `google.navigation:q=${encodedAddress}`,
      
      // iOS Apple Maps fallback
      appleMaps: `http://maps.apple.com/?daddr=${encodedAddress}`,
      
      // Web version with directions
      googleMapsWeb: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
      
      // Basic search fallback
      googleMapsSearch: `https://www.google.com/maps/search/${encodedAddress}`,
    };
  }

  /**
   * Attempt to open native maps app
   */
  static async openNativeApp(address: string): Promise<boolean> {
    const urls = this.generateMapsUrls(address);
    const platform = this.getPlatform();

    return new Promise((resolve) => {
      if (platform === 'ios') {
        // iOS: Try Google Maps app first
        this.tryOpenUrl(urls.googleMapsApp)
          .then((success) => {
            if (!success) {
              // Fallback to Apple Maps
              this.tryOpenUrl(urls.appleMaps).then(resolve);
            } else {
              resolve(true);
            }
          });
      } else if (platform === 'android') {
        // Android: Try Google Maps intent
        this.tryOpenUrl(urls.googleMapsApp).then(resolve);
      } else {
        // Desktop: No native app
        resolve(false);
      }
    });
  }

  /**
   * Open web version of Google Maps
   */
  static openWebMaps(address: string): boolean {
    const urls = this.generateMapsUrls(address);
    
    try {
      const newWindow = window.open(urls.googleMapsWeb, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup blocked, navigate in current window
        window.location.href = urls.googleMapsWeb;
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error opening web maps:', error);
      return false;
    }
  }

  /**
   * Ultimate fallback to basic Google Maps search
   */
  static openFallbackMaps(address: string): void {
    const urls = this.generateMapsUrls(address);
    
    try {
      const fallbackWindow = window.open(urls.googleMapsSearch, '_blank');
      
      if (!fallbackWindow || fallbackWindow.closed || typeof fallbackWindow.closed === 'undefined') {
        window.location.href = urls.googleMapsSearch;
      }
    } catch (error) {
      console.error('Error opening fallback maps:', error);
      // Last resort: try to navigate in current window
      try {
        window.location.href = urls.googleMapsSearch;
      } catch (finalError) {
        console.error('All maps navigation methods failed:', finalError);
      }
    }
  }

  /**
   * Main navigation method that tries all options
   */
  static async navigate(address: string): Promise<void> {
    try {
      // First try native app
      const nativeSuccess = await this.openNativeApp(address);
      
      if (!nativeSuccess) {
        // Fallback to web version
        const webSuccess = this.openWebMaps(address);
        
        if (!webSuccess) {
          // Ultimate fallback
          this.openFallbackMaps(address);
        }
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      // Ultimate fallback
      this.openFallbackMaps(address);
    }
  }

  /**
   * Helper method to try opening a URL and detect success
   */
  private static tryOpenUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const platform = this.getPlatform();
      
      if (platform === 'ios') {
        // iOS: Use iframe method to test app availability
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        // Clean up iframe
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 100);
        
        // Check if we're still focused (app didn't open)
        setTimeout(() => {
          resolve(!document.hasFocus());
        }, 500);
        
      } else if (platform === 'android') {
        // Android: Try to navigate and check if we're still here
        try {
          const startTime = Date.now();
          window.location.href = url;
          
          // Check if we're still in the browser after a delay
          setTimeout(() => {
            const timeElapsed = Date.now() - startTime;
            // If we're still here and not much time passed, the intent probably failed
            resolve(timeElapsed > 1000 || !document.hasFocus());
          }, 500);
        } catch {
          resolve(false);
        }
      } else {
        // Desktop: No native apps
        resolve(false);
      }
    });
  }
}