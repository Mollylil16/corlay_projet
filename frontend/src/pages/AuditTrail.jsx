import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { Search, Filter, Download, Calendar, User, Activity, Eye, Edit, Trash2, FileText, Package, Truck } from 'lucide-react';
import * as XLSX from 'xlsx';

const AuditTrail = () => {
  const { auditLogs, filterLogs } = useAudit();
  const { users } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Appliquer les filtres
  const filteredLogs = filterLogs({
    action: filterAction,
    entity: filterEntity,
    userId: filterUser,
    startDate,
    endDate,
  }).filter((log) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(searchLower) ||
      log.userName.toLowerCase().includes(searchLower) ||
      log.entityId.toLowerCase().includes(searchLower)
    );
  });

  const getActionIcon = (action) => {
    switch (action) {
      case 'creation':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'modification':
        return <Edit className="w-5 h-5 text-blue-500" />;
      case 'suppression':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'consultation':
        return <Eye className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-orange-500" />;
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      creation: { color: 'bg-green-100 text-green-700', label: 'Création' },
      modification: { color: 'bg-blue-100 text-blue-700', label: 'Modification' },
      suppression: { color: 'bg-red-100 text-red-700', label: 'Suppression' },
      consultation: { color: 'bg-gray-100 text-gray-700', label: 'Consultation' },
    };
    const badge = badges[action] || { color: 'bg-orange-100 text-orange-700', label: action };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getEntityBadge = (entity) => {
    const badges = {
      commande: { color: 'bg-purple-100 text-purple-700', label: 'Commande' },
      'bon-livraison': { color: 'bg-cyan-100 text-cyan-700', label: 'Bon de Livraison' },
      utilisateur: { color: 'bg-pink-100 text-pink-700', label: 'Utilisateur' },
      stock: { color: 'bg-yellow-100 text-yellow-700', label: 'Stock' },
      rapport: { color: 'bg-indigo-100 text-indigo-700', label: 'Rapport' },
      transporteur: { color: 'bg-teal-100 text-teal-700', label: 'Transporteur' },
    };
    const badge = badges[entity] || { color: 'bg-gray-100 text-gray-700', label: entity };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleExportExcel = () => {
    const data = filteredLogs.map((log) => ({
      'Date & Heure': new Date(log.timestamp).toLocaleString('fr-FR'),
      Utilisateur: log.userName,
      Action: log.action,
      Entité: log.entity,
      'ID Entité': log.entityId,
      Description: log.description,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail');
    XLSX.writeFile(wb, `Audit_Trail_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Historique exporté en Excel.');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterAction('');
    setFilterEntity('');
    setFilterUser('');
    setStartDate('');
    setEndDate('');
    toast.info('Filtres réinitialisés.');
  };

  // Stats
  const stats = {
    total: auditLogs.length,
    today: auditLogs.filter(
      (log) =>
        new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length,
    creations: auditLogs.filter((log) => log.action === 'creation').length,
    modifications: auditLogs.filter((log) => log.action === 'modification').length,
  };

  return (
    <MainLayout title="Audit Trail" subtitle="Historique des actions utilisateurs">
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Actions</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Aujourd'hui</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Créations</span>
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.creations}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Modifications</span>
              <Edit className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.modifications}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Description, utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Toutes</option>
                <option value="creation">Création</option>
                <option value="modification">Modification</option>
                <option value="suppression">Suppression</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>

            {/* Entity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Entité
              </label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Toutes</option>
                <option value="commande">Commande</option>
                <option value="bon-livraison">Bon de Livraison</option>
                <option value="utilisateur">Utilisateur</option>
                <option value="stock">Stock</option>
                <option value="rapport">Rapport</option>
              </select>
            </div>

            {/* User */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Utilisateur
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Tous</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.prenom} {user.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date Début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Date Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
            >
              <Filter className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter ({filteredLogs.length})
            </button>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Historique ({filteredLogs.length} actions)
          </h3>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune action trouvée</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getActionBadge(log.action)}
                      {getEntityBadge(log.entity)}
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{log.userName}</span>
                      <span className="text-gray-400">•</span>
                      <span>ID: {log.entityId}</span>
                    </div>
                    {Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Métadonnées:</p>
                        <pre className="text-xs text-gray-700">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuditTrail;
