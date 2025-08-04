import React, { useState, useRef } from 'react';
import { validateImageFile, fileToBase64 } from '../../utilities/imageUtils';
import { FloorplanService } from '../../services/storageService';
import { StoreService } from '../../services/firestoreService';

interface FloorplanUploadProps {
  storeId: string;
  currentFloorplanUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
}

export const FloorplanUpload: React.FC<FloorplanUploadProps> = ({
  storeId,
  currentFloorplanUrl,
  onUploadSuccess,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);

    // Validate file
    if (!validateImageFile(file, 10)) {
      setError('Please select a valid image file (JPEG, PNG, WebP) under 10MB');
      return;
    }

    try {
      // Create preview
      const preview = await fileToBase64(file);
      setSelectedFile(file);
      setPreviewUrl(preview);
    } catch (err) {
      setError('Failed to process image file');
      console.error('File processing error:', err);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload with progress tracking
      const downloadUrl = await FloorplanService.upload(
        selectedFile,
        storeId,
        (progress) => setUploadProgress(progress)
      );

      // Update store record with floorplan URL
      await StoreService.update(storeId, {
        floorplanUrl: downloadUrl,
        updatedAt: new Date() as any, // Firebase will convert to Timestamp
      });

      // Success callback
      onUploadSuccess(downloadUrl);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to upload floorplan. ';
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (error.message.includes('CORS') || error.message.includes('storage configuration')) {
        errorMessage = '🚧 Upload service is temporarily unavailable. Please contact support or try again later. The floorplan feature will be available soon.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('permission')) {
        errorMessage += 'You do not have permission to upload files to this location.';
      } else if (error.message.includes('size')) {
        errorMessage += 'The file is too large. Please use a smaller image.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      onUploadError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleUpload();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Store Floorplan
      </h3>

      {/* Current Floorplan Display */}
      {currentFloorplanUrl && !previewUrl && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Current floorplan:</p>
          <div className="relative">
            <img
              src={currentFloorplanUrl}
              alt="Current store floorplan"
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
          </div>
        </div>
      )}

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Buttons */}
      {!selectedFile && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCameraCapture}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo
            </button>

            <button
              onClick={handleGallerySelect}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose from Gallery
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Supported formats: JPEG, PNG, WebP (max 10MB)
          </p>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Floorplan preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload Floorplan'}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              {!isUploading && selectedFile && (
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!error && !selectedFile && !isUploading && currentFloorplanUrl && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">
              Floorplan uploaded successfully! You can now add items to your store layout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};