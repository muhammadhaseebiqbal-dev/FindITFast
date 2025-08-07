import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Store, Item, StoreOwner, Report, StorePlan } from '../types';

// Generic Firestore operations
export class FirestoreService {
  /**
   * Get all documents from a collection
   */
  static async getCollection<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  static async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Add a new document to a collection
   */
  static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument(collectionName: string, id: string, data: Partial<any>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }
}

// Specific service methods for each collection
export const StoreService = {
  getAll: () => FirestoreService.getCollection<Store>('stores'),
  getById: (id: string) => FirestoreService.getDocument<Store>('stores', id),
  getByOwner: (ownerId: string) =>
    FirestoreService.getCollection<Store>('stores', [where('ownerId', '==', ownerId)]),
  getNearby: (_latitude: number, _longitude: number, _radiusKm: number = 50) => {
    // Note: For production, consider using GeoFirestore for more accurate geospatial queries
    // This is a simplified implementation
    return FirestoreService.getCollection<Store>('stores');
  },
  create: (store: Omit<Store, 'id'>) => FirestoreService.addDocument<Store>('stores', store),
  update: async (id: string, data: Partial<Store>) => {
    // Handle temporary store IDs that may not exist yet
    if (id.startsWith('temp_')) {
      try {
        const docRef = doc(db, 'stores', id);
        await setDoc(docRef, data, { merge: true });
      } catch (error) {
        console.error(`Error creating/updating temp store document:`, error);
        throw error;
      }
    } else {
      return FirestoreService.updateDocument('stores', id, data);
    }
  },
  delete: (id: string) => FirestoreService.deleteDocument('stores', id),
};

