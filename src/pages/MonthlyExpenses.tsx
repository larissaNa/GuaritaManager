import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useMonthlyExpenses } from '../hooks/useFirestore';
import { MonthlyExpense, ExpenseCategory } from '../types';
import { useAuth } from '../hooks/useAuth';

export const MonthlyExpenses: React.FC = () => {
  // Helper function to get current date in YYYY-MM-DD format without timezone issues
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { user } = useAuth();
  const { expenses, loading, addExpense, updateExpense, deleteExpense, getExpensesByMonth } = useMonthlyExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthlyExpense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    category: 'Mercearia' as ExpenseCategory,
    description: '',
    value: 0
  });

  React.useEffect(() => {
    const calculateMonthlyTotal = async () => {
      try {
        const monthExpenses = await getExpensesByMonth(selectedYear, selectedMonth);
        const total = monthExpenses.reduce((sum, expense) => sum + expense.value, 0);
        setMonthlyTotal(total);
      } catch (error) {
        console.error('Erro ao calcular total mensal:', error);
      }
    };

    calculateMonthlyTotal();
  }, [selectedMonth, selectedYear, expenses, getExpensesByMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateExpense(editingItem.id!, formData);
      } else {
        await addExpense(formData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (item: MonthlyExpense) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      category: item.category,
      description: item.description || '',
      value: item.value
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: MonthlyExpense) => {
    if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
      try {
        await deleteExpense(item.id!);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: getCurrentDate(),
      category: 'Mercearia' as ExpenseCategory,
      description: '',
      value: 0
    });
    setEditingItem(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcula a semana do mês de forma isolada para cada mês
  const getWeekOfMonth = (date: Date) => {
    // Garantir que estamos trabalhando com uma data válida
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Primeiro dia do mês
    const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    
    // Calcular quantos dias se passaram desde o início do mês
    const dayOfMonth = targetDate.getDate();
    
    // Calcular a semana baseada apenas no dia do mês (1-7 = semana 1, 8-14 = semana 2, etc.)
    return Math.ceil(dayOfMonth / 7);
  };


  const filteredExpenses = expenses.filter(expense => {
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = expense.date.split('-').map(Number);
    const expenseDate = new Date(year, month - 1, day);
    const isCorrectMonth = expenseDate.getFullYear() === selectedYear && 
                          expenseDate.getMonth() + 1 === selectedMonth; 
    
    if (!isCorrectMonth) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
      return false;
    }
    
    // Filter by week
    if (selectedWeek !== 'all') {
      const weekOfMonth = getWeekOfMonth(expenseDate);
      if (weekOfMonth !== selectedWeek) {
        return false;
      }
    }
    
    return true;
  });

  const columns = [
    {
      key: 'date',
      title: 'Data',
      render: (value: string) => {
        // Parse date string directly without timezone conversion
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
      }
    },
    {
      key: 'category',
      title: 'Categoria'
    },
    {
      key: 'description',
      title: 'Descrição'
    },
    {
      key: 'value',
      title: 'Valor',
      render: (value: number) => formatCurrency(value)
    }
  ];

  const expenseCategories: ExpenseCategory[] = [
    'Mercearia',
    'Hortifruti',
    'Bar',
    'Peixes',
    'Carnes',
    'Frios/Congelados',
    'Limpeza',
    'Descartáveis',
    'Material administrativo',
    'Boletos',
    'Serviços',
    'Impostos',
    'Funcionários'
  ];

  // Calculate weekly breakdown by category
  const getWeeklyBreakdown = () => {
    const breakdown: { [week: number]: { [category: string]: number } } = {};
    
    filteredExpenses.forEach(expense => {
      // Parse date string directly to avoid timezone issues
      const [year, month, day] = expense.date.split('-').map(Number);
      const expenseDate = new Date(year, month - 1, day);
      const week = getWeekOfMonth(expenseDate);
      
      if (!breakdown[week]) {
        breakdown[week] = {};
      }
      
      if (!breakdown[week][expense.category]) {
        breakdown[week][expense.category] = 0;
      }
      
      breakdown[week][expense.category] += expense.value;
    });
    
    return breakdown;
  };

  const weeklyBreakdown = getWeeklyBreakdown();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Novo Gasto
        </button>
      </div>

      {/* Filters and Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | 'all')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todas as categorias</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semana</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todas as semanas</option>
              <option value={1}>Semana 1</option>
              <option value={2}>Semana 2</option>
              <option value={3}>Semana 3</option>
              <option value={4}>Semana 4</option>
              <option value={5}>Semana 5</option>
            </select>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Filtrado</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.value, 0))}
            </div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredExpenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Weekly Breakdown by Category */}
      {Object.keys(weeklyBreakdown).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gastos por Semana e Categoria - {monthNames[selectedMonth - 1]} {selectedYear}
          </h2>
          <div className="space-y-4">
            {Object.entries(weeklyBreakdown)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([week, categories]) => (
                <div key={week} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Semana {week}
                    <span className="ml-2 text-sm text-gray-500">
                      (Total: {formatCurrency(Object.values(categories).reduce((sum, value) => sum + value, 0))})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(categories)
                      .sort(([,a], [,b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingItem ? 'Editar Gasto' : 'Novo Gasto Mensal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={`Digite o que foi comprado/pago em ${formData.category}`}
              
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor</label>
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editingItem ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
