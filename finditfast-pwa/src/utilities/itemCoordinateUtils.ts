/**
 * Utility functions for managing item coordinates and positioning on floorplans
 */

export interface Position {
  x: number;
  y: number;
}

export interface FloorplanDimensions {
  width: number;
  height: number;
}

export interface ItemPositionData {
  position: Position;
  floorplanDimensions: FloorplanDimensions;
  timestamp: Date;
}

/**
 * Convert pixel coordinates to percentage-based coordinates
 * @param pixelX - X coordinate in pixels
 * @param pixelY - Y coordinate in pixels
 * @param containerWidth - Container width in pixels
 * @param containerHeight - Container height in pixels
 * @returns Position object with percentage coordinates
 */
export const pixelToPercentage = (
  pixelX: number,
  pixelY: number,
  containerWidth: number,
  containerHeight: number
): Position => {
  return {
    x: (pixelX / containerWidth) * 100,
    y: (pixelY / containerHeight) * 100,
  };
};

/**
 * Convert percentage-based coordinates to pixel coordinates
 * @param percentageX - X coordinate as percentage (0-100)
 * @param percentageY - Y coordinate as percentage (0-100)
 * @param containerWidth - Container width in pixels
 * @param containerHeight - Container height in pixels
 * @returns Position object with pixel coordinates
 */
export const percentageToPixel = (
  percentageX: number,
  percentageY: number,
  containerWidth: number,
  containerHeight: number
): Position => {
  return {
    x: (percentageX / 100) * containerWidth,
    y: (percentageY / 100) * containerHeight,
  };
};

/**
 * Validate that coordinates are within valid bounds
 * @param position - Position to validate
 * @returns boolean indicating if position is valid
 */
export const isValidPosition = (position: Position): boolean => {
  return (
    position.x >= 0 &&
    position.x <= 100 &&
    position.y >= 0 &&
    position.y <= 100 &&
    !isNaN(position.x) &&
    !isNaN(position.y)
  );
};

/**
 * Clamp coordinates to valid bounds (0-100%)
 * @param position - Position to clamp
 * @returns Position with clamped coordinates
 */
export const clampPosition = (position: Position): Position => {
  return {
    x: Math.max(0, Math.min(100, position.x)),
    y: Math.max(0, Math.min(100, position.y)),
  };
};

/**
 * Calculate distance between two positions (in percentage units)
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Distance between positions
 */
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const deltaX = pos2.x - pos1.x;
  const deltaY = pos2.y - pos1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Check if two positions are too close to each other
 * @param pos1 - First position
 * @param pos2 - Second position
 * @param minDistance - Minimum allowed distance (default: 5%)
 * @returns boolean indicating if positions are too close
 */
export const arePositionsTooClose = (
  pos1: Position,
  pos2: Position,
  minDistance: number = 5
): boolean => {
  return calculateDistance(pos1, pos2) < minDistance;
};

/**
 * Find the closest position to a given position from an array of positions
 * @param targetPosition - Position to find closest match for
 * @param positions - Array of positions to search
 * @returns Closest position and its distance, or null if array is empty
 */
export const findClosestPosition = (
  targetPosition: Position,
  positions: Position[]
): { position: Position; distance: number } | null => {
  if (positions.length === 0) return null;

  let closestPosition = positions[0];
  let minDistance = calculateDistance(targetPosition, closestPosition);

  for (let i = 1; i < positions.length; i++) {
    const distance = calculateDistance(targetPosition, positions[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestPosition = positions[i];
    }
  }

  return { position: closestPosition, distance: minDistance };
};

/**
 * Generate a suggested position that doesn't conflict with existing positions
 * @param existingPositions - Array of existing positions to avoid
 * @param preferredPosition - Preferred position (optional)
 * @param minDistance - Minimum distance from existing positions (default: 5%)
 * @returns Suggested position
 */
export const suggestNonConflictingPosition = (
  existingPositions: Position[],
  preferredPosition?: Position,
  minDistance: number = 5
): Position => {
  // If no preferred position, start with center
  let suggestedPosition = preferredPosition || { x: 50, y: 50 };

  // If no existing positions, return the suggested position
  if (existingPositions.length === 0) {
    return clampPosition(suggestedPosition);
  }

  // Check if preferred position conflicts
  const hasConflict = existingPositions.some(pos =>
    arePositionsTooClose(suggestedPosition, pos, minDistance)
  );

  if (!hasConflict) {
    return clampPosition(suggestedPosition);
  }

  // Try to find a non-conflicting position by spiraling outward
  const maxAttempts = 50;
  const angleStep = (2 * Math.PI) / 8; // 8 directions
  let radius = minDistance;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (let i = 0; i < 8; i++) {
      const angle = i * angleStep;
      const testPosition = {
        x: suggestedPosition.x + radius * Math.cos(angle),
        y: suggestedPosition.y + radius * Math.sin(angle),
      };

      // Check if this position is valid and doesn't conflict
      if (
        isValidPosition(testPosition) &&
        !existingPositions.some(pos =>
          arePositionsTooClose(testPosition, pos, minDistance)
        )
      ) {
        return clampPosition(testPosition);
      }
    }
    radius += minDistance * 0.5; // Increase search radius
  }

  // If no non-conflicting position found, return a random valid position
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
  };
};

