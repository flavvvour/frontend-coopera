// src/app/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { useHookGetUser } from '@/hooks/useHookGetUser'; // Импортируем хук
import { DashboardPage } from '@/pages/dashboard';
import { LoginPage } from '@/pages/login';
import { UserComponentPage } from '@/components/User/userComponent';
import { TeamDetail } from '@/pages/team-detail';
import { TelegramAuthPage } from '@/pages/telegram-auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Просто проверяем, есть ли username в localStorage
  const username = localStorage.getItem('username') || 'flavvvour'; // или ваш фиксированный username

  const { data: user, loading, error } = useHookGetUser(username);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const username = localStorage.getItem('username');

  if (username) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />

        <Route
          path="/auth"
          element={
            <AuthRoute>
              <TelegramAuthPage />
            </AuthRoute>
          }
        />

        {/* Защищенные маршруты */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <UserComponentPage username={localStorage.getItem('username') || 'flavvvour'} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute>
              <TeamDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
