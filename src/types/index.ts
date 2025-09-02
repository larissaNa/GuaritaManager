export type UserRole = 'gerente' | 'funcionario';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: UserRole;
  createdAt?: Date;
  createdBy?: string;
}

export interface UserManagementData {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface DailyCashMovement {
  id?: string;
  date: string;
  changeValue: number;
  exitValue: number;
  salesValue: number;
  observation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseCategory = 
  | 'Mercearia'
  | 'Hortifruti'
  | 'Bar'
  | 'Peixes'
  | 'Carnes'
  | 'Frios/Congelados'
  | 'Limpeza'
  | 'Descartáveis'
  | 'Material administrativo'
  | 'Boletos'
  | 'Serviços'
  | 'Impostos'
  | 'Funcionários';

export interface MonthlyExpense {
  id?: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 'hortifrut' | 'mercearia' | 'bebidas-bar' | 'peixes' | 'carnes' | 'frios-congelados' | 'descartaveis' | 'limpeza' | 'material-administrativo' | string;

export interface InventoryItem {
  id?: string;
  category: ProductCategory;
  name: string;
  initialQuantity: number;
  entries: number;
  exits: number;
  currentQuantity: number;
  minStockAlert: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id?: string;
  inventoryItemId: string;
  type: 'entry' | 'exit';
  quantity: number;
  date: string;
  observation?: string;
  createdAt: Date;
}

export interface DashboardData {
  totalCash: number;
  monthlyExpenses: number;
  lowStockItems: number;
  totalInventoryItems: number;
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface DashboardProps {
  onPageChange: (page: string) => void;
}