import { useEffect, useState } from 'react';
import { getUser, getUserById } from '../api/dto/user/users.api';
import { mapUser } from '../api/dto/user/users.mapper';
import type { User } from '../domain/user.types';

// username
export function useHookGetUser(username: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = () => setTick(n => n + 1);

  useEffect(() => {
    if (!username) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const dto = await getUser(username);
        setData(mapUser(dto));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setData(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username, tick]);

  return { data, loading, error, refetch };
}

// id
export function useHookGetUserById(id: number) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const dto = await getUserById(id);
        setData(mapUser(dto));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return { data, loading, error };
}

// универсальный
export function useHookGetUserByParam(param: { username?: string; id?: number }) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!param.username && !param.id) return;

    const load = async () => {
      try {
        let dto;
        if (param.username) {
          dto = await getUser(param.username);
        } else if (param.id) {
          dto = await getUserById(param.id);
        }
        if (dto) {
          setData(mapUser(dto));
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [param.username, param.id]);

  return { data, loading, error };
}
