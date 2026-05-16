const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

import type { ActivityEntryDTO, CreateActivityRequestDTO } from './activity.types';

export async function getActivity(user_id: number): Promise<ActivityEntryDTO[]> {
  const res = await fetch(`${API_URL}/activity?user_id=${user_id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createActivity(req: CreateActivityRequestDTO): Promise<ActivityEntryDTO> {
  const res = await fetch(`${API_URL}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function markAllActivityRead(user_id: number): Promise<void> {
  const res = await fetch(`${API_URL}/activity/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function markSingleActivityRead(id: number, user_id: number): Promise<void> {
  await fetch(`${API_URL}/activity/read/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
}

export async function deleteAllActivity(user_id: number): Promise<void> {
  const res = await fetch(`${API_URL}/activity?user_id=${user_id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
