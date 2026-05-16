const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

import type { TaskCommentDTO, CreateCommentRequestDTO } from './comments.types';

export async function getComments(taskId: number): Promise<TaskCommentDTO[]> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createComment(taskId: number, req: CreateCommentRequestDTO): Promise<TaskCommentDTO> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteComment(taskId: number, commentId: number, userId: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments/${commentId}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
