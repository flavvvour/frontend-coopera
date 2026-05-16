import React from 'react';
import './login-page.css';

export const LoginPage: React.FC = () => {
  const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            Coopera
          </div>
          <div className="login-header">
            <h1>Добро пожаловать!</h1>
            <p>Войдите через Telegram, чтобы начать работу с командой</p>
            <button
              className="telegram-login-btn"
              onClick={() => {
                window.location.href = `https://t.me/${botName}?start=login`;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c-.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
              Войти через Telegram
            </button>
          </div>
        </div>
        <div className="login-footer">© 2026 Университет им. Н.И. Лобачевского</div>
      </div>
    </div>
  );
};
