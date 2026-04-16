/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading components for faster initial page load
const Layout = lazy(() => import('./components/Layout'));
const Menu = lazy(() => import('./components/Menu'));
const Inventory = lazy(() => import('./components/Inventory'));
const Reports = lazy(() => import('./components/Reports'));
const Admin = lazy(() => import('./components/Admin'));
const ProductManagement = lazy(() => import('./components/ProductManagement'));
const CafeProfile = lazy(() => import('./components/CafeProfile'));
const PublicHome = lazy(() => import('./components/PublicHome'));
const Login = lazy(() => import('./components/Login'));
const OrderConfirmation = lazy(() => import('./components/OrderConfirmation'));
const Finance = lazy(() => import('./components/Finance'));
const Employees = lazy(() => import('./components/Employees'));
const NotFound = lazy(() => import('./components/NotFound'));

// Loading component for lazy fallbacks
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fadeIn">
    <div className="w-12 h-12 border-4 border-[#6F4E37]/20 border-t-[#6F4E37] rounded-full animate-spin"></div>
    <p className="text-sm font-bold text-[#8C7B6E] animate-pulse">Menyiapkan halaman...</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('bits_coffee_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('bits_coffee_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bits_coffee_user');
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/menu" element={<div className="p-4 md:p-8 max-w-7xl mx-auto"><Menu /></div>} />
          <Route path="/order-confirmation" element={<div className="p-4 md:p-8 max-w-7xl mx-auto"><OrderConfirmation /></div>} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected App Routes (Staff & Admin) */}
          <Route 
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            {/* Shared routes */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Admin-only routes */}
            <Route 
              path="/products" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><ProductManagement /></ProtectedRoute>} 
            />
            <Route 
              path="/inventory" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><Inventory /></ProtectedRoute>} 
            />
            <Route 
              path="/finance" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><Finance /></ProtectedRoute>} 
            />
            <Route 
              path="/employees" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><Employees /></ProtectedRoute>} 
            />
            <Route 
              path="/reports" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><Reports /></ProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<ProtectedRoute user={user} allowedRoles={['Admin']}><CafeProfile /></ProtectedRoute>} 
            />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}



