import { useState } from 'react';
import { patchTeamAutoassign } from '../api/dto/team/team.api';

export function useHookPatchTeamAutoassign() {
  const [loading, setLoading] = useState(false);
  const patch = async (teamId: number, currentUserId: number, autoassign: boolean) => {
    setLoading(true);
    try {
      await patchTeamAutoassign(teamId, currentUserId, autoassign);
    } finally {
      setLoading(false);
    }
  };
  return { patch, loading };
}
