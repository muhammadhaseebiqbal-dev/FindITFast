import { describe, it, expect } from 'vitest';
import { ItemPin } from '../../../components/floorplan/ItemPin';

describe('ItemPin', () => {
  it('ItemPin component exists and can be imported', () => {
    expect(ItemPin).toBeDefined();
    expect(typeof ItemPin).toBe('function');
  });
});