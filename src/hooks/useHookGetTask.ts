import { useState, useEffect } from 'react';
import { getTask } from '../api/dto/task/task.api';
import { mapGetTask } from '../api/dto/task/task.mapper';
import type { Task } from '../domain/task.types';

export function useHookGetTask(teamId: number) {
  const [data, setData] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const dtos = await getTask(teamId);
        const tasks = dtos.map(mapGetTask);
        setData(tasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [teamId]);

  return {
    data,
    loading,
    error,
  };
}
