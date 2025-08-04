import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FloorplanUpload } from '../../../components/owner/FloorplanUpload';

// Mock DOM environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['mock'], { type: 'image/jpeg' });
        setTimeout(() => callback(blob), 0);
      }),
    } as any;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock the services
vi.mock('../../../utilities/imageUtils', () => ({
  validateImageFile: vi.fn(),
  fileToBase64: vi.fn(),
}));

vi.mock('../../../services/storageService', () => ({
  FloorplanService: {
    upload: vi.fn(),
  },
}));

vi.mock('../../../services/firestoreService', () => ({
  StoreService: {
    update: vi.fn(),
  },
}));

// Import mocked modules
import { validateImageFile, fileToBase64 } from '../../../utilities/imageUtils';
import { FloorplanService } from '../../../services/storageService';
import { StoreService } from '../../../services/firestoreService';

describe('FloorplanUpload', () => {
  const mockProps = {
    storeId: 'test-store-id',
    onUploadSuccess: vi.fn(),
    onUploadError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(validateImageFile).mockReturnValue(true);
    vi.mocked(fileToBase64).mockResolvedValue('data:image/jpeg;base64,test');
    vi.mocked(FloorplanService.upload).mockResolvedValue('https://test-url.com/floorplan.jpg');
    vi.mocked(StoreService.update).mockResolvedValue();
  });

  it('renders upload interface without current floorplan', () => {
    render(<FloorplanUpload {...mockProps} />);
    
    expect(screen.getByText('Store Floorplan')).toBeInTheDocument();
    expect(screen.getByText('Take Photo')).toBeInTheDocument();
    expect(screen.getByText('Choose from Gallery')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: JPEG, PNG, WebP (max 10MB)')).toBeInTheDocument();
  });

  it('displays current floorplan when provided', () => {
    const currentFloorplanUrl = 'https://test-url.com/current-floorplan.jpg';
    render(<FloorplanUpload {...mockProps} currentFloorplanUrl={currentFloorplanUrl} />);
    
    expect(screen.getByText('Current floorplan:')).toBeInTheDocument();
    expect(screen.getByAltText('Current store floorplan')).toHaveAttribute('src', currentFloorplanUrl);
  });

  it('handles file selection and shows preview', async () => {
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file, 10);
      expect(fileToBase64).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(screen.getByText('Preview:')).toBeInTheDocument();
      expect(screen.getByAltText('Floorplan preview')).toBeInTheDocument();
      expect(screen.getByText('Upload Floorplan')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('shows error for invalid file', async () => {
    vi.mocked(validateImageFile).mockReturnValue(false);
    
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file (JPEG, PNG, WebP) under 10MB')).toBeInTheDocument();
    });
  });

  it('handles successful upload', async () => {
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Floorplan')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Floorplan');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(FloorplanService.upload).toHaveBeenCalledWith(
        file,
        'test-store-id',
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(StoreService.update).toHaveBeenCalledWith(
        'test-store-id',
        {
          floorplanUrl: 'https://test-url.com/floorplan.jpg',
          updatedAt: expect.any(Date),
        }
      );
    });

    await waitFor(() => {
      expect(mockProps.onUploadSuccess).toHaveBeenCalledWith('https://test-url.com/floorplan.jpg');
    });
  });

  it('handles upload error', async () => {
    const uploadError = new Error('Upload failed');
    vi.mocked(FloorplanService.upload).mockRejectedValue(uploadError);
    
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Floorplan')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Floorplan');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    expect(mockProps.onUploadError).toHaveBeenCalledWith('Upload failed');
  });

  it('shows upload progress during upload', async () => {
    let progressCallback: ((progress: number) => void) | undefined;
    
    vi.mocked(FloorplanService.upload).mockImplementation((_file, _storeId, onProgress) => {
      progressCallback = onProgress;
      return new Promise((resolve) => {
        setTimeout(() => {
          if (progressCallback) {
            progressCallback(50);
            setTimeout(() => {
              if (progressCallback) progressCallback(100);
              resolve('https://test-url.com/floorplan.jpg');
            }, 100);
          }
        }, 100);
      });
    });
    
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Floorplan')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Floorplan');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('handles cancel action', async () => {
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Preview:')).not.toBeInTheDocument();
      expect(screen.getByText('Take Photo')).toBeInTheDocument();
      expect(screen.getByText('Choose from Gallery')).toBeInTheDocument();
    });
  });

  it('handles retry after error', async () => {
    const uploadError = new Error('Upload failed');
    vi.mocked(FloorplanService.upload)
      .mockRejectedValueOnce(uploadError)
      .mockResolvedValueOnce('https://test-url.com/floorplan.jpg');
    
    render(<FloorplanUpload {...mockProps} />);
    
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Floorplan')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Floorplan');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockProps.onUploadSuccess).toHaveBeenCalledWith('https://test-url.com/floorplan.jpg');
    });
  });

  it('sets camera capture attribute when taking photo', () => {
    render(<FloorplanUpload {...mockProps} />);
    
    const takePhotoButton = screen.getByText('Take Photo');
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    
    fireEvent.click(takePhotoButton);
    
    expect(fileInput).toHaveAttribute('capture', 'environment');
  });

  it('removes capture attribute when choosing from gallery', () => {
    render(<FloorplanUpload {...mockProps} />);
    
    const galleryButton = screen.getByText('Choose from Gallery');
    const fileInput = screen.getByRole('button', { name: /choose from gallery/i }).parentElement?.querySelector('input[type="file"]');
    
    // First set capture attribute
    if (fileInput) {
      fileInput.setAttribute('capture', 'environment');
    }
    
    fireEvent.click(galleryButton);
    
    expect(fileInput).not.toHaveAttribute('capture');
  });
});