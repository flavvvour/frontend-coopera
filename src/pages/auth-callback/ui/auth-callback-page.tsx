import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/api';
import { getUserByParam } from '@/api/dto/user/users.api';
import type { ApiError } from '@/shared/api/types';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tgId = params.get('tg_id');
    const username = params.get('username');
    const photoUrl = params.get('photo_url') ?? undefined;

    if (!tgId || !username) {
      navigate('/login', { replace: true });
      return;
    }

    const telegramId = Number(tgId);

    const login = async () => {
      try {
        await apiClient.createUser({ telegramId, username, photoUrl });
      } catch (err: unknown) {
        const apiError = err as ApiError;
        // 409 = пользователь уже существует — это нормально
        if (apiError?.response?.status !== 409) {
          throw err;
        }
      }

      sessionStorage.setItem('username', username);
      sessionStorage.setItem('telegram_id', tgId);
      if (photoUrl) sessionStorage.setItem('photo_url', photoUrl);

      // Get user ID for activity API
      try {
        const userData = await getUserByParam({ username });
        if (userData?.id) {
          sessionStorage.setItem('user_id', String(userData.id));
        }
      } catch {
        // non-fatal
      }

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
