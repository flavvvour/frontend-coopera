import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login-page.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username'); // Получаем текущего пользователя

  const handleLogout = () => {
    console.log('Выход из системы...');

    // 1. Сначала очищаем все данные
    localStorage.removeItem('username');
    localStorage.removeItem('telegram_id');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');

    if (import.meta.env.DEV) {
      sessionStorage.removeItem('is-logging-out');
      sessionStorage.removeItem('switch-to-user');
    }

    console.log('✅ Данные очищены');

    // 2. Вместо reload() - переходим на страницу выбора пользователя
    navigate('/auth');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Coopera</h1>
          <p>Вход в систему</p>
        </div>

        {/* БЛОК ИНФОРМАЦИИ О ТЕКУЩЕМ ПОЛЬЗОВАТЕЛЕ */}
        {username && (
          <div
            className="current-user-section"
            style={{
              marginBottom: '30px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
            }}
          >
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Вы уже вошли в систему</h3>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Текущий пользователь: <strong>@{username}</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✅ Продолжить как @{username}
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  navigate('/auth');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                🔄 Выйти и выбрать другого пользователя
              </button>
            </div>

            {import.meta.env.DEV && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                ⚡ В режиме разработки вы можете переключаться между тестовыми пользователями
              </p>
            )}
          </div>
        )}

        <div className="telegram-auth-section">
          <h2>Войти через Telegram</h2>
          <p>Безопасная авторизация через Telegram Mini App</p>

          {/* Кнопка для открытия Telegram Mini App */}
          <button
            className="telegram-login-btn"
            onClick={() => {
              const botUsername = 'test_coopera_bot';
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

          {/* Временная кнопка для тестирования */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <p
                style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                }}
              >
                ⚙️ Режим разработки
              </p>
              <button
                type="button"
                className="telegram-login-btn"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                }}
                onClick={() => {
                  // Если уже есть пользователь, очищаем данные
                  if (username) {
                    handleLogout();
                    // Через секунду переходим на auth
                    setTimeout(() => {
                      navigate('/auth');
                    }, 100);
                  } else {
                    // Если нет пользователя, просто переходим
                    navigate('/auth');
                  }
                }}
              >
                🚀 Быстрый вход (для разработки)
              </button>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Пропустить настройку Telegram Mini App
              </p>
            </div>
          )}
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
