export interface GetTaskDTO {
    id: number;
    team_id: number;
    title: string;
    description: string;
    points: number,
    status: string;
    assigned_to_member: number;
    created_by_user: number;
    created_at: string;
    updated_at: string;
}