export interface GetTeamDTO {
    id: number;
    name: string;
    created_at: string;
    created_by_user: number;
    members: MembersDTO[];
}

export interface MembersDTO {
    member_id: number;
    username: string;
    role: string;
}
