import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTask } from './task.api';
import { mapCreateTaskRequest, mapCreateTaskResponse } from './task.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { CreateTaskRequest, CreateTaskResponse } from '../model/task.types';

export function useHookPostTask() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateTaskResponse, Error, CreateTaskRequest>({
    mutationFn: async (request) => {
      if (!request.teamId || !request.title || !request.currentUserId) {
        throw new Error('teamId, title и currentUserId обязательны');
      }
      if ((request.points ?? 1) < 1) {
        throw new Error('points должен быть больше 0');
      }
      const requestDto = mapCreateTaskRequest(request);
      const responseDto = await createTask(requestDto);
      return mapCreateTaskResponse(responseDto);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks(variables.teamId) });
      toast.success('Задача создана');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reset = () => mutation.reset();

  return {
    createTask: (request: CreateTaskRequest) => mutation.mutateAsync(request),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
    reset,
  };
}
