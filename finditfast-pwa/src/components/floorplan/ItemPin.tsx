import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Item } from '../../types';

interface ItemPinProps {
  item: Item;
  onClick?: (item: Item) => void;
  isSelected?: boolean;
  className?: string;
  allowInteraction?: boolean; // Override permission check if needed
}

export const ItemPin: React.FC<ItemPinProps> = ({
  item,
  onClick,
  isSelected = false,
  className = '',
  allowInteraction = true
}) => {
  const { canEditStoreItems } = usePermissions();
  
  console.log('📍 ItemPin render attempt:', {
    itemId: item.id,
    itemName: item.name,
    position: item.position,
    isSelected,
    hasPosition: !!(item.position?.x !== undefined && item.position?.y !== undefined)
  });
  
  // Check if item has position data
  if (!item.position || item.position.x === undefined || item.position.y === undefined) {
    console.warn('⚠️ Item missing position data:', item.name, item.id, 'position:', item.position);
    return null; // Don't render pin if no position data
  }
  
  // Calculate pin position as percentage of container dimensions
  const leftPercent = (item.position.x / 100) * 100;
  const topPercent = (item.position.y / 100) * 100;

  // Ensure pin stays within bounds
  const clampedLeft = Math.max(0, Math.min(95, leftPercent));
  const clampedTop = Math.max(0, Math.min(95, topPercent));

  // Check if user can interact with this pin
  const canInteract = allowInteraction && (canEditStoreItems(item.storeId) || onClick);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canInteract) {
      onClick?.(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (canInteract) {
        onClick?.(item);
      }
    }
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-full z-10 ${className}`}
      style={{
        left: `${clampedLeft}%`,
        top: `${clampedTop}%`
      }}
    >
      {/* Pin Container */}
      <div
        className={`relative transition-all duration-200 ${
          canInteract ? 'cursor-pointer' : 'cursor-default'
        } ${
          isSelected ? 'scale-110' : canInteract ? 'hover:scale-105' : ''
        }`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={canInteract ? 0 : -1}
        role={canInteract ? "button" : "presentation"}
        aria-label={canInteract ? `Item location: ${item.name}` : `Item: ${item.name}`}
      >
        {/* Pin Shadow */}
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full blur-sm transform translate-y-1"></div>
        
        {/* Main Pin */}
        <div
          className={`relative w-8 h-8 rounded-full border-3 transition-all duration-200 ${
            isSelected
              ? 'bg-red-600 border-red-700 shadow-lg'
              : 'bg-red-500 border-red-600 shadow-md hover:bg-red-600 hover:border-red-700'
          }`}
        >
          {/* Pin Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>

          {/* Pulse Animation for Selected Pin */}
          {isSelected && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          )}
        </div>

        {/* Pin Stem */}
        <div
          className={`absolute left-1/2 top-full transform -translate-x-1/2 w-1 h-3 transition-all duration-200 ${
            isSelected ? 'bg-red-700' : 'bg-red-600'
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
          }}
        ></div>

        {/* Item Name Tooltip */}
        <div
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap transition-all duration-200 ${
            isSelected ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
          }`}
        >
          {item.name}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>

        {/* Verification Badge */}
        {item.verified && (
          <div
            className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200 ${
              isSelected ? 'scale-110' : ''
            }`}
          >
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>

      {/* Ripple Effect on Click */}
      <div
        className={`absolute inset-0 rounded-full bg-red-500 opacity-0 pointer-events-none ${
          isSelected ? 'animate-ping' : ''
        }`}
        style={{ animationDuration: '0.6s' }}
      ></div>
    </div>
  );
};