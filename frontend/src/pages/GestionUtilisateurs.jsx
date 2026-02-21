import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Modal from '../components/common/Modal';
import { Plus, Search, UserCheck, UserX, Edit, Trash2, Shield, Calendar, Phone, Mail } from 'lucide-react';

// À réactiver plus tard : limite "minimum 2 utilisateurs" (et création illimitée selon abonnement)
const ENABLE_USER_LIMIT = false;
const MAX_FREE_USERS = 2;

const GestionUtilisateurs = () => {
  const { users, currentUser, createUser, updateUser, deactivateUser, ROLES } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('tous');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const activeUsersCount = users.filter(u => u.actif).length;
  const canAddUser = !ENABLE_USER_LIMIT || activeUsersCount < MAX_FREE_USERS;

  const handleCreateUser = async (userData) => {
    if (ENABLE_USER_LIMIT && !canAddUser) {
      toast.error('Limite atteinte. Maximum 2 utilisateurs gratuits. Passez à un abonnement premium.');
      return;
    }
    try {
      await createUser(userData);
      setIsCreateModalOpen(false);
    } catch (_) {}
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (user.id === currentUser.id) {
      toast.error('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }
    if (user.actif) {
      if (window.confirm(`Désactiver l'utilisateur ${user.prenom} ${user.nom} ?`)) {
        try {
          await deactivateUser(userId);
        } catch (_) {}
      }
    } else {
      try {
        await updateUser(userId, { actif: true });
      } catch (_) {}
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'tous' || user.role === filterRole;
    const matchesStatus = filterStatus === 'tous' || 
                          (filterStatus === 'actif' && user.actif) ||
                          (filterStatus === 'inactif' && !user.actif);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const badges = {
      [ROLES.ADMIN]: { color: 'bg-purple-100 text-purple-700', label: 'Administrateur' },
      [ROLES.DIRECTEUR]: { color: 'bg-red-100 text-red-700', label: 'Directeur' },
      [ROLES.MANAGER_COMMERCIAL]: { color: 'bg-blue-100 text-blue-700', label: 'Manager Commercial' },
      [ROLES.MANAGER_LOGISTIQUE]: { color: 'bg-green-100 text-green-700', label: 'Manager Logistique' },
      [ROLES.DISPATCHER]: { color: 'bg-orange-100 text-orange-700', label: 'Dispatcher' },
      [ROLES.AGENT_COMMERCIAL]: { color: 'bg-cyan-100 text-cyan-700', label: 'Agent Commercial' },
      [ROLES.AGENT_LOGISTIQUE]: { color: 'bg-teal-100 text-teal-700', label: 'Agent Logistique' },
      [ROLES.TRESORERIE]: { color: 'bg-amber-100 text-amber-700', label: 'Trésorerie' },
      [ROLES.FACTURATION]: { color: 'bg-indigo-100 text-indigo-700', label: 'Facturation' },
    };
    const badge = badges[role] || { color: 'bg-gray-100 text-gray-700', label: role };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <MainLayout title="Gestion des Utilisateurs" subtitle="Administrez les comptes et permissions">
      <div className="p-8">
        {/* Avertissement limite (désactivé tant que ENABLE_USER_LIMIT = false) */}
        {ENABLE_USER_LIMIT && !canAddUser && (
          <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
            <Shield className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">Limite Gratuite Atteinte</h4>
              <p className="text-sm text-orange-700">
                Vous avez atteint la limite de {MAX_FREE_USERS} utilisateurs gratuits. 
                <a href="/abonnements" className="font-semibold underline ml-1">Passez à Premium</a> pour ajouter des utilisateurs illimités.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Utilisateurs</span>
              <UserCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Actifs</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-green-600">{activeUsersCount}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Inactifs</span>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-gray-600">{users.filter(u => !u.actif).length}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Licence</span>
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-orange-600">
              {ENABLE_USER_LIMIT ? `${activeUsersCount}/${MAX_FREE_USERS} Gratuit` : 'Création illimitée'}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3 flex-1 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filter Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="tous">Tous les rôles</option>
              {Object.entries(ROLES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>

          <button
            onClick={() => canAddUser ? setIsCreateModalOpen(true) : toast.error('Limite gratuite atteinte')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors ${
              canAddUser ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={ENABLE_USER_LIMIT && !canAddUser}
          >
            <Plus className="w-5 h-5" />
            Nouvel Utilisateur
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Dernière Connexion</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.prenom[0]}{user.nom[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.telephone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.derniereConnexion ? (
                        new Date(user.derniereConnexion).toLocaleString('fr-FR')
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.actif ? (
                        <span className="flex items-center gap-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.actif
                              ? 'hover:bg-orange-50 text-orange-600'
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                          title={user.actif ? 'Désactiver' : 'Réactiver'}
                        >
                          {user.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Create User */}
        {isCreateModalOpen && (
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Nouvel Utilisateur"
            size="lg"
          >
            <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateModalOpen(false)} />
          </Modal>
        )}

        {/* Modal Edit User */}
        {selectedUser && (
          <Modal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            title="Modifier Utilisateur"
            size="lg"
          >
            <UserForm
              user={selectedUser}
              onSubmit={async (data) => {
                try {
                  await updateUser(selectedUser.id, data);
                  setSelectedUser(null);
                } catch (_) {}
              }}
              onCancel={() => setSelectedUser(null)}
            />
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

// Formulaire Utilisateur
const UserForm = ({ user, onSubmit, onCancel }) => {
  const { ROLES } = useAuth();
  const [formData, setFormData] = useState(
    user || {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      role: ROLES.AGENT_COMMERCIAL,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.role) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!user && !formData.password) {
      toast.error('Le mot de passe est obligatoire.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Jean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Kouassi"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="jean.kouassi@corlay.ci"
        />
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="••••••••"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone
        </label>
        <input
          type="tel"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="+225 07 00 00 00 00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rôle <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {Object.entries(ROLES).map(([key, value]) => (
            <option key={value} value={value}>
              {key.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          {user ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default GestionUtilisateurs;
