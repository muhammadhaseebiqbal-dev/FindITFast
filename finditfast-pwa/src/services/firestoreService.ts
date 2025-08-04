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
import type { Store, Item, StoreOwner, Report } from '../types';

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
  update: (id: string, data: Partial<Store>) => FirestoreService.updateDocument('stores', id, data),
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
  create: (report: Omit<Report, 'id'>) => FirestoreService.addDocument<Report>('reports', report),
  update: (id: string, data: Partial<Report>) => FirestoreService.updateDocument('reports', id, data),
  delete: (id: string) => FirestoreService.deleteDocument('reports', id),
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