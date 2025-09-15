/**
 * Safari Compatibility Utilities
 * Handles Safari-specific compatibility issues for item saving and image processing
 */

// Types for Safari compatibility
interface Position {
  x: number;
  y: number;
}

interface SafariSanitizableData {
  position?: Position;
  reportCount?: number;
  imageSize?: number;
  priceImageSize?: number;
  [key: string]: unknown;
}

/**
 * Check if the current browser is Safari
 */
export const isSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  return userAgent.includes('Safari') && !userAgent.includes('Chrome');
};

/**
 * Check if the current browser is Safari on iOS
 */
export const isSafariIOS = (): boolean => {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && userAgent.includes('Safari');
};

/**
 * Sanitize data object for Safari compatibility
 * Ensures all numeric fields are properly typed and removes any problematic values
 */
export const sanitizeForSafari = (data: SafariSanitizableData): SafariSanitizableData => {
  const sanitized = { ...data };
  
  // Ensure position coordinates are proper numbers
  if (sanitized.position) {
    sanitized.position.x = Number(sanitized.position.x) || 0;
    sanitized.position.y = Number(sanitized.position.y) || 0;
  }
  
  // Ensure numeric fields are proper numbers
  if (sanitized.reportCount !== undefined) {
    sanitized.reportCount = Number(sanitized.reportCount) || 0;
  }
  
  if (sanitized.imageSize !== undefined) {
    sanitized.imageSize = Number(sanitized.imageSize) || undefined;
  }
  
  if (sanitized.priceImageSize !== undefined) {
    sanitized.priceImageSize = Number(sanitized.priceImageSize) || undefined;
  }
  
  // Remove any undefined values that might cause issues in Safari
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
};

/**
 * Log Safari-specific debugging information
 */
export const logSafariDebug = (operation: string, data?: unknown): void => {
  if (isSafari() || isSafariIOS()) {
    console.log(`🍎 Safari Debug [${operation}]:`, {
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
      data: data || 'No data'
    });
  }
};

/**
 * Enhanced error logging for Safari
 */
export const logSafariError = (operation: string, error: unknown, context?: unknown): void => {
  if (isSafari() || isSafariIOS()) {
    console.error(`🍎 Safari Error [${operation}]:`, {
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      context: context || 'No context'
    });
  }
};