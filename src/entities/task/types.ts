import type { User } from '@/entities/user';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: User;
  status: TaskStatus;
  priority: number;
  columnId: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';