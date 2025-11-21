export interface CreateTeamData {
    name: string;
    description: string;
    userId: number;
  }
  
  export interface TeamMemberData {
    email: string;
    role?: 'admin' | 'member';
  }