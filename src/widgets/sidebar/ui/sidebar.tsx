// components/sidebar/sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHookGetUser } from '@/hooks/useHookGetUser'; // Добавляем ваш хук
import { TEST_USERS } from '@/utils/test-users';
import './sidebar.css';

import dashboardIcon from '../../../assets/dashboard-logo.svg';
import teamIcon from '../../../assets/team-logo.svg';
import settingsIcon from '../../../assets/settings-logo.svg';
import statisticsIcon from '../../../assets/statistics-logo.svg';
import burgerIcon from '../../../assets/burger-logo.svg';
import exitIcon from '../../../assets/exit-logo.svg';

interface SidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Получаем username из localStorage или используем дефолтный
  const username = localStorage.getItem('username') || 'flavvvour';

  // Используем ваш хук для получения пользователя
  const { data: user, loading: userLoading, error: userError } = useHookGetUser(username);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon, path: '/dashboard' },
    { id: 'teams', label: 'Teams', icon: teamIcon, path: '/dashboard/teams' },
    { id: 'statistics', label: 'Statistics', icon: statisticsIcon, path: '/dashboard/statistics' }, // Добавьте эту строку
    { id: 'settings', label: 'Settings', icon: settingsIcon, path: '/dashboard/settings' },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  // Функция очистки пользователя
  const clearUser = () => {
    localStorage.removeItem('username');
    // Можно добавить очистку других данных если нужно
  };

  // ВЫХОД И ПЕРЕКЛЮЧЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ЗАМЕНИТЕ эту функцию в sidebar.tsx:
  // В sidebar.tsx - замените функцию handleLogout
  const handleLogout = async () => {
    console.group('🚪 Logout Process');

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Режим разработки: выход из системы');

        // 1. Очищаем данные пользователя
        clearUser();
        console.log('✅ Данные пользователя очищены');

        // 2. НЕ устанавливаем флаг выхода (это для выбора пользователя)
        // sessionStorage.removeItem('is-logging-out'); // ← УДАЛИТЕ ЭТО!

        // 3. Редирект на ГЛАВНУЮ страницу (LandingPage)
        console.log('🔄 Редирект на главную страницу');
        navigate('/'); // ← ИЗМЕНИТЕ С /auth НА /
      } else {
        console.log('🚫 В продакшн режиме');

        const telegram = window.Telegram;
        if (telegram?.WebApp) {
          telegram.WebApp.showAlert(
            'Выйти из приложения?',
            'Для смены аккаунта закройте Mini App и откройте заново с другим Telegram аккаунтом.',
            () => {
              clearUser();
              telegram.WebApp.close();
            }
          );
        } else {
          clearUser();
          navigate('/'); // ← ИЗМЕНИТЕ С /auth НА /
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при выходе:', error);
      clearUser();
      navigate('/'); // ← ИЗМЕНИТЕ С /auth НА /
    }

    console.groupEnd();
  };

  // Быстрое переключение пользователя (только в разработке)
  // Исправьте функцию быстрого переключения:
  const handleQuickSwitch = () => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!user) return;

    // Находим следующего пользователя
    const currentIndex = TEST_USERS.findIndex(u => u.telegramId === user.telegramID);
    const nextIndex = (currentIndex + 1) % TEST_USERS.length;
    const nextUser = TEST_USERS[nextIndex];

    console.log(`🔄 Быстрое переключение на: @${nextUser.username}`);

    // Очищаем текущего пользователя
    clearUser();

    // Устанавливаем данные следующего пользователя
    sessionStorage.setItem(
      'switch-to-user',
      JSON.stringify({
        telegramId: nextUser.telegramId,
        username: nextUser.username,
      })
    );

    navigate('/auth?switch=true');
  };

  if (userLoading && !user) {
    return (
      <div className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            {!isCollapsed && <h2 className="sidebar-title">Coopera</h2>}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <img src={burgerIcon} alt="Меню" className="sidebar-toggle-icon" />
            </button>
          </div>
        </div>
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          {!isCollapsed && <p>Загрузка...</p>}
        </div>
      </div>
    );
  }

  // Если ошибка загрузки пользователя
  if (userError && !user) {
    return (
      <div className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            {!isCollapsed && <h2 className="sidebar-title">Coopera</h2>}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <img src={burgerIcon} alt="Меню" className="sidebar-toggle-icon" />
            </button>
          </div>
        </div>
        <div className="error-placeholder">
          <p>Ошибка загрузки</p>
          <button onClick={() => navigate('/auth')} className="auth-btn">
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Боковая панель навигации"
    >
      {/* Хедер с кнопкой сворачивания */}
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          {!isCollapsed && (
            <h2 className="sidebar-title" aria-label="Название приложения">
              Coopera
            </h2>
          )}
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
            aria-expanded={!isCollapsed}
          >
            <img src={burgerIcon} alt="Меню" className="sidebar-toggle-icon" />
          </button>
        </div>
      </div>

      {/* Навигация */}
      <nav className="sidebar-nav" aria-label="Основная навигация">
        <ul>
          {menuItems.map(item => {
            const active = isActive(item.path);
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-item ${active ? 'nav-item--active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Проверяем, является ли иконка эмодзи или путем к файлу */}
                  {typeof item.icon === 'string' && item.icon.length <= 2 ? (
                    // Если это эмодзи (короткая строка)
                    <span className="nav-item__emoji">{item.icon}</span>
                  ) : (
                    // Если это путь к файлу
                    <img src={item.icon} alt={`${item.label} иконка`} className="nav-item__icon" />
                  )}
                  {!isCollapsed && <span className="nav-item__label">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Футер с информацией о пользователе */}
      <div className="sidebar-footer">
        <div className="user-info">
          {!isCollapsed ? (
            <>
              <div className="user-details">
                {/* ВСЁ В ОДНУ СТРОКУ БЕЗ ПРОБЕЛОВ */}
                <div className="user-name-container">
                  <span className="user-name">{user?.username || 'Гость'}</span>
                </div>
              </div>
              <div className="user-actions">
                {/* Кнопка быстрого переключения (только в разработке) */}
                {process.env.NODE_ENV === 'development' && user && (
                  <button
                    className="switch-user-btn"
                    onClick={handleQuickSwitch}
                    aria-label="Быстрое переключение пользователя"
                    title="Быстро переключить пользователя"
                  >
                    <span className="switch-icon">🔄</span>
                  </button>
                )}
                {/* Кнопка выхода */}
                <button
                  className="logout-icon-btn"
                  onClick={handleLogout}
                  aria-label="Выйти из системы"
                  title={process.env.NODE_ENV === 'development' ? 'Сменить пользователя' : 'Выйти'}
                >
                  <img src={exitIcon} alt="Иконка выхода" className="logout-icon" />
                </button>
              </div>
            </>
          ) : (
            /* Свернутое состояние - только кнопка выхода */
            <div className="user-actions">
              <button
                className="logout-icon-btn"
                onClick={handleLogout}
                aria-label="Выйти из системы"
                title="Выйти"
              >
                <img src={exitIcon} alt="Иконка выхода" className="logout-icon" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
