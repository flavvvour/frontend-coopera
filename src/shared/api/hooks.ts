/**
 * React Query хуки для работы с API
 *
 * Преимущества перед обычными запросами:
 * - Автоматическое кеширование
 * - Повторные запросы при ошибках
 * - Оптимистичные обновления
 * - Меньше бойлерплейта
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { BackendTask } from '@/entities/team';

// Query Keys для кеширования
export const queryKeys = {
  teams: (userId?: number) => ['teams', userId] as const,
  team: (teamId: number) => ['team', teamId] as const,
  tasks: (teamId: number) => ['tasks', teamId] as const,
  memberships: (teamId: number) => ['memberships', teamId] as const,
};

/**
 * Загрузка конкретной команды с участниками
 * Возвращает: { id, name, created_at, created_by, members: [{member_id, role}] }
 */
export const useTeam = (teamId: number) => {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => apiClient.getTeam(teamId),
  });
};

/**
 * Загрузка задач команды
 */
export const useTasks = (teamId: number) => {
  return useQuery({
    queryKey: queryKeys.tasks(teamId),
    queryFn: () => apiClient.getTasks(teamId),
  });
};

/**
 * Загрузка участников команды
 */
export const useMemberships = (teamId: number) => {
  return useQuery({
    queryKey: queryKeys.memberships(teamId),
    queryFn: () => apiClient.getMemberships(teamId),
  });
};

/**
 * Создание новой задачи
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      team_id: number;
      points: number;
      current_user_id: number;
    }) => apiClient.createTask(data),

    // После успешного создания - обновляем кеш задач
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(variables.team_id),
      });
    },

    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });
};

/**
 * Обновление задачи
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: number;
      data: {
        status?: string;
        title?: string;
        description?: string;
        points?: number;
        order?: number;
        current_user_id: number;
      };
      teamId: number;
    }) => apiClient.updateTask(taskId, data),

    // Оптимистичное обновление
    onMutate: async ({ taskId, data, teamId }) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({
        queryKey: queryKeys.tasks(teamId),
      });

      // Получаем текущие данные
      const previousTasks = queryClient.getQueryData<BackendTask[]>(queryKeys.tasks(teamId));

      // Оптимистично обновляем UI
      if (previousTasks) {
        queryClient.setQueryData<BackendTask[]>(
          queryKeys.tasks(teamId),
          previousTasks.map(task => (task.id === taskId ? { ...task, ...data } : task))
        );
      }

      // Возвращаем контекст для rollback
      return { previousTasks };
    },

    // Rollback при ошибке
    onError: (error, { teamId }, context) => {
      console.error('Failed to update task:', error);
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks(teamId), context.previousTasks);
      }
    },

    // Обновляем после успеха
    onSettled: (_, __, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(teamId),
      });
    },
  });
};

/**
 * Создание команды
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string; user_id: number }) =>
      apiClient.createTeam(data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams(variables.user_id),
      });
    },

    onError: (error) => {
      console.error('Failed to create team:', error);
    },
  });
};
