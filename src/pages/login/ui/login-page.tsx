import React from 'react';
import './login-page.css';

export const LoginPage: React.FC = () => {
  const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Добро пожаловать!</h1>
          <p>Попробуй и открой для себя новую платформу с автоматизацией</p>
          <button
            className="telegram-login-btn"
            onClick={() => {
              window.location.href = `https://t.me/${botName}`;
            }}
          >
            Войти через Telegram
            <div className="rect">
              <img src="/src/assets/arrow.svg" alt="arrow" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
