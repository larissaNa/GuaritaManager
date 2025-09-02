import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthContainer } from './components/auth/AuthContainer';
import { Navigation } from './components/ui/Navigation';
import { Dashboard } from './pages/Dashboard';
import { CashMovements } from './pages/CashMovements';
import { MonthlyExpenses } from './pages/MonthlyExpenses';
import { Inventory } from './pages/Inventory';
import { UserManagement } from './pages/UserManagement';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthContainer />;
  }

  const renderPage = () => {
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard onPageChange={setCurrentPage} />;
    case 'cash-movements':
      return <CashMovements />;
    case 'monthly-expenses':
      return <MonthlyExpenses />;
    case 'inventory':
      return <Inventory />;
    case 'user-management':
      return <UserManagement />;
    default:
      return <Dashboard onPageChange={setCurrentPage} />;
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
