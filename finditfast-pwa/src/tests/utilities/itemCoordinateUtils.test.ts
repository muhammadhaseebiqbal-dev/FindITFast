import { describe, it, expect } from 'vitest';
import {
  pixelToPercentage,
  percentageToPixel,
  isValidPosition,
  clampPosition,
  calculateDistance,
  arePositionsTooClose,
  findClosestPosition,
  suggestNonConflictingPosition,
  createPositionMetadata,
  isValidPositionMetadata,
  adjustPositionForNewDimensions,
  getPositionBounds,
  isPositionWithinBounds,
} from '../../utilities/itemCoordinateUtils';

describe('itemCoordinateUtils', () => {
  describe('pixelToPercentage', () => {
    it('should convert pixel coordinates to percentage', () => {
      const result = pixelToPercentage(100, 50, 400, 200);
      expect(result).toEqual({ x: 25, y: 25 });
    });

    it('should handle edge cases', () => {
      expect(pixelToPercentage(0, 0, 400, 200)).toEqual({ x: 0, y: 0 });
      expect(pixelToPercentage(400, 200, 400, 200)).toEqual({ x: 100, y: 100 });
    });
  });

  describe('percentageToPixel', () => {
    it('should convert percentage coordinates to pixels', () => {
      const result = percentageToPixel(25, 25, 400, 200);
      expect(result).toEqual({ x: 100, y: 50 });
    });

    it('should handle edge cases', () => {
      expect(percentageToPixel(0, 0, 400, 200)).toEqual({ x: 0, y: 0 });
      expect(percentageToPixel(100, 100, 400, 200)).toEqual({ x: 400, y: 200 });
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ x: 50, y: 50 })).toBe(true);
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 100, y: 100 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ x: -1, y: 50 })).toBe(false);
      expect(isValidPosition({ x: 50, y: 101 })).toBe(false);
      expect(isValidPosition({ x: NaN, y: 50 })).toBe(false);
      expect(isValidPosition({ x: 50, y: NaN })).toBe(false);
    });
  });

  describe('clampPosition', () => {
    it('should clamp coordinates to valid bounds', () => {
      expect(clampPosition({ x: -10, y: 50 })).toEqual({ x: 0, y: 50 });
      expect(clampPosition({ x: 110, y: 50 })).toEqual({ x: 100, y: 50 });
      expect(clampPosition({ x: 50, y: -10 })).toEqual({ x: 50, y: 0 });
      expect(clampPosition({ x: 50, y: 110 })).toEqual({ x: 50, y: 100 });
    });

    it('should not modify valid positions', () => {
      expect(clampPosition({ x: 50, y: 50 })).toEqual({ x: 50, y: 50 });
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two positions', () => {
      const distance = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same positions', () => {
      const distance = calculateDistance({ x: 50, y: 50 }, { x: 50, y: 50 });
      expect(distance).toBe(0);
    });
  });

  describe('arePositionsTooClose', () => {
    it('should return true for positions that are too close', () => {
      const result = arePositionsTooClose({ x: 50, y: 50 }, { x: 52, y: 52 }, 5);
      expect(result).toBe(true);
    });

    it('should return false for positions that are far enough', () => {
      const result = arePositionsTooClose({ x: 50, y: 50 }, { x: 60, y: 60 }, 5);
      expect(result).toBe(false);
    });
  });

  describe('findClosestPosition', () => {
    it('should find the closest position', () => {
      const target = { x: 50, y: 50 };
      const positions = [
        { x: 10, y: 10 },
        { x: 55, y: 55 }, // Closest
        { x: 90, y: 90 },
      ];

      const result = findClosestPosition(target, positions);
      expect(result?.position).toEqual({ x: 55, y: 55 });
      expect(result?.distance).toBeCloseTo(7.07, 2);
    });

    it('should return null for empty array', () => {
      const result = findClosestPosition({ x: 50, y: 50 }, []);
      expect(result).toBeNull();
    });
  });

  describe('suggestNonConflictingPosition', () => {
    it('should return preferred position if no conflicts', () => {
      const preferred = { x: 50, y: 50 };
      const existing = [{ x: 10, y: 10 }, { x: 90, y: 90 }];

      const result = suggestNonConflictingPosition(existing, preferred, 5);
      expect(result).toEqual(preferred);
    });

    it('should find alternative position if preferred conflicts', () => {
      const preferred = { x: 50, y: 50 };
      const existing = [{ x: 52, y: 52 }]; // Too close to preferred

      const result = suggestNonConflictingPosition(existing, preferred, 5);
      expect(result).not.toEqual(preferred);
      expect(isValidPosition(result)).toBe(true);
    });

    it('should return center position if no preferred position given', () => {
      const result = suggestNonConflictingPosition([], undefined, 5);
      expect(result).toEqual({ x: 50, y: 50 });
    });
  });

  describe('createPositionMetadata', () => {
    it('should create valid position metadata', () => {
      const position = { x: 50, y: 50 };
      const dimensions = { width: 800, height: 600 };

      const metadata = createPositionMetadata(position, dimensions);

      expect(metadata.position).toEqual(position);
      expect(metadata.floorplanDimensions).toEqual(dimensions);
      expect(metadata.timestamp).toBeInstanceOf(Date);
    });

    it('should clamp invalid positions', () => {
      const position = { x: 150, y: -10 };
      const dimensions = { width: 800, height: 600 };

      const metadata = createPositionMetadata(position, dimensions);

      expect(metadata.position).toEqual({ x: 100, y: 0 });
    });
  });

  describe('isValidPositionMetadata', () => {
    it('should return true for valid metadata', () => {
      const metadata = {
        position: { x: 50, y: 50 },
        floorplanDimensions: { width: 800, height: 600 },
        timestamp: new Date(),
      };

      expect(isValidPositionMetadata(metadata)).toBe(true);
    });

    it('should return false for invalid metadata', () => {
      const invalidMetadata = {
        position: { x: -10, y: 50 },
        floorplanDimensions: { width: 0, height: 600 },
        timestamp: new Date('invalid'),
      };

      expect(isValidPositionMetadata(invalidMetadata)).toBe(false);
    });
  });

  describe('adjustPositionForNewDimensions', () => {
    it('should adjust position for new dimensions', () => {
      const originalPosition = { x: 50, y: 50 }; // Center
      const originalDimensions = { width: 400, height: 300 };
      const newDimensions = { width: 800, height: 600 };

      const adjusted = adjustPositionForNewDimensions(
        originalPosition,
        originalDimensions,
        newDimensions
      );

      // Should still be center
      expect(adjusted.x).toBeCloseTo(50, 1);
      expect(adjusted.y).toBeCloseTo(50, 1);
    });
  });

  describe('getPositionBounds', () => {
    it('should calculate position bounds', () => {
      const center = { x: 50, y: 50 };
      const radius = 10;

      const bounds = getPositionBounds(center, radius);

      expect(bounds).toEqual({
        minX: 40,
        maxX: 60,
        minY: 40,
        maxY: 60,
      });
    });

    it('should clamp bounds to valid range', () => {
      const center = { x: 5, y: 95 };
      const radius = 10;

      const bounds = getPositionBounds(center, radius);

      expect(bounds).toEqual({
        minX: 0, // Clamped from -5
        maxX: 15,
        minY: 85,
        maxY: 100, // Clamped from 105
      });
    });
  });

  describe('isPositionWithinBounds', () => {
    it('should return true for position within bounds', () => {
      const position = { x: 50, y: 50 };
      const bounds = { minX: 40, maxX: 60, minY: 40, maxY: 60 };

      expect(isPositionWithinBounds(position, bounds)).toBe(true);
    });

    it('should return false for position outside bounds', () => {
      const position = { x: 70, y: 50 };
      const bounds = { minX: 40, maxX: 60, minY: 40, maxY: 60 };

      expect(isPositionWithinBounds(position, bounds)).toBe(false);
    });

    it('should return true for position on bounds edge', () => {
      const position = { x: 60, y: 40 };
      const bounds = { minX: 40, maxX: 60, minY: 40, maxY: 60 };

      expect(isPositionWithinBounds(position, bounds)).toBe(true);
    });
  });
});