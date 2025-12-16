import type { GetTeamDTO } from './get/team.types';
import type { CreateTeamResponseDTO } from './post/team.types';
import type { DeleteTeamResponseDTO } from './delete/team.types'
import type { Team, CreateTeam, DeleteTeamResponse } from '../../../domain/team.types';

export function mapTeam(dto: GetTeamDTO): Team {
  return {
    id: dto.id,
    name: dto.name,
    createdAt: dto.created_at,
    createdByUser: dto.created_by_user,
    members: dto.members.map(t => ({
      memberId: t.member_id,
      username: t.username,
      role: t.role,
    })),
  };
}

export function mapCreatedTeam(dto: CreateTeamResponseDTO): CreateTeam {
    return {
        id: dto.id,
        name: dto.name,
        createdAt: dto.created_at,
        createdBy: dto.created_by,
    };
}

export function mapDeleteTeamResponse(dto: DeleteTeamResponseDTO): DeleteTeamResponse {
  return {
    success: dto.success,
    message: dto.message,
    deletedTeamId: dto.deleted_team_id,
    deletedAt: dto.deleted_at,
  };
}