export const ItemService = {
  getAll: () => FirestoreService.getCollection<Item>('items'),
  getById: (id: string) => FirestoreService.getDocument<Item>('items', id),
  getByStore: (storeId: string) => 
    FirestoreService.getCollection<Item>('items', [where('storeId', '==', storeId)]),
  search: (searchTerm: string) =>
    FirestoreService.getCollection<Item>('items', [
      where('name', '>=', searchTerm.toLowerCase()),
      where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('name'),
      orderBy('verified', 'desc'),
      limit(20)
    ]),
  searchVerified: (searchTerm: string) =>
    FirestoreService.getCollection<Item>('items', [
      where('name', '>=', searchTerm.toLowerCase()),
      where('name', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      where('verified', '==', true),
      orderBy('name'),
      orderBy('verifiedAt', 'desc'),
      limit(20)
    ]),
  incrementReportCount: async (id: string) => {
    const item = await FirestoreService.getDocument<Item>('items', id);
    if (item) {
      await FirestoreService.updateDocument('items', id, {
        reportCount: (item.reportCount || 0) + 1,
        updatedAt: new Date()
      });
    }
  },
  create: (item: Omit<Item, 'id'>) => FirestoreService.addDocument<Item>('items', item),
  update: (id: string, data: Partial<Item>) => FirestoreService.updateDocument('items', id, data),
  delete: (id: string) => FirestoreService.deleteDocument('items', id),
};

export const StoreOwnerService = {
  getAll: () => FirestoreService.getCollection<StoreOwner>('storeOwners'),
  getById: (id: string) => FirestoreService.getDocument<StoreOwner>('storeOwners', id),
  create: (owner: Omit<StoreOwner, 'id'>) => FirestoreService.addDocument<StoreOwner>('storeOwners', owner),
  createWithId: async (id: string, owner: Omit<StoreOwner, 'id'>): Promise<void> => {
    try {
      const docRef = doc(db, 'storeOwners', id);
      await setDoc(docRef, owner);
    } catch (error) {
      console.error('Error creating store owner with ID:', error);
      throw error;
    }
  },
  update: (id: string, data: Partial<StoreOwner>) => FirestoreService.updateDocument('storeOwners', id, data),
  delete: (id: string) => FirestoreService.deleteDocument('storeOwners', id),
};

export const ReportService = {
  getAll: () => FirestoreService.getCollection<Report>('reports'),
  getById: (id: string) => FirestoreService.getDocument<Report>('reports', id),
  getByItem: (itemId: string) =>
    FirestoreService.getCollection<Report>('reports', [
      where('itemId', '==', itemId),
      orderBy('timestamp', 'desc')
    ]),
  getByStore: (storeId: string) =>
    FirestoreService.getCollection<Report>('reports', [
      where('storeId', '==', storeId),
      orderBy('timestamp', 'desc')
    ]),
  getRecentReports: (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return FirestoreService.getCollection<Report>('reports', [
      where('timestamp', '>=', cutoffDate),
      orderBy('timestamp', 'desc'),
      limit(50)
    ]);
  },
  getByStoreOwner: async (ownerId: string) => {
    // First get all stores owned by this owner
    const stores = await StoreService.getByOwner(ownerId);
    const storeIds = stores.map(store => store.id);
    
    if (storeIds.length === 0) return [];
    
    // Get reports for all stores owned by this owner
    const allReports = await Promise.all(
      storeIds.map(storeId => 
        FirestoreService.getCollection<Report>('reports', [
          where('storeId', '==', storeId),
          orderBy('timestamp', 'desc')
        ])
      )
    );
    
    // Flatten and sort all reports
    return allReports
      .flat()
      .sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
  },
  updateStatus: (id: string, status: 'pending' | 'resolved' | 'dismissed') =>
    FirestoreService.updateDocument('reports', id, { status }),
  create: (report: Omit<Report, 'id'>) => FirestoreService.addDocument<Report>('reports', report),
  update: (id: string, data: Partial<Report>) => FirestoreService.updateDocument('reports', id, data),
  delete: (id: string) => FirestoreService.deleteDocument('reports', id),
};

export const StorePlanService = {
  getAll: () => FirestoreService.getCollection<StorePlan>('storePlans'),
  getById: (id: string) => FirestoreService.getDocument<StorePlan>('storePlans', id),
  getByStore: (storeId: string) =>
    FirestoreService.getCollection<StorePlan>('storePlans', [
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    ]),
  getByOwner: (ownerId: string) =>
    FirestoreService.getCollection<StorePlan>('storePlans', [
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    ]),
  getActiveByStore: (storeId: string) =>
    FirestoreService.getCollection<StorePlan>('storePlans', [
      where('storeId', '==', storeId),
      where('isActive', '==', true),
      limit(1)
    ]),
  create: async (storePlan: Omit<StorePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date();
    const docData = {
      ...storePlan,
      uploadedAt: now, // Convert Date to Timestamp for Firestore
      createdAt: now,
      updatedAt: now,
    };
    return FirestoreService.addDocument<any>('storePlans', docData);
  },
  update: (id: string, data: Partial<StorePlan>) => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    return FirestoreService.updateDocument('storePlans', id, updateData);
  },
  delete: (id: string) => FirestoreService.deleteDocument('storePlans', id),
  setActiveStorePlan: async (storeId: string, storePlanId: string): Promise<void> => {
    // First, deactivate all store plans for this store
    const existingPlans = await StorePlanService.getByStore(storeId);
    const updatePromises = existingPlans.map(plan => 
      StorePlanService.update(plan.id, { isActive: false })
    );
    await Promise.all(updatePromises);
    
    // Then activate the selected plan
    await StorePlanService.update(storePlanId, { isActive: true });
  },
};

// Main service export for convenience
export const firestoreService = {
  getStore: StoreService.getById,
  getStores: StoreService.getAll,
  getItem: ItemService.getById,
  getItems: ItemService.getAll,
  searchItems: ItemService.search,
  getStoreItems: ItemService.getByStore,
  createReport: ReportService.create,
  getReports: ReportService.getAll,
};