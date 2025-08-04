# Design Document

## Overview

FindItFast is a Progressive Web Application built with modern web technologies to provide a native-like mobile experience. The application uses a clean, mobile-first design approach with intuitive navigation and fast loading times. The architecture follows a client-server model with Firebase providing backend services including authentication, data storage, and file management.

## Architecture

### Technology Stack
- **Frontend Framework**: React with TypeScript for type safety and maintainability
- **Styling**: Tailwind CSS for responsive, mobile-first design
- **PWA Features**: Service Worker for offline functionality and installability
- **Backend**: Firebase suite (Firestore, Storage, Authentication, Analytics)
- **Image Processing**: Client-side compression using browser APIs
- **Maps Integration**: Google Maps deep linking for navigation

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile PWA    │    │   Firebase       │    │  Google Maps    │
│   (React/TS)    │◄──►│   Backend        │    │   Deep Links    │
│                 │    │                  │    │                 │
│ • Search UI     │    │ • Firestore DB   │    │ • Navigation    │
│ • Floorplan     │    │ • Storage        │    │ • Directions    │
│ • Item Pins     │    │ • Auth           │    │                 │
│ • Owner Portal  │    │ • Analytics      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components and Interfaces

### Core Components

#### 1. Search Interface
- **SearchBar Component**: Main search input with autocomplete
- **SearchResults Component**: List of items with store information
- **ResultCard Component**: Individual result display with verification status

#### 2. Store Information
- **StoreDetails Component**: Store name, address, and floorplan preview
- **NavigationButton Component**: Google Maps integration
- **ArrivedButton Component**: Transition to in-store view

#### 3. Floorplan Viewer
- **FloorplanImage Component**: Zoomable, scrollable store layout
- **ItemPin Component**: Red pin markers for item locations
- **ItemInfo Component**: Item details below floorplan

#### 4. Owner Portal
- **OwnerAuth Component**: Registration and login forms
- **FloorplanUpload Component**: Image upload with compression
- **ItemManager Component**: Add/edit items on floorplan

#### 5. User Feedback
- **ReportButton Component**: Item missing/moved reporting
- **FeedbackModal Component**: User input collection
- **ConfirmationToast Component**: Action confirmations

### Component Hierarchy
```
App
├── Router
│   ├── HomePage
│   │   ├── SearchBar
│   │   └── SearchResults
│   │       └── ResultCard[]
│   ├── StoreDetailsPage
│   │   ├── StoreInfo
│   │   ├── NavigationButton
│   │   └── ArrivedButton
│   ├── FloorplanPage
│   │   ├── FloorplanImage
│   │   ├── ItemPin[]
│   │   ├── ItemInfo
│   │   └── FeedbackButtons
│   └── OwnerPortal
│       ├── OwnerAuth
│       ├── FloorplanUpload
│       └── ItemManager
└── SharedComponents
    ├── Header
    ├── LoadingSpinner
    └── ErrorBoundary
```

## Data Models

### Firestore Collections

