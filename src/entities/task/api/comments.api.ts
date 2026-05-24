import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/errors';
import type { TaskCommentDTO, CreateCommentRequestDTO } from './comments.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function getComments(taskId: number): Promise<TaskCommentDTO[]> {
  const data = await request<TaskCommentDTO[] | null>(
    `${API_BASE_URL}/tasks/${taskId}/comments`
  );
  return Array.isArray(data) ? data : [];
}

export async function createComment(
  taskId: number,
  req: CreateCommentRequestDTO
): Promise<TaskCommentDTO> {
  return request<TaskCommentDTO>(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

export async function deleteComment(
  taskId: number,
  commentId: number,
  userId: number
): Promise<void> {
  await request<void>(
    `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}?user_id=${userId}`,
    { method: 'DELETE' }
  );
}
