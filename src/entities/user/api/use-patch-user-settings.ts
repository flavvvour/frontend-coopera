import { useMutation } from '@tanstack/react-query';
import { patchUserSettings } from './users.api';

interface PatchSettingsVars {
  userId: number;
  wallpaper: string;
  wallpaperCustomUrl: string;
  theme: string;
}

export function useHookPatchUserSettings() {
  const mutation = useMutation<void, Error, PatchSettingsVars>({
    mutationFn: ({ userId, wallpaper, wallpaperCustomUrl, theme }) =>
      patchUserSettings(userId, wallpaper, wallpaperCustomUrl, theme),
  });

  return {
    patch: (userId: number, wallpaper: string, wallpaperCustomUrl: string, theme: string) =>
      mutation.mutateAsync({ userId, wallpaper, wallpaperCustomUrl, theme }),
    loading: mutation.isPending,
  };
}
