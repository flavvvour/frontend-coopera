import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from './task.api';
import { mapUpdateTask } from './task.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { UpdateTaskRequest } from '../model/task.types';

export function useHookUpdateTask(teamId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation<UpdateTaskRequest, Error, UpdateTaskRequest>({
    mutationFn: async (request) => {
      const dto = await updateTask({
        current_user_id: request.currentUserId,
        task_id: request.taskId,
        points: request.points,
        description: request.description,
        title: request.title,
        tags: request.tags,
        priority: request.priority,
        assigned_to_member: request.assignedToMember,
      });
      return mapUpdateTask(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks(teamId) });
    },
  });

  return {
    updateTask: (request: UpdateTaskRequest) => mutation.mutateAsync(request),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
