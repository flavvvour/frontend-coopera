import type { TaskStatus } from '../../model/task.types';

export interface PatchTaskStatusDTO {
    task_id: number;
    current_user_id: number;
    status: TaskStatus;
}
