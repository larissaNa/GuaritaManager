import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useDashboard, useCashMovements, useMonthlyExpenses } from '../hooks/useFirestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {DashboardProps} from '../types/index'

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { dashboardData, loading } = useDashboard();
  const { cashMovements } = useCashMovements();
  const { expenses } = useMonthlyExpenses();
  const [showCashValues, setShowCashValues] = useState(false);

  // Prepare chart data for cash movements (last 31 days)
  const cashChartData = cashMovements
    .slice(0, 31)
    .reverse()
    .map(movement => {
      // Parse date string directly without timezone conversion
      const [year, month, day] = movement.date.split('-');
      return {
        date: `${day}/${month}/${year}`,
        saldo: movement.salesValue
      };
    });

  // Prepare chart data for monthly expenses
  const currentYear = new Date().getFullYear();
  const monthlyExpensesData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthExpenses = expenses.filter(expense => {
      // Parse date string directly to avoid timezone issues
      const [year, expenseMonth, day] = expense.date.split('-').map(Number);
      const expenseDate = new Date(year, expenseMonth - 1, day);
      return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() + 1 === month;
    });
    const total = monthExpenses.reduce((sum, expense) => sum + expense.value, 0);
    
    return {
      month: new Date(currentYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
      gastos: total
    };
  });

  // Prepare chart data for weekly expenses (last 8 weeks)
  const getWeeklyExpensesData = () => {
  const weeks = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    
    // Ajuste: considerar segunda como início
    const dayOfWeek = (now.getDay() + 6) % 7; // transforma 0=domingo em 6, 1=segunda em 0...
    
    weekStart.setDate(now.getDate() - (i * 7) - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0); // Garantir início do dia
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // fecha no domingo
    weekEnd.setHours(23, 59, 59, 999); // Garantir final do dia

    const weekExpenses = expenses.filter(expense => {
      // Parse date string directly to avoid timezone issues
      const [year, month, day] = expense.date.split('-').map(Number);
      const expenseDate = new Date(year, month - 1, day);
      expenseDate.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de timezone
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });

    const total = weekExpenses.reduce((sum, expense) => sum + expense.value, 0);

    weeks.push({
      week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      gastos: total
    });
  }

  return weeks;
};

  const weeklyExpensesData = getWeeklyExpensesData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Vendas Total"
          value={formatCurrency(dashboardData.totalCash)}
          icon={<span className="text-2xl">💰</span>}
          color="green"
          showVisibilityToggle={true}
          isVisible={showCashValues}
          onToggleVisibility={() => setShowCashValues(!showCashValues)}
        />
        <Card
          title="Gastos do Mês"
          value={formatCurrency(dashboardData.monthlyExpenses)}
          icon={<span className="text-2xl">📊</span>}
          color="red"
          showVisibilityToggle={true}
          isVisible={showCashValues}
          onToggleVisibility={() => setShowCashValues(!showCashValues)}
        />
        <Card
          title="Estoque Baixo"
          value={dashboardData.lowStockItems}
          icon={<span className="text-2xl">⚠️</span>}
          color="yellow"
          subtitle={dashboardData.lowStockItems > 0 ? "Itens precisam reposição" : "Tudo ok!"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Movement Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Evolução das Vendas (Últimos 31 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gastos Semanais (Últimas 8 semanas)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Gastos']}
                  labelFormatter={(label) => `Semana: ${label}`}
                />
                <Bar dataKey="gastos" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Expenses Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Gastos por Mês ({currentYear})
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyExpensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Gastos']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="gastos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onPageChange('cash-movements')}
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm font-medium text-gray-900">Lançar Movimento de Caixa</div>
          </div>
          <div
            onClick={() => onPageChange('monthly-expenses')}
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm font-medium text-gray-900">Registrar Gasto</div>
          </div>
          <div
            onClick={() => onPageChange('inventory')}
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="text-sm font-medium text-gray-900">Atualizar Estoque</div>
          </div>
          {/* <div
            onClick={() => onPageChange('user-management')}
            className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm font-medium text-gray-900">Gerenciar Usuários</div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
