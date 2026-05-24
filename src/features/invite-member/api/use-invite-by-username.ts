import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addMembers } from '@/entities/membership';
import { getUser } from '@/entities/user';
import { ApiError } from '@/shared/api/errors';

interface InviteVars {
  teamId: number;
  username: string;
}

interface InviteError extends Error {
  isAlreadyInTeam: boolean;
  isUserNotFound: boolean;
}

function buildInviteError(err: unknown): InviteError {
  let message = 'Ошибка приглашения пользователя';
  let isAlreadyInTeam = false;
  let isUserNotFound = false;

  if (err instanceof ApiError) {
    if (err.status === 409) {
      message = 'Этот пользователь уже состоит в этой команде';
      isAlreadyInTeam = true;
    } else if (err.status === 404) {
      message = 'Пользователь с таким username не найден';
      isUserNotFound = true;
    } else if (err.status === 403) {
      message = 'У вас нет прав для добавления участников';
    } else if (err.status === 400) {
      message = 'Некорректные данные. Проверьте введённый username';
    }
  }

  const e = new Error(message) as InviteError;
  e.isAlreadyInTeam = isAlreadyInTeam;
  e.isUserNotFound = isUserNotFound;
  return e;
}

export function useHookInviteByUsername() {
  const mutation = useMutation<void, InviteError, InviteVars>({
    mutationFn: async ({ teamId, username }) => {
      try {
        const userData = await getUser(username);
        await addMembers(teamId, userData.id);
      } catch (err) {
        throw buildInviteError(err);
      }
    },
    onSuccess: () => {
      toast.success('Участник добавлен');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const clearError = () => mutation.reset();
  const error = mutation.error ?? null;

  return {
    inviteByUsername: (teamId: number, username: string) =>
      mutation.mutateAsync({ teamId, username }),
    loading: mutation.isPending,
    error,
    clearError,
    isAlreadyInTeamError: error?.isAlreadyInTeam ?? false,
    isUserNotFoundError: error?.isUserNotFound ?? false,
  };
}
