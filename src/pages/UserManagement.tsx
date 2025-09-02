import React, { useState, useEffect } from 'react';
import { userManagementService } from '../services/userManagementService';
import { UserManagementData, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMigrationForm, setShowMigrationForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserManagementData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'funcionario' as UserRole
  });

  // Migration form state
  const [migrationData, setMigrationData] = useState({
    uid: '',
    email: '',
    displayName: '',
    role: 'funcionario' as UserRole
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await userManagementService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      setError('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      await userManagementService.createUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role,
        user.uid
      );
      
      setSuccess('Usuário criado com sucesso!');
      setFormData({
        email: '',
        password: '',
        displayName: '',
        role: 'funcionario'
      });
      setShowForm(false);
      await loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      await userManagementService.assignRoleToExistingUser(
        migrationData.uid,
        migrationData.email,
        migrationData.displayName,
        migrationData.role,
        user.uid
      );
      
      setSuccess('Role atribuída ao usuário existente com sucesso!');
      setMigrationData({
        uid: '',
        email: '',
        displayName: '',
        role: 'funcionario'
      });
      setShowMigrationForm(false);
      await loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao atribuir role ao usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await userManagementService.updateUserRole(userId, newRole);
      setSuccess('Permissão atualizada com sucesso!');
      await loadUsers();
    } catch (error) {
      setError('Erro ao atualizar permissão');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await userManagementService.deactivateUser(userId);
      } else {
        await userManagementService.activateUser(userId);
      }
      setSuccess(`Usuário ${isActive ? 'desativado' : 'ativado'} com sucesso!`);
      await loadUsers();
    } catch (error) {
      setError('Erro ao alterar status do usuário');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    return role === 'gerente' ? 'Gerente' : 'Funcionário';
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return role === 'gerente' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Controle de Usuários</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMigrationForm(!showMigrationForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {showMigrationForm ? 'Cancelar' : 'Atribuir Role'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancelar' : 'Novo Usuário'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showMigrationForm && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Atribuir Role a Usuário Existente</h2>
            <p className="text-sm text-gray-600 mb-4">
              Use este formulário para atribuir permissões a usuários que já estão cadastrados no Firebase Authentication.
            </p>
            <form onSubmit={handleMigrationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UID do Usuário
                </label>
                <input
                  type="text"
                  value={migrationData.uid}
                  onChange={(e) => setMigrationData({ ...migrationData, uid: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="UID do usuário no Firebase Auth"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={migrationData.email}
                  onChange={(e) => setMigrationData({ ...migrationData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={migrationData.displayName}
                  onChange={(e) => setMigrationData({ ...migrationData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Permissão
                </label>
                <select
                  value={migrationData.role}
                  onChange={(e) => setMigrationData({ ...migrationData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Atribuindo...' : 'Atribuir Role'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMigrationForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Cadastrar Novo Usuário</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Permissão
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Usuários Cadastrados</h2>
          
          {loading && !showForm ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Nome</th>
                    <th className="text-left py-2 px-3">Email</th>
                    <th className="text-left py-2 px-3">Permissão</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Data de Criação</th>
                    <th className="text-left py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">{userData.displayName}</td>
                      <td className="py-3 px-3">{userData.email}</td>
                      <td className="py-3 px-3">
                        <select
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData.id!, e.target.value as UserRole)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userData.role)}`}
                        >
                          <option value="funcionario">Funcionário</option>
                          <option value="gerente">Gerente</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleActive(userData.id!, userData.isActive)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            userData.isActive
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          } transition-colors`}
                        >
                          {userData.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário cadastrado ainda.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
