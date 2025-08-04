/**
 * Performance monitoring and optimization utilities
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  cacheHitRate?: number;
}

/**
 * Hook to measure component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(Date.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const renderEndTime = Date.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    setMetrics({
      loadTime: renderEndTime,
      renderTime,
      memoryUsage
    });

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}: ${renderTime}ms render time`);
    }
  }, [componentName]);

  return metrics;
};

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for performance optimization
 */
export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
};

/**
 * Memoization utility for expensive calculations
 */
export class MemoCache<TArgs extends any[], TReturn> {
  private cache = new Map<string, { value: TReturn; timestamp: number }>();
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge = 5 * 60 * 1000, maxSize = 100) { // 5 minutes default
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  private generateKey(args: TArgs): string {
    return JSON.stringify(args);
  }

  private cleanup(): void {
    if (this.cache.size <= this.maxSize) return;

    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, { timestamp }]) => {
      if (now - timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    });

    // Remove oldest entries if still over limit
    if (this.cache.size > this.maxSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.cache.size - this.maxSize);
      
      sortedEntries.forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  get(args: TArgs): TReturn | undefined {
    const key = this.generateKey(args);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.value;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return undefined;
  }

  set(args: TArgs, value: TReturn): void {
    const key = this.generateKey(args);
    this.cache.set(key, { value, timestamp: Date.now() });
    this.cleanup();
  }

  clear(): void {
    this.cache.clear();
  }

  has(args: TArgs): boolean {
    const key = this.generateKey(args);
    const cached = this.cache.get(key);
    return cached !== undefined && Date.now() - cached.timestamp < this.maxAge;
  }
}

/**
 * Request deduplication utility
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  cancel(key: string): void {
    this.pendingRequests.delete(key);
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

/**
 * Image optimization utilities
 */
export const ImageOptimizer = {
  /**
   * Get optimal image format based on browser support
   */
  getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }

    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }

    return 'jpeg';
  },

  /**
   * Generate responsive image URLs with appropriate formats
   */
  generateResponsiveUrls(baseUrl: string, sizes: number[]): Record<string, string> {
    const format = this.getOptimalFormat();
    const urls: Record<string, string> = {};

    sizes.forEach(size => {
      const url = baseUrl
        .replace(/\.(jpg|jpeg|png)$/i, `.${format}`)
        .replace(/(\.[^.]+)$/, `_${size}w$1`);
      urls[`${size}w`] = url;
    });

    return urls;
  },

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => 
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
      )
    );
  }
};

/**
 * Bundle size analyzer for development
 */
export const BundleAnalyzer = {
  /**
   * Log bundle size information in development
   */
  logBundleInfo(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    console.group('Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', stylesheets.length);
    
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }
    console.groupEnd();
  },

  /**
   * Monitor resource loading performance
   */
  monitorResources(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          if (resource.transferSize > 100000) { // > 100KB
            console.warn(`Large resource: ${resource.name} (${Math.round(resource.transferSize / 1024)}KB)`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

/**
 * Service Worker cache optimization
 */
export const CacheOptimizer = {
  /**
   * Clear old caches to free up storage
   */
  async clearOldCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        !name.includes(new Date().getFullYear().toString())
      );

      await Promise.all(
        oldCaches.map(name => caches.delete(name))
      );
    }
  },

  /**
   * Get cache usage statistics
   */
  async getCacheStats(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }
};
