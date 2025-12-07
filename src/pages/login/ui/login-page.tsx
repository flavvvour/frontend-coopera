import React from 'react';
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
          <p>Безопасная авторизация через Telegram Mini App</p>

          {/* Кнопка для открытия Telegram Mini App */}
          <button
            className="telegram-login-btn"
            onClick={() => {
              const botUsername = 'test_coopera_bot';
              // Открываем Mini App через бота
              window.location.href = `https://t.me/${botUsername}?start=webapp`;
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
            Войти через Telegram
          </button>

          <p className="auth-hint">
            После нажатия откроется Telegram Mini App для безопасной авторизации.
            <br />
            Никто не сможет войти под чужим аккаунтом!
          </p>

          {/* Временная кнопка для тестирования БЕЗ настройки Mini App */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', fontWeight: 'bold' }}>
                ⚙️ Режим разработки
              </p>
              <button
                type="button"
                className="telegram-login-btn"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                onClick={() => {
                  // Генерируем случайный telegram_id для тестирования
                  const testTelegramId = Math.floor(Math.random() * 1000000000);
                  window.location.href = `/auth?telegram_id=${testTelegramId}&username=&first_name=Test&last_name=User`;
                }}
              >
                🚀 Быстрый вход (для разработки)
              </button>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Пропустить настройку Telegram Mini App
              </p>
            </div>
          )}

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
