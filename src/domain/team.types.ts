// GET
export interface Team {
  id: number;
  name: string;
  createdAt: string;
  createdByUser: number;
  members: Members[];
}

export interface Members {
  name?: string;
  memberId: number;
  username: string;
  role: string;
}

// POST
export interface CreateTeam {
  id: number;
  name: string;
  createdAt: string;
  createdBy: number;
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
