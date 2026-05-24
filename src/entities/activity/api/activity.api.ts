import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { ActivityEntryDTO, CreateActivityRequestDTO } from './activity.types';
import { useAuthStore } from '@/shared/store';
import { queryClient } from '@/shared/lib/queryClient';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getActivity(user_id: number): Promise<ActivityEntryDTO[]> {
  return request<ActivityEntryDTO[]>(`${API_BASE_URL}/activity?user_id=${user_id}`);
}

export async function createActivity(req: CreateActivityRequestDTO): Promise<ActivityEntryDTO> {
  return request<ActivityEntryDTO>(`${API_BASE_URL}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

export async function markAllActivityRead(user_id: number): Promise<void> {
  await request<void>(`${API_BASE_URL}/activity/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
}

export async function markSingleActivityRead(id: number, user_id: number): Promise<void> {
  await request<void>(`${API_BASE_URL}/activity/read/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
}

export async function deleteAllActivity(user_id: number): Promise<void> {
  await request<void>(`${API_BASE_URL}/activity?user_id=${user_id}`, {
    method: 'DELETE',
  });
}

export function addActivity(entry: {
  type: string;
  title: string;
  detail: string;
  teamId?: number;
  teamEmoji?: string;
  teamColor?: string;
}) {
  const stored = useAuthStore.getState().userId;
  const userId = stored ? parseInt(stored, 10) : 0;
  if (userId <= 0) return;
  createActivity({
    user_id: userId,
    team_id: entry.teamId,
    team_emoji: entry.teamEmoji,
    team_color: entry.teamColor,
    type: entry.type,
    title: entry.title,
    detail: entry.detail,
  }).then(() => {
    void queryClient.invalidateQueries({ queryKey: ['activity'] });
  }).catch(() => {});
}
