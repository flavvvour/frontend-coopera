// entities/team/types.ts

export interface TeamMemberApi {
    id: number;
    user_id: number;
    username: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    points?: number;
  }
  
  export interface ApiTeam {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    created_by: number;
    members?: TeamMemberApi[]; // Заменили any[] на конкретный тип
  }
  
  export interface CreateTeamResponse {
    id: number;
    name: string;
    created_at: string;
    created_by: number;
  }
  
  export interface Team {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    members: TeamMember[];
    projects: Project[];
  }
  
  export interface TeamMember {
    id: string;
    userId: string;
    username: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    points: number;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    teamId: string;
    createdAt: string;
    tasks: Task[];
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done' | 'review';
    priority: 'low' | 'medium' | 'high';
    points: number;
    assigneeId?: string;
    assigneeName?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    projectId: string;
    tags: string[];
  }