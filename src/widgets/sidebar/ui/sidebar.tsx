// components/sidebar/sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SidebarProps {
  // Убираем пропсы, так как навигация будет через Router
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: '📊', path: '/dashboard' },
    { id: 'tasks', label: 'Задачи', icon: '📋', path: '/dashboard/tasks' },
    { id: 'teams', label: 'Команды', icon: '👥', path: '/dashboard/teams' },
    { id: 'settings', label: 'Настройки', icon: '⚙️', path: '/dashboard/settings' },
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
          {!isCollapsed && (
            <>
              <h2>Coopera</h2>
              <p>Трекер задач</p>
            </>
          )}
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? '➡️' : '⬅️'}
          </button>
        </div>
      </div>
      
      {/* Навигация */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'nav-item--active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-item__icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-item__label">{item.label}</span>
                )}
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
        </div>
        {!isCollapsed && (
          <button className="logout-btn">
            Выйти
          </button>
        )}
      </div>
    </div>
  );
};