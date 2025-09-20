/**
 * Compress image to specified dimensions and quality
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 800)
 * @param maxHeight - Maximum height in pixels (default: 800)
 * @param quality - Image quality from 0 to 1 (default: 0.7)
 * @returns Promise<File> - Compressed image file
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert file to base64 data URL with Safari compatibility
 * @param file - The image file
 * @returns Promise<string> - Base64 data URL
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!file || !(file instanceof File || file instanceof Blob)) {
      reject(new Error('Invalid file input: Expected File or Blob object'));
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      reject(new Error('File is empty'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      } catch (error) {
        reject(new Error(`FileReader error: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error(`Failed to start reading file: ${error}`));
    }
  });
};

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in MB (default: 10)
 * @returns boolean - Whether the file is valid
 */
export const validateImageFile = (file: File, maxSizeInMB: number = 10): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  return validTypes.includes(file.type) && file.size <= maxSizeInBytes;
};

/**
 * Get image dimensions from file
 * @param file - The image file
 * @returns Promise<{width: number, height: number}> - Image dimensions
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create a thumbnail from an image file
 * @param file - The image file
 * @param size - Thumbnail size (default: 150)
 * @returns Promise<File> - Thumbnail file
 */
export const createThumbnail = (file: File, size: number = 150): Promise<File> => {
  return compressImage(file, size, size, 0.8);
};

/**
 * Normalize base64 data to ensure it's a valid data URL
 * @param base64Data - Base64 string that may or may not have data URL prefix
 * @param mimeType - MIME type for the data (e.g., 'image/jpeg')
 * @returns string - Properly formatted data URL
 */
export const normalizeBase64DataUrl = (base64Data: string, mimeType: string = 'image/jpeg'): string => {
  // If it already starts with data:, return as is
  if (base64Data.startsWith('data:')) {
    return base64Data;
  }
  
  // If it doesn't have the data URL prefix, add it
  return `data:${mimeType};base64,${base64Data}`;
};