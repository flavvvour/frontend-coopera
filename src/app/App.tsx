import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard/ui/dashboard-page';
import { LoginPage } from '@/pages/login';
import { TelegramAuthPage } from '@/pages/telegram-auth/ui/telegram-auth-page';
import { AuthCallbackPage } from '@/pages/auth-callback/ui/auth-callback-page';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const username = sessionStorage.getItem('username');

  if (!username || username.trim() === '') {
    sessionStorage.removeItem('username');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Если приложение открыто внутри Telegram (Mini App) — сразу на /auth
const LoginRoute: React.FC = () => {
  const isTelegramWebApp = Boolean(window.Telegram?.WebApp?.initData);
  if (isTelegramWebApp) {
    return <Navigate to="/auth" replace />;
  }
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/auth" element={<TelegramAuthPage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
