export interface User {
  id: number;
  telegramId: number;
  username: string;
  createdAt: string;
  teams?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

export interface CreateUserRequest {
  telegram_id: number;
  username: string;
}

export interface GetUserRequest {
  telegram_id?: number;
  username?: string;
}

export interface DeleteUserRequest {
  user_id: number;
}