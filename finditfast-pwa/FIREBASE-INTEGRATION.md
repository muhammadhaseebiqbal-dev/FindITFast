# Firebase Integration Documentation

## Overview

This document describes the Firebase integration implemented for the FindItFast PWA. The integration includes Firestore for data storage, Firebase Storage for file uploads, Firebase Authentication for user management, and comprehensive security rules.

## Architecture

### Services Structure

```
src/services/
├── firebase.ts          # Firebase initialization and configuration
├── authService.ts       # Authentication service for store owners
├── firestoreService.ts  # Firestore database operations
└── storageService.ts    # Firebase Storage file operations
```

### Data Models

All TypeScript interfaces are defined in `src/types/index.ts`:

- **Store**: Store information including location and floorplan
- **Item**: Individual items with positions and verification status
- **StoreOwner**: Store owner profiles and authentication data
- **Report**: User reports for missing or moved items

## Firebase Configuration

### Environment Variables

The application uses environment variables for Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Demo Mode

When environment variables are not set, the application runs in demo mode with limited functionality for development and testing.

## Security Rules

### Firestore Security Rules

Located in `firestore.rules`, these rules implement:

- **Public read access** for stores and items (requirement 10.1)
- **Owner-only write access** for stores and items (requirement 10.2)
- **Authenticated user registration** for store owners (requirement 10.4)
- **Report creation** by any user with owner management (requirement 10.5)

### Storage Security Rules

Located in `storage.rules`, these rules implement:

- **Public read access** for all images
- **Owner-only upload/delete** for store floorplans and item images
- **File type and size validation** (max 10MB images only)
- **Organized folder structure** (`/stores/{storeId}/...`)

## Service APIs

### AuthService

```typescript
// Register a new store owner
await AuthService.registerStoreOwner(email, password, ownerData);

// Sign in existing owner
await AuthService.signIn(email, password);

// Check if current user is store owner
const isOwner = await AuthService.isStoreOwner();

// Get store owner data
const ownerData = await AuthService.getStoreOwnerData();
```

### Firestore Services

```typescript
// Store operations
const stores = await StoreService.getAll();
const store = await StoreService.getById(storeId);
const storeId = await StoreService.create(storeData);

// Item operations with search
const items = await ItemService.search('shampoo');
const verifiedItems = await ItemService.searchVerified('bread');
await ItemService.incrementReportCount(itemId);

// Report operations
await ReportService.create({
  itemId,
  storeId,
  type: 'missing',
  timestamp: new Date()
});
```

### Storage Services

```typescript
// Upload compressed floorplan
const floorplanUrl = await FloorplanService.upload(
  imageFile, 
  storeId, 
  (progress) => console.log(`${progress}% uploaded`)
);

// Upload item images
const itemImageUrl = await ItemImageService.upload(imageFile, storeId, itemId);
const priceImageUrl = await ItemImageService.uploadPriceImage(priceFile, storeId, itemId);
```

## Image Processing

### Compression Utilities

Located in `src/utilities/imageUtils.ts`:

```typescript
// Compress image to 800px max, 70% quality (requirement 10.4)
const compressedFile = await compressImage(file, 800, 800, 0.7);

// Validate file type and size
const isValid = validateImageFile(file, 10); // 10MB max

// Get image dimensions
const { width, height } = await getImageDimensions(file);

// Create thumbnail
const thumbnail = await createThumbnail(file, 150);
```

## Database Indexes

Firestore indexes are configured in `firestore.indexes.json` for optimal query performance:

- **Item search**: Compound index on `name` + `verified` status
- **Store items**: Index on `storeId` + `name`
- **Reports**: Indexes on `itemId` and `storeId` with timestamp ordering

## Deployment Configuration

### Firebase Hosting

Configured in `firebase.json` with:

- **Static file serving** from `dist` directory
- **SPA routing** with fallback to `index.html`
- **Cache headers** for optimal PWA performance
- **Service worker** cache control

### Security Best Practices

1. **Environment-based configuration** with fallback to demo mode
2. **Comprehensive security rules** for both Firestore and Storage
3. **Input validation** for all file uploads and data operations
4. **Error handling** with retry mechanisms and user feedback
5. **Type safety** with TypeScript interfaces for all data models

## Testing

Comprehensive test suite in `src/tests/firebase-integration.test.ts` verifies:

- **Service module imports** and structure
- **Image utility functions** and validation
- **TypeScript interface** availability
- **Error handling** and edge cases

## Requirements Compliance

This implementation satisfies all Firebase-related requirements:

- **10.1**: ✅ Firebase Firestore for structured data storage
- **10.2**: ✅ Firebase Storage with organized folder structure  
- **10.4**: ✅ Efficient Firestore queries with proper indexing
- **10.5**: ✅ Data privacy and security best practices

## Usage Examples

### Complete Store Setup Flow

```typescript
// 1. Register store owner
const user = await AuthService.registerStoreOwner(
  'owner@store.com',
  'password',
  {
    name: 'John Doe',
    email: 'owner@store.com',
    phone: '+1234567890',
    storeName: 'SuperMart',
    storeId: 'generated-store-id'
  }
);

// 2. Create store record
const storeId = await StoreService.create({
  name: 'SuperMart',
  address: '123 Main St',
  location: { latitude: 40.7128, longitude: -74.0060 },
  ownerId: user.uid,
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. Upload floorplan
const floorplanUrl = await FloorplanService.upload(floorplanFile, storeId);

// 4. Update store with floorplan
await StoreService.update(storeId, { floorplanUrl });

// 5. Add items to store
const itemId = await ItemService.create({
  name: 'dove shampoo',
  storeId,
  imageUrl: await ItemImageService.upload(itemFile, storeId, 'item-1'),
  position: { x: 150, y: 200 },
  price: 4.99,
  verified: true,
  verifiedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  reportCount: 0
});
```

This comprehensive Firebase integration provides a robust, secure, and scalable backend for the FindItFast PWA application.