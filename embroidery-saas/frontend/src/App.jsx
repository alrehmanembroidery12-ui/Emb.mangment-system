import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Machines from './pages/Machines';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import CoreLogicBranding from './components/CoreLogicBranding';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route 
                      path="workers" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Operator']}>
                          <Workers />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="machines" element={<Machines />} />
                    <Route path="orders" element={<Orders />} />
                    <Route 
                      path="inventory" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Operator']}>
                          <Inventory />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="billing" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Operator']}>
                          <Billing />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="settings" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <CoreLogicBranding />
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
