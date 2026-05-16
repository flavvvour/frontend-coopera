import type { GetUserDTO } from './get/user.types';
import type { User } from '../../../domain/user.types';

export function mapUser(dto: GetUserDTO): User {
  return {
    id: dto.id,
    telegramID: dto.telegram_id,
    username: dto.username,
    photoUrl: dto.photo_url,
    createdAt: new Date(dto.created_at),
    teams: dto.teams.map(t => ({
      id: t.id,
      name: t.name,
      role: t.role,
      emoji: t.emoji,
      color: t.color,
    })),
    wallpaper: dto.wallpaper || 'none',
    wallpaperCustomUrl: dto.wallpaper_custom_url || '',
    theme: dto.theme || 'light',
  };
}
