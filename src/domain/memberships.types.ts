export interface AddMembersRequest {
    teamId: number;
    userId: number;
}

export interface DeleteMember {
    memberId: number;
    teamId: number;
    currentUserId: number;
}

export interface AddMembersResponse {
    ID: number;
}