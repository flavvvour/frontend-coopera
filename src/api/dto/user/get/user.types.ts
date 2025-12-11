export interface GetUserDTO {
    id: number;
    telegram_id: number;
    username: string;
    created_at: string;
    teams: TeamDTO[];
}

export interface TeamDTO {
    id: number;
    name: string;
    role: string;
}