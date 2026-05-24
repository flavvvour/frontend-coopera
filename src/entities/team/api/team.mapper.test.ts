import { describe, it, expect } from 'vitest';
import { mapTeam, mapCreatedTeam, mapDeleteTeamResponse } from './team.mapper';
import type { GetTeamDTO } from './get/team.types';
import type { CreateTeamResponseDTO } from './post/team.types';
import type { DeleteTeamResponseDTO } from './delete/team.types';

// ---------------------------------------------------------------------------
// mapTeam
// ---------------------------------------------------------------------------
describe('mapTeam', () => {
  const base: GetTeamDTO = {
    id: 1,
    name: 'Alpha',
    created_at: '2024-01-01T00:00:00Z',
    created_by_user: 10,
    members: [
      { member_id: 100, user_id: 10, username: 'alice', role: 'owner' },
      { member_id: 101, user_id: 11, username: 'bob', role: 'member' },
    ],
  };

  it('maps snake_case top-level fields to camelCase', () => {
    const result = mapTeam(base);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.createdByUser).toBe(10);
  });

  it('passes id and name through unchanged', () => {
    const result = mapTeam(base);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Alpha');
  });

  it('maps each member from snake_case to camelCase', () => {
    const result = mapTeam(base);
    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toEqual({ memberId: 100, userId: 10, username: 'alice', role: 'owner' });
    expect(result.members[1]).toEqual({ memberId: 101, userId: 11, username: 'bob', role: 'member' });
  });

  it('produces an empty members array when members is empty', () => {
    expect(mapTeam({ ...base, members: [] }).members).toEqual([]);
  });

  it('forwards optional emoji when present', () => {
    expect(mapTeam({ ...base, emoji: '🚀' }).emoji).toBe('🚀');
  });

  it('leaves emoji undefined when absent', () => {
    expect(mapTeam(base).emoji).toBeUndefined();
  });

  it('forwards optional color when present', () => {
    expect(mapTeam({ ...base, color: '#ff0000' }).color).toBe('#ff0000');
  });

  it('forwards optional autoassign when present', () => {
    expect(mapTeam({ ...base, autoassign: true }).autoassign).toBe(true);
  });

  it('leaves autoassign undefined when absent', () => {
    expect(mapTeam(base).autoassign).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// mapCreatedTeam
// ---------------------------------------------------------------------------
describe('mapCreatedTeam', () => {
  const base: CreateTeamResponseDTO = {
    id: 5,
    name: 'Beta',
    created_at: '2024-06-01T00:00:00Z',
    created_by: 3,
  };

  it('maps created_at → createdAt', () => {
    expect(mapCreatedTeam(base).createdAt).toBe('2024-06-01T00:00:00Z');
  });

  it('maps created_by → createdBy', () => {
    expect(mapCreatedTeam(base).createdBy).toBe(3);
  });

  it('passes id and name through unchanged', () => {
    const result = mapCreatedTeam(base);
    expect(result.id).toBe(5);
    expect(result.name).toBe('Beta');
  });

  it('forwards optional emoji and color', () => {
    const result = mapCreatedTeam({ ...base, emoji: '🎯', color: '#00ff00' });
    expect(result.emoji).toBe('🎯');
    expect(result.color).toBe('#00ff00');
  });

  it('leaves emoji and color undefined when absent', () => {
    const result = mapCreatedTeam(base);
    expect(result.emoji).toBeUndefined();
    expect(result.color).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// mapDeleteTeamResponse
// ---------------------------------------------------------------------------
describe('mapDeleteTeamResponse', () => {
  const base: DeleteTeamResponseDTO = {
    success: true,
    message: 'Team deleted',
    deleted_team_id: 7,
    deleted_at: '2024-07-01T00:00:00Z',
  };

  it('maps deleted_team_id → deletedTeamId', () => {
    expect(mapDeleteTeamResponse(base).deletedTeamId).toBe(7);
  });

  it('maps deleted_at → deletedAt', () => {
    expect(mapDeleteTeamResponse(base).deletedAt).toBe('2024-07-01T00:00:00Z');
  });

  it('passes success and message through unchanged', () => {
    const result = mapDeleteTeamResponse(base);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Team deleted');
  });

  it('leaves deletedTeamId undefined when absent', () => {
    const result = mapDeleteTeamResponse({ success: false, message: 'not found' });
    expect(result.deletedTeamId).toBeUndefined();
  });

  it('leaves deletedAt undefined when absent', () => {
    const result = mapDeleteTeamResponse({ success: false, message: 'not found' });
    expect(result.deletedAt).toBeUndefined();
  });
});
