// ==================== Backend API Types ====================
// Типы для данных, приходящих с бэкенда (snake_case с json тегами)

export interface BackendTeam {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  created_by: number;
}

export interface BackendTask {
  id: number;
  team_id?: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  points?: number;
  order?: number;
  assignee_id?: number;
  assignee_name?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

// ==================== Frontend Types ====================
// Типы для использования в приложении (camelCase)

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
    status: 'open' | 'assigned' | 'in_review' | 'completed';  // Бэкендовские статусы
    priority: 'low' | 'medium' | 'high';
    points: number;
    order?: number;
    assigneeId?: string;
    assigneeName?: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    projectId: string;
    tags: string[];
  }