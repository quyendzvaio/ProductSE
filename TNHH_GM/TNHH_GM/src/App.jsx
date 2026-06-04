import React, { useEffect, useState } from 'react';

import ChatbotLauncher from './components/common/ChatbotLauncher';
import LoginModal from './components/auth/LoginModal';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import WarehousePage from './pages/WarehousePage';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '123';
const STORAGE_KEY = 'gm-admin-auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [pendingPage, setPendingPage] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const handleOpenWarehouse = () => {
    if (isAuthenticated) {
      setCurrentPage('warehouse');
      return;
    }

    setPendingPage('warehouse');
    setIsLoginOpen(true);
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
  };

  const handleOpenLogin = () => {
    setPendingPage(null);
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setPendingPage(null);
    setIsLoginOpen(false);
  };

  const handleLogin = (username, password) => {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Sai tài khoản hoặc mật khẩu. Chỉ tài khoản admin mới được vào KHO.',
      };
    }

    setIsAuthenticated(true);
    setIsLoginOpen(false);

    if (pendingPage === 'warehouse') {
      setCurrentPage('warehouse');
    }

    setPendingPage(null);
    return { success: true };
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPendingPage(null);

    if (currentPage === 'warehouse') {
      setCurrentPage('home');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        onNavigateHome={handleNavigateHome}
        onOpenWarehouse={handleOpenWarehouse}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        {currentPage === 'warehouse' ? <WarehousePage /> : <HomePage />}
      </main>

      <Footer />
      <ChatbotLauncher />
      {isLoginOpen ? (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={handleCloseLogin}
          onSubmit={handleLogin}
        />
      ) : null}
    </div>
  );
}

export default App;
