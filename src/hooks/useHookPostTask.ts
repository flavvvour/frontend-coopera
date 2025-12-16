import { useState } from 'react';
import { createTask } from '../api/dto/task/task.api';
import { mapCreateTaskRequest, mapCreateTaskResponse } from '../api/dto/task/task.mapper';
import type { CreateTaskRequest, CreateTaskResponse } from '../domain/task.types';

export function useHookPostTask() {
  const [data, setData] = useState<CreateTaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTaskHandler = async (request: CreateTaskRequest): Promise<CreateTaskResponse> => {
    if (!request.teamId || !request.title || !request.currentUserId) {
      const error = new Error('teamId, title и currentUserId обязательны');
      setError(error);
      throw error;
    }

    if (request.points < 1) {
      const error = new Error('points должен быть больше 0');
      setError(error);
      throw error;
    }

    try {
      setLoading(true);
      setError(null);
      setData(null);

      const requestDto = mapCreateTaskRequest(request);

      const responseDto = await createTask(
        requestDto.team_id,
        requestDto.points,
        requestDto.current_user_id,
        requestDto.assigned_to_member,
        requestDto.title,
        requestDto.description
      );

      const result = mapCreateTaskResponse(responseDto);
      setData(result);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    createTask: createTaskHandler,
    data,
    loading,
    error,
    reset,
  };
}
