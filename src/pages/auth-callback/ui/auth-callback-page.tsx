import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/api';
import type { ApiError } from '@/shared/api/types';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tgId = params.get('tg_id');
    const username = params.get('username');

    if (!tgId || !username) {
      navigate('/login', { replace: true });
      return;
    }

    const telegramId = Number(tgId);

    const login = async () => {
      try {
        await apiClient.createUser({ telegramId, username });
      } catch (err: unknown) {
        const apiError = err as ApiError;
        // 409 = пользователь уже существует — это нормально
        if (apiError?.response?.status !== 409) {
          throw err;
        }
      }

      localStorage.setItem('username', username);
      localStorage.setItem('telegram_id', tgId);
      navigate('/dashboard', { replace: true });
    };

    login().catch(err => {
      console.error('Auth callback error:', err);
      setError('Ошибка авторизации. Попробуйте снова.');
    });
  }, [navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/login'}>На главную</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Авторизация...</p>
    </div>
  );
};
