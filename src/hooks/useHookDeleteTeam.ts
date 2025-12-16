import { useState } from 'react';
import { deleteTeam } from '../api/dto/team/team.api';
import { mapDeleteTeamResponse } from '../api/dto/team/team.mapper';
import type { DeleteTeamResponse } from '../domain/team.types';

export function useHookDeleteTeam() {
  const [data, setData] = useState<DeleteTeamResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTeamHandler = async (teamId: number, currentUserId: number) => {
    if (!teamId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setData(null);

      const dto = await deleteTeam(teamId, currentUserId);
      const result = mapDeleteTeamResponse(dto);

      setData(result);

      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete team');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTeam: deleteTeamHandler,
    data,
    loading,
    error,
  };
}
