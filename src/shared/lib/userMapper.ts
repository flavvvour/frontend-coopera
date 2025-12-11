import { apiClient } from '../api/client';

class UserMapper {
  private userCache: Map<number, { username: string; telegramId?: number }> = new Map();

  async getUsername(userId: number): Promise<string> {
    // Проверяем кэш
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!.username;
    }

    try {
      console.log(`🔍 UserMapper: fetching user with id=${userId}`);

      // Нужно получить пользователя по внутреннему ID
      // Но у нас только getUser(telegramId, username)
      // Нужен новый endpoint или будем получать всех пользователей

      // Временное решение: получаем всех пользователей
      const allUsers = await this.getAllUsers();
      const user = allUsers.find(u => u.id === userId);

      if (user && user.username) {
        const displayName = `@${user.username}`;
        console.log(`✅ UserMapper: found ${userId} -> @${user.username}`);

        // Сохраняем в кэш
        this.userCache.set(userId, {
          username: displayName,
          telegramId: user.telegramId,
        });

        return displayName;
      }

      return `@user_${userId}`;
    } catch (error) {
      console.error(`❌ UserMapper: Failed to fetch user ${userId}:`, error);
      return `@user_${userId}`;
    }
  }

  async getUsernames(userIds: number[]): Promise<Record<number, string>> {
    console.log(`🔍 UserMapper: getUsernames for user IDs:`, userIds);

    const result: Record<number, string> = {};
    const toFetch: number[] = [];

    // Проверяем кэш
    for (const userId of userIds) {
      if (this.userCache.has(userId)) {
        result[userId] = this.userCache.get(userId)!.username;
      } else {
        toFetch.push(userId);
      }
    }

    // Загружаем оставшихся
    if (toFetch.length > 0) {
      console.log(`🔍 UserMapper: Need to fetch ${toFetch.length} users`);

      // Получаем всех пользователей за раз
      try {
        const allUsers = await this.getAllUsers();

        for (const userId of toFetch) {
          const user = allUsers.find(u => u.id === userId);

          if (user && user.username) {
            const displayName = `@${user.username}`;
            this.userCache.set(userId, {
              username: displayName,
              telegramId: user.telegramId,
            });
            result[userId] = displayName;
          } else {
            result[userId] = `@user_${userId}`;
          }
        }
      } catch (error) {
        console.error('❌ UserMapper: Failed to fetch all users:', error);
        for (const userId of toFetch) {
          result[userId] = `@user_${userId}`;
        }
      }
    }

    console.log(`✅ UserMapper: Result:`, result);
    return result;
  }

  private async getAllUsers(): Promise<any[]> {
    try {
      // Попробуем получить всех пользователей
      // Если endpoint /users/ без параметров возвращает всех
      const users = await apiClient.getUser();
      return Array.isArray(users) ? users : users ? [users] : [];
    } catch (error) {
      console.error('❌ UserMapper: Failed to get all users:', error);
      return [];
    }
  }

  // Инициализируем кэш известными пользователями
  initKnownUsers() {
    // ID 58 -> @flavvvour
    this.userCache.set(2, { username: '@flavvvour', telegramId: 416604955 });
    // ID 63 -> @flavvvour_from_frontend
    this.userCache.set(63, { username: '@flavvvour_from_frontend', telegramId: 633239384 });
    this.userCache.set(67, { username: '@alexey' });
    this.userCache.set(68, { username: '@ekaterina' });
    this.userCache.set(69, { username: '@mikhail' });
    this.userCache.set(70, { username: '@anna' });
    this.userCache.set(71, { username: '@sergey' });
    console.log('✅ UserMapper: initialized with known users');
  }
}

export const userMapper = new UserMapper();
userMapper.initKnownUsers();
