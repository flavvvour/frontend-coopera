// components/sidebar/sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';

import dashboardIcon from '../../../assets/dashboard-logo.svg';
import teamIcon from '../../../assets/team-logo.svg';
import settingsIcon from '../../../assets/settings-logo.svg';
import burgerIcon from '../../../assets/burger-logo.svg';
import exitIcon from '../../../assets/exit-logo.svg';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SidebarProps {
  // Убираем пропсы, так как навигация будет через Router
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon, path: '/dashboard' },
    { id: 'teams', label: 'Teams', icon: teamIcon, path: '/dashboard/teams' },
    { id: 'settings', label: 'Settings', icon: settingsIcon, path: '/dashboard/settings' },
  ];

  // Функция для проверки активного раздела
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Хедер с кнопкой сворачивания */}
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {!isCollapsed && <h2>Coopera</h2>}
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <img src={burgerIcon} alt="menu" className="sidebar-toggle-icon" />
          </button>
        </div>
      </div>

      {/* Навигация */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'nav-item--active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <img src={item.icon} alt={item.label} className="nav-item__icon" />
                {!isCollapsed && <span className="nav-item__label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Футер */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">Пользователь</span>
              <span className="user-points">100 баллов</span>
            </div>
          )}
          <button className="logout-icon-btn" aria-label="Выйти">
            <img src={exitIcon} alt="exit" className="logout-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};
