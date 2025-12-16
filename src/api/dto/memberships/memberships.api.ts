import type { DeleteMemberDTO } from './delete/memberships.types';
import type { AddMembersResponseDTO } from './post/memberships.types';
import { mapToAddMembersResponse } from './memberships.mapper';
import type { AddMembersResponse } from '../../../domain/memberships.types';
const API_URL = 'http://localhost:8080/api/v1';

// POST
export async function AddMembers(team_id: number, user_id: number): Promise<AddMembersResponse> {
  const url = `${API_URL}/memberships`;

  const requestBody = {
    team_id: team_id,
    user_id: user_id,
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

  // Получаем DTO ответ от сервера
  const responseDTO: AddMembersResponseDTO = await res.json();
  console.log('Ответ от сервера (DTO):', responseDTO);

  // Преобразуем DTO ответа в доменный объект через маппер
  const domainResponse: AddMembersResponse = mapToAddMembersResponse(responseDTO);
  console.log('Пользователь добавлен в команду (доменный):', domainResponse);

  return domainResponse;
}

// DELETE
export async function DeleteMember(
  member_id: number,
  team_id: number,
  current_user_id: number
): Promise<DeleteMemberDTO> {
  const url = `${API_URL}/memberships?member_id=${member_id}&team_id=${team_id}&current_user_id=${current_user_id}`;

  console.log('Отправка запроса DELETE участника:', url);

  const res = await fetch(url, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса DELETE:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  console.log('Участник удален, статус:', res.status);

  return {
    member_id,
    team_id,
    current_user_id,
  };
}
