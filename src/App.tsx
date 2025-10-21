import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthLayout } from './templates/AuthLayout';
import { ProtectedLayout } from './templates/ProtectedLayout';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

// Lazy loading de páginas para mejorar el rendimiento
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const BillsPage = lazy(() => import('./pages/BillsPage').then(module => ({ default: module.BillsPage })));
const NewBillPage = lazy(() => import('./pages/NewBillPage').then(module => ({ default: module.NewBillPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(module => ({ default: module.UsersPage })));

// Componente de carga mientras se cargan las páginas
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path="/signup" element={
              <AuthLayout>
                <SignupPage />
              </AuthLayout>
            } />
            <Route path="/" element={
              <ProtectedLayout>
                <RoleProtectedRoute allowedRoles={['area_coordinator']}>
                  <DashboardPage />
                </RoleProtectedRoute>
              </ProtectedLayout>
            } />
            <Route path="/bills" element={
              <ProtectedLayout>
                <RoleProtectedRoute allowedRoles={['area_coordinator']}>
                  <BillsPage />
                </RoleProtectedRoute>
              </ProtectedLayout>
            } />
            <Route path="/new-bill" element={
              <ProtectedLayout>
                <NewBillPage />
              </ProtectedLayout>
            } />
            <Route path="/reports" element={
              <ProtectedLayout>
                <ReportsPage />
              </ProtectedLayout>
            } />
            <Route path="/users" element={
              <ProtectedLayout>
                <RoleProtectedRoute allowedRoles={['area_coordinator']}>
                  <UsersPage />
                </RoleProtectedRoute>
              </ProtectedLayout>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
