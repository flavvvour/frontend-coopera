import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTeam } from './team.api';
import { mapCreatedTeam } from './team.mapper';
import type { CreateTeam } from '../model/team.types';

interface CreateTeamVars {
  userId: number;
  name: string;
  emoji?: string;
  color?: string;
}

export function useHookPostTeam() {
  const mutation = useMutation<CreateTeam, Error, CreateTeamVars>({
    mutationFn: async ({ userId, name, emoji, color }) => {
      const dto = await createTeam({ user_id: userId, name, emoji, color });
      return mapCreatedTeam(dto);
    },
    onSuccess: () => {
      toast.success('Команда создана');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createTeam: (userId: number, name: string, emoji?: string, color?: string) =>
      mutation.mutateAsync({ userId, name, emoji, color }),
    data: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
