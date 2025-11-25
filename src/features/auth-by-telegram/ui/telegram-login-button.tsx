import React, { useEffect, useRef, useState } from 'react';
import { useUserStore, authService } from "@/features/auth-by-telegram"
import type { TelegramUser } from '@/entities/user';
import './telegram-login-button.css';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface TelegramLoginButtonProps {
  botUsername: string;
  size?: 'large' | 'medium' | 'small';
}

export const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botUsername,
  size = 'large'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setUser = useUserStore((state) => state.setUser);
    const setLoading = useUserStore((state) => state.setLoading);
    const isLoading = useUserStore((state) => state.isLoading);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState<string>('');

  const cleanBotUsername = botUsername.replace('@', '');

  // Функция обработки авторизации - ПРЯМО ЗДЕСЬ
  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    setLoading(true);
    
    try {
      // 1. Отправляем данные на ваш бэкенд
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramUser)
      });

      if (!response.ok) {
        throw new Error('Auth failed');
      }

      const authData = await response.json();
      
      // 2. Сохраняем токен
      authService.saveToken(authData.token);
      
      // 3. Сохраняем пользователя в store
      setUser(authData.user);
      
    } catch (error) {
      console.error('Auth error:', error);
      // Можно показать ошибку пользователю
    } finally {
      setLoading(false);
    }
  };

  // Функция для ручного перехода в Telegram
  const handleManualTelegramAuth = () => {
    const telegramUrl = `https://t.me/${cleanBotUsername}?start=auth`;
    window.open(telegramUrl, '_blank');
  };

  useEffect(() => {
    if (!containerRef.current || !cleanBotUsername) return;

    // Очистка предыдущего скрипта
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Регистрируем глобальную функцию
    window.onTelegramAuth = handleTelegramAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    
    script.setAttribute('data-telegram-login', cleanBotUsername);
    script.setAttribute('data-size', size);
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    script.onload = () => {
      setScriptLoaded(true);
      setWidgetError('');
    };

    script.onerror = () => {
      console.error('Failed to load Telegram widget script');
      setScriptLoaded(true);
      setWidgetError('Не удалось загрузить виджет Telegram');
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.innerHTML = '';
      }
      window.onTelegramAuth = undefined;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanBotUsername, size]);

  if (isLoading) {
    return (
      <div className="telegram-loading">
        <div className="loading-spinner"></div>
        <span>Авторизация...</span>
      </div>
    );
  }

  return (
    <div className="telegram-auth-container">
      {/* Основной виджет */}
      <div className="widget-section">
        <div 
          ref={containerRef} 
          className={`telegram-button-container ${!scriptLoaded ? 'loading' : ''}`}
        />
        
        {widgetError && (
          <div className="error-message">
            {widgetError}
          </div>
        )}
      </div>

      {/* Fallback вариант */}
      <div className="fallback-section">
        <div className="divider">
          <span>или</span>
        </div>
        
        <button 
          className="manual-telegram-button"
          onClick={handleManualTelegramAuth}
          type="button"
        >
          <span className="telegram-icon">📱</span>
          Открыть в Telegram
        </button>
      </div>
    </div>
  );
};