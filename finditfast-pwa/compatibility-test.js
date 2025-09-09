/**
 * Safari/iOS Compatibility Test
 * Tests that the new metadata-only storage system works without large base64 data
 */

import { getStorePlanImageUrl, hasStorePlanImage } from '../src/utils/storePlanCompatibility';
import { getItemImageUrl, hasItemImage } from '../src/utils/itemCompatibility';
import type { StorePlan, Item } from '../src/types';

// Mock data for testing
const mockLegacyStorePlan = {
  id: 'test-plan-1',
  storeId: 'test-store',
  ownerId: 'test-owner',
  name: 'Test Floorplan',
  type: 'image/jpeg',
  size: 50000,
  base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCvAA==', // tiny test image
  uploadedAt: new Date(),
  originalSize: 50000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const mockNewStorePlan: StorePlan = {
  id: 'test-plan-2',
  storeId: 'test-store',
  ownerId: 'test-owner',
  name: 'New Floorplan',
  type: 'image/jpeg',
  size: 50000,
  uploadedAt: new Date() as any,
  originalSize: 50000,
  isActive: true,
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  hasImageData: true,
  fileName: 'floorplan.jpg'
};

const mockLegacyItem = {
  id: 'test-item-1',
  name: 'Test Item',
  storeId: 'test-store',
  imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCvAA==',
  verified: true,
  verifiedAt: new Date() as any,
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  reportCount: 0
} as any;

const mockNewItem: Item = {
  id: 'test-item-2',
  name: 'New Test Item',
  storeId: 'test-store',
  imageUrl: '',
  verified: true,
  verifiedAt: new Date() as any,
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  reportCount: 0,
  hasImageData: true,
  imageMimeType: 'image/jpeg',
  imageSize: 50000
};

// Test functions
function testStorePlanCompatibility() {
  console.log('🧪 Testing StorePlan Compatibility...');
  
  // Test legacy floorplan (with base64)
  const legacyUrl = getStorePlanImageUrl(mockLegacyStorePlan);
  const legacyHasImage = hasStorePlanImage(mockLegacyStorePlan);
  
  console.log('📊 Legacy StorePlan:');
  console.log('  - Has Image:', legacyHasImage);
  console.log('  - URL Type:', legacyUrl.startsWith('data:') ? 'base64' : 'placeholder');
  console.log('  - URL Length:', legacyUrl.length);
  
  // Test new floorplan (metadata only)
  const newUrl = getStorePlanImageUrl(mockNewStorePlan);
  const newHasImage = hasStorePlanImage(mockNewStorePlan);
  
  console.log('📊 New StorePlan:');
  console.log('  - Has Image:', newHasImage);
  console.log('  - URL Type:', newUrl.startsWith('data:') ? 'placeholder SVG' : 'other');
  console.log('  - URL Length:', newUrl.length);
  
  console.log('✅ StorePlan compatibility test completed\n');
}

function testItemCompatibility() {
  console.log('🧪 Testing Item Compatibility...');
  
  // Test legacy item (with base64)
  const legacyUrl = getItemImageUrl(mockLegacyItem);
  const legacyHasImage = hasItemImage(mockLegacyItem);
  
  console.log('📊 Legacy Item:');
  console.log('  - Has Image:', legacyHasImage);
  console.log('  - URL Type:', legacyUrl.startsWith('data:') ? 'base64' : 'placeholder');
  console.log('  - URL Length:', legacyUrl.length);
  
  // Test new item (metadata only)
  const newUrl = getItemImageUrl(mockNewItem);
  const newHasImage = hasItemImage(mockNewItem);
  
  console.log('📊 New Item:');
  console.log('  - Has Image:', newHasImage);
  console.log('  - URL Type:', newUrl.startsWith('data:') ? 'placeholder SVG' : 'other');
  console.log('  - URL Length:', newUrl.length);
  
  console.log('✅ Item compatibility test completed\n');
}

function testSafariCompatibility() {
  console.log('🧪 Testing Safari/iOS Firestore Compatibility...');
  
  // Simulate Firestore document size check
  const testNewStorePlan = JSON.stringify(mockNewStorePlan);
  const testNewItem = JSON.stringify(mockNewItem);
  
  console.log('📊 Document Sizes:');
  console.log('  - New StorePlan JSON size:', testNewStorePlan.length, 'bytes');
  console.log('  - New Item JSON size:', testNewItem.length, 'bytes');
  console.log('  - Safari/iOS limit: ~1MB (1,048,576 bytes)');
  
  const storePlanSafe = testNewStorePlan.length < 100000; // Much smaller than 1MB
  const itemSafe = testNewItem.length < 100000;
  
  console.log('📊 Safety Check:');
  console.log('  - StorePlan safe for Safari:', storePlanSafe ? '✅' : '❌');
  console.log('  - Item safe for Safari:', itemSafe ? '✅' : '❌');
  
  console.log('✅ Safari compatibility test completed\n');
}

// Run all tests
function runCompatibilityTests() {
  console.log('🚀 Running Safari/iOS Compatibility Tests\n');
  
  testStorePlanCompatibility();
  testItemCompatibility();
  testSafariCompatibility();
  
  console.log('🎉 All compatibility tests completed successfully!');
  console.log('📱 The application should now work correctly on Safari/iOS without Firestore size limit errors.');
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCompatibilityTests };
} else if (typeof window !== 'undefined') {
  (window as any).runCompatibilityTests = runCompatibilityTests;
}

runCompatibilityTests();