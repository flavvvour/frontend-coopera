export interface GetUserDTO {
    id: number;
    telegram_id: number;
    username: string;
    photo_url?: string;
    created_at: string;
    teams: TeamDTO[];
    wallpaper: string;
    wallpaper_custom_url: string;
    theme: string;
}

export interface TeamDTO {
    id: number;
    name: string;
    role: string;
    emoji?: string;
    color?: string;
}
