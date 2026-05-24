import { describe, it, expect } from 'vitest';
import {
  mapGetTask,
  mapCreateTaskRequest,
  mapCreateTaskResponse,
  mapDeleteTaskRequestToDTO,
  mapUpdateTask,
  mapPatchTaskStatus,
} from './task.mapper';
import type { GetTaskDTO } from './get/task.types';
import type { CreateTaskResponseDTO } from './post/task.types';
import type { UpdateTaskRequestDTO } from './update/task.types';
import type { PatchTaskStatusDTO } from './patch/task.types';
import type { CreateTaskRequest, DeleteTaskRequest } from '../model/task.types';

// ---------------------------------------------------------------------------
// mapGetTask
// ---------------------------------------------------------------------------
describe('mapGetTask', () => {
  const base: GetTaskDTO = {
    id: 1,
    team_id: 10,
    title: 'Fix bug',
    description: 'Reproduce first',
    points: 3,
    status: 'open',
    assigned_to_member: 5,
    created_by_user: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  };

  it('maps snake_case fields to camelCase', () => {
    const result = mapGetTask(base);
    expect(result.teamId).toBe(10);
    expect(result.assignedToMember).toBe(5);
    expect(result.createdByUser).toBe(2);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
  });

  it('passes scalar fields through unchanged', () => {
    const result = mapGetTask(base);
    expect(result.id).toBe(1);
    expect(result.title).toBe('Fix bug');
    expect(result.description).toBe('Reproduce first');
    expect(result.points).toBe(3);
    expect(result.status).toBe('open');
  });

  it('defaults tags to [] when absent', () => {
    expect(mapGetTask(base).tags).toEqual([]);
  });

  it('preserves tags when present', () => {
    const result = mapGetTask({ ...base, tags: ['backend', 'urgent'] });
    expect(result.tags).toEqual(['backend', 'urgent']);
  });

  it('defaults priority to "low" when absent', () => {
    expect(mapGetTask(base).priority).toBe('low');
  });

  it('preserves priority when present', () => {
    expect(mapGetTask({ ...base, priority: 'high' }).priority).toBe('high');
  });

  it('defaults commentCount to 0 when absent', () => {
    expect(mapGetTask(base).commentCount).toBe(0);
  });

  it('preserves commentCount when present', () => {
    expect(mapGetTask({ ...base, comment_count: 7 }).commentCount).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// mapCreateTaskRequest
// ---------------------------------------------------------------------------
describe('mapCreateTaskRequest', () => {
  const base: CreateTaskRequest = {
    teamId: 10,
    currentUserId: 2,
    assignedToMember: 5,
    title: 'New task',
    description: 'Do it',
  };

  it('maps camelCase fields to snake_case', () => {
    const result = mapCreateTaskRequest(base);
    expect(result.team_id).toBe(10);
    expect(result.current_user_id).toBe(2);
    expect(result.assigned_to_member).toBe(5);
  });

  it('defaults points to 1 when not provided', () => {
    expect(mapCreateTaskRequest(base).points).toBe(1);
  });

  it('uses provided points value', () => {
    expect(mapCreateTaskRequest({ ...base, points: 5 }).points).toBe(5);
  });

  it('passes title and description through', () => {
    const result = mapCreateTaskRequest(base);
    expect(result.title).toBe('New task');
    expect(result.description).toBe('Do it');
  });

  it('forwards optional tags and priority', () => {
    const result = mapCreateTaskRequest({ ...base, tags: ['x'], priority: 'medium' });
    expect(result.tags).toEqual(['x']);
    expect(result.priority).toBe('medium');
  });
});

// ---------------------------------------------------------------------------
// mapCreateTaskResponse
// ---------------------------------------------------------------------------
describe('mapCreateTaskResponse', () => {
  const base: CreateTaskResponseDTO = {
    id: 99,
    team_id: 10,
    title: 'Created',
    description: 'desc',
    points: 2,
    status: 'open',
    created_by_user: 3,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  };

  it('maps snake_case to camelCase', () => {
    const result = mapCreateTaskResponse(base);
    expect(result.teamId).toBe(10);
    expect(result.createdByUser).toBe(3);
    expect(result.createdAt).toBe('2024-03-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-03-01T00:00:00Z');
  });

  it('defaults tags to [] when absent', () => {
    expect(mapCreateTaskResponse(base).tags).toEqual([]);
  });

  it('defaults priority to "low" when absent', () => {
    expect(mapCreateTaskResponse(base).priority).toBe('low');
  });

  it('preserves tags and priority when present', () => {
    const result = mapCreateTaskResponse({ ...base, tags: ['a'], priority: 'high' });
    expect(result.tags).toEqual(['a']);
    expect(result.priority).toBe('high');
  });
});

// ---------------------------------------------------------------------------
// mapDeleteTaskRequestToDTO
// ---------------------------------------------------------------------------
describe('mapDeleteTaskRequestToDTO', () => {
  const req: DeleteTaskRequest = { taskId: 42, currentUserId: 7 };

  it('maps taskId → task_id', () => {
    expect(mapDeleteTaskRequestToDTO(req).task_id).toBe(42);
  });

  it('maps currentUserId → current_user_id', () => {
    expect(mapDeleteTaskRequestToDTO(req).current_user_id).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// mapUpdateTask
// ---------------------------------------------------------------------------
describe('mapUpdateTask', () => {
  const dto: UpdateTaskRequestDTO = {
    current_user_id: 1,
    task_id: 20,
    points: 4,
    description: 'Updated desc',
    title: 'Updated title',
    tags: ['refactor'],
    priority: 'medium',
  };

  it('maps snake_case to camelCase', () => {
    const result = mapUpdateTask(dto);
    expect(result.currentUserId).toBe(1);
    expect(result.taskId).toBe(20);
  });

  it('passes points and description through', () => {
    const result = mapUpdateTask(dto);
    expect(result.points).toBe(4);
    expect(result.description).toBe('Updated desc');
  });

  it('forwards optional title, tags, priority', () => {
    const result = mapUpdateTask(dto);
    expect(result.title).toBe('Updated title');
    expect(result.tags).toEqual(['refactor']);
    expect(result.priority).toBe('medium');
  });

  it('passes undefined title when not provided', () => {
    const result = mapUpdateTask({ ...dto, title: undefined });
    expect(result.title).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// mapPatchTaskStatus
// ---------------------------------------------------------------------------
describe('mapPatchTaskStatus', () => {
  const dto: PatchTaskStatusDTO = {
    task_id: 55,
    current_user_id: 3,
    status: 'completed',
  };

  it('maps task_id → taskId', () => {
    expect(mapPatchTaskStatus(dto).taskId).toBe(55);
  });

  it('maps current_user_id → currentUserId', () => {
    expect(mapPatchTaskStatus(dto).currentUserId).toBe(3);
  });

  it('passes status through unchanged', () => {
    expect(mapPatchTaskStatus(dto).status).toBe('completed');
  });
});
