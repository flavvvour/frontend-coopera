import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { patchTaskStatus } from './task.api';
import { mapPatchTaskStatus } from './task.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { PatchTaskStatus, Task } from '../model/task.types';

type MutationContext = { previousTasks: Task[] | undefined };

export function useHookUpdateTaskStatus(teamId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<PatchTaskStatus, Error, PatchTaskStatus, MutationContext>({
    mutationFn: async (request) => {
      const dto = await patchTaskStatus({
        task_id: request.taskId,
        current_user_id: request.currentUserId,
        status: request.status,
      });
      return mapPatchTaskStatus(dto);
    },
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(teamId) });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks(teamId));
      queryClient.setQueryData<Task[]>(queryKeys.tasks(teamId), (old) =>
        old?.map(t =>
          t.id === request.taskId
            ? { ...t, status: request.status, updatedAt: new Date().toISOString() }
            : t
        ) ?? []
      );
      return { previousTasks };
    },
    onError: (_error, _request, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks(teamId), context.previousTasks);
      }
      toast.error('Не удалось переместить задачу');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks(teamId) });
    },
  });

  return {
    updateTaskStatus: (request: PatchTaskStatus) => mutation.mutateAsync(request),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
