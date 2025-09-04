import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCashMovements, useMonthlyExpenses } from '../hooks/useFirestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const MonthlyProfits: React.FC = () => {
  // All hooks must be called at the top level
  const { user } = useAuth();
  const { cashMovements } = useCashMovements();
  const { expenses } = useMonthlyExpenses();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Check if user is manager after hooks
  if (user?.role !== 'gerente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Esta página é restrita apenas para gerentes.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate monthly profits (sales - expenses)
  const monthlyProfitsData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    
    // Calculate monthly sales from cash movements
    const monthlySales = cashMovements
      .filter(movement => {
        const [year, movementMonth] = movement.date.split('-').map(Number);
        return year === selectedYear && movementMonth === month;
      })
      .reduce((sum, movement) => sum + movement.salesValue, 0);

    // Calculate monthly expenses
    const monthlyExpenses = expenses
      .filter(expense => {
        const [year, expenseMonth] = expense.date.split('-').map(Number);
        return year === selectedYear && expenseMonth === month;
      })
      .reduce((sum, expense) => sum + expense.value, 0);

    const profit = monthlySales - monthlyExpenses;

    return {
      month: new Date(selectedYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
      vendas: monthlySales,
      gastos: monthlyExpenses,
      lucro: profit
    };
  });

  // Calculate yearly totals
  const yearlyTotals = monthlyProfitsData.reduce(
    (acc, month) => ({
      vendas: acc.vendas + month.vendas,
      gastos: acc.gastos + month.gastos,
      lucro: acc.lucro + month.lucro
    }),
    { vendas: 0, gastos: 0, lucro: 0 }
  );

  // Calculate quarterly data
  const quarterlyData = [
    {
      quarter: 'Q1',
      months: monthlyProfitsData.slice(0, 3),
    },
    {
      quarter: 'Q2', 
      months: monthlyProfitsData.slice(3, 6),
    },
    {
      quarter: 'Q3',
      months: monthlyProfitsData.slice(6, 9),
    },
    {
      quarter: 'Q4',
      months: monthlyProfitsData.slice(9, 12),
    }
  ].map(q => ({
    quarter: q.quarter,
    vendas: q.months.reduce((sum, m) => sum + m.vendas, 0),
    gastos: q.months.reduce((sum, m) => sum + m.gastos, 0),
    lucro: q.months.reduce((sum, m) => sum + m.lucro, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Relatório de Lucros - Gerência</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Ano:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendas Totais {selectedYear}</dt>
                  <dd className="text-lg font-medium text-green-600">{formatCurrency(yearlyTotals.vendas)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Gastos Totais {selectedYear}</dt>
                  <dd className="text-lg font-medium text-red-600">{formatCurrency(yearlyTotals.gastos)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Lucro Total {selectedYear}</dt>
                  <dd className={`text-lg font-medium ${yearlyTotals.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(yearlyTotals.lucro)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Evolução Mensal de Lucros - {selectedYear}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyProfitsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'vendas' ? 'Vendas' : name === 'gastos' ? 'Gastos' : 'Lucro'
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="vendas"
              />
              <Line 
                type="monotone" 
                dataKey="gastos" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="gastos"
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="lucro"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Comparison */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Comparação Trimestral - {selectedYear}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'vendas' ? 'Vendas' : name === 'gastos' ? 'Gastos' : 'Lucro'
                ]}
                labelFormatter={(label) => `Trimestre: ${label}`}
              />
              <Bar dataKey="vendas" fill="#10b981" name="vendas" />
              <Bar dataKey="gastos" fill="#ef4444" name="gastos" />
              <Bar dataKey="lucro" fill="#3b82f6" name="lucro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Details Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Detalhamento Mensal - {selectedYear}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lucro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyProfitsData.map((data, index) => {
                const margin = data.vendas > 0 ? ((data.lucro / data.vendas) * 100) : 0;
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(data.vendas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(data.gastos)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      data.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(data.lucro)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      margin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {margin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
