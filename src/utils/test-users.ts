export const TEST_USERS: never[] = [];

export const getCurrentTestUser = () => localStorage.getItem('test-user-id');

export const setCurrentTestUser = (telegramId: number) => {
  localStorage.setItem('test-user-id', telegramId.toString());
};

export const clearTestUser = () => {
  localStorage.removeItem('test-user-id');
};
