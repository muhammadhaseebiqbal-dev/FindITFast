import { describe, it, expect } from 'vitest';
import { FloorplanImage } from '../../../components/floorplan/FloorplanImage';

describe('FloorplanImage', () => {
  it('FloorplanImage component exists and can be imported', () => {
    expect(FloorplanImage).toBeDefined();
    expect(typeof FloorplanImage).toBe('function');
  });
});