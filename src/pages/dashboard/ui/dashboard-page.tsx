import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import { UserTeamsPage } from '@/components/User/userTeamsPage';
import { TeamDetailPage } from '@/components/Team/teamDetailPage';
import { PersonalStatisticsPage } from '@/components/User/PersonalStatisticsPage';
import './dashboard-page.css';

export const DashboardPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const username = localStorage.getItem('username') || 'Пользователь';

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar-wrapper">
        <Sidebar onCollapseChange={handleSidebarCollapse} />
      </div>
      <div className={`dashboard-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="dashboard-content-inner">
                <div className="content-header">
                  <h1>Добро пожаловать в Coopera!</h1>
                  <p>Инновационная платформа для управления проектами и командами</p>
                </div>

                <div className="project-description">
                  <div className="features-section">
                    <h3>О проекте</h3>
                    <div className="features-grid">
                      <div className="feature-item">
                        <div className="feature-icon">👥</div>
                        <h4>Управление командами</h4>
                        <p>
                          Создавайте команды, распределяйте роли и управляйте участниками эффективно
                        </p>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">📊</div>
                        <h4>Аналитика и статистика</h4>
                        <p>
                          Отслеживайте прогресс проекта и продуктивность участников с помощью
                          детальной аналитики
                        </p>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">🤝</div>
                        <h4>Коллаборация</h4>
                        <p>
                          Совместная работа над задачами в реальном времени с интуитивно понятным
                          интерфейсом
                        </p>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">⚡</div>
                        <h4>Автоматизация</h4>
                        <p>
                          Автоматические уведомления, отчеты и напоминания для эффективного workflow
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="getting-started">
                    <h3>Начните работу с Coopera</h3>
                    <div className="getting-started-steps">
                      <div className="step">
                        <span className="step-number">1</span>
                        <div className="step-content">
                          <h4>Создайте команду</h4>
                          <p>Перейдите в раздел "Teams" и создайте свою первую команду</p>
                        </div>
                      </div>

                      <div className="step">
                        <span className="step-number">2</span>
                        <div className="step-content">
                          <h4>Добавьте участников</h4>
                          <p>Пригласите коллег присоединиться к вашей команде</p>
                        </div>
                      </div>

                      <div className="step">
                        <span className="step-number">3</span>
                        <div className="step-content">
                          <h4>Отслеживайте прогресс</h4>
                          <p>Используйте раздел "Statistics" для мониторинга эффективности</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="teams" element={<UserTeamsPage username={username} />} />
          <Route path="teams/:teamId" element={<TeamDetailPage />} />
          <Route path="statistics" element={<PersonalStatisticsPage username={username} />} />
          {/* <Route path="/dashboard/*" element={<DashboardPage />} /> */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </div>
  );
};
