import React, { useEffect, useState } from 'react';
import './telegram-auth-page.css';

type AuthState =
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'error'; message: string };

function buildCallbackUrl(webApp: TelegramWebApp): string | null {
  const user = webApp.initDataUnsafe?.user;
  if (user) {
    const params = new URLSearchParams({
      tg_id: user.id.toString(),
      username: user.username ?? user.first_name ?? `tg_${user.id}`,
    });
    return `${window.location.origin}/auth-callback?${params}`;
  }

  // Резервный вариант — парсим raw initData
  try {
    const params = new URLSearchParams(webApp.initData);
    const userJson = params.get('user');
    if (userJson) {
      const parsed = JSON.parse(decodeURIComponent(userJson));
      const p = new URLSearchParams({
        tg_id: parsed.id.toString(),
        username: parsed.username ?? parsed.first_name ?? `tg_${parsed.id}`,
      });
      return `${window.location.origin}/auth-callback?${p}`;
    }
  } catch {
    // не удалось распарсить
  }

  return null;
}

export const TelegramAuthPage: React.FC = () => {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      setState({ status: 'error', message: 'Откройте приложение через Telegram' });
      return;
    }

    webApp.ready();
    webApp.expand();

    const url = buildCallbackUrl(webApp);
    if (url) {
      setState({ status: 'ready', url });
    } else {
      setState({ status: 'error', message: 'Не удалось получить данные пользователя из Telegram' });
    }
  }, []);

  const handleOpen = (url: string) => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.openLink(url);
      setTimeout(() => webApp.close(), 800);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="telegram-auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c-.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
          </div>

          {state.status === 'loading' && <p>Загрузка...</p>}

          {state.status === 'error' && <p>{state.message}</p>}

          {state.status === 'ready' && (
            <>
              <h1>Добро пожаловать в Coopera</h1>
              <p>Нажмите кнопку ниже чтобы войти</p>
              <button
                className="auth-submit-btn primary"
                onClick={() => handleOpen(state.url)}
              >
                Войти в приложение
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
