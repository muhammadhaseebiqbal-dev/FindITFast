import { describe, it, expect } from 'vitest';
import { SearchBar } from '../../components/search/SearchBar';

describe('Search Components', () => {
  it('SearchBar component exists and can be imported', () => {
    expect(SearchBar).toBeDefined();
    expect(typeof SearchBar).toBe('function');
  });
});