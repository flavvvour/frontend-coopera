import React from 'react';
import { TelegramLoginButton } from '@/features/auth-by-telegram';
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
          <h2>Войти через Telegram</h2>
          <p>Быстро и безопасно</p>
          
          {/* Настоящий Telegram Widget */}
          <TelegramLoginButton 
            botUsername="smartbaskbot" // Замените на username вашего бота
            size="large"
          />
          
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
          </div> */}
        </div>
        
        <div className="login-footer">
          <button 
            className="back-btn"
            onClick={() => window.history.back()}
          >
            ← Назад на главную
          </button>
        </div>
      </div>
    </div>
  );
};