import type { Task } from '@/entities/task';
export interface Column {
    id: string;
    title: string;
    task: Task[];
    order: number;
}
export type ColumnStatus = 'backlog' | 'in-progress' | 'review' | 'done';