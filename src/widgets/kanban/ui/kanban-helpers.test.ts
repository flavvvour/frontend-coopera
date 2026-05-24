import { describe, it, expect, vi, afterEach } from 'vitest';
import { SECONDS_IN_HOUR, SECONDS_IN_DAY } from '@/shared/lib/constants';

const MEMBER_COLORS = [
  '#5b8def','#3b7dd8','#6fa3f5','#4c8ee8','#7ab3ff','#3572cc','#88b8f8','#2e67c4',
];

function getMemberColor(id: number) { return MEMBER_COLORS[id % MEMBER_COLORS.length]; }

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'только что';
  if (diff < SECONDS_IN_HOUR) return `${Math.floor(diff / 60)} мин`;
  if (diff < SECONDS_IN_DAY) return `${Math.floor(diff / SECONDS_IN_HOUR)} ч`;
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function pluralTasks(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} задача`;
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return `${n} задачи`;
  return `${n} задач`;
}

describe('timeAgo', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('returns "только что" for differences under 60 seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:30Z'));
    const ts = new Date('2024-01-01T12:00:00Z').getTime();
    expect(timeAgo(ts)).toBe('только что');
  });

  it('returns minutes string for differences under 1 hour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:05:00Z'));
    const ts = new Date('2024-01-01T12:00:00Z').getTime();
    expect(timeAgo(ts)).toBe('5 мин');
  });

  it('returns hours string for differences under 24 hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T15:00:00Z'));
    const ts = new Date('2024-01-01T12:00:00Z').getTime();
    expect(timeAgo(ts)).toBe('3 ч');
  });

  it('returns localeDateString for differences of 24 hours or more', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-03T12:00:00Z'));
    const ts = new Date('2024-01-01T12:00:00Z').getTime();
    const result = timeAgo(ts);
    expect(result).not.toBe('только что');
    expect(result).not.toMatch(/мин$/);
    expect(result).not.toMatch(/ч$/);
    expect(result).toMatch(/\d/);
  });
});

describe('pluralTasks', () => {
  it('returns задача for 1', () => { expect(pluralTasks(1)).toBe('1 задача'); });
  it('returns задача for 21', () => { expect(pluralTasks(21)).toBe('21 задача'); });
  it('returns задачи for 2', () => { expect(pluralTasks(2)).toBe('2 задачи'); });
  it('returns задачи for 3', () => { expect(pluralTasks(3)).toBe('3 задачи'); });
  it('returns задачи for 4', () => { expect(pluralTasks(4)).toBe('4 задачи'); });
  it('returns задачи for 22', () => { expect(pluralTasks(22)).toBe('22 задачи'); });
  it('returns задач for 0', () => { expect(pluralTasks(0)).toBe('0 задач'); });
  it('returns задач for 5', () => { expect(pluralTasks(5)).toBe('5 задач'); });
  it('returns задач for 11', () => { expect(pluralTasks(11)).toBe('11 задач'); });
  it('returns задач for 12', () => { expect(pluralTasks(12)).toBe('12 задач'); });
  it('returns задач for 14', () => { expect(pluralTasks(14)).toBe('14 задач'); });
  it('returns задача for 101', () => { expect(pluralTasks(101)).toBe('101 задача'); });
});

describe('getInitials', () => {
  it('returns first 2 chars uppercased', () => {
    expect(getInitials('alexey')).toBe('AL');
  });

  it('works with a single-char username', () => {
    expect(getInitials('a')).toBe('A');
  });

  it('works with already-uppercase username', () => {
    expect(getInitials('IVAN')).toBe('IV');
  });

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getMemberColor', () => {
  it('returns color from MEMBER_COLORS by modulo', () => {
    expect(getMemberColor(0)).toBe(MEMBER_COLORS[0]);
    expect(getMemberColor(1)).toBe(MEMBER_COLORS[1]);
    expect(getMemberColor(MEMBER_COLORS.length)).toBe(MEMBER_COLORS[0]);
  });

  it('wraps around palette for large ids', () => {
    const id = 100;
    expect(getMemberColor(id)).toBe(MEMBER_COLORS[id % MEMBER_COLORS.length]);
  });

  it('always returns non-empty string', () => {
    for (let i = 0; i < MEMBER_COLORS.length * 2; i++) {
      expect(getMemberColor(i)).toBeTruthy();
    }
  });
});
