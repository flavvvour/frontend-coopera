export interface Task {
  id: number;
  teamId: number;
  title: string;
  description?: string;
  points?: number;
  status: string;
  assignedToMember?: number | null;
  createdByUser: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  team_id: number;
  title: string;
  description?: string;
  points?: number;
  assigned_to?: number;
  current_user_id: number;
}

export interface UpdateTaskRequest {
  task_id: number;
  current_user_id: number;
  title?: string;
  description?: string;
  points?: number;
  status?: string;
  assigned_to?: number | null; // Для API
  assignedToMember?: number; // Для внутреннего использования
}

export interface UpdateTaskStatusRequest {
  task_id: number;
  current_user_id: number;
  status: string;
}

export interface GetTasksRequest {
  task_id?: number;
  user_id?: number;
  team_id?: number;
}

export interface DeleteTaskRequest {
  task_id: number;
  current_user_id: number;
}

export type TaskStatus = 'open' | 'assigned' | 'in_review' | 'completed' | 'archived';
