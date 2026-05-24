export interface ActivityEntryDTO {
  id: number;
  user_id: number;
  team_id?: number;
  team_emoji?: string;
  team_color?: string;
  type: string;
  title: string;
  detail: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateActivityRequestDTO {
  user_id: number;
  team_id?: number;
  team_emoji?: string;
  team_color?: string;
  type: string;
  title: string;
  detail: string;
}
