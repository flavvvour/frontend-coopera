const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Teams API
  async getTeams() {
    return this.request('/teams/list');
  }

  async createTeam(data: { name: string; description: string; user_id: number }) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeam(teamId: number) {
    return this.request(`/teams?team_id=${teamId}`);
  }

  // Tasks API
  async getTasks(teamId: number) {
    return this.request(`/tasks?team_id=${teamId}`);
  }

  async createTask(data: { title: string; description: string; creator_id: number; team_id: number }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users API
  async createUser(data: { telegram_id: number; username: string; first_name: string; last_name: string }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(telegramId: number) {
    return this.request(`/users?telegram_id=${telegramId}`);
  }
}

export const apiClient = new ApiClient();