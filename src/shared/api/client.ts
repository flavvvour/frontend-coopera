/**
 * API Client (FSD: shared/api)
 * 
 * IMPLEMENTED:
 * - Axios-based HTTP client with base URL configuration
 * - Response error interceptor for consistent error handling
 * - Teams API: getTeams, createTeam, getTeam, deleteTeam
 * - Tasks API: getTasks, createTask, updateTask
 * - Memberships API: addMember, removeMember
 * - Users API: createUser, getUser, getUserByUsername
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
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          body: error.response?.data,
          url: error.config?.url,
        });
        throw error;
      }
    );
  }

  // Teams API
  async getTeams(userId?: number) {
    try {
      if (userId) {
        const response = await this.axiosInstance.get(`/teams/?user_id=${userId}`);
        return response.data;
      }
      // Если user_id не передан, возвращаем пустой массив
      return [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Backend требует обязательный параметр (team_id или user_id)
      return [];
    }
  }

  async createTeam(data: { name: string; description: string; user_id: number }) {
    const response = await this.axiosInstance.post('/teams/', data);
    return response.data;
  }

  async getTeam(teamId: number) {
    const response = await this.axiosInstance.get(`/teams/?team_id=${teamId}`);
    return response.data;
  }

  async deleteTeam(teamId: number, currentUserId: number) {
    const response = await this.axiosInstance.delete(`/teams/?team_id=${teamId}&current_user_id=${currentUserId}`);
    return response.data;
  }

  // Tasks API
  async getTasks(teamId: number) {
    const response = await this.axiosInstance.get(`/tasks/?team_id=${teamId}`);
    return response.data;
  }

  async createTask(data: { 
    title: string; 
    description: string; 
    team_id: number;
    points: number;
    current_user_id: number;
  }) {
    const response = await this.axiosInstance.post('/tasks/', data);
    return response.data;
  }

  async updateTask(taskId: number, data: { 
    status?: string;
    title?: string;
    description?: string;
    points?: number;
    order?: number;
    current_user_id: number;
  }) {
    const response = await this.axiosInstance.patch(`/tasks/?task_id=${taskId}`, data);
    return response.data;
  }

  // Memberships API
  async addMember(data: { team_id: number; user_id: number; role?: string }) {
    const response = await this.axiosInstance.post('/memberships/', data);
    return response.data;
  }

  async removeMember(teamId: number, userId: number) {
    const response = await this.axiosInstance.delete(`/memberships/?team_id=${teamId}&user_id=${userId}`);
    return response.data;
  }

  // Users API
  async createUser(data: { telegram_id: number; username: string; first_name: string; last_name: string }) {
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