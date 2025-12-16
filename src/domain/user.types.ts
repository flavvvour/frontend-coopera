export interface User {
  id: number;
  telegramID: number;
  username: string;
  createdAt: Date;
  teams: Team[];
}

export interface Team {
  id: number;
  name: string;
  role: string;
}
