export interface User {
  id: number;
  telegramID: number;
  username: string;
  photoUrl?: string;
  createdAt: Date;
  teams: UserTeam[];
  wallpaper: string;
  wallpaperCustomUrl: string;
  theme: string;
}

export interface UserTeam {
  id: number;
  name: string;
  role: string;
  emoji?: string;
  color?: string;
}
