import { useQuery } from '@tanstack/react-query';
import { getTeam } from './team.api';
import { mapTeam } from './team.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { Team } from '../model/team.types';

export function useTeam(teamId: number) {
  const { data, isLoading, error, refetch } = useQuery<Team, Error>({
    queryKey: queryKeys.team(teamId),
    queryFn: async () => {
      const dto = await getTeam(teamId);
      return mapTeam(dto);
    },
    enabled: !!teamId,
    staleTime: 30_000,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  };
}
