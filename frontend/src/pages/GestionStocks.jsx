import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import DepotCardWithTanks from '../components/stocks/DepotCardWithTanks';
import StockAlertsWidget from '../components/stocks/StockAlertsWidget';
import StockMovementsTable from '../components/stocks/StockMovementsTable';
import StockValueWidget from '../components/stocks/StockValueWidget';
import { Plus, X, Building2 } from 'lucide-react';

const TABS = { depots: 'Cuves & Dépôts', psl: 'Relevés stock commun', achat: 'Commandes d\'achat' };

const GestionStocks = () => {
  const {
    stocks,
    adjustStock,
    createDepot,
    relevesPSL,
    commandesAchat,
    getStockTheoriqueActuel,
    addRelevePSL,
    addCommandeAchat,
    refetch,
  } = useApp();
  const { hasPermission } = useAuth();
  const canAdjustStocks = hasPermission('ajuster-stocks');
  
  const depotsFormatted = (stocks.depots || []).map(depot => ({
    id: depot.id,
    name: depot.nom, // Mapper nom → name
    location: `LOC-${depot.id.toUpperCase()}`,
    status: depot.statut, // Mapper statut → status
    tanks: depot.tanks, // Les tanks sont déjà au bon format
  }));
  
  const depots = depotsFormatted;

  const totalStockData = (() => {
    let total = 0;
    const byType = {};
    depots.forEach((d) => {
      (d.tanks || []).forEach((t) => {
        total += t.current || 0;
        const key = (t.type || t.name || 'Autre').toLowerCase().includes('diesel') ? 'Diesel' : (t.type || t.name || '').toLowerCase().includes('essence') ? 'Essence' : 'Autre';
        byType[key] = (byType[key] || 0) + (t.current || 0);
      });
    });
    const totalM = total >= 1e6 ? (total / 1e6).toFixed(2) + 'M' : total >= 1e3 ? (total / 1e3).toFixed(1) + 'k' : String(total);
    const breakdown = Object.entries(byType).map(([name], i) => ({
      name,
      percentage: total ? Math.round(((byType[name] || 0) / total) * 100) : 0,
      color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500'][i] || 'bg-gray-500',
    }));
    return { totalVolume: totalM, breakdown: breakdown.length ? breakdown : [{ name: 'Aucun', percentage: 100, color: 'bg-gray-300' }] };
  })();

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentDepotId, setAdjustmentDepotId] = useState('');
  const [adjustmentTankId, setAdjustmentTankId] = useState('');
  const [adjustmentPercentage, setAdjustmentPercentage] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [showCreateDepotModal, setShowCreateDepotModal] = useState(false);
  const [createDepotForm, setCreateDepotForm] = useState({
    nom: '',
    statut: 'operationnel',
    tanks: [{ tankNumber: 'TANK 01', name: 'Diesel (B7)', type: 'diesel', capacity: '500000', percentage: '0' }],
  });
  const [creatingDepot, setCreatingDepot] = useState(false);
  const [stockTab, setStockTab] = useState('depots');
  const [stockTheorique, setStockTheorique] = useState({ diesel: 0, essence: 0 });
  const [pslForm, setPslForm] = useState({ date: new Date().toISOString().split('T')[0], typeCarburant: 'diesel', quantiteDeclareePSL: '', commentaire: '' });
  const [achatForm, setAchatForm] = useState({ date: new Date().toISOString().split('T')[0], fournisseur: '', typeCarburant: 'diesel', quantiteCommandee: '', quantiteRecue: '', commentaire: '' });
  const [savingPsl, setSavingPsl] = useState(false);
  const [savingAchat, setSavingAchat] = useState(false);

  React.useEffect(() => {
    if (stockTab === 'psl') getStockTheoriqueActuel().then(setStockTheorique).catch(() => setStockTheorique({ diesel: 0, essence: 0 }));
  }, [stockTab, getStockTheoriqueActuel]);

  const selectedDepot = depots.find((d) => d.id === adjustmentDepotId);
  const tanksOfDepot = selectedDepot?.tanks || [];
  const selectedTank = tanksOfDepot.find((t) => t.id === adjustmentTankId);

  const handleOpenAdjustmentModal = () => {
    if (!depots.length) {
      toast.info('Aucun dépôt. Les données sont chargées depuis le serveur.');
      return;
    }
    const firstDepot = depots[0];
    const firstTank = firstDepot?.tanks?.[0];
    setAdjustmentDepotId(firstDepot.id);
    setAdjustmentTankId(firstTank?.id || '');
    setAdjustmentPercentage(firstTank != null ? String(firstTank.percentage ?? 0) : '');
    setIsAdjustmentModalOpen(true);
  };

  const handleDepotChange = (depotId) => {
    setAdjustmentDepotId(depotId);
    const depot = depots.find((d) => d.id === depotId);
    const firstTank = depot?.tanks?.[0];
    setAdjustmentTankId(firstTank?.id || '');
    setAdjustmentPercentage(firstTank != null ? String(firstTank.percentage ?? 0) : '');
  };

  const handleTankChange = (tankId) => {
    setAdjustmentTankId(tankId);
    const tank = tanksOfDepot.find((t) => t.id === tankId);
    setAdjustmentPercentage(tank != null ? String(tank.percentage ?? 0) : '');
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjustmentDepotId || !adjustmentTankId) {
      toast.error('Veuillez sélectionner un dépôt et une cuve.');
      return;
    }
    const pct = Number(adjustmentPercentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('Le pourcentage doit être entre 0 et 100.');
      return;
    }
    setAdjusting(true);
    try {
      await adjustStock(adjustmentDepotId, adjustmentTankId, pct);
      toast.success(`Niveau mis à jour : ${selectedTank?.name || 'Cuve'} à ${pct} %.`);
      setIsAdjustmentModalOpen(false);
    } catch (_) {}
    setAdjusting(false);
  };

  const handleCreateDepotSubmit = async (e) => {
    e.preventDefault();
    if (!createDepotForm.nom.trim()) {
      toast.error('Nom du dépôt requis.');
      return;
    }
    if (!createDepotForm.tanks.length || !createDepotForm.tanks.every((t) => t.name?.trim() && Number(t.capacity) > 0)) {
      toast.error('Au moins une cuve avec nom et capacité est requise.');
      return;
    }
    setCreatingDepot(true);
    try {
      await createDepot(createDepotForm);
      setShowCreateDepotModal(false);
      setCreateDepotForm({
        nom: '',
        statut: 'operationnel',
        tanks: [{ tankNumber: 'TANK 01', name: 'Diesel (B7)', type: 'diesel', capacity: '500000', percentage: '0' }],
      });
    } catch (_) {}
    setCreatingDepot(false);
  };

  const addTankToCreate = () => {
    setCreateDepotForm((f) => ({
      ...f,
      tanks: [...f.tanks, { tankNumber: `TANK ${f.tanks.length + 1}`, name: '', type: 'diesel', capacity: '100000', percentage: '0' }],
    }));
  };

  const updateCreateTank = (index, field, value) => {
    setCreateDepotForm((f) => ({
      ...f,
      tanks: f.tanks.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));
  };

  const removeCreateTank = (index) => {
    if (createDepotForm.tanks.length <= 1) return;
    setCreateDepotForm((f) => ({ ...f, tanks: f.tanks.filter((_, i) => i !== index) }));
  };

  const handleSubmitRelevePSL = async (e) => {
    e.preventDefault();
    const q = parseInt(pslForm.quantiteDeclareePSL, 10);
    if (Number.isNaN(q) || q < 0) {
      toast.error('Quantité déclarée invalide');
      return;
    }
    setSavingPsl(true);
    try {
      await addRelevePSL({ date: pslForm.date, typeCarburant: pslForm.typeCarburant, quantiteDeclareePSL: q, commentaire: pslForm.commentaire || undefined });
      setPslForm((f) => ({ ...f, quantiteDeclareePSL: '', commentaire: '' }));
    } finally {
      setSavingPsl(false);
    }
  };

  const handleSubmitCommandeAchat = async (e) => {
    e.preventDefault();
    const qc = parseInt(achatForm.quantiteCommandee, 10);
    const qr = parseInt(achatForm.quantiteRecue, 10);
    if (Number.isNaN(qc) || qc < 0 || Number.isNaN(qr) || qr < 0) {
      toast.error('Quantités invalides');
      return;
    }
    setSavingAchat(true);
    try {
      await addCommandeAchat({
        date: achatForm.date,
        fournisseur: achatForm.fournisseur || undefined,
        typeCarburant: achatForm.typeCarburant,
        quantiteCommandee: qc,
        quantiteRecue: qr,
        commentaire: achatForm.commentaire || undefined,
      });
      setAchatForm((f) => ({ ...f, quantiteCommandee: '', quantiteRecue: '', commentaire: '' }));
    } finally {
      setSavingAchat(false);
    }
  };

  return (
    <MainLayout title="Gestion des Stocks" subtitle="Niveaux de réserve stratégique">
      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStockTab(key)}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${stockTab === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {stockTab === 'depots' && (
        <>
        {/* Header Actions (lecture seule si pas ajuster-stocks) */}
        {canAdjustStocks && (
          <div className="mb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateDepotModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm transition-colors"
            >
              <Building2 className="w-5 h-5" />
              CRÉER UN DÉPÔT
            </button>
            <button
              type="button"
              onClick={handleOpenAdjustmentModal}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" />
              AJUSTEMENT STOCK
            </button>
          </div>
        )}

        {/* Depots Grid - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {depots.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600 font-medium mb-1">Aucun dépôt enregistré</p>
              <p className="text-gray-500 text-sm">Créez vos vrais dépôts Corlay avec le bouton <strong>CRÉER UN DÉPÔT</strong> ci-dessus. Les alertes, mouvements et valeur de stock s’afficheront à partir de vos données.</p>
            </div>
          ) : (
            depots.map((depot) => (
              <DepotCardWithTanks key={depot.id} depot={depot} />
            ))
          )}
        </div>

        {/* Alerts Widget - Below Depots */}
        <div className="mb-6">
          <StockAlertsWidget />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Movements Table - 2 columns */}
          <div className="lg:col-span-2">
            <StockMovementsTable />
          </div>

          {/* Stock Value Widget - 1 column */}
          <div>
            <StockValueWidget
              totalVolume={totalStockData.totalVolume}
              breakdown={totalStockData.breakdown}
            />
          </div>
        </div>
        </>
        )}

        {/* Onglet Relevés stock commun — stock déclaré par le gestionnaire (PSL, GESTOCI, etc.) vs stock théorique (logiciel) */}
        {stockTab === 'psl' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Saisissez les niveaux de stock déclarés par le gestionnaire des réservoirs communs (PSL, GESTOCI, etc. — ex. email du matin). Le stock théorique est calculé à partir des cuves enregistrées dans le logiciel (ex. 50 000 L − 20 000 L livrés = 30 000 L). Comparez pour analyser les écarts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-sm font-medium text-gray-700">Stock théorique actuel (logiciel)</span>
                <p className="text-lg mt-1">Diesel : <strong>{(stockTheorique.diesel ?? 0).toLocaleString('fr-FR')} L</strong></p>
                <p className="text-lg">Essence : <strong>{(stockTheorique.essence ?? 0).toLocaleString('fr-FR')} L</strong></p>
              </div>
            </div>
            {canAdjustStocks && (
              <form onSubmit={handleSubmitRelevePSL} className="flex flex-wrap items-end gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={pslForm.date} onChange={(e) => setPslForm((f) => ({ ...f, date: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type carburant</label>
                  <select value={pslForm.typeCarburant} onChange={(e) => setPslForm((f) => ({ ...f, typeCarburant: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2">
                    <option value="diesel">Diesel</option>
                    <option value="essence">Essence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock déclaré par le gestionnaire (L)</label>
                  <input type="number" min={0} value={pslForm.quantiteDeclareePSL} onChange={(e) => setPslForm((f) => ({ ...f, quantiteDeclareePSL: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-32" placeholder="ex. 28000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                  <input type="text" value={pslForm.commentaire} onChange={(e) => setPslForm((f) => ({ ...f, commentaire: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-48" placeholder="Explication écart" />
                </div>
                <button type="submit" disabled={savingPsl} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">{savingPsl ? 'Enregistrement…' : 'Enregistrer le relevé'}</button>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Stock déclaré (L)</th>
                    <th className="text-right p-2">Stock théorique (L)</th>
                    <th className="text-right p-2">Écart (L)</th>
                    <th className="text-left p-2">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {(relevesPSL || []).slice(0, 30).map((r) => {
                    const ecart = (r.quantiteDeclareePSL ?? 0) - (r.stockTheorique ?? 0);
                    return (
                      <tr key={r.id} className="border-t border-gray-100">
                        <td className="p-2">{r.date}</td>
                        <td className="p-2">{r.typeCarburant}</td>
                        <td className="p-2 text-right">{(r.quantiteDeclareePSL ?? 0).toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right">{(r.stockTheorique ?? 0).toLocaleString('fr-FR')}</td>
                        <td className={`p-2 text-right font-medium ${ecart !== 0 ? (ecart > 0 ? 'text-green-600' : 'text-red-600') : ''}`}>{ecart.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-gray-600">{r.commentaire || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(relevesPSL || []).length === 0 && <p className="p-4 text-gray-500 text-center">Aucun relevé. Saisissez le premier ci-dessus.</p>}
            </div>
          </div>
        )}

        {/* Onglet Commandes d'achat — quantité commandée vs quantité reçue */}
        {stockTab === 'achat' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Tracez les commandes d'achat : quantité commandée auprès du fournisseur et quantité effectivement reçue. Utile pour suivre les écarts (manques) au quotidien.
            </p>
            {canAdjustStocks && (
              <form onSubmit={handleSubmitCommandeAchat} className="flex flex-wrap items-end gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={achatForm.date} onChange={(e) => setAchatForm((f) => ({ ...f, date: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <input type="text" value={achatForm.fournisseur} onChange={(e) => setAchatForm((f) => ({ ...f, fournisseur: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-40" placeholder="Société" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type carburant</label>
                  <select value={achatForm.typeCarburant} onChange={(e) => setAchatForm((f) => ({ ...f, typeCarburant: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2">
                    <option value="diesel">Diesel</option>
                    <option value="essence">Essence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité commandée (L)</label>
                  <input type="number" min={0} value={achatForm.quantiteCommandee} onChange={(e) => setAchatForm((f) => ({ ...f, quantiteCommandee: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-32" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité reçue (L)</label>
                  <input type="number" min={0} value={achatForm.quantiteRecue} onChange={(e) => setAchatForm((f) => ({ ...f, quantiteRecue: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-32" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                  <input type="text" value={achatForm.commentaire} onChange={(e) => setAchatForm((f) => ({ ...f, commentaire: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 w-40" />
                </div>
                <button type="submit" disabled={savingAchat} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">{savingAchat ? 'Enregistrement…' : 'Enregistrer'}</button>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Fournisseur</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Commandé (L)</th>
                    <th className="text-right p-2">Reçu (L)</th>
                    <th className="text-right p-2">Écart (L)</th>
                    <th className="text-left p-2">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {(commandesAchat || []).slice(0, 30).map((c) => {
                    const ecart = (c.quantiteRecue ?? 0) - (c.quantiteCommandee ?? 0);
                    return (
                      <tr key={c.id} className="border-t border-gray-100">
                        <td className="p-2">{c.date}</td>
                        <td className="p-2">{c.fournisseur || '—'}</td>
                        <td className="p-2">{c.typeCarburant}</td>
                        <td className="p-2 text-right">{(c.quantiteCommandee ?? 0).toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-right">{(c.quantiteRecue ?? 0).toLocaleString('fr-FR')}</td>
                        <td className={`p-2 text-right font-medium ${ecart !== 0 ? (ecart >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>{ecart.toLocaleString('fr-FR')}</td>
                        <td className="p-2 text-gray-600">{c.commentaire || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(commandesAchat || []).length === 0 && <p className="p-4 text-gray-500 text-center">Aucune commande d'achat. Enregistrez la première ci-dessus.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajustement manuel du stock */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !adjusting && setIsAdjustmentModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ajustement manuel du stock</h3>
              <button type="button" onClick={() => !adjusting && setIsAdjustmentModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Choisissez le dépôt, la cuve et le nouveau niveau (%). Les litres sont recalculés automatiquement.</p>
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
                <select
                  value={adjustmentDepotId}
                  onChange={(e) => handleDepotChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuve</label>
                <select
                  value={adjustmentTankId}
                  onChange={(e) => handleTankChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={!tanksOfDepot.length}
                >
                  <option value="">— Sélectionner —</option>
                  {tanksOfDepot.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.tankNumber || t.id} — Cap. {Number(t.capacity || 0).toLocaleString('fr-FR')} L
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={adjustmentPercentage}
                  onChange={(e) => setAdjustmentPercentage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0–100"
                />
                {selectedTank && adjustmentPercentage !== '' && !Number.isNaN(Number(adjustmentPercentage)) && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {Math.round((Number(adjustmentPercentage) / 100) * (selectedTank.capacity || 0)).toLocaleString('fr-FR')} L
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !adjusting && setIsAdjustmentModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {adjusting ? 'Enregistrement...' : 'Valider l\'ajustement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Créer un dépôt */}
      {showCreateDepotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !creatingDepot && setShowCreateDepotModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Créer un dépôt Corlay</h3>
              <button type="button" onClick={() => !creatingDepot && setShowCreateDepotModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateDepotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du dépôt *</label>
                <input
                  type="text"
                  required
                  value={createDepotForm.nom}
                  onChange={(e) => setCreateDepotForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Dépôt Corlay Abidjan Nord"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={createDepotForm.statut}
                  onChange={(e) => setCreateDepotForm((f) => ({ ...f, statut: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="operationnel">Opérationnel</option>
                  <option value="niveau-bas">Niveau bas</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Cuves *</label>
                  <button type="button" onClick={addTankToCreate} className="text-sm text-orange-600 hover:underline">
                    + Ajouter une cuve
                  </button>
                </div>
                <div className="space-y-3">
                  {createDepotForm.tanks.map((tank, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Cuve {index + 1}</span>
                        {createDepotForm.tanks.length > 1 && (
                          <button type="button" onClick={() => removeCreateTank(index)} className="text-xs text-red-600 hover:underline">
                            Supprimer
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={tank.tankNumber}
                          onChange={(e) => updateCreateTank(index, 'tankNumber', e.target.value)}
                          className="px-2 py-1.5 border rounded text-sm"
                          placeholder="N° cuve"
                        />
                        <input
                          type="text"
                          required
                          value={tank.name}
                          onChange={(e) => updateCreateTank(index, 'name', e.target.value)}
                          className="px-2 py-1.5 border rounded text-sm"
                          placeholder="Nom (ex: Diesel B7)"
                        />
                        <select
                          value={tank.type}
                          onChange={(e) => updateCreateTank(index, 'type', e.target.value)}
                          className="px-2 py-1.5 border rounded text-sm"
                        >
                          <option value="diesel">Diesel</option>
                          <option value="essence">Essence</option>
                        </select>
                        <input
                          type="number"
                          required
                          min={1}
                          value={tank.capacity}
                          onChange={(e) => updateCreateTank(index, 'capacity', e.target.value)}
                          className="px-2 py-1.5 border rounded text-sm"
                          placeholder="Capacité (L)"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={tank.percentage}
                          onChange={(e) => updateCreateTank(index, 'percentage', e.target.value)}
                          className="px-2 py-1.5 border rounded text-sm col-span-2"
                          placeholder="Niveau initial %"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !creatingDepot && setShowCreateDepotModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingDepot}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {creatingDepot ? 'Création...' : 'Créer le dépôt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default GestionStocks;
