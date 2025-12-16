import type { CreateTaskRequestDTO, CreateTaskResponseDTO } from './post/task.types';
import type { GetTaskDTO } from './get/task.types';
// import type { UpdateTaskRequest } from '@/domain/task.types';
import type { UpdateTaskRequestDTO } from './update/task.types';
import type { PatchTaskStatusDTO } from './patch/task.types';
const API_URL = 'http://localhost:8080/api/v1';

// GET (В ДТО именно массив возвращается)
export async function getTask(team_id: number): Promise<GetTaskDTO[]> {
  const url = `${API_URL}/tasks?team_id=${team_id}`;

  console.log('Отправка запроса GET задач по команде:', url);

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log('Получены задачи команды:', data);
  return data;
}

// POST
export async function createTask(
  team_id: number,
  points: number,
  current_user_id: number,
  assigned_to_member: number,
  title: string,
  description: string
): Promise<CreateTaskResponseDTO> {
  const url = `${API_URL}/tasks`;

  const requestBody: CreateTaskRequestDTO = {
    team_id: team_id,
    points: points,
    current_user_id: current_user_id,
    assigned_to_member: assigned_to_member,
    title: title,
    description: description,
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
  console.log('Задача создана:', data);
  return data;
}

// DELETE
export async function deleteTask(task_id: number, current_user_id: number): Promise<boolean> {
  const url = `${API_URL}/tasks?task_id=${task_id}&current_user_id=${current_user_id}`;

  console.log('Отправка запроса DELETE задачи:', url);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ошибка запроса DELETE:', res.status, errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  console.log('Задача удалена, статус:', res.status);
  return true;
}

// PATCH (update)
export async function updateTask(
  current_user_id: number,
  task_id: number,
  points: number,
  description: string
): Promise<UpdateTaskRequestDTO> {
  const url = `${API_URL}/tasks`;

  const requestBody: UpdateTaskRequestDTO = {
    current_user_id: current_user_id,
    task_id: task_id,
    points: points,
    description: description,
  };

  console.log('Отправка запроса PATCH:', url, requestBody);

  const res = await fetch(url, {
    method: 'PATCH',
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
  const status = res.status;

  // Для статуса 204 No Content или ответ пустой
  if (status === 204 || res.headers.get('content-length') === '0') {
    console.log('Задача обновлена (204 No Content)');
    return requestBody;
  }
  const data = await res.json();
  console.log('Задача обновлена:', data);
  return data;
}

// PATCH (status)
export async function patchTaskStatus(
  task_id: number,
  current_user_id: number,
  status: string
): Promise<PatchTaskStatusDTO> {
  const url = `${API_URL}/tasks/status`;

  const requestBody: PatchTaskStatusDTO = {
    task_id: task_id,
    current_user_id: current_user_id,
    status: status,
  };

  console.log('Отправка запроса PATCH:', url, requestBody);

  const res = await fetch(url, {
    method: 'PATCH',
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
  const statusMsg = res.status;

  // Для статуса 204 No Content или ответ пустой
  if (statusMsg === 204 || res.headers.get('content-length') === '0') {
    console.log('Статус задачи обновлен (204 No Content)');
    return requestBody;
  }
  const data = await res.json();
  console.log('Статус задачи обновлен:', data);
  return data;
}
