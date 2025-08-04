import { Timestamp } from 'firebase/firestore';

export interface Store {
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

export interface Item {
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

export interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeId: string;
  createdAt: Timestamp;
}

export interface Report {
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

export interface StoreRequest {
  id: string;
  storeName: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  requestedBy: string; // Always required to match Firestore rules
  ownerId?: string;    // For backward compatibility
  ownerName?: string;
  ownerEmail?: string;
  notes?: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: string;
  rejectedBy?: string;
  uploadedFiles?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

// Re-export permission types
export * from './permissions';