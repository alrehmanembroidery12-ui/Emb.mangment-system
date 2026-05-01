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
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
                        <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                          <Workers />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="machines" element={<Machines />} />
                    <Route path="orders" element={<Orders />} />
                    <Route 
                      path="inventory" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                          <Inventory />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="billing" 
                      element={
                        <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
