/**
 * Mobile responsiveness utilities and hooks
 */

import { useState, useEffect } from 'react';

export interface BreakpointConfig {
  xs: number;  // Extra small devices (phones)
  sm: number;  // Small devices (large phones)
  md: number;  // Medium devices (tablets)
  lg: number;  // Large devices (desktops)
  xl: number;  // Extra large devices
}

export const breakpoints: BreakpointConfig = {
  xs: 375,
  sm: 414,
  md: 768,
  lg: 1024,
  xl: 1280
};

export type BreakpointKey = keyof BreakpointConfig;

/**
 * Hook to track current viewport width and active breakpoint
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = (): BreakpointKey => {
    const { width } = viewport;
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isBreakpoint = (breakpoint: BreakpointKey): boolean => {
    return viewport.width >= breakpoints[breakpoint];
  };

  const isMobile = (): boolean => {
    return viewport.width < breakpoints.md;
  };

  const isTablet = (): boolean => {
    return viewport.width >= breakpoints.md && viewport.width < breakpoints.lg;
  };

  const isDesktop = (): boolean => {
    return viewport.width >= breakpoints.lg;
  };

  return {
    viewport,
    currentBreakpoint: getCurrentBreakpoint(),
    isBreakpoint,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop()
  };
};

/**
 * Hook to detect touch device capabilities
 */
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return {
    isTouch,
    supportsHover: !isTouch,
    prefersTouchInteraction: isTouch
  };
};

/**
 * Hook to track device orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    const handleResize = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(handleOrientationChange, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};

/**
 * Hook to detect if user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to handle safe area insets for devices with notches/home indicators
 */
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0')
      });
    };

    // Set CSS custom properties for safe area insets
    const root = document.documentElement;
    root.style.setProperty('--sat', 'env(safe-area-inset-top)');
    root.style.setProperty('--sar', 'env(safe-area-inset-right)');
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--sal', 'env(safe-area-inset-left)');

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};

/**
 * Utility function to generate responsive classes based on breakpoints
 */
export const generateResponsiveClasses = (
  baseClasses: string,
  responsiveClasses: Partial<Record<BreakpointKey, string>>
): string => {
  let classes = baseClasses;
  
  Object.entries(responsiveClasses).forEach(([breakpoint, className]) => {
    if (className) {
      classes += ` ${breakpoint}:${className}`;
    }
  });
  
  return classes;
};

/**
 * Utility to check if current device is likely a mobile phone
 */
export const isMobilePhone = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'iphone', 'ipod', 'blackberry', 'windows phone'];
  
  return (
    mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
    (window.innerWidth <= breakpoints.sm && 'ontouchstart' in window)
  );
};

/**
 * Utility to get optimal image sizes for different screen densities
 */
export const getResponsiveImageSizes = (baseWidth: number) => {
  return {
    '1x': baseWidth,
    '2x': baseWidth * 2,
    '3x': baseWidth * 3
  };
};

/**
 * Utility to generate responsive font sizes
 */
export const getResponsiveFontSize = (
  baseSize: number,
  scaleFactor: { [key in BreakpointKey]?: number } = {}
) => {
  const { currentBreakpoint } = useViewport();
  const scale = scaleFactor[currentBreakpoint] || 1;
  return baseSize * scale;
};
