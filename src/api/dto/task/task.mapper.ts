import type { CreateTaskRequestDTO, CreateTaskResponseDTO } from '../task/post/task.types';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
} from '../../../domain/task.types';
import type { GetTaskDTO } from './get/task.types';
import type { Task } from '../../../domain/task.types';
import type { DeleteTaskRequestDTO } from './delete/task.types';
import type { UpdateTaskRequestDTO } from './update/task.types';
import type { DeleteTaskRequest } from '../../../domain/task.types';
import type { PatchTaskStatus } from '../../../domain/task.types';
import type { PatchTaskStatusDTO } from './patch/task.types';

export function mapCreateTaskResponse(dto: CreateTaskResponseDTO): CreateTaskResponse {
  return {
    id: dto.id,
    teamId: dto.team_id,
    title: dto.title,
    description: dto.description,
    points: dto.points,
    status: dto.status,
    createdByUser: dto.created_by_user,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCreateTaskRequest(dto: CreateTaskRequest): CreateTaskRequestDTO {
  return {
    team_id: dto.teamId,
    points: dto.points,
    current_user_id: dto.currentUserId,
    assigned_to_member: dto.assignedToMember,
    title: dto.title,
    description: dto.description,
  };
}

export function mapGetTask(dto: GetTaskDTO): Task {
  return {
    id: dto.id,
    teamId: dto.team_id,
    title: dto.title,
    description: dto.description,
    points: dto.points,
    status: dto.status,
    assignedToMember: dto.assigned_to_member,
    createdByUser: dto.created_by_user,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapDeleteTaskRequestToDTO(dto: DeleteTaskRequest): DeleteTaskRequestDTO {
  return {
    task_id: dto.taskId,
    current_user_id: dto.currentUserId,
  };
}

export function mapUpdateTask(dto: UpdateTaskRequestDTO): UpdateTaskRequest {
  return {
    currentUserId: dto.current_user_id,
    taskId: dto.task_id,
    points: dto.points,
    description: dto.description,
  };
}

export function mapPatchTaskStatus(dto: PatchTaskStatusDTO): PatchTaskStatus {
  return {
    taskId: dto.task_id,
    currentUserId: dto.current_user_id,
    status: dto.status,
  };
}
