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

  // Initialize sample data
  async initializeSampleInventory(): Promise<void> {
    const sampleItems: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Peixes
      { category: 'peixes', name: 'Tilápia de 1kg', initialQuantity: 50, entries: 0, exits: 0, currentQuantity: 50, minStockAlert: 10, unit: 'kg' },
      { category: 'peixes', name: 'Tilápia de 1,5kg', initialQuantity: 30, entries: 0, exits: 0, currentQuantity: 30, minStockAlert: 8, unit: 'kg' },
      { category: 'peixes', name: 'Camarão 15g', initialQuantity: 100, entries: 0, exits: 0, currentQuantity: 100, minStockAlert: 20, unit: 'unidade' },
      { category: 'peixes', name: 'Camarão 30g', initialQuantity: 80, entries: 0, exits: 0, currentQuantity: 80, minStockAlert: 15, unit: 'unidade' },
      { category: 'peixes', name: 'Manjuba', initialQuantity: 25, entries: 0, exits: 0, currentQuantity: 25, minStockAlert: 5, unit: 'kg' },
      { category: 'peixes', name: 'Filé Branquinho/Tilápia', initialQuantity: 40, entries: 0, exits: 0, currentQuantity: 40, minStockAlert: 10, unit: 'kg' },
      { category: 'peixes', name: 'Salmão', initialQuantity: 15, entries: 0, exits: 0, currentQuantity: 15, minStockAlert: 3, unit: 'kg' },
      
      // Carnes
      { category: 'carnes', name: 'Contra Filé', initialQuantity: 35, entries: 0, exits: 0, currentQuantity: 35, minStockAlert: 8, unit: 'kg' },
      { category: 'carnes', name: 'Picanha', initialQuantity: 20, entries: 0, exits: 0, currentQuantity: 20, minStockAlert: 5, unit: 'kg' },
      { category: 'carnes', name: 'Fraldinha', initialQuantity: 30, entries: 0, exits: 0, currentQuantity: 30, minStockAlert: 7, unit: 'kg' },
      { category: 'carnes', name: 'Filé de Frango (Peito)', initialQuantity: 45, entries: 0, exits: 0, currentQuantity: 45, minStockAlert: 10, unit: 'kg' },
      { category: 'carnes', name: 'Frango a Passarinho', initialQuantity: 25, entries: 0, exits: 0, currentQuantity: 25, minStockAlert: 6, unit: 'kg' },
      { category: 'carnes', name: 'Barriga de Porco', initialQuantity: 20, entries: 0, exits: 0, currentQuantity: 20, minStockAlert: 5, unit: 'kg' },
      { category: 'carnes', name: 'Bacon Fatiado', initialQuantity: 15, entries: 0, exits: 0, currentQuantity: 15, minStockAlert: 3, unit: 'kg' },
      { category: 'carnes', name: 'Bacon Peça', initialQuantity: 10, entries: 0, exits: 0, currentQuantity: 10, minStockAlert: 2, unit: 'peça' },
      { category: 'carnes', name: 'Filé Mignon', initialQuantity: 12, entries: 0, exits: 0, currentQuantity: 12, minStockAlert: 3, unit: 'kg' },
      { category: 'carnes', name: 'Carneiro', initialQuantity: 8, entries: 0, exits: 0, currentQuantity: 8, minStockAlert: 2, unit: 'kg' },
      { category: 'carnes', name: 'Galinha Caipira', initialQuantity: 15, entries: 0, exits: 0, currentQuantity: 15, minStockAlert: 3, unit: 'unidade' },
      { category: 'carnes', name: 'Frango Desossado', initialQuantity: 30, entries: 0, exits: 0, currentQuantity: 30, minStockAlert: 8, unit: 'kg' },
      { category: 'carnes', name: 'Carne de Sol/Coxão Mole', initialQuantity: 18, entries: 0, exits: 0, currentQuantity: 18, minStockAlert: 4, unit: 'kg' },
      { category: 'carnes', name: 'Pé de Porco', initialQuantity: 12, entries: 0, exits: 0, currentQuantity: 12, minStockAlert: 3, unit: 'unidade' },
      { category: 'carnes', name: 'Orelha de Porco', initialQuantity: 10, entries: 0, exits: 0, currentQuantity: 10, minStockAlert: 2, unit: 'unidade' },
      { category: 'carnes', name: 'Rabo de Porco', initialQuantity: 8, entries: 0, exits: 0, currentQuantity: 8, minStockAlert: 2, unit: 'unidade' },
      
      // Frios/Congelados
      { category: 'frios-congelados', name: 'Queijo Mussarela', initialQuantity: 25, entries: 0, exits: 0, currentQuantity: 25, minStockAlert: 5, unit: 'kg' },
      { category: 'frios-congelados', name: 'Queijo Coalho', initialQuantity: 20, entries: 0, exits: 0, currentQuantity: 20, minStockAlert: 4, unit: 'kg' },
      { category: 'frios-congelados', name: 'Presunto', initialQuantity: 15, entries: 0, exits: 0, currentQuantity: 15, minStockAlert: 3, unit: 'kg' },
      { category: 'frios-congelados', name: 'Cheddar Bisnaga', initialQuantity: 30, entries: 0, exits: 0, currentQuantity: 30, minStockAlert: 8, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Catupiry Bisnaga', initialQuantity: 25, entries: 0, exits: 0, currentQuantity: 25, minStockAlert: 6, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Calabresa Pacote', initialQuantity: 20, entries: 0, exits: 0, currentQuantity: 20, minStockAlert: 5, unit: 'pacote' },
      { category: 'frios-congelados', name: 'Sorvete de Creme', initialQuantity: 40, entries: 0, exits: 0, currentQuantity: 40, minStockAlert: 10, unit: 'litro' },
      { category: 'frios-congelados', name: 'Croquete de Carne', initialQuantity: 200, entries: 0, exits: 0, currentQuantity: 200, minStockAlert: 50, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Pastel de Carne', initialQuantity: 150, entries: 0, exits: 0, currentQuantity: 150, minStockAlert: 30, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Pastel de Frango', initialQuantity: 120, entries: 0, exits: 0, currentQuantity: 120, minStockAlert: 25, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Pastel de Queijo', initialQuantity: 100, entries: 0, exits: 0, currentQuantity: 100, minStockAlert: 20, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Pastel de Camarão', initialQuantity: 80, entries: 0, exits: 0, currentQuantity: 80, minStockAlert: 15, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Pastel Misto', initialQuantity: 90, entries: 0, exits: 0, currentQuantity: 90, minStockAlert: 18, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Bolinho de Camarão', initialQuantity: 100, entries: 0, exits: 0, currentQuantity: 100, minStockAlert: 20, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Bolinho de Carne de Sol', initialQuantity: 80, entries: 0, exits: 0, currentQuantity: 80, minStockAlert: 15, unit: 'unidade' },
      { category: 'frios-congelados', name: 'Bolinho de Bacalhau', initialQuantity: 70, entries: 0, exits: 0, currentQuantity: 70, minStockAlert: 12, unit: 'unidade' }
    ];

    const batch = writeBatch(db);
    sampleItems.forEach(item => {
      const docRef = doc(collection(db, COLLECTIONS.INVENTORY));
      batch.set(docRef, {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
  }
};
