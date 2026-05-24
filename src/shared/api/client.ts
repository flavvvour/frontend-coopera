import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/shared/config/api';
import { ApiError } from './errors';

const toSnakeCase = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
      v,
    ])
  );

class ApiClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async createUser(data: {
    telegramId: number;
    username: string;
    photoUrl?: string;
  }): Promise<void> {
    try {
      await this.http.post('/users/', toSnakeCase(data as Record<string, unknown>));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new ApiError(err.response.status, JSON.stringify(err.response.data));
      }
      throw err;
    }
  }
}

export const apiClient = new ApiClient();
