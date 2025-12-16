// hooks/useHookGetUserTasks.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useHookGetUser } from './useHookGetUser';
import { getTask } from '../api/dto/task/task.api';
import { getTeam } from '../api/dto/team/team.api';
import { mapGetTask } from '../api/dto/task/task.mapper';
import { mapTeam } from '../api/dto/team/team.mapper';
import type { Task } from '../domain/task.types';
// import type { Team } from '../domain/team.types';

interface UseHookGetUserTasksResult {
  data: {
    allTasks: Task[];
    assignedTasks: Task[];
    createdTasks: Task[];
    user: ReturnType<typeof useHookGetUser>['data'] | null;
    teamMemberMap: Record<number, number>;
  };
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useHookGetUserTasks(username: string): UseHookGetUserTasksResult {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [teamMemberMap, setTeamMemberMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: user, loading: userLoading, error: userError } = useHookGetUser(username);

  const fetchTeamMemberData = useCallback(async (teamIds: { id: number }[], username: string) => {
    const teamMemberPromises = teamIds.map(async ({ id }) => {
      try {
        const teamDto = await getTeam(id);
        const teamData = mapTeam(teamDto);
        const userMember = teamData.members.find(member => member.username === username);

        return {
          teamId: id,
          memberId: userMember?.memberId || null,
        };
      } catch (err) {
        console.error(`Error fetching team ${id}:`, err);
        return {
          teamId: id,
          memberId: null,
        };
      }
    });

    const teamMembers = await Promise.all(teamMemberPromises);
    const memberMap: Record<number, number> = {};

    teamMembers.forEach(({ teamId, memberId }) => {
      if (memberId !== null) {
        memberMap[teamId] = memberId;
      }
    });

    return memberMap;
  }, []);

  const fetchTeamTasks = useCallback(async (teamIds: { id: number }[]) => {
    const teamTasksPromises = teamIds.map(async ({ id }) => {
      try {
        const dtos = await getTask(id);
        return dtos.map(mapGetTask);
      } catch (err) {
        console.error(`Error fetching tasks for team ${id}:`, err);
        return [];
      }
    });

    const allTeamTasksArrays = await Promise.all(teamTasksPromises);
    return allTeamTasksArrays.flat();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user || userLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Извлекаем только ID команд
      const teamIds = user.teams.map(team => ({ id: team.id }));

      // Параллельно загружаем данные о членстве и задачи
      const [memberMap, tasks] = await Promise.all([
        fetchTeamMemberData(teamIds, username), // ← Исправлено здесь
        fetchTeamTasks(teamIds),
      ]);

      // Отладка: логируем данные
      console.log('=== FETCHED TASKS DATA ===');
      console.log('Total tasks:', tasks.length);
      if (tasks.length > 0) {
        console.log('Sample task:', tasks[0]);
        console.log('Task points:', tasks[0].points);
        console.log(
          'All tasks points:',
          tasks.map(t => ({
            id: t.id,
            title: t.title,
            points: t.points,
            status: t.status,
          }))
        );
      }
      console.log('Team member map:', memberMap);

      setTeamMemberMap(memberMap);
      setAllTasks(tasks);
    } catch (err) {
      console.error('Error fetching user tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user tasks'));
    } finally {
      setLoading(false);
    }
  }, [user, userLoading, username, fetchTeamMemberData, fetchTeamTasks]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);
  const refresh = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const tasksAssignedToUser = useMemo(() => {
    if (!allTasks.length || !user || Object.keys(teamMemberMap).length === 0) {
      return [];
    }

    return allTasks.filter(task => {
      const userMemberId = teamMemberMap[task.teamId];
      return userMemberId && task.assignedToMember === userMemberId;
    });
  }, [allTasks, user, teamMemberMap]);

  const tasksCreatedByUser = useMemo(() => {
    if (!allTasks.length || !user) return [];
    return allTasks.filter(task => task.createdByUser === user.id);
  }, [allTasks, user]);

  return {
    data: {
      allTasks,
      assignedTasks: tasksAssignedToUser,
      createdTasks: tasksCreatedByUser,
      user,
      teamMemberMap,
    },
    loading: loading || userLoading,
    error: error || userError,
    refresh,
  };
}
