import React from 'react';
import './login-page.css';

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.491 11.74 18.51 5.64c.635-.232 1.189.155.983 1.118l-2.19 10.32c-.162.73-.594.906-1.205.563l-3.28-2.418-1.584 1.524c-.175.175-.322.322-.66.322l.236-3.338 6.077-5.49c.264-.234-.058-.364-.41-.13L4.128 13.887l-3.22-.998c-.7-.22-.714-.7.147-1.035z" fill="currentColor"/>
    </svg>
  );
}

export const LoginPage: React.FC = () => {
  const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME;

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden>
        <div className="login-blob login-blob--1" />
        <div className="login-blob login-blob--2" />
        <div className="login-blob login-blob--3" />
        <div className="login-blob login-blob--4" />
      </div>
      <div className="login-container pop-in">
        <div className="login-card">
          <div className="login-logo">
            Coopera<span className="login-logo-dot">.</span>
          </div>
          <h1 className="login-title">Добро пожаловать!</h1>
          <p className="login-sub">Войдите через Telegram, чтобы начать работу с командой</p>
          <button
            className="login-tg-btn"
            onClick={() => { window.location.href = `https://t.me/${botName}?start=login`; }}
          >
            <TelegramIcon size={22} />
            Войти через Telegram
          </button>
        </div>
      </div>
    </div>
  );
};
