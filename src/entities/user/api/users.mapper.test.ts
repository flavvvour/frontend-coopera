import { describe, it, expect } from 'vitest';
import { mapUser } from './users.mapper';
import type { GetUserDTO } from './get/user.types';

const base: GetUserDTO = {
  id: 1,
  telegram_id: 987654321,
  username: 'alice',
  created_at: '2024-01-15T12:00:00Z',
  teams: [
    { id: 10, name: 'Alpha', role: 'owner', emoji: '🚀', color: '#abc' },
    { id: 11, name: 'Beta', role: 'member' },
  ],
  wallpaper: 'aurora',
  wallpaper_custom_url: 'https://example.com/bg.jpg',
  theme: 'dark',
};

describe('mapUser', () => {
  it('maps telegram_id → telegramID', () => {
    expect(mapUser(base).telegramID).toBe(987654321);
  });

  it('maps photo_url → photoUrl', () => {
    expect(mapUser({ ...base, photo_url: 'https://cdn.example.com/photo.jpg' }).photoUrl)
      .toBe('https://cdn.example.com/photo.jpg');
  });

  it('leaves photoUrl undefined when photo_url is absent', () => {
    expect(mapUser(base).photoUrl).toBeUndefined();
  });

  it('maps created_at to a Date instance', () => {
    expect(mapUser(base).createdAt).toBeInstanceOf(Date);
  });

  it('parsed Date matches the ISO string value', () => {
    const result = mapUser(base);
    expect(result.createdAt.toISOString()).toBe('2024-01-15T12:00:00.000Z');
  });

  it('maps wallpaper_custom_url → wallpaperCustomUrl', () => {
    expect(mapUser(base).wallpaperCustomUrl).toBe('https://example.com/bg.jpg');
  });

  it('passes id, username, wallpaper, theme through unchanged', () => {
    const result = mapUser(base);
    expect(result.id).toBe(1);
    expect(result.username).toBe('alice');
    expect(result.wallpaper).toBe('aurora');
    expect(result.theme).toBe('dark');
  });

  it('defaults wallpaper to "none" when falsy', () => {
    expect(mapUser({ ...base, wallpaper: '' }).wallpaper).toBe('none');
  });

  it('defaults wallpaperCustomUrl to "" when falsy', () => {
    expect(mapUser({ ...base, wallpaper_custom_url: '' }).wallpaperCustomUrl).toBe('');
  });

  it('defaults theme to "light" when falsy', () => {
    expect(mapUser({ ...base, theme: '' }).theme).toBe('light');
  });

  it('maps teams array preserving all fields', () => {
    const result = mapUser(base);
    expect(result.teams).toHaveLength(2);
    expect(result.teams[0]).toEqual({ id: 10, name: 'Alpha', role: 'owner', emoji: '🚀', color: '#abc' });
  });

  it('leaves team emoji and color undefined when absent', () => {
    const result = mapUser(base);
    expect(result.teams[1].emoji).toBeUndefined();
    expect(result.teams[1].color).toBeUndefined();
  });

  it('produces empty teams array when teams is empty', () => {
    expect(mapUser({ ...base, teams: [] }).teams).toEqual([]);
  });
});
