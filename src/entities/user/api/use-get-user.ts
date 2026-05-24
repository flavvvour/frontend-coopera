import { useQuery } from '@tanstack/react-query';
import { getUser, getUserById } from './users.api';
import { mapUser } from './users.mapper';
import { queryKeys } from '@/shared/query-keys';
import type { User } from '../model/user.types';

export function useHookGetUser(username: string) {
  const { data, isLoading, error, refetch } = useQuery<User, Error>({
    queryKey: queryKeys.user(username),
    queryFn: async () => {
      const dto = await getUser(username);
      return mapUser(dto);
    },
    enabled: !!username,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refetch,
  };
}

export function useHookGetUserById(id: number) {
  const { data, isLoading, error } = useQuery<User, Error>({
    queryKey: queryKeys.userById(id),
    queryFn: async () => {
      const dto = await getUserById(id);
      return mapUser(dto);
    },
    enabled: !!id,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function useHookGetUserByParam(param: { username?: string; id?: number }) {
  const enabled = !!(param.username || param.id);
  const queryKey = param.username
    ? queryKeys.user(param.username)
    : queryKeys.userById(param.id!);

  const { data, isLoading, error } = useQuery<User, Error>({
    queryKey,
    queryFn: async () => {
      if (param.username) {
        const dto = await getUser(param.username);
        return mapUser(dto);
      }
      const dto = await getUserById(param.id!);
      return mapUser(dto);
    },
    enabled,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
