import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoreRequestService } from '../../services/storeRequestService';
import { GeolocationService } from '../../services/geolocationService';
import type { CreateStoreRequestData } from '../../services/storeRequestService';

interface StoreRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  storeName: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export const StoreRequestForm: React.FC<StoreRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await GeolocationService.getCurrentLocation();
      if (location) {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Location is optional, so we don't show an error
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    if (!user?.uid) {
      setErrors(['Please sign in to submit a store request.']);
      return;
    }

    // Create validation data with requestedBy
    const validationData: CreateStoreRequestData = {
      ...formData,
      requestedBy: user.uid,
    };

    const validationErrors = StoreRequestService.validateStoreRequestData(validationData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreateStoreRequestData = {
        ...formData,
        requestedBy: user.uid,
      };

      await StoreRequestService.createStoreRequest(requestData);
      setSuccessMessage('Store request submitted and store created successfully! Your store is now live and awaiting admin approval for full activation.');
      
      // Reset form
      setFormData({
        storeName: '',
        address: '',
        notes: '',
      });

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      setErrors([error.message || 'Failed to submit store request. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Request Submitted!</h3>
          <p className="mt-2 text-sm text-gray-600">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Request a New Store</h2>
        <p className="mt-2 text-sm text-gray-600">
          Can't find a store you're looking for? Let us know and we'll try to add it!
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
            Store Name *
          </label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., SuperMart Downtown"
            required
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Store Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main St, City, State"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Location (Optional)
            </label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
            >
              {isGettingLocation ? 'Getting location...' : 'Use current location'}
            </button>
          </div>
          {formData.location && (
            <p className="mt-1 text-xs text-gray-500">
              Location captured: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional information about the store..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};