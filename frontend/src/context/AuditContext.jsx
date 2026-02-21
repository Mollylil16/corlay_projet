import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const AuditContext = createContext();

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit doit être utilisé dans un AuditProvider');
  }
  return context;
};

export const AuditProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchLogs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.get('/audit-logs');
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erreur chargement logs audit:', e);
      setAuditLogs([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Ajouter un log d'audit (persisté en BDD)
  const addAuditLog = async (log) => {
    try {
      const created = await api.post('/audit-logs', {
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        description: log.description,
      });
      setAuditLogs((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('Erreur création log audit:', e);
      throw e;
    }
  };

  // Filtrer les logs
  const filterLogs = (filters) => {
    let filtered = [...auditLogs];

    if (filters.userId) {
      filtered = filtered.filter((log) => log.userId === filters.userId);
    }

    if (filters.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    if (filters.entity) {
      filtered = filtered.filter((log) => log.entity === filters.entity);
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }

    return filtered;
  };

  const value = {
    auditLogs,
    addAuditLog,
    filterLogs,
    refetchLogs: fetchLogs,
  };

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
};
