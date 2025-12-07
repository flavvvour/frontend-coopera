import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard';
import { LoginPage } from '@/pages/login';
import { TelegramAuthPage } from '@/pages/telegram-auth';
import { useUserStore } from '@/features/auth-by-telegram';

// Защищенный роут - требует авторизации
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<TelegramAuthPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
