import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, X } from 'lucide-react';
import SystemStatusBadge from '../common/SystemStatusBadge';
import { useApp } from '../../context/AppContext';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { alertes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const nonLues = alertes.filter((a) => !a.lu);
  const lastAlertes = [...alertes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/commandes?search=${encodeURIComponent(q)}`);
    else navigate('/commandes');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-3xl font-serif font-semibold text-gray-900">{title}</h1>
            <SystemStatusBadge />
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher commande, client, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </form>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {nonLues.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[8px] h-2 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center px-1">
                  {nonLues.length > 9 ? '9+' : nonLues.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Notifications</span>
                  <button type="button" onClick={() => setNotifOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {lastAlertes.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">Aucune notification</p>
                  ) : (
                    lastAlertes.map((a) => (
                      <div
                        key={a.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!a.lu ? 'bg-orange-50/50' : ''}`}
                      >
                        <p className="font-medium text-gray-900 text-sm">{a.titre}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setNotifOpen(false); navigate('/stocks'); }}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Voir les alertes stocks →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
