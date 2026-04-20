import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Dashboard from './pages/Dashboard';
import VotingBooth from './pages/VotingBooth';
import Success from './pages/Success';
import Admin from './pages/Admin';
import AdminAdvanced from './pages/AdminAdvanced';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/super-admin-login" element={<SuperAdminLogin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booth" element={<VotingBooth />} />
              <Route path="/success" element={<Success />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/advanced" element={<AdminAdvanced />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
