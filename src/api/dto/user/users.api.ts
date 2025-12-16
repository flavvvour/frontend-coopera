import type { GetUserDTO } from './get/user.types';

const API_URL = 'http://localhost:8080/api/v1';

// по username получение пользователя
export async function getUser(username: string): Promise<GetUserDTO> {
  const url = `${API_URL}/users?username=${encodeURIComponent(username)}`;

  console.log('Отправка запроса GET:', url);

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Получены данные пользователя:', data);
  return data;
}

// по id получение пользователя
export async function getUserById(id: number): Promise<GetUserDTO> {
  const url = `${API_URL}/users?id=${id}`;

  console.log('Отправка запроса GET по ID:', url);

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Получены данные пользователя по ID:', data);
  return data;
}

export async function getUserByParam(param: {
  username?: string;
  id?: number;
  telegram_id?: number;
}): Promise<GetUserDTO> {
  let url = `${API_URL}/users?`;

  if (param.username) {
    url += `username=${param.username}`;
  } else if (param.id) {
    url += `id=${param.id}`;
  } else if (param.telegram_id) {
    url += `telegram_id=${param.telegram_id}`;
  } else {
    throw new Error('Не указан параметр для поиска пользователя');
  }

  console.log('Отправка запроса GET пользователя:', url);

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data;
}
