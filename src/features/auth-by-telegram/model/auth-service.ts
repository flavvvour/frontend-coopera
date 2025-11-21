const JWT_TOKEN_KEY = 'coopera_jwt_token';

export const authService = {
  saveToken: (token: string) => {
    localStorage.setItem(JWT_TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    return localStorage.getItem(JWT_TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
  },

  // Проверяем валидность токена (упрощенная версия)
  isTokenValid: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};