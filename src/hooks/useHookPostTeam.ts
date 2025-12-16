import { useState } from 'react';
import { createTeam } from '../api/dto/team/team.api';
import { mapCreatedTeam } from '../api/dto/team/team.mapper';
import type { CreateTeam } from '../domain/team.types';

export function useHookPostTeam() {
  const [data, setData] = useState<CreateTeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNewTeam = async (userId: number, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const dto = await createTeam(userId, name);
      const createdTeam = mapCreatedTeam(dto);
      setData(createdTeam);
      return createdTeam;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create team');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTeam: createNewTeam,
    data,
    loading,
    error,
  };
}
