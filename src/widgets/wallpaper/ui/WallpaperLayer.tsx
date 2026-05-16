import { useState, useEffect } from 'react';

export type WallpaperKind = 'none' | 'aurora' | 'ocean' | 'meadow' | 'paper' | 'grid' | 'custom';

export const WALLPAPERS: Record<WallpaperKind, string> = {
  none:   'Без обоев',
  aurora: 'Северное сияние',
  ocean:  'Океан',
  meadow: 'Луг',
  paper:  'Бумага',
  grid:   'Сетка',
  custom: 'Своё фото',
};

// In-memory cache so WallpaperLayer and WallpaperPicker stay in sync
let _wallpaper: WallpaperKind = 'none';
let _customUrl = '';
let _userId = 0;
const _listeners: Array<() => void> = [];

function notify() { _listeners.forEach(fn => fn()); }

export function initWallpaper(kind: WallpaperKind, customUrl: string, userId: number) {
  _wallpaper = kind;
  _customUrl = customUrl;
  _userId = userId;
  notify();
}

export async function setWallpaper(kind: WallpaperKind, customUrl?: string) {
  _wallpaper = kind;
  if (customUrl !== undefined) _customUrl = customUrl;
  notify();
  window.dispatchEvent(new CustomEvent('coop_wallpaper_changed'));
  if (_userId > 0) {
    try {
      const { patchUserSettings } = await import('../../../api/dto/user/users.api');
      await patchUserSettings(_userId, kind, _customUrl, document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    } catch {}
  }
}

export function getWallpaper(): WallpaperKind { return _wallpaper; }
export function getCustomUrl(): string { return _customUrl; }

export function WallpaperLayer() {
  const [wallpaper, setWp] = useState<WallpaperKind>(() => _wallpaper);
  const [customUrl, setCustom] = useState(() => _customUrl);

  useEffect(() => {
    const handler = () => { setWp(_wallpaper); setCustom(_customUrl); };
    _listeners.push(handler);
    const evHandler = () => { setWp(_wallpaper); setCustom(_customUrl); };
    window.addEventListener('coop_wallpaper_changed', evHandler);
    return () => {
      const idx = _listeners.indexOf(handler);
      if (idx >= 0) _listeners.splice(idx, 1);
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
