import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Package,
  MapPin,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  Truck,
  Users,
  CreditCard,
  CheckSquare,
  Receipt,
  Shield,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react';

const LOGO_SRC = '/WhatsApp%20Image%202026-02-21%20at%2000.44.46.jpeg';

const Sidebar = () => {
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/', permission: null },
    { icon: ShoppingCart, label: 'Commandes', path: '/commandes', permission: 'voir-commandes' },
    { icon: CheckSquare, label: 'Validations', path: '/validations', permission: 'voir-validations' },
    { icon: FileText, label: 'Bons de Livraison', path: '/bons-livraison', permission: 'dispatcher' },
    { icon: Package, label: 'Expédition', path: '/expedition', permission: 'dispatcher' },
    { icon: MapPin, label: 'Suivi en Temps Réel', path: '/suivi', permission: 'voir-suivi' },
    { icon: Database, label: 'Gestion des Stocks', path: '/stocks', permission: 'voir-stocks' },
    { icon: TrendingUp, label: 'Analyse Stocks', path: '/analyse-stocks', permission: 'voir-stocks' },
    { icon: AlertTriangle, label: 'Incidents', path: '/incidents', permission: 'voir-incidents' },
    { icon: Activity, label: 'Actions', path: '/actions', permission: null },
    { icon: BarChart3, label: 'Rapports', path: '/rapports', permission: 'voir-rapports' },
    { icon: Receipt, label: 'Facturation', path: '/facturation', permission: 'voir-rapports' },
    { icon: Truck, label: 'Transporteurs', path: '/transporteurs', permission: 'voir-transporteurs' },
    { icon: Users, label: 'Utilisateurs', path: '/utilisateurs', permission: 'all' },
    { icon: CreditCard, label: 'Abonnements', path: '/abonnements', permission: 'all' },
    { icon: Shield, label: 'Audit Trail', path: '/audit', permission: 'all' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#1e293b] h-full text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src={LOGO_SRC} alt="CorlayFlow" className="w-10 h-10 object-contain rounded-lg" />
        <span className="text-xl font-semibold">CorlayFlow</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Filtrer selon permissions
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
            {currentUser?.prenom?.[0]}{currentUser?.nom?.[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium truncate">
              {currentUser?.prenom} {currentUser?.nom}
            </div>
            <div className="text-xs text-orange-400 uppercase">
              {currentUser?.role?.split('-')[0]}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="sidebar-item mt-2 w-full text-left hover:bg-red-600/10 border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
