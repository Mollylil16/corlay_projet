import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import MainLayout from '../components/layout/MainLayout';
import { Shield, Check, X, CreditCard, Star, Crown } from 'lucide-react';

const ICON_MAP = { shield: Shield, star: Star, crown: Crown };

const Abonnements = () => {
  const { users, currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const activeUsersCount = users.filter((u) => u.actif).length;
  const maxFreeUsers = 2;
  const currentPlanId = subscription?.planId ?? (activeUsersCount <= maxFreeUsers ? 'free' : null);
  const isFreePlan = currentPlanId === 'free' || !currentPlanId;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [plansData, subData] = await Promise.all([
          api.get('/plans'),
          api.get('/subscriptions/me').catch(() => null),
        ]);
        if (cancelled) return;
        setPlans(Array.isArray(plansData) ? plansData : []);
        setSubscription(subData && subData.planId ? subData : null);
      } catch (e) {
        if (!cancelled) {
          toast.error('Impossible de charger les offres.');
          setPlans([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const plansForUi = plans.map((p) => ({
    ...p,
    icon: ICON_MAP[p.icon] || Shield,
    current: p.id === currentPlanId,
  }));

  const handleSubscribe = (plan) => {
    if (plan.id === 'free') {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }
    if (plan.id === 'enterprise') {
      toast.info('Contactez-nous : commercial@corlay.ci');
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    try {
      const endDate = selectedPlan.period === 'An' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null;
      await api.post('/subscriptions', { planId: selectedPlan.id, endDate });
      setSubscription({ planId: selectedPlan.id, plan: selectedPlan, endDate });
      toast.success('Abonnement Premium activé avec succès.');
      setShowPaymentModal(false);
      setSelectedPlan(null);
    } catch (e) {
      toast.error(e?.data?.message || 'Erreur lors de l\'activation.');
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      gray: {
        border: 'border-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        button: 'bg-gray-500 hover:bg-gray-600',
        badge: 'bg-gray-100 text-gray-700',
      },
      orange: {
        border: 'border-orange-400',
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        text: 'text-orange-700',
        button: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        badge: 'bg-orange-500 text-white',
      },
      purple: {
        border: 'border-purple-400',
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        text: 'text-purple-700',
        button: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
        badge: 'bg-purple-500 text-white',
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <MainLayout title="Abonnements & Licences" subtitle="Gérez votre forfait et vos options">
      <div className="p-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement des offres...</div>
        ) : (
          <>
            {/* Statut actuel */}
            <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Statut Actuel</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full font-semibold ${isFreePlan ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isFreePlan ? 'Plan Gratuit' : 'Plan Premium'}
                    </span>
                    <div className="text-sm text-gray-600">
                      {activeUsersCount} / {isFreePlan ? maxFreeUsers : '∞'} utilisateurs actifs
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {subscription?.endDate && (
                    <>
                      <div className="text-sm text-gray-600 mb-1">Expire le</div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(subscription.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isFreePlan && activeUsersCount >= maxFreeUsers && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 mb-1">Limite Atteinte</h4>
                      <p className="text-sm text-orange-700 mb-3">
                        Vous avez atteint la limite de {maxFreeUsers} utilisateurs. Passez à Premium pour débloquer des utilisateurs illimités.
                      </p>
                      <button
                        onClick={() => handleSubscribe(plansForUi.find((p) => p.id === 'premium'))}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
                      >
                        Passer à Premium
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Plans (depuis API) */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nos Forfaits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansForUi.map((plan) => {
                const Icon = plan.icon;
                const colors = getColorClasses(plan.color);
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-6 border-2 ${plan.recommended ? 'border-orange-400 shadow-2xl scale-105' : colors.border} transition-all hover:shadow-xl`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg">
                          RECOMMANDÉ
                        </span>
                      </div>
                    )}
                    {plan.current && (
                      <div className="absolute top-6 right-6">
                        <span className={`px-3 py-1 ${colors.badge} text-xs font-bold rounded-full`}>ACTUEL</span>
                      </div>
                    )}

                    <div className={`${colors.bg} rounded-xl p-5 mb-6`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 ${plan.recommended ? 'bg-gradient-to-br from-orange-500 to-orange-600' : `bg-${plan.color}-500`} rounded-xl flex items-center justify-center text-white`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900">{plan.name}</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        {plan.price != null ? (
                          <>
                            <span className="text-4xl font-bold text-gray-900">{Number(plan.price).toLocaleString()}</span>
                            <span className="text-gray-600">FCFA</span>
                            <span className="text-sm text-gray-500">/ {plan.period}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">{plan.period}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {(plan.features || []).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={plan.current}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${plan.current ? 'bg-gray-300 cursor-not-allowed' : colors.button}`}
                    >
                      {plan.current ? 'Plan Actuel' : plan.id === 'enterprise' ? 'Nous Contacter' : 'Choisir ce Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modal paiement */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Confirmation de Paiement</h3>
              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Forfait</span>
                  <span className="font-bold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Période</span>
                  <span className="font-semibold text-gray-900">{selectedPlan.period}</span>
                </div>
                {selectedPlan.price != null && (
                  <div className="pt-4 border-t border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-orange-600">
                        {Number(selectedPlan.price).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de Paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="p-4 border-2 border-orange-500 rounded-lg bg-orange-50 flex items-center justify-center gap-2 font-semibold text-orange-700">
                    <CreditCard className="w-5 h-5" />
                    Carte
                  </button>
                  <button type="button" className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center gap-2 font-semibold text-gray-700">
                    Mobile Money
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 font-medium"
                >
                  Confirmer le Paiement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Abonnements;
