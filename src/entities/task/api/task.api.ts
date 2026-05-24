import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { CreateTaskRequestDTO, CreateTaskResponseDTO } from './post/task.types';
import type { GetTaskDTO } from './get/task.types';
import type { UpdateTaskRequestDTO } from './update/task.types';
import type { PatchTaskStatusDTO } from './patch/task.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getTask(team_id: number): Promise<GetTaskDTO[]> {
  return request<GetTaskDTO[]>(`${API_BASE_URL}/tasks?team_id=${team_id}`);
}

export async function createTask(dto: CreateTaskRequestDTO): Promise<CreateTaskResponseDTO> {
  return request<CreateTaskResponseDTO>(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateTask(dto: UpdateTaskRequestDTO): Promise<UpdateTaskRequestDTO> {
  return request<UpdateTaskRequestDTO>(`${API_BASE_URL}/tasks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function patchTaskStatus(dto: PatchTaskStatusDTO): Promise<PatchTaskStatusDTO> {
  return request<PatchTaskStatusDTO>(`${API_BASE_URL}/tasks/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteTask(task_id: number, current_user_id: number): Promise<void> {
  await request<void>(
    `${API_BASE_URL}/tasks?task_id=${task_id}&current_user_id=${current_user_id}`,
    { method: 'DELETE' }
  );
}
