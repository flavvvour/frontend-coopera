export interface GetTeamDTO {
    id: number;
    name: string;
    created_at: string;
    created_by_user: number;
    members: MembersDTO[];
    emoji?: string;
    color?: string;
    autoassign?: boolean;
}

export interface MembersDTO {
    member_id: number;
    user_id: number;
    username: string;
    role: string;
}
