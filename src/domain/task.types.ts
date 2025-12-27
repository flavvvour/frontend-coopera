// POST
export interface CreateTaskResponse {
  id: number;
  teamId: number;
  title: string;
  description: string;
  points: number;
  status: string;
  createdByUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  teamId: number;
  points?: number;
  currentUserId: number;
  assignedToMember: number;
  title: string;
  description: string;
}

export interface Task {
  id: number;
  teamId: number;
  title: string;
  description: string;
  points: number;
  status: string;
  assignedToMember: number;
  createdByUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteTaskRequest {
  taskId: number;
  currentUserId: number;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
  deletedTaskId?: number;
  error?: string;
  status?: number;
}

export interface UpdateTaskRequest {
    currentUserId: number;
    taskId: number;
    points: number;
    description: string;
}

export interface PatchTaskStatus {
    taskId: number;
    currentUserId: number;
    status: string;
}