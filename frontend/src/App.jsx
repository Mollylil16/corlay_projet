import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import RealtimeNotifier from './components/common/RealtimeNotifier';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Commandes from './pages/Commandes';
import BonsLivraison from './pages/BonsLivraison';
import ExpeditionDnD from './pages/ExpeditionDnD';
import Suivi from './pages/Suivi';
import GestionStocks from './pages/GestionStocks';
import Actions from './pages/Actions';
import RapportsNew from './pages/RapportsNew';
import Transporteurs from './pages/Transporteurs';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import Abonnements from './pages/Abonnements';
import Validations from './pages/Validations';
import Facturation from './pages/Facturation';
import AuditTrail from './pages/AuditTrail';
import AnalyseStocks from './pages/AnalyseStocks';
import Incidents from './pages/Incidents';
import './style.css';

function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <AppProvider>
          <RealtimeNotifier />
        <Router>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes protégées */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/commandes" element={<ProtectedRoute requiredPermission="voir-commandes"><Commandes /></ProtectedRoute>} />
            <Route path="/bons-livraison" element={<ProtectedRoute requiredPermission="dispatcher"><BonsLivraison /></ProtectedRoute>} />
            <Route path="/expedition" element={<ProtectedRoute requiredPermission="dispatcher"><ExpeditionDnD /></ProtectedRoute>} />
            <Route path="/suivi" element={<ProtectedRoute requiredPermission="voir-suivi"><Suivi /></ProtectedRoute>} />
            <Route path="/stocks" element={<ProtectedRoute requiredPermission="voir-stocks"><GestionStocks /></ProtectedRoute>} />
            <Route path="/actions" element={<ProtectedRoute><Actions /></ProtectedRoute>} />
            <Route path="/rapports" element={<ProtectedRoute requiredPermission="voir-rapports"><RapportsNew /></ProtectedRoute>} />
            <Route path="/transporteurs" element={<ProtectedRoute requiredPermission="voir-transporteurs"><Transporteurs /></ProtectedRoute>} />
            <Route path="/utilisateurs" element={<ProtectedRoute requiredPermission="all"><GestionUtilisateurs /></ProtectedRoute>} />
            <Route path="/abonnements" element={<ProtectedRoute requiredPermission="all"><Abonnements /></ProtectedRoute>} />
            <Route path="/validations" element={<ProtectedRoute requiredPermission="voir-validations"><Validations /></ProtectedRoute>} />
            <Route path="/facturation" element={<ProtectedRoute requiredPermission="voir-rapports"><Facturation /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute requiredPermission="all"><AuditTrail /></ProtectedRoute>} />
            <Route path="/analyse-stocks" element={<ProtectedRoute requiredPermission="voir-stocks"><AnalyseStocks /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute requiredPermission="voir-incidents"><Incidents /></ProtectedRoute>} />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </AppProvider>
      </AuditProvider>
    </AuthProvider>
  );
}

export default App;
