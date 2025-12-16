export interface CreateTeamResponseDTO {
    id: number;
    name: string;
    created_at: string;
    created_by: number;
}

export interface CreateTeamRequestDTO {
    user_id: number;
    name: string;
}