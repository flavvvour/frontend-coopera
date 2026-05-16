import { useState } from 'react';
import { patchTeamMeta } from '../api/dto/team/team.api';

export function useHookPatchTeamMeta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const patchMeta = async (teamId: number, currentUserId: number, emoji: string, color: string) => {
    try {
      setLoading(true);
      setError(null);
      await patchTeamMeta(teamId, currentUserId, emoji, color);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update team meta');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { patchMeta, loading, error };
}
