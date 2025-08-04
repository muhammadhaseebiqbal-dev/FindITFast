import React, { useEffect, useState } from 'react';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  className?: string;
}

/**
 * Mobile gesture handler component that provides touch gesture recognition
 */
export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  swipeThreshold = 50,
  className = ''
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    } else if (e.touches.length === 2 && onPinch) {
      const distance = getPinchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && onPinch && initialPinchDistance) {
      const currentDistance = getPinchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance;
      onPinch(scale);
    } else if (e.touches.length === 1) {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setInitialPinchDistance(null);
      
      if (!touchStart || !touchEnd) return;

      const deltaX = touchStart.x - touchEnd.x;
      const deltaY = touchStart.y - touchEnd.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check for swipe gestures
      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeLeft?.();
          } else {
            onSwipeRight?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeUp?.();
          } else {
            onSwipeDown?.();
          }
        }
      }

      // Check for double tap
      if (onDoubleTap && absDeltaX < 10 && absDeltaY < 10) {
        const now = Date.now();
        const tapDelay = now - lastTap;
        
        if (tapDelay < 300 && tapDelay > 0) {
          onDoubleTap();
        }
        setLastTap(now);
      }
    }
  };

  const getPinchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
};

interface KeyboardHandlerProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  className?: string;
}

/**
 * Keyboard event handler for mobile accessibility and keyboard navigation
 */
export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  children,
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onArrowRight?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);

  return <div className={className}>{children}</div>;
};

interface ViewportHandlerProps {
  children: React.ReactNode;
  onViewportChange?: (viewport: { width: number; height: number; orientation: 'portrait' | 'landscape' }) => void;
}

/**
 * Viewport handler that tracks screen size and orientation changes
 */
export const ViewportHandler: React.FC<ViewportHandlerProps> = ({
  children,
  onViewportChange
}) => {
  useEffect(() => {
    const handleResize = () => {
      const newViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const
      };
      
      onViewportChange?.(newViewport);
    };

    const handleOrientationChange = () => {
      // Delay to ensure viewport dimensions are updated
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [onViewportChange]);

  return <>{children}</>;
};
