import type { GetTeamDTO } from './get/team.types';
import type { CreateTeamRequestDTO, CreateTeamResponseDTO } from './post/team.types';
import type { DeleteTeamResponseDTO } from './delete/team.types';
import type { PatchTeamMetaRequestDTO } from './patch/team.types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// GET
export async function getTeam(team_id: number): Promise<GetTeamDTO> {
  const url = `${API_URL}/teams?team_id=${team_id}`;

  console.log('Отправка запроса GET:', url);

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Получены данные команды:', data);
  return data;
}

// POST
export async function createTeam(user_id: number, name: string, emoji?: string, color?: string): Promise<CreateTeamResponseDTO> {
  const url = `${API_URL}/teams`;

  const requestBody: CreateTeamRequestDTO = {
    user_id,
    name,
    ...(emoji !== undefined && { emoji }),
    ...(color !== undefined && { color }),
  };

  console.log('Отправка запроса POST:', url, requestBody);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Команда создана:', data);
  return data;
}

// PATCH (meta: emoji + color)
export async function patchTeamMeta(team_id: number, current_user_id: number, emoji: string, color: string): Promise<void> {
  const url = `${API_URL}/teams`;

  const body: PatchTeamMetaRequestDTO = { team_id, current_user_id, emoji, color };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка PATCH команды:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
}

// PATCH autoassign
export async function patchTeamAutoassign(team_id: number, current_user_id: number, autoassign: boolean): Promise<void> {
  const url = `${API_URL}/teams/autoassign`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id, current_user_id, autoassign }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
}

// PATCH photo
export async function patchTeamPhoto(team_id: number, current_user_id: number, photo_url: string): Promise<void> {
  const res = await fetch(`${API_URL}/teams/photo`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_id, current_user_id, photo_url }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }
}

// DELETE
export async function deleteTeam(
  team_id: number,
  current_user_id: number
): Promise<DeleteTeamResponseDTO> {
  const url = `${API_URL}/teams?team_id=${team_id}&current_user_id=${current_user_id}`;

  console.log('Отправка запроса DELETE:', url);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Команда удалена:', data);
  return data;
}
