import { describe, it, expect } from 'vitest';
import { ItemInfo } from '../../../components/floorplan/ItemInfo';

describe('ItemInfo', () => {
  it('ItemInfo component exists and can be imported', () => {
    expect(ItemInfo).toBeDefined();
    expect(typeof ItemInfo).toBe('function');
  });
});