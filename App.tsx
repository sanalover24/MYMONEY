import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import ToastContainer from './components/ui/ToastContainer';
import { authService } from './supabase/services';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import ReportsPage from './pages/ReportsPage';
import CategoriesPage from './pages/CategoriesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import WalletPage from './pages/WalletPage';
import CreditPage from './pages/CreditPage';
import CreditDetailPage from './pages/CreditDetailPage';
import PersonCreditProfilePage from './pages/PersonCreditProfilePage';
import CreditReceivedPage from './pages/CreditReceivedPage';
import CreditReceivedDetailPage from './pages/CreditReceivedDetailPage';
import MorePage from './pages/MorePage';
import AddPage from './pages/AddPage';
import AddWalletPage from './pages/AddWalletPage';
import AddCategoryPage from './pages/AddCategoryPage';
import AddCreditPage from './pages/AddCreditPage';
import AddCreditReceivedPage from './pages/AddCreditReceivedPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setIsLoggedIn(!!user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DataProvider>
      <ThemeProvider>
        <ToastProvider>
          <SearchProvider>
            <HashRouter>
              <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {isLoggedIn ? (
                  <Route path="/" element={<Layout onLogout={handleLogout} />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    
                    {/* --- ADD ROUTES --- */}
                    <Route path="add" element={<AddPage />} />
                    <Route path="add-transaction" element={<AddTransactionPage />} />
                    <Route path="add-wallet" element={<AddWalletPage />} />
                    <Route path="add-credit" element={<AddCreditPage />} />
                    <Route path="add-credit-received" element={<AddCreditReceivedPage />} />
                    <Route path="add-category" element={<AddCategoryPage />} />

                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="credit" element={<CreditPage />} />
                    <Route path="credit/:id" element={<CreditDetailPage />} />
                    <Route path="credit/person/:name" element={<PersonCreditProfilePage />} />
                    <Route path="credit-received" element={<CreditReceivedPage />} />
                    <Route path="credit-received/:id" element={<CreditReceivedDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="more" element={<MorePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                ) : (
                  <Route path="*" element={<Navigate to="/login" replace />} />
                )}
              </Routes>
            </HashRouter>
          </SearchProvider>
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </DataProvider>
  );
}

export default App;
