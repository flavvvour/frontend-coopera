// hooks/useHookUpdateTask.ts
import { useState } from 'react';
import { updateTask } from '../api/dto/task/task.api';
import { mapUpdateTask } from '../api/dto/task/task.mapper';
import type { UpdateTaskRequest } from '../domain/task.types';
import type { UpdateTaskRequestDTO } from '../api/dto/task/update/task.types';

export function useHookUpdateTask() {
  const [data, setData] = useState<UpdateTaskRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTaskRequest = async (request: UpdateTaskRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Вызываем API функцию, передавая поля из request
      const dto: UpdateTaskRequestDTO = await updateTask(
        request.currentUserId,
        request.taskId,
        request.points,
        request.description
      );

      // Преобразуем DTO в доменную модель
      const result = mapUpdateTask(dto);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTask: updateTaskRequest,
    data,
    loading,
    error,
  };
}
