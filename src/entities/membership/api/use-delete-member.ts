import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteMember as deleteMemberApi } from './memberships.api';
import { mapDeleteMembers } from './memberships.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { DeleteMember } from '../model/membership.types';

interface DeleteMemberVars {
  memberId: number;
  teamId: number;
  currentUserId: number;
}

export function useHookDeleteMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteMember, Error, DeleteMemberVars>({
    mutationFn: async ({ memberId, teamId, currentUserId }) => {
      const dto = await deleteMemberApi(memberId, teamId, currentUserId);
      return mapDeleteMembers(dto);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.team(variables.teamId) });
      toast.success('Участник удалён');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    deleteMember: (memberId: number, teamId: number, currentUserId: number) =>
      mutation.mutateAsync({ memberId, teamId, currentUserId }),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
