export interface AddMemberRequest {
  team_id: number;
  user_id: number;
}

export interface RemoveMemberRequest {
  team_id: number;
  user_id: number;
  current_user_id: number;
}