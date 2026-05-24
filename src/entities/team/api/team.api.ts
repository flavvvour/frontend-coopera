import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { GetTeamDTO } from './get/team.types';
import type { CreateTeamRequestDTO, CreateTeamResponseDTO } from './post/team.types';
import type { DeleteTeamResponseDTO } from './delete/team.types';
import type { PatchTeamMetaRequestDTO } from './patch/team.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getTeam(team_id: number): Promise<GetTeamDTO> {
  return request<GetTeamDTO>(`${API_BASE_URL}/teams?team_id=${team_id}`);
}

export async function createTeam(dto: CreateTeamRequestDTO): Promise<CreateTeamResponseDTO> {
  return request<CreateTeamResponseDTO>(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function patchTeamMeta(dto: PatchTeamMetaRequestDTO): Promise<void> {
  await request<void>(`${API_BASE_URL}/teams`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function patchTeamAutoassign(
  team_id: number,
  current_user_id: number,
  autoassign: boolean
): Promise<void> {
  await request<void>(`${API_BASE_URL}/teams/autoassign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id, current_user_id, autoassign }),
  });
}

export async function patchTeamPhoto(
  team_id: number,
  current_user_id: number,
  photo_url: string
): Promise<void> {
  await request<void>(`${API_BASE_URL}/teams/photo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id, current_user_id, photo_url }),
  });
}

export async function deleteTeam(
  team_id: number,
  current_user_id: number
): Promise<DeleteTeamResponseDTO> {
  return request<DeleteTeamResponseDTO>(
    `${API_BASE_URL}/teams?team_id=${team_id}&current_user_id=${current_user_id}`,
    { method: 'DELETE' }
  );
}
