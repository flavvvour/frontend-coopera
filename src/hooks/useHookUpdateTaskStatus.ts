// hooks/useHookUpdateTaskStatus.ts
import { useState } from 'react';
import { patchTaskStatus } from '../api/dto/task/task.api';
import { mapPatchTaskStatus } from '../api/dto/task/task.mapper';
import type { PatchTaskStatus } from '../domain/task.types';
import type { PatchTaskStatusDTO } from '../api/dto/task/patch/task.types';

export function useHookUpdateTaskStatus() {
  const [data, setData] = useState<PatchTaskStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTaskStatus = async (request: PatchTaskStatus) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Изменение статуса задачи:', request);

      // Вызываем API функцию, передавая поля из request
      const dto: PatchTaskStatusDTO = await patchTaskStatus(
        request.taskId,
        request.currentUserId,
        request.status
      );

      // Преобразуем DTO в доменную модель
      const result = mapPatchTaskStatus(dto);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Не удалось изменить статус задачи');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTaskStatus,
    data,
    loading,
    error,
  };
}
