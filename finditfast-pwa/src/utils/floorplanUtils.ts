/**
 * Utility functions for handling base64 floorplan data
 */

export interface Base64Floorplan {
  name: string;
  type: string;
  size: number;
  base64: string;
  uploadedAt: Date;
  originalSize: number;
}

/**
 * Download a base64 floorplan image
 */
export const downloadBase64Floorplan = (floorplan: Base64Floorplan) => {
  try {
    // Create a blob from the base64 data
    const byteCharacters = atob(floorplan.base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: floorplan.type });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = floorplan.name;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading floorplan:', error);
    throw new Error('Failed to download floorplan');
  }
};

/**
 * Get file extension from filename
 */
export const getFloorplanFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Format file size for display
 */
export const formatFloorplanFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate floorplan file type
 */
export const isValidFloorplanType = (filename: string): boolean => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const extension = getFloorplanFileExtension(filename);
  return allowedExtensions.includes(extension);
};

/**
 * Get floorplan file type icon
 */
export const getFloorplanFileIcon = (type: string): string => {
  if (type.includes('image')) {
    return '🖼️';
  }
  return '📄';
};

/**
 * Convert base64 floorplan to blob URL for display
 */
export const base64FloorplanToBlob = (floorplan: Base64Floorplan): string => {
  try {
    const byteCharacters = atob(floorplan.base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: floorplan.type });
    
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    throw new Error('Failed to convert floorplan to blob');
  }
};
