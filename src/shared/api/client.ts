/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Client (FSD: shared/api) - С преобразованием camelCase <-> snake_case
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Простая функция для преобразования camelCase -> snake_case
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = obj[key];
      return acc;
    },
    {} as Record<string, any>
  );
};

// Простая функция для преобразования snake_case -> camelCase
// Исправьте toCamelCase в apiClient.ts:
const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    // Преобразуем snake_case в camelCase
    if (key.includes('_')) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key]; // Создаем camelCase версию
      // ✅ Сохраняем оригинальное snake_case поле ТОЛЬКО если его еще нет
      if (!(key in result)) {
        result[key] = obj[key];
      }
    } else {
      // Сохраняем как есть
      result[key] = obj[key];
    }
  }

  // ✅ СПЕЦИАЛЬНОЕ ПРЕОБРАЗОВАНИЕ для полей API которые приходят в PascalCase
  const specialMappings = [
    { pascal: 'ID', camel: 'id' },
    { pascal: 'createdByUser', camel: 'createdByUser' },
    { pascal: 'CreatedAt', camel: 'createdAt' },
    { pascal: 'assignedToMember', camel: 'assignedToMember' },
    { pascal: 'UpdatedAt', camel: 'updatedAt' },
  ];

  specialMappings.forEach(({ pascal, camel }) => {
    if (obj[pascal] !== undefined && !(camel in result)) {
      result[camel] = obj[pascal];
    }
  });

  return result;
};

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // 🔥 ДОБАВЬТЕ ЭТОТ КОД ПЕРЕД interceptors.response.use
    // Интерцептор для логирования исходящих запросов
    this.axiosInstance.interceptors.request.use(
      config => {
        if (import.meta.env.DEV) {
          console.log('📤 [API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            params: config.params,
            headers: config.headers,
          });
        }
        return config;
      },
      error => {
        console.error('❌ [API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Существующий интерцептор ответов
    this.axiosInstance.interceptors.response.use(
      response => {
        // Преобразуем ответ из snake_case в camelCase
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data)) {
            response.data = response.data.map(item =>
              typeof item === 'object' ? toCamelCase(item) : item
            );
          } else {
            response.data = toCamelCase(response.data);
          }
        }

        // 🔥 ДОБАВЬТЕ ЛОГИРОВАНИЕ УСПЕШНЫХ ОТВЕТОВ
        if (import.meta.env.DEV) {
          console.log('📥 [API Response]', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            url: response.config.url,
            method: response.config.method?.toUpperCase(),
          });
        }

        return response;
      },
      (error: AxiosError) => {
        if (import.meta.env.DEV) {
          console.error('❌ [API Error]', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            requestData: error.config?.data ? JSON.parse(error.config.data) : undefined,
          });
        }
        throw error;
      }
    );
  }

  // ========== Teams API ==========

  async createTeam(data: { userId: number; name: string }) {
    const snakeData = toSnakeCase(data);
    const response = await this.axiosInstance.post('/teams/', snakeData);
    return response.data;
  }

  async getTeam(teamId: number) {
    const response = await this.axiosInstance.get(`/teams/?team_id=${teamId}`);
    return response.data;
  }

  async deleteTeam(teamId: number, currentUserId: number) {
    await this.axiosInstance.delete(`/teams/?team_id=${teamId}&current_user_id=${currentUserId}`);
  }

  // ========== Tasks API ==========

  async getTasks(teamId: number) {
    const response = await this.axiosInstance.get(`/tasks/?team_id=${teamId}`);
    return response.data;
  }

  async createTask(data: {
    teamId: number;
    title: string;
    description?: string;
    points?: number;
    assignedToMember?: number;
    currentUserId: number;
  }) {
    const snakeData = toSnakeCase(data);
    const response = await this.axiosInstance.post('/tasks/', snakeData);
    return response.data;
  }

  async updateTask(data: {
    taskId: number;
    currentUserId: number;
    title?: string;
    description?: string;
    points?: number;
    assignedToMember?: number | null;
  }) {
    const snakeData = toSnakeCase(data);
    const response = await this.axiosInstance.patch('/tasks/', snakeData);
    return response.data;
  }

  async updateTaskStatus(data: { taskId: number; currentUserId: number; status: string }) {
    const snakeData = toSnakeCase(data);
    const response = await this.axiosInstance.patch('/tasks/status', snakeData);
    return response.data;
  }

  async deleteTask(taskId: number, currentUserId: number) {
    await this.axiosInstance.delete(`/tasks/?task_id=${taskId}&current_user_id=${currentUserId}`);
  }
  // ========== Members API ==========

  async addTeamMemberByUsername(data: { teamId: number; username: string; currentUserId: number }) {
    try {
      console.log('🔍 [API] Ищем пользователя по username:', data.username);

      // 1. Сначала находим пользователя по username
      const userResponse = await this.getUser(undefined, data.username);

      if (!userResponse) {
        throw new Error(`Пользователь "${data.username}" не найден в системе`);
      }

      console.log('✅ [API] Пользователь найден:', userResponse);

      // 2. Получаем ID пользователя
      const userId = userResponse.id || userResponse.ID || userResponse.userId;

      if (!userId) {
        throw new Error('Не удалось получить ID пользователя');
      }

      console.log('🔄 [API] Проверяем, не состоит ли уже в команде:', {
        teamId: data.teamId,
        userId,
      });

      // 3. Проверяем, не состоит ли уже в команде
      const teamData = await this.getTeam(data.teamId);
      if (teamData.members && Array.isArray(teamData.members)) {
        const isAlreadyMember = teamData.members.some((member: any) => {
          const memberId = member.member_id || member.memberId || member.userId;
          return memberId === userId;
        });

        if (isAlreadyMember) {
          throw new Error(`Пользователь "${data.username}" уже состоит в этой команде`);
        }
      }

      console.log('📤 [API] Отправляем данные на сервер:', {
        team_id: data.teamId,
        member_id: userId,
        added_by: data.currentUserId,
      });

      // 4. Отправляем запрос - ВАЖНО: используем правильный формат
      // Попробуйте оба варианта:

      // Вариант 1: Как в вашем оригинальном fetch
      const requestData = {
        team_id: data.teamId,
        member_id: userId,
        added_by: data.currentUserId,
        role: 'member',
      };

      console.log('📤 [API] Данные для отправки:', requestData);

      const response = await this.axiosInstance.post('/memberships/', requestData);

      console.log('✅ [API] Участник успешно добавлен:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Ошибка добавления участника:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      // Детальная диагностика ошибки
      if (error.response?.status === 400) {
        const serverError = error.response.data;
        console.log('📋 [API] Ошибка 400 от сервера:', serverError);

        if (serverError?.error?.includes('record not found')) {
          throw new Error(`Пользователь не найден в системе`);
        }

        // Возможно бэкенд ожидает другой формат данных
        console.log('⚠️ Возможно неверный формат данных. Пробуем альтернативный формат...');

        // Альтернативный вариант 2
        try {
          // Снова пытаемся найти пользователя для получения userId
          const userResponse = await this.getUser(undefined, data.username);
          if (!userResponse) {
            throw new Error(`Пользователь "${data.username}" не найден в системе`);
          }

          const userId = userResponse.id || userResponse.ID || userResponse.userId;

          const altRequestData = {
            teamId: data.teamId,
            memberId: userId,
            addedBy: data.currentUserId,
            role: 'member',
          };

          console.log('🔄 Пробуем альтернативный формат:', altRequestData);
          const altResponse = await this.axiosInstance.post('/memberships/', altRequestData);
          return altResponse.data;
        } catch (altError) {
          console.error('❌ Альтернативный формат тоже не работает:', altError);
        }

        throw new Error(`Ошибка сервера: ${JSON.stringify(serverError)}`);
      }

      throw error;
    }
  }

  async addMember(data: { teamId: number; userId: number; currentUserId: number }) {
    const snakeData = toSnakeCase({
      ...data,
      role: 'member',
    });
    const response = await this.axiosInstance.post('/memberships/', snakeData);
    return response.data;
  }

  async removeMember(data: { teamId: number; userId: number; currentUserId: number }) {
    const snakeData = toSnakeCase(data);
    await this.axiosInstance.delete('/memberships/', { data: snakeData });
  }

  // ========== Users API ==========

  async createUser(data: { telegramId: number; username: string; photoUrl?: string }) {
    const snakeData = toSnakeCase(data);
    const response = await this.axiosInstance.post('/users/', snakeData);
    return response.data;
  }

  async getUser(telegramId?: number, username?: string) {
    console.log('📞 API: getUser called with:', { telegramId, username });

    const params: Record<string, any> = {};
    if (telegramId !== undefined) {
      params.telegram_id = telegramId;
    }
    if (username !== undefined) {
      params.username = username;
    }

    console.log('📞 API: Final params:', params);

    try {
      const response = await this.axiosInstance.get('/users/', { params });
      console.log('📞 API: GET /users/ SUCCESS:', {
        status: response.status,
        data: response.data,
        // Покажем все поля
        fields: response.data ? Object.keys(response.data) : [],
      });
      return response.data;
    } catch (error: any) {
      console.log('📞 API: GET /users/ ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteUser(userId: number) {
    await this.axiosInstance.delete(`/users/?user_id=${userId}`);
  }

  async getUserTeams(userId: number) {
    try {
      const response = await this.axiosInstance.get(`/users/${userId}/teams`);
      console.log('✅ getUserTeams response:', response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log('Нет отдельного endpoint для команд пользователя...');

      // Пробуем получить все команды
      try {
        const response = await this.axiosInstance.get('/teams/');
        const allTeams = response.data || [];
        console.log('📋 Всего команд в системе:', allTeams.length);

        // Фильтруем команды пользователя
        const userTeams = allTeams.filter((team: any) => {
          // Проверяем создателя (разные форматы)
          const isCreator =
            team.createdByUser === userId ||
            team.created_by === userId ||
            team.createdByUser === userId;

          if (isCreator) {
            console.log(`👑 Пользователь создал команду ${team.ID || team.id}`);
            return true;
          }

          // Проверяем участников
          if (team.members && Array.isArray(team.members)) {
            const isMember = team.members.some((member: any) => {
              const memberId =
                member.memberId ||
                member.member_id ||
                member.userId ||
                member.user_id ||
                member.MemberId;

              return memberId === userId;
            });

            if (isMember) {
              console.log(`👤 Пользователь участник команды ${team.ID || team.id}`);
              return true;
            }
          }

          return false;
        });

        console.log(`✅ Пользователь ${userId} состоит в ${userTeams.length} командах`);
        return userTeams;
      } catch (err) {
        console.error('❌ Ошибка получения команд:', err);
        return []; // Возвращаем пустой массив
      }
    }
  }

  async getUserById(userId: number) {
    try {
      const response = await this.axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUsersByIds(userIds: number[]) {
    try {
      // Если есть endpoint для batch запроса
      const params = new URLSearchParams();
      userIds.forEach(id => params.append('user_ids', id.toString()));

      const response = await this.axiosInstance.get(`/users/batch?${params.toString()}`);

      // Преобразуем массив в объект { userId: userData }
      const usersMap: Record<number, any> = {};
      if (Array.isArray(response.data)) {
        response.data.forEach((user: any) => {
          if (user.id) {
            usersMap[user.id] = user;
          }
        });
      }

      return usersMap;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn('Batch endpoint not available, fetching sequentially...');
      return this.getUsersByIdsSequentially(userIds);
    }
  }

  private async getUsersByIdsSequentially(userIds: number[]): Promise<Record<number, any>> {
    const usersMap: Record<number, any> = {};

    for (const userId of userIds) {
      try {
        const user = await this.getUserById(userId);
        if (user) {
          usersMap[userId] = user;
        }
      } catch (error) {
        console.warn(`Failed to fetch user ${userId}:`, error);
      }
    }

    return usersMap;
  }

  async getAllUsers() {
    try {
      // Попробуем получить всех пользователей без параметров
      const response = await this.axiosInstance.get('/users/');
      console.log('📞 API: GET /users/ (all users) response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('📞 API: Failed to get all users:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
