import { useState } from 'react';
import { AddMembers } from '../api/dto/memberships/memberships.api';
import type { AddMembersResponse } from '../domain/memberships.types';

export function useHookAddMember() {
  const [data, setData] = useState<AddMembersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addMember = async (teamId: number, userId: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Добавление участника:', { teamId, userId });

      // Вызываем API - получаем ответ от сервера
      const response: AddMembersResponse = await AddMembers(teamId, userId);

      setData(response);
      console.log('Участник успешно добавлен, ID:', response.ID);

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add member to team');
      setError(error);
      console.error('Ошибка добавления участника:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addMember,
    data,
    loading,
    error,
  };
}
