import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import type { UploadTaskSnapshot } from 'firebase/storage';
import { storage } from './firebase';
import { compressImage } from '../utilities/imageUtils';

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Exponential backoff delay calculation
 */
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper for async operations with enhanced error handling
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Check for CORS errors specifically
      if (lastError.message.includes('CORS') || lastError.message.includes('fetch')) {
        throw new Error('Upload failed due to storage configuration. Please contact support or try again later.');
      }
      
      if (attempt === config.maxRetries) {
        throw lastError;
      }
      
      const delay = calculateDelay(attempt, config);
      console.warn(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export class StorageService {
  /**
   * Upload a file to Firebase Storage with retry mechanism
   * @param file - File to upload
   * @param path - Storage path (e.g., 'stores/storeId/floorplan.jpg')
   * @param onProgress - Optional progress callback
   * @param retryConfig - Optional retry configuration
   * @returns Promise<string> - Download URL
   */
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void,
    retryConfig?: RetryConfig
  ): Promise<string> {
    return withRetry(async () => {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    }, retryConfig);
  }

  /**
   * Upload and compress an image with retry mechanism
   * @param file - Image file to upload
   * @param path - Storage path
   * @param maxWidth - Maximum width (default: 800)
   * @param maxHeight - Maximum height (default: 800)
   * @param quality - Image quality (default: 0.7)
   * @param onProgress - Optional progress callback
   * @param retryConfig - Optional retry configuration
   * @returns Promise<string> - Download URL
   */
  static async uploadCompressedImage(
    file: File,
    path: string,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.7,
    onProgress?: (progress: number) => void,
    retryConfig?: RetryConfig
  ): Promise<string> {
    try {
      const compressedFile = await compressImage(file, maxWidth, maxHeight, quality);
      return await this.uploadFile(compressedFile, path, onProgress, retryConfig);
    } catch (error) {
      console.error('Error uploading compressed image:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Firebase Storage with retry mechanism
   * @param path - Storage path of the file to delete
   * @param retryConfig - Optional retry configuration
   */
  static async deleteFile(path: string, retryConfig?: RetryConfig): Promise<void> {
    return withRetry(async () => {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    }, retryConfig);
  }

  /**
   * Get download URL for a file with retry mechanism
   * @param path - Storage path
   * @param retryConfig - Optional retry configuration
   * @returns Promise<string> - Download URL
   */
  static async getDownloadURL(path: string, retryConfig?: RetryConfig): Promise<string> {
    return withRetry(async () => {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    }, retryConfig);
  }
}

// Specific methods for different file types
export const FloorplanService = {
  upload: (file: File, storeId: string, onProgress?: (progress: number) => void) => {
    // Use a safe path pattern that doesn't require database validation
    const path = storeId.startsWith('temp_') 
      ? `floorplans/temp/${storeId}/floorplan.jpg`
      : `stores/${storeId}/floorplan.jpg`;
    
    return StorageService.uploadCompressedImage(
      file,
      path,
      1200, // Higher resolution for floorplans
      1200,
      0.8,  // Higher quality for floorplans
      onProgress
    );
  },
  delete: (storeId: string) => {
    const path = storeId.startsWith('temp_') 
      ? `floorplans/temp/${storeId}/floorplan.jpg`
      : `stores/${storeId}/floorplan.jpg`;
    
    return StorageService.deleteFile(path);
  },
};

export const ItemImageService = {
  upload: (file: File, storeId: string, itemId: string, onProgress?: (progress: number) => void) =>
    StorageService.uploadCompressedImage(
      file,
      `stores/${storeId}/items/${itemId}/item-image.jpg`,
      800,
      800,
      0.7,
      onProgress
    ),
  uploadPriceImage: (file: File, storeId: string, itemId: string, onProgress?: (progress: number) => void) =>
    StorageService.uploadCompressedImage(
      file,
      `stores/${storeId}/items/${itemId}/price-image.jpg`,
      800,
      800,
      0.7,
      onProgress
    ),
  delete: (storeId: string, itemId: string) =>
    StorageService.deleteFile(`stores/${storeId}/items/${itemId}/item-image.jpg`),
  deletePriceImage: (storeId: string, itemId: string) =>
    StorageService.deleteFile(`stores/${storeId}/items/${itemId}/price-image.jpg`),
};

// Service for uploading item images before item creation (when we don't have itemId yet)
export const ItemStorageService = {
  uploadItemImage: (file: File, storeId: string, onProgress?: (progress: number) => void) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `item-${timestamp}-${randomId}.jpg`;
    return StorageService.uploadCompressedImage(
      file,
      `stores/${storeId}/items/${fileName}`,
      800,
      800,
      0.7,
      onProgress
    );
  },
  uploadPriceImage: (file: File, storeId: string, onProgress?: (progress: number) => void) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `price-${timestamp}-${randomId}.jpg`;
    return StorageService.uploadCompressedImage(
      file,
      `stores/${storeId}/items/${fileName}`,
      800,
      800,
      0.7,
      onProgress
    );
  },
};