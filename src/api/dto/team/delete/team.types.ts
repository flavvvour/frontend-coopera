export interface DeleteTeamRequestDTO {
    team_id: number;
    current_user_id: number;
}

export interface DeleteTeamResponseDTO  {
    success: boolean;
    message: string;
    deleted_team_id?: number;
    deleted_at?: string;
}
