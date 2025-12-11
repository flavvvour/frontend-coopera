export interface Team {
  id?: number;
  name: string;
  createdAt: string;
  createdByUser: number;
  members?: Array<{
    memberId: number;
    role: string;
  }>;
}

export interface TeamMember {
  username: string;
  id: number;
  teamId?: number;
  memberId: number;
  role: string;
  createdAt: string;
}

export interface CreateTeamRequest {
  user_id: number;
  name: string;
}

export interface GetTeamRequest {
  team_id: number;
}

export interface DeleteTeamRequest {
  team_id: number;
  current_user_id: number;
}