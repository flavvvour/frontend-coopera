/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import type { WallpaperKind } from '@/shared/lib/wallpaper-state';
import {
  getWallpaper,
  getCustomUrl,
  getWallpaperUserId,
  setWallpaperState,
  subscribeWallpaper,
} from '@/shared/lib/wallpaper-state';

export type { WallpaperKind } from '@/shared/lib/wallpaper-state';
export { initWallpaper } from '@/shared/lib/wallpaper-state';

export { getWallpaper, getCustomUrl } from '@/shared/lib/wallpaper-state';

export async function setWallpaper(kind: WallpaperKind, customUrl?: string) {
  setWallpaperState(kind, customUrl);
  window.dispatchEvent(new CustomEvent('coop_wallpaper_changed'));
  const userId = getWallpaperUserId();
  if (userId > 0) {
    try {
      const { patchUserSettings } = await import('@/entities/user/api/users.api');
      await patchUserSettings(userId, kind, getCustomUrl(), document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    } catch { /* ignore */ }
  }
}

export function WallpaperLayer() {
  const [wallpaper, setWp] = useState<WallpaperKind>(() => getWallpaper());
  const [customUrl, setCustom] = useState(() => getCustomUrl());

  useEffect(() => {
    const handler = () => { setWp(getWallpaper()); setCustom(getCustomUrl()); };
    const unsub = subscribeWallpaper(handler);
    const evHandler = () => { setWp(getWallpaper()); setCustom(getCustomUrl()); };
    window.addEventListener('coop_wallpaper_changed', evHandler);
    return () => {
      unsub();
      window.removeEventListener('coop_wallpaper_changed', evHandler);
    };
  }, []);

  if (wallpaper === 'none') return null;

  const hasBg = wallpaper !== 'paper' && wallpaper !== 'grid';

  return (
    <div className="wp-layer" data-kind={wallpaper} aria-hidden="true">
      {wallpaper === 'aurora' && (
        <>
          <div className="wp-blob wp-blob-1" />
          <div className="wp-blob wp-blob-2" />
          <div className="wp-blob wp-blob-3" />
          <div className="wp-aurora-flash" />
        </>
      )}
      {wallpaper === 'ocean' && (
        <>
          <div className="wp-wave wp-wave-1" />
          <div className="wp-wave wp-wave-2" />
          <div className="wp-wave wp-wave-3" />
        </>
      )}
      {wallpaper === 'meadow' && (
        <>
          <div className="wp-meadow-bg" />
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="wp-firefly"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </>
      )}
      {wallpaper === 'paper'  && <div className="wp-paper" />}
      {wallpaper === 'grid'   && <div className="wp-grid" />}
      {wallpaper === 'custom' && customUrl && (
        <div className="wp-custom" style={{ backgroundImage: `url(${customUrl})` }} />
      )}
      {hasBg && <div className="wp-veil" />}
    </div>
  );
}
