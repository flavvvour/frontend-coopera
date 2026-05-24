import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMembers } from './memberships.api';
import { queryKeys } from '@/shared/query-keys';
import type { AddMembersResponse } from '../model/membership.types';

export function useHookAddMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation<AddMembersResponse, Error, { teamId: number; userId: number }>({
    mutationFn: ({ teamId, userId }) => addMembers(teamId, userId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
    },
  });

  return {
    addMember: (teamId: number, userId: number) => mutation.mutateAsync({ teamId, userId }),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
