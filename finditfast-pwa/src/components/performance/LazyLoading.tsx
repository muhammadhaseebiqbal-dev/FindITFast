import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  height?: number;
  offset?: number;
  placeholder?: ReactNode;
  className?: string;
  onLoad?: () => void;
}

/**
 * Lazy loading component using Intersection Observer API
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  offset = 100,
  placeholder,
  className = '',
  onLoad
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [offset]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [isVisible, isLoaded, onLoad]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ minHeight: isLoaded ? 'auto' : height }}
    >
      {isLoaded ? children : (placeholder || <LazyLoadSkeleton height={height} />)}
    </div>
  );
};

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy loading image component with WebP support and fallbacks
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP version if available
  const getWebPSrc = (originalSrc: string): string => {
    if (originalSrc.includes('.jpg') || originalSrc.includes('.jpeg') || originalSrc.includes('.png')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (imageSrc.includes('.webp')) {
      // Fallback to original format if WebP fails
      setImageSrc(src);
    } else {
      setIsError(true);
      onError?.();
    }
  };

  useEffect(() => {
    // Try WebP first, fallback to original
    const webpSrc = getWebPSrc(src);
    setImageSrc(webpSrc);
  }, [src]);

  if (isError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <LazyLoad
      height={height}
      placeholder={
        placeholder ? (
          <img src={placeholder} alt={alt} className={className} style={{ width, height }} />
        ) : (
          <div
            className={`bg-gray-200 animate-pulse ${className}`}
            style={{ width, height }}
          />
        )
      }
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </LazyLoad>
  );
};

interface LazyLoadSkeletonProps {
  height: number;
  className?: string;
}

/**
 * Skeleton placeholder for lazy loading
 */
const LazyLoadSkeleton: React.FC<LazyLoadSkeletonProps> = ({ height, className = '' }) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
      style={{ height }}
    >
      <div className="h-full flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    </div>
  );
};

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtualized list component for performance with large datasets
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loader?: ReactNode;
  className?: string;
}

/**
 * Infinite scroll component for pagination
 */
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  loader,
  className = ''
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="h-4">
          {isLoading && (
            loader || (
              <div className="flex justify-center py-4">
                <div className="loading-spinner" />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
