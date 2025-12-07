import { describe, it, expect } from 'vitest';
import type { Task, TeamMember } from '@/entities/team';

// ==================== ФУНКЦИЯ 1: Проверка переходов статусов ====================
/**
 * Проверяет, может ли задача перейти из одного статуса в другой
 */
export function canTransitionStatus(
  currentStatus: string,
  newStatus: string,
  isManager: boolean
): boolean {
  if (isManager) return true;
  if (currentStatus === newStatus) return true;

  const allowedTransitions: Record<string, string[]> = {
    open: ['assigned'],
    assigned: ['in_review'],
    in_review: ['assigned'],
    completed: [],
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// ==================== ФУНКЦИЯ 2: Фильтрация задач по статусу ====================
/**
 * Фильтрует задачи по определенному статусу
 */
export function filterTasksByStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter(task => task.status === status);
}

// ==================== ФУНКЦИЯ 3: Подсчет очков задач ====================
/**
 * Подсчитывает общее количество очков по задачам
 */
export function calculateTotalPoints(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + (task.points || 0), 0);
}

// ==================== ФУНКЦИЯ 4: Проверка прав на редактирование ====================
/**
 * Проверяет, может ли пользователь редактировать задачу
 */
export function canEditTask(task: Task, userId: string, isManager: boolean): boolean {
  if (isManager) return true;
  return task.assigneeId === userId;
}

// ==================== ФУНКЦИЯ 5: Группировка задач по исполнителям ====================
/**
 * Группирует задачи по исполнителям
 */
export function groupTasksByAssignee(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    const assigneeId = task.assigneeId || 'unassigned';
    if (!acc[assigneeId]) {
      acc[assigneeId] = [];
    }
    acc[assigneeId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

// ==================== ФУНКЦИЯ 6: Проверка менеджера ====================
/**
 * Проверяет, является ли пользователь менеджером команды
 */
export function isUserManager(members: TeamMember[], userId: string): boolean {
  return members.some(member => member.userId === userId && member.role === 'manager');
}

// ==================== ФУНКЦИЯ 7: Форматирование даты ====================
/**
 * Форматирует дату в читаемый вид (DD.MM.YYYY)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}

// ==================== ФУНКЦИЯ 8: Валидация названия задачи ====================
/**
 * Проверяет, валидно ли название задачи
 */
export function isValidTaskTitle(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
}

// ==================== ФУНКЦИЯ 9: Подсчет задач по статусу ====================
/**
 * Подсчитывает количество задач в каждом статусе
 */
export function countTasksByStatus(tasks: Task[]): Record<string, number> {
  return tasks.reduce((acc, task) => {
    const status = task.status || 'open';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ==================== ФУНКЦИЯ 10: Получение имени исполнителя ====================
/**
 * Получает имя исполнителя задачи из списка участников
 */
export function getAssigneeName(task: Task, members: TeamMember[]): string {
  if (!task.assigneeId) return 'Не назначена';
  const member = members.find(m => m.userId === task.assigneeId);
  return member?.username || 'Неизвестный пользователь';
}

// ==================== 10 РАЗЛИЧНЫХ UNIT ТЕСТОВ ====================

describe('10 Different Unit Tests', () => {
  // Тестовые данные
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'open',
      points: 5,
      assigneeId: 'user1',
      assigneeName: 'User 1',
      projectId: 'project1',
      tags: [],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'assigned',
      points: 3,
      assigneeId: 'user2',
      assigneeName: 'User 2',
      projectId: 'project1',
      tags: [],
      createdAt: '2024-01-16',
      updatedAt: '2024-01-16',
    },
    {
      id: '3',
      title: 'Valid Task Name',
      description: 'Description 3',
      status: 'completed',
      points: 2,
      assigneeId: 'user1',
      assigneeName: 'User 1',
      projectId: 'project1',
      tags: [],
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
    },
  ];

  const mockMembers: TeamMember[] = [
    {
      id: '1',
      userId: 'user1',
      username: 'John Doe',
      role: 'manager',
      joinedAt: '2024-01-01',
      points: 100,
    },
    {
      id: '2',
      userId: 'user2',
      username: 'Jane Smith',
      role: 'member',
      joinedAt: '2024-01-02',
      points: 50,
    },
  ];

  // ТЕСТ 1: Проверка переходов статусов
  it('TEST 1: should validate status transitions correctly', () => {
    expect(canTransitionStatus('open', 'assigned', false)).toBe(true);
  });

  // ТЕСТ 2: Фильтрация задач по статусу
  it('TEST 2: should filter tasks by status', () => {
    const openTasks = filterTasksByStatus(mockTasks, 'open');
    expect(openTasks.length).toBe(1);
    expect(openTasks[0].id).toBe('1');
  });

  // ТЕСТ 3: Подсчет очков
  it('TEST 3: should calculate total points correctly', () => {
    const total = calculateTotalPoints(mockTasks);
    expect(total).toBe(10); // 5 + 3 + 2
  });

  // ТЕСТ 4: Проверка прав на редактирование
  it('TEST 4: should check edit permissions correctly', () => {
    expect(canEditTask(mockTasks[0], 'user1', false)).toBe(true);
    expect(canEditTask(mockTasks[0], 'user2', false)).toBe(false);
  });

  // ТЕСТ 5: Группировка задач по исполнителям
  it('TEST 5: should group tasks by assignee', () => {
    const grouped = groupTasksByAssignee(mockTasks);
    expect(grouped['user1'].length).toBe(2); // Task 1 и Task 3
    expect(grouped['user2'].length).toBe(1); // Task 2
  });

  // ТЕСТ 6: Проверка роли менеджера
  it('TEST 6: should identify manager correctly', () => {
    expect(isUserManager(mockMembers, 'user1')).toBe(true);
    expect(isUserManager(mockMembers, 'user2')).toBe(false);
  });

  // ТЕСТ 7: Форматирование даты
  it('TEST 7: should format date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('15.01.2024');
    expect(formatDate('invalid')).toBe('Invalid date');
  });

  // ТЕСТ 8: Валидация названия задачи
  it('TEST 8: should validate task title correctly', () => {
    expect(isValidTaskTitle('Valid Task Name')).toBe(true);
    expect(isValidTaskTitle('AB')).toBe(false); // слишком короткое
    expect(isValidTaskTitle('')).toBe(false); // пустое
  });

  // ТЕСТ 9: Подсчет задач по статусам
  it('TEST 9: should count tasks by status', () => {
    const counts = countTasksByStatus(mockTasks);
    expect(counts.open).toBe(1);
    expect(counts.assigned).toBe(1);
    expect(counts.completed).toBe(1);
  });

  // ТЕСТ 10: Получение имени исполнителя
  it('TEST 10: should get assignee name correctly', () => {
    expect(getAssigneeName(mockTasks[0], mockMembers)).toBe('John Doe');
    expect(getAssigneeName({ ...mockTasks[0], assigneeId: '' }, mockMembers)).toBe('Не назначена');
  });
});
