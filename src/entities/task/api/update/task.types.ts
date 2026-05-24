export interface UpdateTaskRequestDTO {
    current_user_id: number;
    task_id: number;
    points: number;
    description: string;
    title?: string;
    tags?: string[];
    priority?: string;
    assigned_to_member?: number;
}
