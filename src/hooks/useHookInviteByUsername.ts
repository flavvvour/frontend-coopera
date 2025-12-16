import { useState } from 'react';
import { AddMembers } from '../api/dto/memberships/memberships.api';
import { getUser } from '../api/dto/user/users.api';

export function useHookInviteByUsername() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAlreadyInTeamError, setIsAlreadyInTeamError] = useState(false);
  const [isUserNotFoundError, setIsUserNotFoundError] = useState(false);

  const inviteByUsername = async (teamId: number, username: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsAlreadyInTeamError(false);
      setIsUserNotFoundError(false);

      console.log('Приглашение пользователя по username:', { teamId, username });

      // 1. Находим пользователя по username
      const userData = await getUser(username);
      console.log('Найден пользователь:', userData);

      // 2. Добавляем в команду по ID
      const result = await AddMembers(teamId, userData.id);

      console.log('Пользователь успешно добавлен в команду:', result);
      return result;
    } catch (err) {
      let errorMessage = 'Ошибка приглашения пользователя';
      let isAlreadyInTeam = false;
      let isUserNotFound = false;

      if (err instanceof Error) {
        // Проверяем тип ошибки
        if (err.message.includes('HTTP 409')) {
          errorMessage = 'Этот пользователь уже состоит в этой команде';
          isAlreadyInTeam = true;
        } else if (
          err.message.includes('HTTP 404') ||
          err.message.includes('пользователь не найден')
        ) {
          errorMessage = 'Пользователь с таким username не найден';
          isUserNotFound = true;
        } else if (err.message.includes('HTTP 403') || err.message.includes('Forbidden')) {
          errorMessage = 'У вас нет прав для добавления участников';
        } else if (err.message.includes('HTTP 400')) {
          errorMessage = 'Некорректные данные. Проверьте введенный username';
        }

        console.error('Ошибка приглашения:', err.message);
      }

      const friendlyError = new Error(errorMessage);
      setError(friendlyError);
      setIsAlreadyInTeamError(isAlreadyInTeam);
      setIsUserNotFoundError(isUserNotFound);
      throw friendlyError;
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteByUsername,
    loading,
    error,
    isAlreadyInTeamError,
    isUserNotFoundError,
  };
}
