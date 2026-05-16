export interface User {
  id: number;
  telegramID: number;
  username: string;
  photoUrl?: string;
  createdAt: Date;
  teams: Team[];
  wallpaper: string;
  wallpaperCustomUrl: string;
  theme: string;
}

export interface Team {
  id: number;
  name: string;
  role: string;
  emoji?: string;
  color?: string;
}
