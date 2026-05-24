export interface CreateTeamResponseDTO {
    id: number;
    name: string;
    created_at: string;
    created_by: number;
    emoji?: string;
    color?: string;
}

export interface CreateTeamRequestDTO {
    user_id: number;
    name: string;
    emoji?: string;
    color?: string;
}
