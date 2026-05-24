import { useQuery } from '@tanstack/react-query';
import { getTask } from './task.api';
import { mapGetTask } from './task.mapper';
import { queryKeys } from '@/shared/query-keys';
import { POLL_INTERVAL_MS } from '@/shared/lib/constants';
import type { Task } from '../model/task.types';

export function useHookGetTask(teamId: number) {
  const { data, isLoading, error, refetch } = useQuery<Task[], Error>({
    queryKey: queryKeys.tasks(teamId),
    queryFn: async () => {
      const dtos = await getTask(teamId);
      return dtos.map(mapGetTask);
    },
    enabled: !!teamId,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refresh: refetch,
  };
}
