import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DailyCashMovement, MonthlyExpense, InventoryItem, StockMovement } from '../types';

const COLLECTIONS = {
  CASH_MOVEMENTS: 'cashMovements',
  MONTHLY_EXPENSES: 'monthlyExpenses',
  INVENTORY: 'inventory',
  STOCK_MOVEMENTS: 'stockMovements'
};

export const firestoreService = {
  // Daily Cash Movement CRUD
  async addCashMovement(data: Omit<DailyCashMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CASH_MOVEMENTS), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateCashMovement(id: string, data: Partial<DailyCashMovement>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CASH_MOVEMENTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  async deleteCashMovement(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CASH_MOVEMENTS, id));
  },

  async getCashMovements(): Promise<DailyCashMovement[]> {
    const q = query(collection(db, COLLECTIONS.CASH_MOVEMENTS), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as DailyCashMovement[];
  },

  // Monthly Expenses CRUD
  async addMonthlyExpense(data: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MONTHLY_EXPENSES), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateMonthlyExpense(id: string, data: Partial<MonthlyExpense>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MONTHLY_EXPENSES, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  async deleteMonthlyExpense(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.MONTHLY_EXPENSES, id));
  },

  async getMonthlyExpenses(): Promise<MonthlyExpense[]> {
    const q = query(collection(db, COLLECTIONS.MONTHLY_EXPENSES), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as MonthlyExpense[];
  },

  async getExpensesByMonth(year: number, month: number): Promise<MonthlyExpense[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const q = query(
      collection(db, COLLECTIONS.MONTHLY_EXPENSES),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as MonthlyExpense[];
  },

  // Inventory CRUD
  async addInventoryItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.INVENTORY), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.INVENTORY, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.INVENTORY, id));
  },

  async getInventoryItems(): Promise<InventoryItem[]> {
    const q = query(collection(db, COLLECTIONS.INVENTORY), orderBy('category'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as InventoryItem[];
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await this.getInventoryItems();
    return items.filter(item => item.currentQuantity <= item.minStockAlert);
  },

  // Stock Movement
  async addStockMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<string> {
    const batch = writeBatch(db);
    
    // Add stock movement
    const movementRef = doc(collection(db, COLLECTIONS.STOCK_MOVEMENTS));
    batch.set(movementRef, {
      ...data,
      createdAt: Timestamp.now()
    });

    // Update inventory item
    const inventoryRef = doc(db, COLLECTIONS.INVENTORY, data.inventoryItemId);
    const inventoryDoc = await getDoc(inventoryRef);
    
    if (inventoryDoc.exists()) {
      const currentData = inventoryDoc.data() as InventoryItem;
      const quantityChange = data.type === 'entry' ? data.quantity : -data.quantity;
      
      batch.update(inventoryRef, {
        entries: data.type === 'entry' ? currentData.entries + data.quantity : currentData.entries,
        exits: data.type === 'exit' ? currentData.exits + data.quantity : currentData.exits,
        currentQuantity: currentData.currentQuantity + quantityChange,
        updatedAt: Timestamp.now()
      });
    }

    await batch.commit();
    return movementRef.id;
  },

  async getStockMovements(inventoryItemId?: string): Promise<StockMovement[]> {
    let q = query(collection(db, COLLECTIONS.STOCK_MOVEMENTS), orderBy('date', 'desc'));
    
    if (inventoryItemId) {
      q = query(
        collection(db, COLLECTIONS.STOCK_MOVEMENTS),
        where('inventoryItemId', '==', inventoryItemId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as StockMovement[];
  },

}