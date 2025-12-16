import { useState } from 'react';
import { DeleteMember } from '../api/dto/memberships/memberships.api';
import { mapDeleteMembers } from '../api/dto/memberships/memberships.mapper';
import type { DeleteMember as DeleteMemberType } from '../domain/memberships.types';

export function useHookDeleteMember() {
  const [data, setData] = useState<DeleteMemberType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMemberHandler = async (memberId: number, teamId: number, currentUserId: number) => {
    if (!memberId || !teamId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setData(null);

      console.log('Удаление участника:', { memberId, teamId, currentUserId });

      const dto = await DeleteMember(memberId, teamId, currentUserId);

      const deletedMember = mapDeleteMembers(dto);

      setData(deletedMember);
      console.log('Участник успешно удален:', deletedMember);

      return deletedMember;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Не удалось удалить участника из команды');
      setError(error);
      console.error('Ошибка удаления участника:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteMember: deleteMemberHandler,
    data,
    loading,
    error,
  };
}
