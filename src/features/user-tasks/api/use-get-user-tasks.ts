import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUser, mapUser } from '@/entities/user';
import { getTask, mapGetTask } from '@/entities/task';
import { getTeam, mapTeam } from '@/entities/team';
import { queryKeys } from '@/shared/query-keys';
import type { Task } from '@/entities/task';
import type { User } from '@/entities/user';

interface UserTasksData {
  allTasks: Task[];
  assignedTasks: Task[];
  createdTasks: Task[];
  user: User | null;
  teamMemberMap: Record<number, number>;
}

interface UseHookGetUserTasksResult {
  data: UserTasksData;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useHookGetUserTasks(username: string): UseHookGetUserTasksResult {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery<User, Error>({
    queryKey: queryKeys.user(username),
    queryFn: async () => {
      const dto = await getUser(username);
      return mapUser(dto);
    },
    enabled: !!username,
  });

  const teamIds = user?.teams.map(t => t.id) ?? [];

  const {
    data: tasksAndMembers,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<{ allTasks: Task[]; teamMemberMap: Record<number, number> }, Error>({
    queryKey: ['user-tasks-detail', username, teamIds],
    queryFn: async () => {
      const [taskArrays, teamDatas] = await Promise.all([
        Promise.all(
          teamIds.map(id =>
            getTask(id)
              .then(dtos => dtos.map(mapGetTask))
              .catch(() => [] as Task[])
          )
        ),
        Promise.all(
          teamIds.map(id =>
            getTeam(id)
              .then(dto => ({ id, data: mapTeam(dto) }))
              .catch(() => ({ id, data: null }))
          )
        ),
      ]);

      const allTasks = taskArrays.flat();

      const teamMemberMap: Record<number, number> = {};
      for (const { id, data: teamData } of teamDatas) {
        if (!teamData) continue;
        const userMember = teamData.members.find(m => m.username === username);
        if (userMember) {
          teamMemberMap[id] = userMember.memberId;
        }
      }

      return { allTasks, teamMemberMap };
    },
    enabled: !!user && teamIds.length > 0,
  });

  const allTasks = tasksAndMembers?.allTasks ?? [];
  const teamMemberMap = tasksAndMembers?.teamMemberMap ?? {};

  const assignedTasks = useMemo(() => {
    if (!allTasks.length || !user || Object.keys(teamMemberMap).length === 0) return [];
    return allTasks.filter(task => {
      const userMemberId = teamMemberMap[task.teamId];
      return userMemberId !== undefined && task.assignedToMember === userMemberId;
    });
  }, [allTasks, user, teamMemberMap]);

  const createdTasks = useMemo(() => {
    if (!allTasks.length || !user) return [];
    return allTasks.filter(task => task.createdByUser === user.id);
  }, [allTasks, user]);

  const refresh = () => {
    void refetchUser();
    void refetchTasks();
  };

  return {
    data: {
      allTasks,
      assignedTasks,
      createdTasks,
      user: user ?? null,
      teamMemberMap,
    },
    loading: userLoading || tasksLoading,
    error: userError ?? tasksError ?? null,
    refresh,
  };
}
