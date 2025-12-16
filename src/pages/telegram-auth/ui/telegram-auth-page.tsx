// pages/telegram-auth-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '@/shared/api';
import { useHookGetUser } from '@/hooks/useHookGetUser'; // Импортируем ваш хук
import type { ApiError } from '@/shared/api/types';
import { TEST_USERS, setCurrentTestUser, clearTestUser } from '@/utils/test-users';
import './telegram-auth-page.css';

export const TelegramAuthPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Используем хук для получения пользователя по username
  const { data: userData, loading: userLoading, error: userError } = useHookGetUser(username || '');

  // Проверяем, пришли ли мы после выхода
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isAfterLogout = searchParams.get('logout') === 'true';

    if (isAfterLogout) {
      console.log('Пришли после выхода - очищаем данные');
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

  // Эффект для автоматического продолжения после получения данных пользователя
  useEffect(() => {
    if (authCompleted) {
      console.log('Авторизация завершена, проверяем данные...');

      if (userData && !userLoading && !userError) {
        console.log('Пользователь загружен, переходим в дашборд');

        // Сохраняем username в localStorage для дальнейшего использования
        localStorage.setItem('username', username);
        localStorage.setItem('telegram_id', telegramId?.toString() || '');

        // Сохраняем выбранного тестового пользователя
        if (process.env.NODE_ENV === 'development' && telegramId) {
          setCurrentTestUser(telegramId);
          sessionStorage.removeItem('is-logging-out');
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else if (userError) {
        console.log('Пользователь не найден, но продолжаем');
        localStorage.setItem('username', username);
        localStorage.setItem('telegram_id', telegramId?.toString() || '');

        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    }
  }, [authCompleted, userData, userLoading, userError, username, telegramId, navigate]);

  // Автоматическая авторизация
  const handleAutoAuth = useCallback(
    async (selectedTelegramId?: number, selectedUsername?: string) => {
      const authTelegramId = selectedTelegramId || telegramId;
      const authUsername = selectedUsername || username;

      if (!authTelegramId || !authUsername) {
        setError('Не указаны Telegram ID или username');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        let userResponse;

        // Проверяем, есть ли пользователь в нашей базе через ваш хук

        // Если пользователь не найден (userError), создаем нового через API
        if (userError) {
          console.log('Пользователь не найден - создаем нового');
          try {
            userResponse = await apiClient.createUser({
              telegramId: authTelegramId,
              username: authUsername.trim(),
            });
            console.log('User created:', userResponse);

            // Устанавливаем флаг, что авторизация выполнена
            // Теперь хук useHookGetUser начнет загружать нового пользователя
            setAuthCompleted(true);
          } catch (createError: unknown) {
            const apiError = createError as ApiError;
            if (apiError.response?.status === 409) {
              console.log('User already exists (409) - пользователь существует');
              setAuthCompleted(true);
            } else {
              throw createError;
            }
          }
        } else {
          console.log('Пользователь найден или загружается');
          setAuthCompleted(true);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка авторизации');
        setIsLoading(false);
      }
    },
    [telegramId, username, userError]
  );

  // Авторизация выбранного пользователя
  const handleSelectUser = (user: (typeof TEST_USERS)[0]) => {
    setTelegramId(user.telegramId);
    setUsername(user.username);
    setShowUserSwitcher(false);
    handleAutoAuth(user.telegramId, user.username);
  };

  // В режиме разработки: используем тестовых пользователей
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logoutFlag = sessionStorage.getItem('is-logging-out');
      const switchFlag = sessionStorage.getItem('switch-to-user');

      if (logoutFlag === 'true' || switchFlag) {
        console.log('🚫 Пользователь вышел или хочет переключиться, показываем выбор');
        setShowUserSwitcher(true);

        // Очищаем флаги
        sessionStorage.removeItem('is-logging-out');
        sessionStorage.removeItem('switch-to-user');
        return;
      }

      // ЕСЛИ пользователь уже есть в localStorage - не авторизуем автоматически!
      const existingUsername = localStorage.getItem('username');
      if (existingUsername) {
        console.log('👤 Пользователь уже выбран:', existingUsername);
        // Показываем выбор пользователя или просто информацию
        setShowUserSwitcher(true);
        return;
      }

      // ТОЛЬКО если нет пользователя - показываем выбор
      setShowUserSwitcher(true);
    }
  }, []);

  // Если идет загрузка пользователя после авторизации
  if (authCompleted && (userLoading || isLoading)) {
    return (
      <div className="telegram-auth-page">
        <div className="auth-container">
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Загрузка данных пользователя...</p>
          </div>
        </div>
      </div>
    );
  }

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
                      {user.role === 'manager' ? 'Менеджер' : 'Участник'}
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
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </div>
            <h1>Откройте приложение в Telegram</h1>
            <p>Это приложение работает только внутри Telegram</p>
          </div>
        </div>
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
            disabled={isLoading || !telegramId || !username}
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
          {userError && !error && (
            <div className="info-message">
              Пользователь @{username} не найден. Будет создан новый профиль.
            </div>
          )}
        </div>

        <div className="auth-info">
          <p>
            <strong>Режим:</strong>{' '}
            {process.env.NODE_ENV === 'development' ? 'Разработка' : 'Продакшн'}
          </p>
          <p>• Telegram ID: {telegramId || 'не получен'}</p>
          <p>• Username: @{username}</p>
          <p>• Статус: {userLoading ? 'Загрузка...' : userError ? 'Не найден' : 'Готово'}</p>
        </div>
      </div>
    </div>
  );
};
