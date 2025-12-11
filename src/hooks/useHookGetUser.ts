import { useEffect, useState } from "react";
import { getUser } from "../api/dto/user/users.api";
import { mapUser } from "../api/dto/user/users.mapper";
import type { User } from "../domain/user.types";

export function useHookGetUser(username: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!username) return;

    const load = async () => {
      try {
        const dto = await getUser(username);
        setData(mapUser(dto));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  return { data, loading, error };
}