/**
 * API Client (FSD: shared/api)
 *
 * IMPLEMENTED:
 * - Axios-based HTTP client with base URL configuration
 * - Response error interceptor for consistent error handling
 * - Teams API: getTeam (by team_id), createTeam, deleteTeam
 * - Tasks API: getTasks, createTask, updateTask
 * - Memberships API: addMember, removeMember
 * - Users API: createUser, getUser (by telegram_id or username), getUserByUsername
 *
 * NOTE: Для получения списка команд пользователя используйте getUser(telegram_id).teams
 *
 * FUTURE:
 * - Implement request/response logging for development mode only
 * - Add authentication token handling via interceptors
 * - Implement request retry logic for failed requests
 * - Add request caching for GET endpoints
 * - Type-safe error handling with custom error classes
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor для обработки ошибок
    this.axiosInstance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        // Логируем только в development режиме
        if (import.meta.env.DEV) {
          console.error('API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            body: error.response?.data,
            url: error.config?.url,
          });
        }
        throw error;
      }
    );
  }

  // Teams API -> GET (team) POST, DELETE
  // Примечание: Для получения списка команд пользователя используйте getUser(telegram_id).teams
  // getTeams больше не поддерживается - используйте только getTeam(team_id)

  async createTeam(data: { name: string; description: string; user_id: number }) {
    const response = await this.axiosInstance.post('/teams/', data);
    return response.data;
  }

  async getTeam(teamId: number) {
    // Возвращает команду с участниками: { id, name, created_at, created_by, members: [{member_id, role}] }
    const response = await this.axiosInstance.get(`/teams/?team_id=${teamId}`);
    return response.data;
  }

  async deleteTeam(teamId: number, currentUserId: number) {
    const response = await this.axiosInstance.delete(
      `/teams/?team_id=${teamId}&current_user_id=${currentUserId}`
    );
    return response.data;
  }

  // Tasks API -> GET (tasks), POST, PATCH
  async getTasks(teamId: number) {
    const response = await this.axiosInstance.get(`/tasks/?team_id=${teamId}`);
    return response.data;
  }

  async createTask(data: {
    title: string;
    description: string;
    team_id: number;
    points: number;
    assigned_to?: number;
    current_user_id: number;
  }) {
    const response = await this.axiosInstance.post('/tasks/', data);
    return response.data;
  }

  async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      points?: number;
      assigned_to?: number;
      current_user_id: number;
    }
  ) {
    const response = await this.axiosInstance.patch(`/tasks/`, {
      task_id: taskId,
      ...data,
    });
    return response.data;
  }

  async updateTaskStatus(
    taskId: number,
    data: {
      status: string;
      current_user_id: number;
    }
  ) {
    const response = await this.axiosInstance.patch(`/tasks/status`, {
      task_id: taskId,
      ...data,
    });
    return response.data;
  }

  async deleteTask(taskId: number, currentUserId: number) {
    const response = await this.axiosInstance.delete(
      `/tasks/?task_id=${taskId}&current_user_id=${currentUserId}`
    );
    return response.data;
  }

  // Memberships API
  async getMemberships(teamId: number) {
    const response = await this.axiosInstance.get(`/memberships/?team_id=${teamId}`);
    return response.data;
  }

  async addMember(data: { team_id: number; user_id: number; role?: string }) {
    const response = await this.axiosInstance.post('/memberships/', data);
    return response.data;
  }

  async removeMember(teamId: number, userId: number) {
    const response = await this.axiosInstance.delete(
      `/memberships/?team_id=${teamId}&user_id=${userId}`
    );
    return response.data;
  }

  // Users API
  async createUser(data: {
    telegram_id: number;
    username: string;
    first_name: string;
    last_name: string;
  }) {
    const response = await this.axiosInstance.post('/users/', data);
    return response.data;
  }

  async getUser(telegramId: number) {
    const response = await this.axiosInstance.get(`/users/?telegram_id=${telegramId}`);
    return response.data;
  }

  async getUserByUsername(username: string) {
    const response = await this.axiosInstance.get(`/users/?username=${username}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
