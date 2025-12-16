// hooks/useHookDeleteTask.ts
import { useState } from 'react';
import { deleteTask } from '../api/dto/task/task.api';
import { mapDeleteTaskRequestToDTO } from '../api/dto/task/task.mapper';

export function useHookDeleteTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteTaskHandler = async (taskId: number, currentUserId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Преобразовал доменные параметры в DTO
      const requestDTO = mapDeleteTaskRequestToDTO({
        taskId,
        currentUserId,
      });

      // Отправил запрос с DTO параметрами
      await deleteTask(requestDTO.task_id, requestDTO.current_user_id);

      setSuccess(true);

      return {
        success: true,
        message: `Задача #${taskId} удалена`,
      };
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);

      const error =
        err instanceof Error ? err : new Error('Неизвестная ошибка при удалении задачи');

      setError(error);
      setSuccess(false);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTask: deleteTaskHandler,
    loading,
    error,
    success,
  };
}
