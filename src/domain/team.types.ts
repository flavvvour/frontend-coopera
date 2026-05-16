// GET
export interface Team {
  id: number;
  name: string;
  createdAt: string;
  createdByUser: number;
  members: Members[];
  emoji?: string;
  color?: string;
  autoassign?: boolean;
}

export interface Members {
  name?: string;
  memberId: number;
  userId: number;
  username: string;
  role: string;
}

// POST
export interface CreateTeam {
  id: number;
  name: string;
  createdAt: string;
  createdBy: number;
  emoji?: string;
  color?: string;
}

// DELETE
export interface DeleteTeamRequest {
  teamId: number;
  currentUserId: number;
}

export interface DeleteTeamResponse {
  success: boolean;
  message: string;
  deletedTeamId?: number;
  deletedAt?: string;
}
