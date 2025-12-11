// pages/telegram-auth-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/shared/api';
// import { useUserStore } from '@/entities/user/user-store';
import type { ApiError } from '@/shared/api/types';
import { TEST_USERS, setCurrentTestUser, clearTestUser } from '@/utils/test-users';
import './telegram-auth-page.css';

export const TelegramAuthPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // const setUser = useUserStore(state => state.setUser);

  // Проверяем, пришли ли мы после выхода
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isAfterLogout = searchParams.get('logout') === 'true';

    if (isAfterLogout) {
      console.log('🚫 Пришли после выхода - очищаем данные');
      clearTestUser();
      // Очищаем флаг через 10 секунд
      setTimeout(() => {
        sessionStorage.removeItem('is-logging-out');
      }, 10000);
    }
  }, [location]);

  // В режиме разработки: используем тестовых пользователей
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logoutFlag = sessionStorage.getItem('is-logging-out');

      if (logoutFlag === 'true') {
        console.log('🚫 Пользователь вышел, показываем выбор');
        setShowUserSwitcher(true);
        return;
      }

      // По умолчанию - первый пользователь (менеджер)
      setTelegramId(TEST_USERS[0].telegramId);
      setUsername(TEST_USERS[0].username);
    }
  }, []);

  // Автоматическая авторизация
  const handleAutoAuth = useCallback(
    async (selectedTelegramId?: number, selectedUsername?: string) => {
      const authTelegramId = selectedTelegramId || telegramId;
      const authUsername = selectedUsername || username;

      if (!authTelegramId || !authUsername) return;

      setIsLoading(true);
      setError('');

      try {
        let userResponse;
        try {
          userResponse = await apiClient.getUser(authTelegramId);
          console.log('User found by telegram_id:', userResponse);
        } catch (getError: unknown) {
          const apiError = getError as ApiError;
          if (apiError.response?.status === 404) {
            console.log('User not found (404) - создаем нового');
          } else {
            throw getError;
          }
        }

        if (!userResponse) {
          try {
            userResponse = await apiClient.createUser({
              telegramId: authTelegramId,
              username: authUsername.trim(),
            });
            console.log('User created:', userResponse);
          } catch (createError: unknown) {
            const apiError = createError as ApiError;
            if (apiError.response?.status === 409) {
              console.log('User already exists (409), trying to get again...');
              userResponse = await apiClient.getUser(authTelegramId);
              if (!userResponse) {
                throw new Error('Пользователь существует, но не найден после 409 ошибки');
              }
            } else {
              throw createError;
            }
          }
        }

        const userToSave = {
          id: userResponse.id,
          telegramId: userResponse.telegramId,
          username: userResponse.username,
          createdAt: userResponse.createdAt || new Date().toISOString(),
        };

        console.log('Saving user to store:', userToSave);
        // setUser(userToSave);

        // Сохраняем выбранного тестового пользователя
        if (process.env.NODE_ENV === 'development') {
          setCurrentTestUser(authTelegramId);
          sessionStorage.removeItem('is-logging-out'); // Убираем флаг выхода
        }

        navigate('/dashboard');
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка авторизации');
      } finally {
        setIsLoading(false);
      }
    },
    [telegramId, username, navigate]
  );

  // Авторизация выбранного пользователя
  const handleSelectUser = (user: (typeof TEST_USERS)[0]) => {
    setTelegramId(user.telegramId);
    setUsername(user.username);
    setShowUserSwitcher(false);
    handleAutoAuth(user.telegramId, user.username);
  };

  // Если в режиме разработки и нужно выбрать пользователя
  if (process.env.NODE_ENV === 'development' && showUserSwitcher) {
    return (
      <div className="telegram-auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </div>
            <h1>Выберите пользователя</h1>
            <p>для тестирования разных ролей</p>
          </div>

          <div className="user-switcher">
            <div className="user-list">
              {TEST_USERS.map(user => (
                <button
                  key={user.telegramId}
                  className="user-option"
                  onClick={() => handleSelectUser(user)}
                  disabled={isLoading}
                >
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="user-details">
                    <strong>@{user.username}</strong>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'manager' ? '👑 Менеджер' : '👤 Участник'}
                    </span>
                    <span className="user-description">{user.description}</span>
                  </div>
                </button>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="auth-info">
            <p>
              <em>Вы можете переключаться между пользователями для тестирования разных функций</em>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Если нет Telegram Web App, показываем инструкцию
  const telegramWebApp = window.Telegram?.WebApp;
  if (!telegramWebApp && process.env.NODE_ENV !== 'development') {
    return (
      <div className="telegram-auth-page">
        <div className="auth-container">{/* ... инструкция для продакшн */}</div>
      </div>
    );
  }

  return (
    <div className="telegram-auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
          </div>
          <h1>Добро пожаловать в Coopera</h1>
          <p>Вход через Telegram</p>

          {telegramId && (
            <div className="telegram-info">
              <p>
                Telegram ID: <code>{telegramId}</code>
              </p>
              <p>Username: @{username}</p>
            </div>
          )}
        </div>

        {/* Кнопка для входа */}
        <div className="auth-actions">
          <button
            onClick={() => handleAutoAuth()}
            className="auth-submit-btn primary"
            disabled={isLoading}
          >
            {isLoading ? 'Входим...' : `Войти как @${username}`}
          </button>

          {/* В режиме разработки показываем кнопку смены пользователя */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setShowUserSwitcher(true)}
              className="auth-submit-btn secondary"
              disabled={isLoading}
            >
              🔄 Сменить пользователя
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Авторизация...</p>
          </div>
        )}

        <div className="auth-info">
          <p>
            <strong>Режим:</strong>{' '}
            {process.env.NODE_ENV === 'development' ? 'Разработка' : 'Продакшн'}
          </p>
          <p>• Telegram ID: {telegramId || 'не получен'}</p>
          <p>• Username: @{username}</p>
        </div>
      </div>
    </div>
  );
};
