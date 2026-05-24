import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteTask } from './task.api';
import { mapDeleteTaskRequestToDTO } from './task.mapper';
import { queryKeys } from '@/shared/query-keys';

export function useHookDeleteTask(teamId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { taskId: number; currentUserId: number }>({
    mutationFn: async ({ taskId, currentUserId }) => {
      const requestDTO = mapDeleteTaskRequestToDTO({ taskId, currentUserId });
      await deleteTask(requestDTO.task_id, requestDTO.current_user_id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks(teamId) });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast.success('Задача удалена');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    deleteTask: (taskId: number, currentUserId: number) =>
      mutation.mutateAsync({ taskId, currentUserId }),
    loading: mutation.isPending,
    error: mutation.error ?? null,
    success: mutation.isSuccess,
  };
}
