import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { DailyCashMovement, MonthlyExpense, InventoryItem, DashboardData } from '../types';

export const useCashMovements = () => {
  const [cashMovements, setCashMovements] = useState<DailyCashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashMovements = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCashMovements();
      setCashMovements(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar movimentações de caixa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashMovements();
  }, []);

  const addCashMovement = async (data: Omit<DailyCashMovement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await firestoreService.addCashMovement(data);
      await fetchCashMovements();
    } catch (err) {
      throw new Error('Erro ao adicionar movimentação de caixa');
    }
  };

  const updateCashMovement = async (id: string, data: Partial<DailyCashMovement>) => {
    try {
      await firestoreService.updateCashMovement(id, data);
      await fetchCashMovements();
    } catch (err) {
      throw new Error('Erro ao atualizar movimentação de caixa');
    }
  };

  const deleteCashMovement = async (id: string) => {
    try {
      await firestoreService.deleteCashMovement(id);
      await fetchCashMovements();
    } catch (err) {
      throw new Error('Erro ao excluir movimentação de caixa');
    }
  };

  return {
    cashMovements,
    loading,
    error,
    addCashMovement,
    updateCashMovement,
    deleteCashMovement,
    refetch: fetchCashMovements
  };
};

export const useMonthlyExpenses = () => {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getMonthlyExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar gastos mensais');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (data: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await firestoreService.addMonthlyExpense(data);
      await fetchExpenses();
    } catch (err) {
      throw new Error('Erro ao adicionar gasto mensal');
    }
  };

  const updateExpense = async (id: string, data: Partial<MonthlyExpense>) => {
    try {
      await firestoreService.updateMonthlyExpense(id, data);
      await fetchExpenses();
    } catch (err) {
      throw new Error('Erro ao atualizar gasto mensal');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await firestoreService.deleteMonthlyExpense(id);
      await fetchExpenses();
    } catch (err) {
      throw new Error('Erro ao excluir gasto mensal');
    }
  };

  const getExpensesByMonth = async (year: number, month: number) => {
    try {
      return await firestoreService.getExpensesByMonth(year, month);
    } catch (err) {
      throw new Error('Erro ao carregar gastos do mês');
    }
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByMonth,
    refetch: fetchExpenses
  };
};

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getInventoryItems();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar estoque');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addInventoryItem = async (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await firestoreService.addInventoryItem(data);
      await fetchInventory();
    } catch (err) {
      throw new Error('Erro ao adicionar item ao estoque');
    }
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    try {
      await firestoreService.updateInventoryItem(id, data);
      await fetchInventory();
    } catch (err) {
      throw new Error('Erro ao atualizar item do estoque');
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      await firestoreService.deleteInventoryItem(id);
      await fetchInventory();
    } catch (err) {
      throw new Error('Erro ao excluir item do estoque');
    }
  };

  const addStockMovement = async (data: any) => {
    try {
      await firestoreService.addStockMovement(data);
      await fetchInventory();
    } catch (err) {
      throw new Error('Erro ao registrar movimentação de estoque');
    }
  };

  const getLowStockItems = async () => {
    try {
      return await firestoreService.getLowStockItems();
    } catch (err) {
      throw new Error('Erro ao carregar itens com estoque baixo');
    }
  };

  return {
    inventory,
    loading,
    error,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addStockMovement,
    getLowStockItems,
    refetch: fetchInventory
  };
};

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCash: 0,
    monthlyExpenses: 0,
    lowStockItems: 0,
    totalInventoryItems: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [cashMovements, expenses, inventory, lowStockItems] = await Promise.all([
        firestoreService.getCashMovements(),
        firestoreService.getExpensesByMonth(new Date().getFullYear(), new Date().getMonth() + 1),
        firestoreService.getInventoryItems(),
        firestoreService.getLowStockItems()
      ]);

      const totalCash = cashMovements.reduce((sum, movement) => sum + movement.salesValue, 0);
      const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);

      setDashboardData({
        totalCash,
        monthlyExpenses,
        lowStockItems: lowStockItems.length,
        totalInventoryItems: inventory.length
      });
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    refetch: fetchDashboardData
  };
};
