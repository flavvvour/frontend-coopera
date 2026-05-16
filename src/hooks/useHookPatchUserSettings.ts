import { useState } from 'react';
import { patchUserSettings } from '../api/dto/user/users.api';

export function useHookPatchUserSettings() {
  const [loading, setLoading] = useState(false);
  const patch = async (userId: number, wallpaper: string, wallpaperCustomUrl: string, theme: string) => {
    setLoading(true);
    try {
      await patchUserSettings(userId, wallpaper, wallpaperCustomUrl, theme);
    } finally {
      setLoading(false);
    }
  };
  return { patch, loading };
}
