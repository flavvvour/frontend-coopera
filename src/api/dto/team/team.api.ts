import type { GetTeamDTO } from './get/team.types';
import type { CreateTeamRequestDTO, CreateTeamResponseDTO } from './post/team.types';
import type { DeleteTeamResponseDTO } from './delete/team.types';

const API_URL = 'http://localhost:8080/api/v1';

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
export async function createTeam(user_id: number, name: string): Promise<CreateTeamResponseDTO> {
  const url = `${API_URL}/teams`;

  const requestBody: CreateTeamRequestDTO = {
    user_id: user_id,
    name: name,
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
