// entities/task/model/task-store.ts
import { create } from 'zustand';
import type { Task } from '@/entities/task';
import type { Column } from '@/entities/column/types';

interface TaskStore {
  tasks: Task[];
  columns: Column[];
  moveTask: (taskId: string, newColumnId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
}

// Убрали неиспользуемый параметр set
export const useTaskStore = create<TaskStore>(() => ({
  tasks: [],
  columns: [],
  
  moveTask: (taskId: string, newColumnId: string) => {
    console.log(`Moving task ${taskId} to column ${newColumnId}`);
  },
  
  updateTask: (taskId: string, updates: Partial<Task>) => {
    console.log(`Updating task ${taskId} with:`, updates);
  }
}));