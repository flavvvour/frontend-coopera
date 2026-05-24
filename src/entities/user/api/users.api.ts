import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { GetUserDTO } from './get/user.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getUser(username: string): Promise<GetUserDTO> {
  return request<GetUserDTO>(
    `${API_BASE_URL}/users?username=${encodeURIComponent(username)}`
  );
}

export async function getUserById(id: number): Promise<GetUserDTO> {
  return request<GetUserDTO>(`${API_BASE_URL}/users?id=${id}`);
}

export async function getUserByParam(param: {
  username?: string;
  id?: number;
  telegram_id?: number;
}): Promise<GetUserDTO> {
  if (param.username) {
    return getUser(param.username);
  }
  if (param.id) {
    return getUserById(param.id);
  }
  if (param.telegram_id) {
    return request<GetUserDTO>(
      `${API_BASE_URL}/users?telegram_id=${param.telegram_id}`
    );
  }
  throw new Error('Не указан параметр для поиска пользователя');
}

export async function patchUserSettings(
  user_id: number,
  wallpaper: string,
  wallpaper_custom_url: string,
  theme: string
): Promise<void> {
  await request<void>(`${API_BASE_URL}/users/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, wallpaper, wallpaper_custom_url, theme }),
  });
}
