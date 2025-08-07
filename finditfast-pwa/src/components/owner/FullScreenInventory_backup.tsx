import React, { useState, useEffect, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { ItemService, StorePlanService } from '../../services/firestoreService';
import { fileToBase64, validateImageFile, compressImage, normalizeBase64DataUrl } from '../../utilities/imageUtils';
import type { Store, Item, StorePlan } from '../../types';

interface FullScreenInventoryProps {
  store: Store;
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

export const FullScreenInventory: React.FC<FullScreenInventoryProps> = ({ store, onClose }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [storePlans, setStorePlans] = useState<StorePlan[]>([]);
  const [activeStorePlan, setActiveStorePlan] = useState<StorePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AddItemStep>('items-list');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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
      
      // Load items and store plans in parallel
      const [storeItems, plans] = await Promise.all([
        ItemService.getByStore(store.id),
        StorePlanService.getByStore(store.id)
      ]);
      
      setItems(storeItems);
      setStorePlans(plans);
      
      // Set active store plan
      const activePlan = plans.find(plan => plan.isActive) || plans[0];
      setActiveStorePlan(activePlan || null);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (!validateImageFile(file, 5)) {
        alert('Please select a valid image file (max 5MB)');
        return;
      }

      const compressedFile = await compressImage(file, 800, 800, 0.7);
      const base64 = await fileToBase64(compressedFile);
      setNewItem(prev => ({ ...prev, image: base64 }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const handleAddNewItem = () => {
    if (!activeStorePlan) {
      alert('Please upload a floorplan first to add items with locations.');
      return;
    }
    setCurrentStep('select-location');
  };

  const handleFloorplanClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (currentStep !== 'select-location' || !floorplanRef.current || !activeStorePlan) return;

    const rect = floorplanRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewItem(prev => ({
      ...prev,
      position: { x, y },
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

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('Please enter item name');
      return;
    }

    if (!newItem.position || !newItem.floorplanId) {
      alert('Please select a location on the floorplan first.');
      return;
    }

    try {
      const itemData = {
        name: newItem.name.trim(),
        price: newItem.price.trim() || undefined,
        category: newItem.category.trim() || 'General',
        description: newItem.description.trim() || undefined,
        imageUrl: newItem.image || undefined,
        storeId: store.id,
        floorplanId: newItem.floorplanId,
        position: newItem.position,
        verified: true,
        verifiedAt: Timestamp.now(),
        reportCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await ItemService.create(itemData as any);
      
      // Reset form and reload items
      resetNewItem();
      await loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await ItemService.delete(itemId);
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category || 'General')));

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={currentStep === 'items-list' ? onClose : () => setCurrentStep('items-list')}
              className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">{store.name}</h1>
              <p className="text-indigo-200 text-sm">
                {currentStep === 'items-list' && 'Inventory Management'}
                {currentStep === 'select-location' && 'Select Item Location'}
                {currentStep === 'item-form' && 'Add New Item'}
              </p>
            </div>
          </div>
          
          {currentStep === 'items-list' && (
            <button
              onClick={handleAddNewItem}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              + Add Item
            </button>
          )}
        </div>

        {/* Search and Filter - only show on items list */}
        {currentStep === 'items-list' && (
          <div className="mt-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                filterCategory === 'all' 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-400'
              }`}
            >
              All ({items.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  filterCategory === category 
                    ? 'bg-white text-indigo-600' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {category} ({items.filter(item => item.category === category).length})
              </button>
            ))}
          </div>
        </div>
        )}
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
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading items...</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Items List View */}
            {currentStep === 'items-list' && (
              <>
                {filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery || filterCategory !== 'all' 
                          ? 'No items match your search criteria'
                          : 'Start adding items to your inventory'
                        }
                      </p>
                      <button
                        onClick={handleAddNewItem}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add First Item
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Item Image */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                        )}

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                              {item.category && (
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                                  {item.category}
                                </span>
                              )}
                              {item.price && (
                                <p className="text-lg font-semibold text-green-600 mt-1">
                                  ${item.price}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1 overflow-hidden" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}>
                                  {item.description}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-3">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Item</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter item name"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 29.99"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Electronics, Clothing"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Item description..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                    {newItem.image ? (
                      <div className="space-y-3">
                        <img
                          src={newItem.image}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => setNewItem(prev => ({ ...prev, image: null }))}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block"
                        >
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Item Details</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                  {selectedItem.category && (
                    <span className="inline-block px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full mt-2">
                      {selectedItem.category}
                    </span>
                  )}
                </div>

                {selectedItem.price && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <p className="text-xl font-semibold text-green-600">${selectedItem.price}</p>
                  </div>
                )}

                {selectedItem.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-600">{selectedItem.description}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500 pt-4 border-t">
                  <p>Added: {selectedItem.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                  {selectedItem.updatedAt && selectedItem.createdAt !== selectedItem.updatedAt && (
                    <p>Updated: {selectedItem.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDeleteItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
