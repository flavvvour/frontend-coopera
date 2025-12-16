// utils/test-users.ts
export const TEST_USERS = [
  {
    id: 58,
    telegramId: 416604955,
    username: 'flavvvour',
    role: 'manager',
    description: 'Менеджер (создатель команд)',
  },
  {
    id: 67,
    telegramId: 100000001,
    username: 'alexey',
    role: 'member',
    description: 'Обычный участник',
  },
];

export const getCurrentTestUser = () => {
  return localStorage.getItem('test-user-id');
};

export const setCurrentTestUser = (telegramId: number) => {
  localStorage.setItem('test-user-id', telegramId.toString());
};

export const clearTestUser = () => {
  localStorage.removeItem('test-user-id');
};
