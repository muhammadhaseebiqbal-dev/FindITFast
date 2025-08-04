import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  compressImage,
  validateImageFile,
  getImageDimensions,
  createThumbnail,
  fileToBase64,
} from '../../utilities/imageUtils';

// Mock DOM APIs
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toBlob: vi.fn(),
};

const mockContext = {
  drawImage: vi.fn(),
};

const mockImage = {
  width: 0,
  height: 0,
  naturalWidth: 0,
  naturalHeight: 0,
  onload: null as any,
  onerror: null as any,
  src: '',
};

// Setup global mocks
Object.defineProperty(global, 'Image', {
  value: vi.fn(() => mockImage),
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    return {};
  }),
});

Object.defineProperty(global, 'FileReader', {
  value: vi.fn(() => ({
    readAsDataURL: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
  })),
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
  },
});

describe('imageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue(mockContext);
  });

  describe('validateImageFile', () => {
    it('should validate JPEG files', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateImageFile(file)).toBe(true);
    });

    it('should validate PNG files', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateImageFile(file)).toBe(true);
    });

    it('should validate WebP files', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateImageFile(file)).toBe(true);
    });

    it('should reject invalid file types', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      expect(validateImageFile(file)).toBe(false);
    });

    it('should reject files that are too large', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      
      expect(validateImageFile(file, 10)).toBe(false);
    });
  });

  describe('compressImage', () => {
    it('should be defined', () => {
      expect(compressImage).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof compressImage).toBe('function');
    });
  });

  describe('getImageDimensions', () => {
    it('should be defined', () => {
      expect(getImageDimensions).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof getImageDimensions).toBe('function');
    });
  });

  describe('createThumbnail', () => {
    it('should be defined', () => {
      expect(createThumbnail).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof createThumbnail).toBe('function');
    });
  });

  describe('fileToBase64', () => {
    it('should be defined', () => {
      expect(fileToBase64).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof fileToBase64).toBe('function');
    });
  });
});