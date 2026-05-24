import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/api';
import { ApiError } from '@/shared/api/errors';
import { getUserByParam } from '@/entities/user';
import { useAuthStore } from '@/shared/store';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
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
        if (!(err instanceof ApiError && err.status === 409)) {
          throw err;
        }
      }

      setUser({ username, telegramId: tgId, photoUrl: photoUrl ?? undefined });

      try {
        const userData = await getUserByParam({ username });
        if (userData?.id) {
          setUser({ userId: String(userData.id) });
        }
      } catch { /* ignore */ }

      navigate('/dashboard', { replace: true });
    };

    login().catch(err => {
      console.error('Auth callback error:', err);
      setError('Ошибка авторизации. Попробуйте снова.');
    });
  }, [navigate, setUser]);

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
