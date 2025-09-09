import React, { useState, useEffect, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ItemService, StorePlanService } from '../../services/firestoreService';
import { fileToBase64, validateImageFile, compressImage } from '../../utilities/imageUtils';
import { getStorePlanImageUrl } from '../../utils/storePlanCompatibility';
import type { Store, Item, StorePlan } from '../../types';

interface FullScreenInventoryProps {
  store: Store;
  storePlans?: StorePlan[];
  onClose: () => void;
}

interface NewItemForm {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string | null;
  position: { x: number; y: number } | null;
  floorplanId: string | null;
}

type AddItemStep = 'items-list' | 'select-location' | 'item-form';

export const FullScreenInventory: React.FC<FullScreenInventoryProps> = ({ store, storePlans: propStorePlans, onClose }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [storePlans, setStorePlans] = useState<StorePlan[]>([]);
  const [activeStorePlan, setActiveStorePlan] = useState<StorePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AddItemStep>('items-list');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Zoom functionality for floorplan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  const floorplanRef = useRef<HTMLImageElement>(null);
  
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: '',
    price: '',
    category: '',
    description: '',
    image: null,
    position: null,
    floorplanId: null
  });

  // Load items and store plans on component mount
  useEffect(() => {
    loadData();
  }, [store.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load items for this store
      const storeItems = await ItemService.getByStore(store.id);
      console.log('Loaded items:', storeItems);
      setItems(storeItems);
      
      // Use passed store plans or load them
      let plans = propStorePlans || [];
      if (!plans || plans.length === 0) {
        try {
          plans = await StorePlanService.getByStore(store.id);
          console.log('Loaded store plans:', plans);
        } catch (error) {
          console.error('Error loading store plans:', error);
          plans = [];
        }
      }
      
      setStorePlans(plans);
      
      // Set active store plan
      const activePlan = plans.find(plan => plan.isActive) || plans[0];
      console.log('Active plan selected:', activePlan);
      setActiveStorePlan(activePlan || null);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Zoom functionality functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleAddNewItem = () => {
    console.log('Store plans:', storePlans);
    console.log('Active store plan:', activeStorePlan);
    
    if (storePlans.length === 0) {
      alert('No floorplans found for this store. Please upload a floorplan first in the Floorplan Manager.');
      return;
    }
    
    if (!activeStorePlan) {
      alert('No active floorplan found. Please set an active floorplan first.');
      return;
    }
    
    setCurrentStep('select-location');
  };

  const handleFloorplanClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (currentStep !== 'select-location' || !floorplanRef.current || !activeStorePlan) return;

    const rect = floorplanRef.current.getBoundingClientRect();
    
    // Account for zoom and pan transformations
    const imageX = e.clientX - rect.left;
    const imageY = e.clientY - rect.top;
    
    // Adjust for zoom and pan
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const adjustedX = ((imageX - centerX - (imagePosition.x / zoomLevel)) / zoomLevel + centerX) / rect.width * 100;
    const adjustedY = ((imageY - centerY - (imagePosition.y / zoomLevel)) / zoomLevel + centerY) / rect.height * 100;

    setNewItem(prev => ({
      ...prev,
      position: { x: adjustedX, y: adjustedY },
      floorplanId: activeStorePlan.id
    }));

    setCurrentStep('item-form');
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      price: '',
      category: '',
      description: '',
      image: null,
      position: null,
      floorplanId: null
    });
    setCurrentStep('items-list');
  };

  const handleBackFromLocation = () => {
    resetNewItem();
  };

  const handleBackFromForm = () => {
    setNewItem(prev => ({ ...prev, position: null, floorplanId: null }));
    setCurrentStep('select-location');
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (!validateImageFile(file, 5)) {
        alert('Please select a valid image file (max 5MB)');
        return;
      }

      // Compress the image
      const compressedFile = await compressImage(file, 800, 800, 0.8);
      
      // Convert to base64
      const base64 = await fileToBase64(compressedFile);
      
      setNewItem(prev => ({ ...prev, image: base64 }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSubmitItem = async () => {
    try {
      if (!newItem.name || !newItem.position || !newItem.floorplanId) {
        alert('Please fill in all required fields and select a location.');
        return;
      }

      // Clean price by removing $ and non-numeric characters except decimal point
      const cleanPrice = newItem.price ? newItem.price.replace(/[^\d.]/g, '') : undefined;

      const itemData = {
        name: newItem.name,
        price: cleanPrice || undefined,
        category: newItem.category || undefined,
        description: newItem.description || undefined,
        imageUrl: '', // Empty URL since we're not storing base64
        storeId: store.id,
        floorplanId: newItem.floorplanId,
        position: newItem.position,
        verified: true,
        verifiedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        reportCount: 0,
        // Metadata fields for Safari/iOS compatibility
        hasImageData: !!newItem.image,
        imageMimeType: newItem.image ? 'image/jpeg' : undefined,
        imageSize: newItem.image ? newItem.image.length : undefined,
      };

      await ItemService.create(itemData as Omit<Item, 'id'>);
      
      // Reload data
      await loadData();
      
      // Reset form
      resetNewItem();
      
      alert('Item added successfully!');
      
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || 
                           (item.category && item.category.toLowerCase() === filterCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={currentStep === 'items-list' ? onClose : 
                      currentStep === 'select-location' ? handleBackFromLocation : handleBackFromForm}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold">{store.name}</h1>
              <p className="text-indigo-200 text-sm">
                {currentStep === 'items-list' && 'Inventory Management'}
                {currentStep === 'select-location' && 'Select Item Location'}
                {currentStep === 'item-form' && 'Add New Item'}
              </p>
            </div>
          </div>
          {currentStep === 'items-list' && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading items...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items List View */}
            {currentStep === 'items-list' && (
              <div className="h-full flex flex-col">
                {/* Search and Filter Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddNewItem}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-auto p-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery || filterCategory !== 'all' 
                          ? 'No items match your search criteria.' 
                          : 'Start by adding your first item to this store.'}
                      </p>
                      <button
                        onClick={handleAddNewItem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Add First Item
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200"
                        >
                          {item.imageUrl && (
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h4>
                          {item.category && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md mb-2">
                              {item.category}
                            </span>
                          )}
                          {item.price && (
                            <p className="text-lg font-bold text-green-600 mb-2">${parseFloat(item.price).toFixed(2)}</p>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.description}</p>
                          )}
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Select Location View */}
            {currentStep === 'select-location' && activeStorePlan && (
              <div className="h-full flex flex-col bg-gray-50">
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-blue-800 text-sm font-medium">
                      Click on the floorplan where you want to place the new item
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  <div className="flex justify-center">
                    <div className="relative inline-block border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
                      
                      {/* Zoom Controls */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col bg-white bg-opacity-90 rounded-lg shadow-lg border">
                        <button
                          onClick={handleZoomIn}
                          className="p-3 hover:bg-gray-100 transition-colors border-b border-gray-200"
                          title="Zoom In"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <button
                          onClick={handleZoomOut}
                          className="p-3 hover:bg-gray-100 transition-colors border-b border-gray-200"
                          title="Zoom Out"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        </button>
                        <button
                          onClick={handleResetZoom}
                          className="p-3 hover:bg-gray-100 transition-colors"
                          title="Reset Zoom"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>

                      {/* Zoom Level Indicator */}
                      {zoomLevel !== 1 && (
                        <div className="absolute top-4 right-4 z-20">
                          <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md shadow-lg">
                            {Math.round(zoomLevel * 100)}%
                          </div>
                        </div>
                      )}

                      {/* Zoomable Floorplan Container */}
                      <div 
                        className="relative w-full h-full overflow-hidden"
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{ 
                          cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'crosshair'
                        }}
                      >
                        <img
                          ref={floorplanRef}
                          src={getStorePlanImageUrl(activeStorePlan)}
                          alt={`${store.name} floorplan`}
                          className="max-w-full max-h-[calc(100vh-200px)] transition-transform duration-200"
                          onClick={handleFloorplanClick}
                          style={{
                            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                            transformOrigin: 'center'
                          }}
                          draggable={false}
                        />
                        
                        {/* Show existing item pins */}
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-50"
                            style={{ 
                              left: `${(item.position as any)?.x || 0}%`, 
                              top: `${(item.position as any)?.y || 0}%`,
                              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px) translate(-50%, -50%)`
                            }}
                          >
                            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white shadow-md"></div>
                          </div>
                        ))}
                        
                        {/* Show selected position */}
                        {newItem.position && (
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{ 
                              left: `${newItem.position.x}%`, 
                              top: `${newItem.position.y}%`,
                              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px) translate(-50%, -50%)`
                            }}
                          >
                            <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Item Form View */}
            {currentStep === 'item-form' && (
              <div className="h-full overflow-auto">
                <div className="max-w-2xl mx-auto p-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>

                    <form className="space-y-6">
                      {/* Item Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter item name"
                          required
                        />
                      </div>

                      {/* Price and Category Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newItem.price || '$'}
                              onChange={(e) => {
                                const value = e.target.value;
                                let cleaned = value.replace(/[^\d.]/g, '');
                                const parts = cleaned.split('.');
                                if (parts.length > 2) {
                                  cleaned = parts[0] + '.' + parts.slice(1).join('');
                                }
                                if (parts[1] && parts[1].length > 2) {
                                  cleaned = parts[0] + '.' + parts[1].substring(0, 2);
                                }
                                const formattedValue = cleaned ? `$${cleaned}` : '$';
                                setNewItem(prev => ({ ...prev, price: formattedValue }));
                              }}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="$0.00"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm">AUD</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <input
                            type="text"
                            value={newItem.category}
                            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Electronics, Clothing"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newItem.description}
                          onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Describe the item..."
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Item Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {newItem.image ? (
                            <div className="space-y-4">
                              <img
                                src={newItem.image}
                                alt="Item preview"
                                className="max-w-full max-h-48 mx-auto rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => setNewItem(prev => ({ ...prev, image: null }))}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div>
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-600 mb-2">Upload item image</p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                                className="hidden"
                                id="item-image"
                              />
                              <label
                                htmlFor="item-image"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                              >
                                Choose Image
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Info */}
                      {newItem.position && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-green-800 font-medium">Location selected on floorplan</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={handleBackFromForm}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Change Location
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitItem}
                          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          Add Item
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Item Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {selectedItem.imageUrl && (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedItem.name}</h4>
                  {selectedItem.category && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                      {selectedItem.category}
                    </span>
                  )}
                </div>

                {selectedItem.price && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl font-bold text-green-600">${parseFloat(selectedItem.price || '0').toFixed(2)}</p>
                  </div>
                )}

                {selectedItem.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
