import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchTeamAutoassign } from './team.api';
import { queryKeys } from '@/shared/query-keys';

interface PatchAutoassignVars {
  teamId: number;
  currentUserId: number;
  autoassign: boolean;
}

export function useHookPatchTeamAutoassign() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, PatchAutoassignVars>({
    mutationFn: async ({ teamId, currentUserId, autoassign }) => {
      await patchTeamAutoassign(teamId, currentUserId, autoassign);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
    },
  });

  return {
    patch: (teamId: number, currentUserId: number, autoassign: boolean) =>
      mutation.mutateAsync({ teamId, currentUserId, autoassign }),
    loading: mutation.isPending,
  };
}
