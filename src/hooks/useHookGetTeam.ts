// hooks/useHookGetTeam.ts
import { useEffect, useState, useCallback } from 'react';
import { getTeam } from '../api/dto/team/team.api';
import { mapTeam } from '../api/dto/team/team.mapper';
import type { Team } from '../domain/team.types';

export function useTeam(teamId: number) {
  const [data, setData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // fetch добавил для обновления состояния на UI
  const fetchTeam = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dto = await getTeam(teamId);
      setData(mapTeam(dto));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch team'));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    data,
    loading,
    error,
    refetch: fetchTeam,
  };
}