/**
 * Create item position metadata for storage
 * @param position - Item position
 * @param floorplanDimensions - Floorplan dimensions when position was set
 * @returns ItemPositionData object
 */
export const createPositionMetadata = (
  position: Position,
  floorplanDimensions: FloorplanDimensions
): ItemPositionData => {
  return {
    position: clampPosition(position),
    floorplanDimensions,
    timestamp: new Date(),
  };
};

/**
 * Validate item position metadata
 * @param metadata - Position metadata to validate
 * @returns boolean indicating if metadata is valid
 */
export const isValidPositionMetadata = (metadata: ItemPositionData): boolean => {
  return (
    isValidPosition(metadata.position) &&
    metadata.floorplanDimensions.width > 0 &&
    metadata.floorplanDimensions.height > 0 &&
    metadata.timestamp instanceof Date &&
    !isNaN(metadata.timestamp.getTime())
  );
};

/**
 * Adjust position for different floorplan dimensions (if floorplan is updated)
 * This function maintains the relative position when floorplan dimensions change
 * @param originalPosition - Original position
 * @param originalDimensions - Original floorplan dimensions
 * @param newDimensions - New floorplan dimensions
 * @returns Adjusted position
 */
export const adjustPositionForNewDimensions = (
  originalPosition: Position,
  originalDimensions: FloorplanDimensions,
  newDimensions: FloorplanDimensions
): Position => {
  // If dimensions are the same, no adjustment needed
  if (
    originalDimensions.width === newDimensions.width &&
    originalDimensions.height === newDimensions.height
  ) {
    return originalPosition;
  }

  // Calculate the scaling factors
  const scaleX = newDimensions.width / originalDimensions.width;
  const scaleY = newDimensions.height / originalDimensions.height;

  // For percentage-based coordinates, we want to maintain relative position
  // If the aspect ratio changes, we need to adjust accordingly
  const aspectRatioOriginal = originalDimensions.width / originalDimensions.height;
  const aspectRatioNew = newDimensions.width / newDimensions.height;

  if (Math.abs(aspectRatioOriginal - aspectRatioNew) < 0.01) {
    // Aspect ratios are similar, keep the same percentage position
    return originalPosition;
  }

  // Convert to pixel coordinates in original dimensions
  const pixelPosition = percentageToPixel(
    originalPosition.x,
    originalPosition.y,
    originalDimensions.width,
    originalDimensions.height
  );

  // Scale the pixel coordinates
  const scaledPixelPosition = {
    x: pixelPosition.x * scaleX,
    y: pixelPosition.y * scaleY,
  };

  // Convert back to percentage using new dimensions
  return pixelToPercentage(
    scaledPixelPosition.x,
    scaledPixelPosition.y,
    newDimensions.width,
    newDimensions.height
  );
};

/**
 * Get position bounds for a given area (useful for grouping items)
 * @param centerPosition - Center position of the area
 * @param radius - Radius of the area (in percentage units)
 * @returns Object with min/max bounds
 */
export const getPositionBounds = (
  centerPosition: Position,
  radius: number
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} => {
  return {
    minX: Math.max(0, centerPosition.x - radius),
    maxX: Math.min(100, centerPosition.x + radius),
    minY: Math.max(0, centerPosition.y - radius),
    maxY: Math.min(100, centerPosition.y + radius),
  };
};

/**
 * Check if a position is within given bounds
 * @param position - Position to check
 * @param bounds - Bounds object
 * @returns boolean indicating if position is within bounds
 */
export const isPositionWithinBounds = (
  position: Position,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): boolean => {
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.y >= bounds.minY &&
    position.y <= bounds.maxY
  );
};