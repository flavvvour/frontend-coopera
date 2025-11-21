// pages/dashboard-page.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import { Teams } from '@/pages/teams';
import { KanbanBoard } from '@/features/task';
import './dashboard-page.css';

export const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <Sidebar />
      
      <main className="dashboard-main">
        <Routes>
          {/* Эти маршруты будут относительно /dashboard/ */}
          <Route index element={<DashboardHome />} /> {/* /dashboard */}
          <Route path="tasks" element={<TasksSection />} /> {/* /dashboard/tasks */}
          <Route path="teams/*" element={<TeamsSection />} /> {/* /dashboard/teams */}
          <Route path="settings" element={<SettingsSection />} /> {/* /dashboard/settings */}
        </Routes>
      </main>
    </div>
  );
};

// Компоненты секций остаются без изменений
const DashboardHome: React.FC = () => (
  <div className="dashboard-content">
    <div className="content-header">
      <h1>📊 Обзор проектов</h1>
      <p>Мониторинг ваших задач и прогресса</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>24</h3>
          <p>Всего задач</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>8</h3>
          <p>В процессе</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <h3>12</h3>
          <p>Завершено</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-info">
          <h3>340</h3>
          <p>Мои баллы</p>
        </div>
      </div>
    </div>
  </div>
);

const TasksSection: React.FC = () => (
  <div className="dashboard-content">
    <KanbanBoard 
      tasks={[]} 
      onUpdateTask={() => {}} 
      onCreateTask={() => {}} 
      projectId="1" 
      teamMembers={[]} 
    />
  </div>
);

const TeamsSection: React.FC = () => (
  <div className="dashboard-content">
    <Teams />
  </div>
);


const SettingsSection: React.FC = () => (
  <div className="dashboard-content">
    <h1>⚙️ Настройки</h1>
    <p>Настройки профиля и системы</p>
  </div>
);