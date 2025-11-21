export interface CreateTaskData {
    title: string;
    description?: string;
    assigneeId: number;
    priority: number;
    columnId: string;
}

export interface TaskFilters {
    status?: string;
    assignee?: number;
    priority?: number;
}