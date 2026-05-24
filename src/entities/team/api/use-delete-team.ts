import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteTeam } from './team.api';

export function useHookDeleteTeam() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { teamId: number; currentUserId: number }>({
    mutationFn: async ({ teamId, currentUserId }) => {
      await deleteTeam(teamId, currentUserId);
    },
    onSuccess: () => {
      toast.success('Команда удалена');
      void queryClient.invalidateQueries({ queryKey: ['user'] });
      void queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    deleteTeam: (teamId: number, currentUserId: number) =>
      mutation.mutateAsync({ teamId, currentUserId }),
    data: null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
