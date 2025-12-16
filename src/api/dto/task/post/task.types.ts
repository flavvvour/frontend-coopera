export interface CreateTaskResponseDTO {
    id: number;
    team_id: number;
    title: string;
    description: string;
    points: number;
    status: string;
    created_by_user: number;
    created_at: string;
    updated_at: string; 
}

export interface CreateTaskRequestDTO {
    team_id: number;
    points: number;
    current_user_id: number;
    assigned_to_member: number;
    title: string;
    description: string;
}