import { describe, it, expect } from 'vitest';
import {
  mapToAddMembersDTO,
  mapToAddMembers,
  mapDeleteMembers,
  mapToAddMembersResponse,
} from './memberships.mapper';
import type { AddMembersRequestDTO, AddMembersResponseDTO } from './post/memberships.types';
import type { DeleteMemberDTO } from './delete/memberships.types';
import type { AddMembersRequest } from '../model/membership.types';

// ---------------------------------------------------------------------------
// mapToAddMembersDTO  (domain → DTO)
// ---------------------------------------------------------------------------
describe('mapToAddMembersDTO', () => {
  const req: AddMembersRequest = { teamId: 10, userId: 3 };

  it('maps teamId → team_id', () => {
    expect(mapToAddMembersDTO(req).team_id).toBe(10);
  });

  it('maps userId → user_id', () => {
    expect(mapToAddMembersDTO(req).user_id).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// mapToAddMembers  (DTO → domain)
// ---------------------------------------------------------------------------
describe('mapToAddMembers', () => {
  const dto: AddMembersRequestDTO = { team_id: 20, user_id: 7 };

  it('maps team_id → teamId', () => {
    expect(mapToAddMembers(dto).teamId).toBe(20);
  });

  it('maps user_id → userId', () => {
    expect(mapToAddMembers(dto).userId).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// mapDeleteMembers
// ---------------------------------------------------------------------------
describe('mapDeleteMembers', () => {
  const dto: DeleteMemberDTO = { member_id: 55, team_id: 10, current_user_id: 2 };

  it('maps member_id → memberId', () => {
    expect(mapDeleteMembers(dto).memberId).toBe(55);
  });

  it('maps team_id → teamId', () => {
    expect(mapDeleteMembers(dto).teamId).toBe(10);
  });

  it('maps current_user_id → currentUserId', () => {
    expect(mapDeleteMembers(dto).currentUserId).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// mapToAddMembersResponse
// ---------------------------------------------------------------------------
describe('mapToAddMembersResponse', () => {
  const dto: AddMembersResponseDTO = { id: 99 };

  it('maps id → ID', () => {
    expect(mapToAddMembersResponse(dto).ID).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: mapToAddMembersDTO ∘ mapToAddMembers is identity
// ---------------------------------------------------------------------------
describe('mapToAddMembersDTO / mapToAddMembers round-trip', () => {
  it('domain → DTO → domain preserves values', () => {
    const original: AddMembersRequest = { teamId: 42, userId: 13 };
    const roundTripped = mapToAddMembers(mapToAddMembersDTO(original));
    expect(roundTripped).toEqual(original);
  });
});
