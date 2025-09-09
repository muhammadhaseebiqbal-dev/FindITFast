/**
 * Compatibility utilities for Item data migration
 * Handles the transition from base64 storage to metadata-only storage
 * for Safari/iOS Firestore compatibility
 */

import type { Item } from '../types';

// Extended interface for backward compatibility
export interface LegacyItem extends Omit<Item, 'hasImageData' | 'imageMimeType' | 'imageSize' | 'hasPriceImage' | 'priceImageMimeType' | 'priceImageSize'> {
  hasImageData?: boolean;
  imageMimeType?: string;
  imageSize?: number;
  hasPriceImage?: boolean;
  priceImageMimeType?: string;
  priceImageSize?: number;
}

/**
 * Gets the item image URL, handling both legacy (base64) and new (metadata) formats
 * For new metadata-only items, returns a placeholder image
 */
export function getItemImageUrl(item: LegacyItem | Item): string {
  // Legacy format - has base64 data in imageUrl
  if (item.imageUrl && item.imageUrl.startsWith('data:')) {
    return item.imageUrl;
  }
  
  // New format - metadata only, return placeholder
  if (item.hasImageData) {
    return generateItemPlaceholder(item.name, item.imageMimeType);
  }
  
  // Fallback - if imageUrl exists but not base64, return it (could be a URL)
  if (item.imageUrl) {
    return item.imageUrl;
  }
  
  // Final fallback placeholder
  return generateItemPlaceholder(item.name || 'Item');
}

/**
 * Gets the price image URL, handling both legacy and new formats
 */
export function getPriceImageUrl(item: LegacyItem | Item): string | null {
  // Legacy format - has base64 data in priceImageUrl
  if (item.priceImageUrl && item.priceImageUrl.startsWith('data:')) {
    return item.priceImageUrl;
  }
  
  // New format - metadata only, return placeholder
  if (item.hasPriceImage) {
    return generatePricePlaceholder(item.price || 'Price');
  }
  
  // No price image available
  return null;
}

/**
 * Checks if an Item has image data available
 */
export function hasItemImage(item: LegacyItem | Item): boolean {
  // Legacy format
  if (item.imageUrl && item.imageUrl.startsWith('data:')) {
    return true;
  }
  
  // New format
  return item.hasImageData === true;
}

/**
 * Checks if an Item has price image data available
 */
export function hasItemPriceImage(item: LegacyItem | Item): boolean {
  // Legacy format
  if (item.priceImageUrl && item.priceImageUrl.startsWith('data:')) {
    return true;
  }
  
  // New format
  return item.hasPriceImage === true;
}

/**
 * Generates a placeholder SVG for item images
 */
function generateItemPlaceholder(name: string, mimeType?: string): string {
  const isPhoto = mimeType?.startsWith('image/') || false;
  const icon = isPhoto ? '📷' : '📦';
  
  const svgContent = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="100" cy="80" r="30" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
      <text x="100" y="86" font-family="Arial, sans-serif" font-size="24" fill="#64748b" text-anchor="middle">
        ${icon}
      </text>
      <text x="100" y="130" font-family="Arial, sans-serif" font-size="14" fill="#475569" text-anchor="middle">
        ${name.length > 20 ? name.substring(0, 17) + '...' : name}
      </text>
      <text x="100" y="150" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">
        Image Uploaded
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

/**
 * Generates a placeholder SVG for price images
 */
function generatePricePlaceholder(price: string): string {
  const svgContent = `
    <svg width="150" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
      <text x="75" y="35" font-family="Arial, sans-serif" font-size="12" fill="#92400e" text-anchor="middle">
        💰
      </text>
      <text x="75" y="55" font-family="Arial, sans-serif" font-size="16" fill="#78350f" text-anchor="middle" font-weight="bold">
        ${price}
      </text>
      <text x="75" y="75" font-family="Arial, sans-serif" font-size="8" fill="#a16207" text-anchor="middle">
        Price Image
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

/**
 * Determines if Item is in legacy format (has base64 data in imageUrl)
 */
export function isLegacyItem(item: any): item is LegacyItem {
  return item.imageUrl && item.imageUrl.startsWith('data:');
}