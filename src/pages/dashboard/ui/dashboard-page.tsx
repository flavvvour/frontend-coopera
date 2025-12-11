// pages/dashboard-page.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import { UserComponentPage } from '@/components/User/userComponent';
import { TeamDetail } from '@/pages/team-detail';
import { useUserStats } from '@/features/dashboard/hooks/useUserStats';
import './dashboard-page.css';

const DashboardHome: React.FC = () => {
  const { stats, loading, error } = useUserStats();

  useEffect(() => {
    if (!loading) {
      console.log('📊 Статистика на дашборде:', stats);
    }
  }, [stats, loading]);

  if (loading) {
    return (
      <div className="dashboard-content-inner">
        <div className="content-header">
          <h1>Обзор проектов</h1>
          <p>Загрузка статистики...</p>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card loading">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="loading-text"></div>
                <div className="loading-subtext"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content-inner">
        <div className="content-header">
          <h1>Обзор проектов</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content-inner">
      <div className="content-header">
        <h1>Обзор проектов</h1>
        <p>Мониторинг ваших задач и прогресса</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.assignedTasks}</h3>
            <p>Назначено на меня</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>В процессе</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Завершено</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>{stats.totalPoints}</h3>
            <p>Мои баллы</p>
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="stats-grid" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalTasks}</h3>
            <p>Всего задач в командах</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-info">
            <h3>{stats.createdTasks}</h3>
            <p>Создано мной</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar onCollapseChange={handleSidebarCollapse} />
      <div
        className={`dashboard-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      >
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/teams" element={<UserComponentPage username={'flavvvour'} />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};
