import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: '📊' },
    { id: 'cash-movements', label: 'Movimento de Caixa', icon: '💰' },
    { id: 'monthly-expenses', label: 'Gastos Mensais', icon: '📋' },
    { id: 'inventory', label: 'Controle de Estoque', icon: '📦' },
    ...(user?.role === 'gerente' ? [
      { id: 'monthly-profits', label: 'Relatório de Lucros', icon: '📈' },
      { id: 'user-management', label: 'Usuários', icon: '👥' }
    ] : [])
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-600">Financeiro Rancho</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`${
                    currentPage === item.id
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {/* <span className="text-sm text-gray-700 mr-4">
              Olá, {user?.displayName || user?.email}
            </span> */}
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
