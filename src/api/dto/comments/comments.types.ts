export interface TaskCommentDTO {
  id: number;
  task_id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

export interface CreateCommentRequestDTO {
  user_id: number;
  username: string;
  text: string;
}
