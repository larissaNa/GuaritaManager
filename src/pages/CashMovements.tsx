import React, { useState, useMemo } from 'react';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useCashMovements } from '../hooks/useFirestore';
import { DailyCashMovement } from '../types';

export const CashMovements: React.FC = () => {
  // Helper function to get current date in YYYY-MM-DD format without timezone issues
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { cashMovements, loading, addCashMovement, updateCashMovement, deleteCashMovement } = useCashMovements();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DailyCashMovement | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'week' | 'month'>('all');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    changeValue: 0,
    exitValue: 0,
    salesValue: 0,
    observation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateCashMovement(editingItem.id!, formData);
      } else {
        await addCashMovement(formData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (item: DailyCashMovement) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      changeValue: item.changeValue,
      exitValue: item.exitValue,
      salesValue: item.salesValue,
      observation: item.observation || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: DailyCashMovement) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteCashMovement(item.id!);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: getCurrentDate(),
      changeValue: 0,
      exitValue: 0,
      salesValue: 0,
      observation: ''
    });
    setEditingItem(null);
  };

  // Filter and calculate functions
  const getWeekRange = (weekString: string) => {
    if (!weekString) return null;
    const [year, week] = weekString.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);
    const weekStart = new Date(firstMonday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return { start: weekStart, end: weekEnd };
  };

  const getMonthRange = (monthString: string) => {
    if (!monthString) return null;
    const [year, month] = monthString.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start, end };
  };

  const filteredMovements = useMemo(() => {
    let filtered = [...cashMovements];

    if (filterType === 'week' && selectedWeek) {
      const weekRange = getWeekRange(selectedWeek);
      if (weekRange) {
        filtered = filtered.filter(movement => {
          const [year, month, day] = movement.date.split('-').map(Number);
          const movementDate = new Date(year, month - 1, day);
          return movementDate >= weekRange.start && movementDate <= weekRange.end;
        });
      }
    } else if (filterType === 'month' && selectedMonth) {
      const monthRange = getMonthRange(selectedMonth);
      if (monthRange) {
        filtered = filtered.filter(movement => {
          const [year, month, day] = movement.date.split('-').map(Number);
          const movementDate = new Date(year, month - 1, day);
          return movementDate >= monthRange.start && movementDate <= monthRange.end;
        });
      }
    }

    return filtered;
  }, [cashMovements, filterType, selectedWeek, selectedMonth]);

  const totalSales = useMemo(() => {
    return filteredMovements.reduce((total, movement) => total + movement.salesValue, 0);
  }, [filteredMovements]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
      key: 'changeValue',
      title: 'Troco',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'exitValue',
      title: 'Saída',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'salesValue',
      title: 'Vendas',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'observation',
      title: 'Observação',
      render: (value: string) => value || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Movimento de Caixa Diário</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Novo Movimento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por:</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'all' | 'week' | 'month');
                setSelectedWeek('');
                setSelectedMonth('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os registros</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>

          {filterType === 'week' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Semana:</label>
              <input
                type="week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {filterType === 'month' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Mês:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="ml-auto">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total de Vendas:</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(totalSales)}
              </div>
              <div className="text-xs text-gray-500">
                {filteredMovements.length} registro(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredMovements}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingItem ? 'Editar Movimento' : 'Novo Movimento de Caixa'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor do Troco</label>
              <input
                type="number"
                step="0.01"
                value={formData.changeValue}
                onChange={(e) => setFormData({ ...formData, changeValue: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor de Saída</label>
              <input
                type="number"
                step="0.01"
                value={formData.exitValue}
                onChange={(e) => setFormData({ ...formData, exitValue: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vendas do Dia</label>
            <input
              type="number"
              step="0.01"
              value={formData.salesValue}
              onChange={(e) => setFormData({ ...formData, salesValue: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observação</label>
            <textarea
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Observações sobre o movimento do dia..."
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