#### Stores Collection
```typescript
interface Store {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  floorplanUrl?: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Items Collection
```typescript
interface Item {
  id: string;
  name: string;
  storeId: string;
  imageUrl: string;
  priceImageUrl?: string;
  position: {
    x: number;
    y: number;
  };
  price?: number;
  verified: boolean;
  verifiedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reportCount: number;
}
```

#### Store Owners Collection
```typescript
interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeId: string;
  createdAt: Timestamp;
}
```

#### Reports Collection
```typescript
interface Report {
  id: string;
  itemId: string;
  storeId: string;
  userId?: string;
  type: 'missing' | 'moved' | 'found';
  timestamp: Timestamp;
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

### Firebase Storage Structure
```
/stores/
  /{storeId}/
    /floorplan.jpg
    /items/
      /{itemId}/
        /item-image.jpg
        /price-image.jpg
```

## User Interface Design

### Mobile-First Approach
- **Viewport**: Optimized for 375px-414px mobile screens
- **Touch Targets**: Minimum 44px for accessibility
- **Typography**: Responsive font scaling with system fonts
- **Colors**: High contrast for readability in various lighting
- **Navigation**: Bottom navigation for thumb-friendly access

### Screen Layouts

#### Home Screen
```
┌─────────────────────────┐
│      FindItFast         │
├─────────────────────────┤
│  🔍 Search for items... │
├─────────────────────────┤
│ Recent Searches         │
│ • Shampoo              │
│ • Bread                │
│ • Batteries            │
├─────────────────────────┤
│ [Store Owners: Upload]  │
└─────────────────────────┘
```

#### Search Results
```
┌─────────────────────────┐
│ ← Search Results        │
├─────────────────────────┤
│ Dove Shampoo       ✓    │
│ SuperMart Store         │
│ 1.2 km • $4.99         │
│ Verified 2 days ago     │
├─────────────────────────┤
│ Head & Shoulders        │
│ Corner Shop             │
│ 0.8 km • $6.50         │
│ Verified 5 days ago     │
└─────────────────────────┘
```

#### Floorplan View
```
┌─────────────────────────┐
│ ← Back to Store         │
├─────────────────────────┤
│                         │
│    [Floorplan Image]    │
│         📍 Item         │
│                         │
├─────────────────────────┤
│ Dove Shampoo • $4.99    │
│ SuperMart Store         │
│ Verified 2 days ago     │
├─────────────────────────┤
│ [Item Missing] [Report] │
└─────────────────────────┘
```

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Offline detection with cached data fallback
- **Image Upload Failures**: Retry mechanism with compression adjustment
- **Search Failures**: Graceful degradation with cached results
- **Location Errors**: Manual location input as fallback

### Firebase Error Handling
- **Authentication Errors**: Clear user feedback with retry options
- **Firestore Errors**: Exponential backoff for retries
- **Storage Errors**: Alternative upload methods and error reporting
- **Analytics Errors**: Silent failure to not impact user experience

### Error Recovery Strategies
```typescript
interface ErrorHandler {
  networkError: () => void; // Show offline banner
  authError: () => void;    // Redirect to login
  uploadError: () => void;  // Show retry dialog
  searchError: () => void;  // Show cached results
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for UI components
- **Utility Functions**: Jest for data processing and validation
- **Firebase Integration**: Mock Firebase services for isolated testing
- **Image Processing**: Test compression and upload functionality

### Integration Testing
- **User Flows**: End-to-end testing with Cypress
- **Firebase Integration**: Test actual database operations in staging
- **PWA Features**: Test installation and offline functionality
- **Cross-Browser**: Test on Chrome, Safari, Firefox mobile browsers

### Performance Testing
- **Load Times**: Lighthouse audits for PWA performance
- **Image Optimization**: Test compression ratios and quality
- **Database Queries**: Monitor Firestore read/write operations
- **Offline Functionality**: Test service worker caching strategies

### Test Coverage Goals
- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: All critical user paths covered
- **Performance**: PWA score above 90 on Lighthouse
- **Accessibility**: WCAG 2.1 AA compliance

## Security Considerations

### Authentication & Authorization
- **Firebase Auth**: Secure owner authentication with email verification
- **Role-Based Access**: Separate permissions for users vs owners
- **API Security**: Firestore security rules for data protection
- **Session Management**: Secure token handling and refresh

### Data Protection
- **Input Validation**: Client and server-side validation
- **Image Security**: File type and size validation before upload
- **Location Privacy**: Optional location sharing with user consent
- **Data Encryption**: Firebase handles encryption at rest and in transit

### PWA Security
- **HTTPS Only**: Enforce secure connections for PWA functionality
- **Content Security Policy**: Prevent XSS attacks
- **Service Worker Security**: Secure caching strategies
- **Origin Validation**: Prevent unauthorized API access