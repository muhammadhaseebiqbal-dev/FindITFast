import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxWidthOrHeight: number;
  maxSizeMB: number;
  useWebWorker: boolean;
  fileType?: string;
  quality?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress image for thumbnail/preview use
 * Target: 150-300px wide, 20-40KB compressed
 */
export async function compressThumbnail(file: File): Promise<CompressionResult> {
  const options: CompressionOptions = {
    maxWidthOrHeight: 300, // Max 300px for thumbnail
    maxSizeMB: 0.04, // 40KB max (0.04 MB)
    useWebWorker: true,
    fileType: 'image/jpeg',
    quality: 0.8
  };

  return await compressImage(file, options);
}

/**
 * Compress image for main product display
 * Target: 600-800px wide, 60-120KB compressed
 */
export async function compressMainImage(file: File): Promise<CompressionResult> {
  const options: CompressionOptions = {
    maxWidthOrHeight: 800, // Max 800px for main image
    maxSizeMB: 0.12, // 120KB max (0.12 MB)
    useWebWorker: true,
    fileType: 'image/jpeg',
    quality: 0.85
  };

  return await compressImage(file, options);
}

/**
 * Auto-select compression type based on intended use
 */
export async function compressImageAuto(file: File, type: 'thumbnail' | 'main' = 'main'): Promise<CompressionResult> {
  if (type === 'thumbnail') {
    return await compressThumbnail(file);
  } else {
    return await compressMainImage(file);
  }
}

/**
 * Core compression function
 */
async function compressImage(file: File, options: CompressionOptions): Promise<CompressionResult> {
  const originalSize = file.size;
  
  try {
    console.log('🖼️ Starting image compression:', {
      originalName: file.name,
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      targetMaxSize: `${(options.maxSizeMB * 1024).toFixed(2)} KB`,
      maxDimensions: options.maxWidthOrHeight
    });

    // Compress the image
    const compressedFile = await imageCompression(file, options);
    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    console.log('✅ Image compression completed:', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      compressedSize: `${(compressedSize / 1024).toFixed(2)} KB`,
      compressionRatio: `${compressionRatio.toFixed(1)}%`,
      withinLimits: compressedSize <= (options.maxSizeMB * 1024 * 1024)
    });

    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    throw new Error(`Failed to compress image: ${error}`);
  }
}

/**
 * Convert compressed file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if image is within size limits for Firestore
 * Firestore has a document size limit of ~1MB, but we should stay well under that
 */
export function isWithinFirestoreLimits(base64String: string): boolean {
  // Base64 encoding increases size by ~33%, so we check the actual string length
  const sizeInBytes = new Blob([base64String]).size;
  const maxSafeSize = 800 * 1024; // 800KB to stay well under 1MB limit
  
  console.log('🔍 Checking Firestore limits:', {
    base64Length: base64String.length,
    sizeInBytes: `${(sizeInBytes / 1024).toFixed(2)} KB`,
    maxSafeSize: `${(maxSafeSize / 1024).toFixed(2)} KB`,
    withinLimits: sizeInBytes <= maxSafeSize
  });
  
  return sizeInBytes <= maxSafeSize;
}

/**
 * Validate and prepare image for upload
 */
export async function validateAndPrepareImage(
  file: File, 
  compressionType: 'thumbnail' | 'main' = 'main'
): Promise<{
  base64: string;
  compressionResult: CompressionResult;
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }
    
    // Validate file size (before compression)
    const maxOriginalSize = 10 * 1024 * 1024; // 10MB max original
    if (file.size > maxOriginalSize) {
      errors.push(`Original image too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`);
    }
    
    if (errors.length > 0) {
      return {
        base64: '',
        compressionResult: {} as CompressionResult,
        isValid: false,
        errors
      };
    }
    
    // Compress the image
    const compressionResult = await compressImageAuto(file, compressionType);
    
    // Convert to base64
    const base64 = await fileToBase64(compressionResult.compressedFile);
    
    // Validate final size for Firestore
    if (!isWithinFirestoreLimits(base64)) {
      errors.push('Compressed image still too large for database. Please use a smaller image.');
    }
    
    return {
      base64,
      compressionResult,
      isValid: errors.length === 0,
      errors
    };
    
  } catch (error) {
    console.error('❌ Image validation failed:', error);
    return {
      base64: '',
      compressionResult: {} as CompressionResult,
      isValid: false,
      errors: [`Failed to process image: ${error}`]
    };
  }
}