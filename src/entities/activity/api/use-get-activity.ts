import { useQuery } from '@tanstack/react-query';
import { getActivity } from './activity.api';
import { queryKeys } from '@/shared/query-keys';
import type { ActivityEntryDTO } from './activity.types';

export function useHookGetActivity(userId: number) {
  const { data, isLoading, error, refetch } = useQuery<ActivityEntryDTO[], Error>({
    queryKey: queryKeys.activity(userId),
    queryFn: () => getActivity(userId),
    enabled: !!userId,
    staleTime: 10_000,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  };
}
