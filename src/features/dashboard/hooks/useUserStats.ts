// features/dashboard/hooks/useUserStats.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api';
import { useHookGetUser } from '@/hooks/useHookGetUser'; // Импортируем ваш хук
import type { Task } from '@/entities/task';

interface UserStats {
  totalTasks: number;
  inProgress: number;
  completed: number;
  totalPoints: number;
  assignedTasks: number;
  createdTasks: number;
}

export const useUserStats = (username?: string) => {
  // Используем ваш хук для получения пользователя
  const { data: user, loading: userLoading, error: userError } = useHookGetUser(username || '');

  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    totalPoints: 0,
    assignedTasks: 0,
    createdTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserStats = async () => {
      // Если нет username или пользователь еще загружается
      if (!username || userLoading) {
        return;
      }

      // Если ошибка загрузки пользователя
      if (userError || !user) {
        setError(userError?.message || 'Пользователь не найден');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Получаем команды пользователя
        const userTeams = await apiClient.getUserTeams(user.id);

        let allTasks: Task[] = [];

        // 2. Для каждой команды получаем задачи
        for (const team of userTeams) {
          try {
            const tasks = await apiClient.getTasks(team.id);
            allTasks = [...allTasks, ...tasks];
          } catch (err) {
            console.error(`Ошибка загрузки задач для команды ${team.id}:`, err);
          }
        }

        // 3. Рассчитываем статистику
        const userId = user.id;

        const totalTasks = allTasks.length;
        const assignedTasks = allTasks.filter(task => task.assignedToMember === userId).length;

        const inProgress = allTasks.filter(
          task =>
            task.assignedToMember === userId &&
            (task.status === 'assigned' || task.status === 'in_review')
        ).length;

        const completedTasks = allTasks.filter(
          task => task.assignedToMember === userId && task.status === 'completed'
        );

        const completed = completedTasks.length;

        const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);

        const createdTasks = allTasks.filter(task => task.createdByUser === userId).length;

        setStats({
          totalTasks,
          inProgress,
          completed,
          totalPoints,
          assignedTasks,
          createdTasks,
        });
        setError('');
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [username, user, userLoading, userError]);

  return {
    stats,
    loading: loading || userLoading, // Объединяем загрузки
    error: error || userError?.message || '',
  };
};
