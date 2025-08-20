import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout, MobileContent } from '../components/common/MobileLayout';
import { ItemService } from '../services/firestoreService';
import { reportService } from '../services/reportService';
import type { Item } from '../types';

interface CameraState {
  isSupported: boolean;
  isActive: boolean;
  stream: MediaStream | null;
  error: string | null;
}

export const ReportItemPage: React.FC = () => {
  const { itemId, storeId } = useParams<{ itemId: string; storeId: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reportData, setReportData] = useState({
    itemImage: null as string | null, // base64 string
    locationImage: null as string | null, // base64 string
    itemImagePreview: null as string | null,
    locationImagePreview: null as string | null,
    comments: ''
  });
  
  const [camera, setCamera] = useState<CameraState>({
    isSupported: false,
    isActive: false,
    stream: null,
    error: null
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const locationFileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentCapture, setCurrentCapture] = useState<'item' | 'location' | null>(null);

  // Load item data
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) return;
      
      try {
        const itemData = await ItemService.getById(itemId);
        setItem(itemData);
      } catch (error) {
        console.error('Failed to load item:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  // Check camera support
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setCamera(prev => ({ ...prev, isSupported }));
    };

    checkCameraSupport();
  }, []);

  // Start camera
  const startCamera = useCallback(async (captureType: 'item' | 'location') => {
    if (!camera.isSupported) return;

    try {
      setCurrentCapture(captureType);
      
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setCamera(prev => ({
        ...prev,
        isActive: true,
        stream,
        error: null
      }));
    } catch (error) {
      console.error('Camera access failed:', error);
      setCamera(prev => ({
        ...prev,
        error: 'Failed to access camera. Please check permissions.',
        isActive: false
      }));
    }
  }, [camera.isSupported]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => track.stop());
    }
    
    setCamera(prev => ({
      ...prev,
      isActive: false,
      stream: null
    }));
    setCurrentCapture(null);
  }, [camera.stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !currentCapture) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64
    const base64Data = canvas.toDataURL('image/jpeg', 0.8);

    // Also create a blob for preview
    canvas.toBlob((blob) => {
      if (!blob) return;

      const previewUrl = URL.createObjectURL(blob);

      setReportData(prev => ({
        ...prev,
        [`${currentCapture}Image`]: base64Data, // Store as base64
        [`${currentCapture}ImagePreview`]: previewUrl
      }));

      stopCamera();
    }, 'image/jpeg', 0.8);
  }, [currentCapture, stopCamera]);

  // Handle file input
  const handleFileChange = useCallback((type: 'item' | 'location', file: File | null) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setReportData(prev => ({
        ...prev,
        [`${type}Image`]: base64Data, // Store as base64
        [`${type}ImagePreview`]: previewUrl
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Submit report
  const handleSubmit = useCallback(async () => {
    if (!item || !itemId || !storeId) return;
    if (!reportData.itemImage || !reportData.locationImage) {
      alert('Please provide both item and location photos');
      return;
    }

    setSubmitting(true);

    try {
      await reportService.createItemReport({
        itemId,
        storeId,
        itemName: item.name,
        itemImage: reportData.itemImage,
        locationImage: reportData.locationImage,
        comments: reportData.comments,
        reportedBy: 'anonymous', // Could be user ID if authenticated
        reportedAt: new Date()
      });

      alert('Report submitted successfully!');
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [item, itemId, storeId, reportData, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      // Cleanup preview URLs
      if (reportData.itemImagePreview) {
        URL.revokeObjectURL(reportData.itemImagePreview);
      }
      if (reportData.locationImagePreview) {
        URL.revokeObjectURL(reportData.locationImagePreview);
      }
    };
  }, [stopCamera, reportData.itemImagePreview, reportData.locationImagePreview]);

  if (loading) {
    return (
      <MobileLayout>
        <MobileContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading item details...</p>
            </div>
          </div>
        </MobileContent>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileContent>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Missing Item</h1>
            {item && (
              <div className="flex items-center space-x-4">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-gray-600">{item.category}</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera View */}
          {camera.isActive && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  Take {currentCapture === 'item' ? 'Item' : 'Location'} Photo
                </h3>
              </div>
              
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={capturePhoto}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Item Photo Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📱 Item Photo</h3>
            <p className="text-gray-600 mb-4">Take a photo of the item you couldn't find</p>
            
            {reportData.itemImagePreview ? (
              <div className="mb-4">
                <img 
                  src={reportData.itemImagePreview} 
                  alt="Item preview"
                  className="w-full max-w-md mx-auto rounded-lg shadow"
                />
              </div>
            ) : null}
            
            <div className="flex flex-col space-y-3">
              {camera.isSupported && (
                <button
                  onClick={() => startCamera('item')}
                  disabled={camera.isActive}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  📷 Use Camera
                </button>
              )}
              
              <button
                onClick={() => itemFileInputRef.current?.click()}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                📁 Choose from Files
              </button>
              
              <input
                type="file"
                ref={itemFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange('item', e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          {/* Location Photo Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📍 Location Photo</h3>
            <p className="text-gray-600 mb-4">Take a photo of where the item should be located</p>
            
            {reportData.locationImagePreview ? (
              <div className="mb-4">
                <img 
                  src={reportData.locationImagePreview} 
                  alt="Location preview"
                  className="w-full max-w-md mx-auto rounded-lg shadow"
                />
              </div>
            ) : null}
            
            <div className="flex flex-col space-y-3">
              {camera.isSupported && (
                <button
                  onClick={() => startCamera('location')}
                  disabled={camera.isActive}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  📷 Use Camera
                </button>
              )}
              
              <button
                onClick={() => locationFileInputRef.current?.click()}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                📁 Choose from Files
              </button>
              
              <input
                type="file"
                ref={locationFileInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange('location', e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">💬 Additional Comments</h3>
            <textarea
              value={reportData.comments}
              onChange={(e) => setReportData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Any additional details about the missing item..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error Display */}
          {camera.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{camera.error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pb-safe">
            <button
              onClick={handleSubmit}
              disabled={submitting || !reportData.itemImage || !reportData.locationImage}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Report...
                </span>
              ) : (
                '📤 Submit Report'
              )}
            </button>
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </MobileContent>
    </MobileLayout>
  );
};
