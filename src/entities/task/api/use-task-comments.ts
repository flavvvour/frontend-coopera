import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, deleteComment } from './comments.api';
import { queryKeys } from '@/shared/query-keys';
import type { TaskCommentDTO } from './comments.types';

export function useTaskComments(taskId: number | null) {
  const queryClient = useQueryClient();
  const key = taskId ? queryKeys.taskComments(taskId) : (['task-comments-disabled'] as const);

  const { data, isLoading, refetch } = useQuery<TaskCommentDTO[], Error>({
    queryKey: key,
    queryFn: async () => {
      if (!taskId) return [];
      return getComments(taskId);
    },
    enabled: !!taskId,
  });

  const sendMutation = useMutation<
    TaskCommentDTO,
    Error,
    { userId: number; username: string; text: string },
    { previous: TaskCommentDTO[]; optimisticId: number }
  >({
    mutationFn: ({ userId, username, text }) => {
      if (!taskId) return Promise.reject(new Error('taskId is null'));
      return createComment(taskId, { user_id: userId, username, text });
    },
    onMutate: async ({ userId, username, text }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskCommentDTO[]>(key) ?? [];
      const optimistic: TaskCommentDTO = {
        id: -Date.now(),
        task_id: taskId ?? 0,
        user_id: userId,
        username,
        text,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<TaskCommentDTO[]>(key, [...previous, optimistic]);
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: (created, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData<TaskCommentDTO[]>(
        key,
        (queryClient.getQueryData<TaskCommentDTO[]>(key) ?? []).map(c =>
          c.id === context.optimisticId ? created : c
        )
      );
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData<TaskCommentDTO[]>(key, context.previous);
    },
  });

  const removeMutation = useMutation<
    void,
    Error,
    { commentId: number; userId: number },
    { previous: TaskCommentDTO[] }
  >({
    mutationFn: ({ commentId, userId }) => {
      if (!taskId) return Promise.reject(new Error('taskId is null'));
      return deleteComment(taskId, commentId, userId);
    },
    onMutate: async ({ commentId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskCommentDTO[]>(key) ?? [];
      queryClient.setQueryData<TaskCommentDTO[]>(
        key,
        previous.filter(c => c.id !== commentId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData<TaskCommentDTO[]>(key, context.previous);
    },
  });

  const send = (userId: number, username: string, text: string) =>
    sendMutation.mutateAsync({ userId, username, text });

  const remove = (commentId: number, userId: number) =>
    removeMutation.mutateAsync({ commentId, userId });

  return {
    comments: data ?? [],
    loading: isLoading,
    send,
    remove,
    reload: refetch,
  };
}
