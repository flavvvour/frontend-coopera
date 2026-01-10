import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login-page.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    console.log('Выход из системы...');

    localStorage.removeItem('username');
    localStorage.removeItem('telegram_id');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');

    if (import.meta.env.DEV) {
      sessionStorage.removeItem('is-logging-out');
      sessionStorage.removeItem('switch-to-user');
    }

    navigate('/auth');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Добро пожаловать!</h1>
          <p>Попробуй и открой для себя новую платформу с автоматизацией</p>
          <button
            className="telegram-login-btn"
            onClick={() => {
              const botUsername = 'test_coopera_bot';
              window.location.href = `https://t.me/${botUsername}?start=webapp`;
            }}
          >
            Войти через Telegram
            <div className="rect">
              <img src="src\assets\arrow.svg" alt="arrow" />
            </div>
          </button>
        </div>

        <div className="telegram-auth-section">
          {import.meta.env.DEV && (
            <div>
              <button
                type="button"
                className="telegram-login-btn-test"
                onClick={() => {
                  if (username) {
                    handleLogout();
                    setTimeout(() => {
                      navigate('/auth');
                    }, 100);
                  } else {
                    navigate('/auth');
                  }
                }}
              >
                Быстрый вход (для разработки)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
