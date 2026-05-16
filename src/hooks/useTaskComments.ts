import { useState, useEffect, useCallback } from 'react';
import { getComments, createComment, deleteComment } from '@/api/dto/comments/comments.api';
import type { TaskCommentDTO } from '@/api/dto/comments/comments.types';

export function useTaskComments(taskId: number | null) {
  const [comments, setComments] = useState<TaskCommentDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await getComments(taskId);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { load(); }, [load]);

  const send = useCallback(async (userId: number, username: string, text: string) => {
    if (!taskId) return;
    const optimistic: TaskCommentDTO = {
      id: -Date.now(),
      task_id: taskId,
      user_id: userId,
      username,
      text,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    try {
      const created = await createComment(taskId, { user_id: userId, username, text });
      setComments(prev => prev.map(c => c.id === optimistic.id ? created : c));
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    }
  }, [taskId]);

  const remove = useCallback(async (commentId: number, userId: number) => {
    if (!taskId) return;
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await deleteComment(taskId, commentId, userId);
    } catch {
      load();
    }
  }, [taskId, load]);

  return { comments, loading, send, remove, reload: load };
}
