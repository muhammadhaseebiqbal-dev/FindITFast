export type UserRole = 'user' | 'owner';

export interface UserPermissions {
  canEditItems: boolean;
  canMoveItems: boolean;
  canUploadFloorplan: boolean;
  canManageStore: boolean;
  canReportItems: boolean;
  canRequestStores: boolean;
}

export interface StoreRequest {
  id: string;
  storeName: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  requestedBy?: string; // User ID if authenticated
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}