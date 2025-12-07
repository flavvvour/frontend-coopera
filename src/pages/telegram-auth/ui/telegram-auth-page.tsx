import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@/features/auth-by-telegram';
import { apiClient } from '@/shared/api';
import './telegram-auth-page.css';

export const TelegramAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  // Получаем данные из URL параметров или Telegram WebApp
  useEffect(() => {
    // Сначала проверяем URL параметры (для обычного бота)
    const telegramIdParam = searchParams.get('telegram_id');
    const usernameParam = searchParams.get('username');

    if (telegramIdParam) {
      setTelegramId(Number(telegramIdParam));
      if (usernameParam) {
        setUsername(usernameParam);
      }
      return;
    }

    // Если параметров нет, проверяем Telegram WebApp (для Mini App)
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const telegramUser = tg.initDataUnsafe?.user;

      if (telegramUser) {
        setTelegramId(telegramUser.id);
        if (telegramUser.username) {
          setUsername(telegramUser.username);
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Введите никнейм Telegram');
      return;
    }


    const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
    if (!usernameRegex.test(username)) {
      setError('Никнейм должен содержать 5-32 символа (латиница, цифры, _)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let userTelegramId = telegramId;

      // Если telegram_id не получен из параметров, пытаемся получить из WebApp
      if (!userTelegramId && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const telegramUser = tg.initDataUnsafe?.user;

        if (telegramUser) {
          userTelegramId = telegramUser.id;
        }
      }

      // Если всё ещё нет telegram_id, используем временное значение
      // (в реальном приложении здесь должна быть ошибка или другая логика)
      if (!userTelegramId) {
        // Для тестирования генерируем временный ID на основе username
        userTelegramId = Math.floor(Math.random() * 1000000);
        console.warn('Используется временный telegram_id для тестирования:', userTelegramId);
      }

      // Создаем или получаем пользователя на бэкенде
      const userData = {
        telegram_id: userTelegramId,
        username: username.trim(),
        first_name: '',
        last_name: '',
      };

      let user;
      
      // Сначала пытаемся получить пользователя по telegram_id
      try {
        console.log('Trying getUser with telegram_id:', userTelegramId);
        user = await apiClient.getUser(userTelegramId);
        console.log('User found by telegram_id:', user);
      } catch (getUserError) {
        console.log('getUser error:', getUserError);
        // Если пользователя нет (404), пытаемся создать нового
        if ((getUserError as { response?: { status?: number } })?.response?.status === 404) {
          try {
            console.log('Trying createUser:', userData);
            user = await apiClient.createUser(userData);
            console.log('User created:', user);
          } catch (createError) {
            console.log('createUser error:', createError);
            // Если получили 409 (Conflict) - пользователь существует, но с другим telegram_id
            // Пытаемся получить по username
            if ((createError as { response?: { status?: number } })?.response?.status === 409) {
              try {
                console.log('Trying getUserByUsername:', username.trim());
                user = await apiClient.getUserByUsername(username.trim());
                console.log('User found by username:', user);
              } catch (getUserByUsernameError) {
                console.error('getUserByUsername error:', getUserByUsernameError);
                throw new Error('Пользователь с таким никнеймом уже существует');
              }
            } else {
              throw createError;
            }
          }
        } else {
          throw getUserError;
        }
      }

      console.log('Final user to save:', user);

      // Сохраняем пользователя в store (включая команды, если они есть)
      const userToSave = {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        photo_url: user.photo_url,
      };
      
      console.log('Saving user to store:', userToSave);
      setUser(userToSave);
      console.log('User saved, navigating to dashboard...');

      // Переходим на главную страницу
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      setError('Ошибка авторизации. Попробуйте еще раз');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p>Введите ваш никнейм Telegram для продолжения</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Никнейм Telegram</label>
            <div className="input-wrapper">
              <span className="input-prefix">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="username"
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
            </div>
            <span className="input-hint">Ваш никнейм из профиля Telegram</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={isLoading || !username}>
            {isLoading ? 'Входим...' : 'Продолжить'}
          </button>
        </form>

        <div className="auth-info">
          <p>
            <strong>Зачем это нужно?</strong>
          </p>
          <p>Никнейм используется для идентификации в командах и совместной работе</p>
        </div>
      </div>
    </div>
  );
};
