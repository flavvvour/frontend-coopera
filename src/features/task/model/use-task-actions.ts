import { useTaskStore } from "./task-store";
import type { CreateTaskData } from '@/features/task/types';

export const useTaskActions = () => {
    const { moveTask } = useTaskStore();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const takeTask = async (_taskId: string) => {
      // TODO: Добавить логику взятия задачи позже
      console.log('Take task functionality coming soon...');
    };
    
    const createTask = async (taskData: CreateTaskData) => {
      // Используем параметр
      console.log('Creating task with data:', taskData);
      // TODO: Добавить вызов API для создания задачи
      // await api.createTask(taskData);
    };
    
    return { takeTask, createTask, moveTask };
};