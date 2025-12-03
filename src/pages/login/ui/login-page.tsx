import React from 'react';
// import { TelegramLoginButton } from '@/features/auth-by-telegram';
import './login-page.css';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Coopera</h1>
          <p>Вход в систему</p>
        </div>

        <div className="telegram-auth-section">
          {/* <h2>Войти через Telegram</h2> */}
          {/* <p>Быстро и безопасно</p> */}

          {/* Для локальной разработки используем кнопку с deep link */}
          <button
            className="telegram-login-btn"
            onClick={() => {
              const botUsername = 'test_coopera_bot'; // Ваш бот
              window.open(`https://t.me/${botUsername}?start=auth`, '_blank');
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
            Войти через Telegram
          </button>

          <p className="auth-hint">
            Нажмите кнопку, чтобы открыть бота в Telegram и авторизоваться
          </p>

          {/* Для продакшена раскомментируйте виджет после настройки домена в BotFather */}
          {/* 
          <TelegramLoginButton 
            botUsername="test_coopera_bot"
            size="large"
          />
          */}

          {/* <div className="login-features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Мгновенный вход</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Без паролей</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👥</span>
              <span>Доступ к командам</span>
            </div>
          </div>*/}
        </div>

        <div className="login-footer">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Назад на главную
          </button>
        </div>
      </div>
    </div>
  );
};
