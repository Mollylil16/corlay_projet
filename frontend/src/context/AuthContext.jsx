import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const ROLES = {
  ADMIN: 'administrateur',
  MANAGER_COMMERCIAL: 'manager-commercial',
  MANAGER_LOGISTIQUE: 'manager-logistique',
  DISPATCHER: 'dispatcher',
  AGENT_COMMERCIAL: 'agent-commercial',
  AGENT_LOGISTIQUE: 'agent-logistique',
  DIRECTEUR: 'directeur',
  TRESORERIE: 'tresorerie',
  FACTURATION: 'facturation',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['all'],
  // Profils avec accès au menu Validations (Trésorerie, Facturation, BL, commandes)
  [ROLES.DIRECTEUR]: ['voir-validations', 'valider-commandes', 'voir-rapports', 'voir-commandes', 'voir-stocks', 'voir-transporteurs', 'voir-incidents'],
  [ROLES.MANAGER_COMMERCIAL]: ['voir-validations', 'creer-commandes', 'modifier-commandes', 'valider-commandes', 'voir-commandes', 'voir-rapports'],
  [ROLES.MANAGER_LOGISTIQUE]: ['voir-validations', 'voir-commandes', 'dispatcher', 'voir-stocks', 'gerer-transporteurs', 'valider-bl', 'voir-rapports', 'voir-incidents'],
  [ROLES.TRESORERIE]: ['voir-validations', 'voir-commandes', 'valider-tresorerie'],
  [ROLES.FACTURATION]: ['voir-validations', 'voir-commandes', 'valider-facturation'],
  // Profils sans accès au menu Validations
  [ROLES.DISPATCHER]: ['dispatcher', 'creer-bl', 'voir-suivi', 'voir-transporteurs', 'voir-stocks', 'voir-incidents'],
  [ROLES.AGENT_COMMERCIAL]: ['creer-commandes', 'voir-commandes'],
  [ROLES.AGENT_LOGISTIQUE]: ['voir-commandes', 'voir-stocks', 'ajuster-stocks', 'voir-incidents'],
};

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const list = await api.get('/users');
      setUsers(list);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setUsers([]);
    }
  }, []);

  // Restaurer session au chargement
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        loadUsers();
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, [loadUsers]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadUsers();
      toast.success(`Bienvenue ${user.prenom} ${user.nom}.`);
      return true;
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Email ou mot de passe incorrect';
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUsers([]);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.info('Déconnexion réussie');
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    const userPermissions = PERMISSIONS[currentUser.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const createUser = async (userData) => {
    try {
      const created = await api.post('/users', {
        email: userData.email,
        password: userData.password,
        nom: userData.nom,
        prenom: userData.prenom,
        role: userData.role,
        telephone: userData.telephone || undefined,
      });
      setUsers((prev) => [created, ...prev]);
      toast.success(`Utilisateur ${created.prenom} ${created.nom} créé avec succès`);
      return created;
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Erreur création utilisateur';
      toast.error(msg);
      throw err;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const payload = { ...updates };
      if (payload.password === '') delete payload.password;
      const updated = await api.patch(`/users/${userId}`, payload);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      if (currentUser?.id === userId) setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
      toast.success('Utilisateur mis à jour');
      return updated;
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Erreur mise à jour';
      toast.error(msg);
      throw err;
    }
  };

  const deactivateUser = async (userId) => {
    try {
      const updated = await api.patch(`/users/${userId}`, { actif: false });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.warning('Utilisateur désactivé');
      return updated;
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Erreur';
      toast.error(msg);
      throw err;
    }
  };

  const resetPassword = (email) => {
    toast.info(`Fonctionnalité à venir : email de réinitialisation pour ${email}`);
    return true;
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    createUser,
    updateUser,
    deactivateUser,
    resetPassword,
    loadUsers,
    ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
