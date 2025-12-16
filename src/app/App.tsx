import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing';
import { DashboardPage } from '@/pages/dashboard/ui/dashboard-page';
import { LoginPage } from '@/pages/login';
import { TelegramAuthPage } from '@/pages/telegram-auth/ui/telegram-auth-page';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const username = localStorage.getItem('username');

  // Если нет username - сразу редирект
  if (!username) {
    console.log('Нет username в localStorage');
    return <Navigate to="/login" replace />;
  }

  // Можно добавить дополнительную проверку
  // Например, что username не пустая строка
  if (username.trim() === '') {
    localStorage.removeItem('username');
    return <Navigate to="/login" replace />;
  }

  console.log('Пользователь авторизован:', username);
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<TelegramAuthPage />} />

        {/* Защищенный маршрут дашборда */}
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
