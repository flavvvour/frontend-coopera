import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchTeamMeta } from './team.api';
import { queryKeys } from '@/shared/query-keys';

interface PatchTeamMetaVars {
  teamId: number;
  currentUserId: number;
  emoji: string;
  color: string;
}

export function useHookPatchTeamMeta() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, PatchTeamMetaVars>({
    mutationFn: async ({ teamId, currentUserId, emoji, color }) => {
      await patchTeamMeta({ team_id: teamId, current_user_id: currentUserId, emoji, color });
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
    },
  });

  return {
    patchMeta: (teamId: number, currentUserId: number, emoji: string, color: string) =>
      mutation.mutateAsync({ teamId, currentUserId, emoji, color }),
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
