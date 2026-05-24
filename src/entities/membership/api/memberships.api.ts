import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { AddMembersResponseDTO } from './post/memberships.types';
import type { DeleteMemberDTO } from './delete/memberships.types';
import { mapToAddMembersResponse } from './memberships.mapper';
import type { AddMembersResponse } from '../model/membership.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function addMembers(team_id: number, user_id: number): Promise<AddMembersResponse> {
  const dto = await request<AddMembersResponseDTO>(`${API_BASE_URL}/memberships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id, user_id }),
  });
  return mapToAddMembersResponse(dto);
}

export async function deleteMember(
  member_id: number,
  team_id: number,
  current_user_id: number
): Promise<DeleteMemberDTO> {
  await request<void>(
    `${API_BASE_URL}/memberships?member_id=${member_id}&team_id=${team_id}&current_user_id=${current_user_id}`,
    { method: 'DELETE' }
  );
  return { member_id, team_id, current_user_id };
}
