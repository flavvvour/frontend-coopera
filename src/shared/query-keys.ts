export const queryKeys = {
  tasks: (teamId: number) => ['tasks', teamId] as const,
  task: (taskId: number) => ['task', taskId] as const,
  taskComments: (taskId: number) => ['task-comments', taskId] as const,
  team: (teamId: number) => ['team', teamId] as const,
  user: (username: string) => ['user', username] as const,
  userById: (id: number) => ['user', id] as const,
  userTasks: (username: string, teamId: number) => ['user-tasks', username, teamId] as const,
  activity: (userId: number) => ['activity', userId] as const,
};
