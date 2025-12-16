import type { AddMembersRequestDTO, AddMembersResponseDTO } from './post/memberships.types';
import type { DeleteMemberDTO } from './delete/memberships.types';
import type {
  AddMembersRequest,
  DeleteMember,
  AddMembersResponse,
} from '@/domain/memberships.types';

export function mapToAddMembersDTO(domain: AddMembersRequest): AddMembersRequestDTO {
  return {
    team_id: domain.teamId,
    user_id: domain.userId,
  };
}

export function mapToAddMembers(dto: AddMembersRequestDTO): AddMembersRequest {
  return {
    teamId: dto.team_id,
    userId: dto.user_id,
  };
}

export function mapDeleteMembers(dto: DeleteMemberDTO): DeleteMember {
  return {
    memberId: dto.member_id,
    teamId: dto.team_id,
    currentUserId: dto.current_user_id,
  };
}

export function mapToAddMembersResponse(dto: AddMembersResponseDTO): AddMembersResponse {
  return {
    ID: dto.id,
  };
}
