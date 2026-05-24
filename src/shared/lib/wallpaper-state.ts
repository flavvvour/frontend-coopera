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

let _wallpaper: WallpaperKind = 'none';
let _customUrl = '';
let _userId = 0;
const _listeners: Array<() => void> = [];

export function notifyWallpaperListeners() { _listeners.forEach(fn => fn()); }

export function subscribeWallpaper(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i >= 0) _listeners.splice(i, 1);
  };
}

export function initWallpaper(kind: WallpaperKind, customUrl: string, userId: number) {
  _wallpaper = kind;
  _customUrl = customUrl;
  _userId = userId;
  notifyWallpaperListeners();
}

export function getWallpaper(): WallpaperKind { return _wallpaper; }
export function getCustomUrl(): string { return _customUrl; }
export function getWallpaperUserId(): number { return _userId; }

export function setWallpaperState(kind: WallpaperKind, customUrl?: string) {
  _wallpaper = kind;
  if (customUrl !== undefined) _customUrl = customUrl;
  notifyWallpaperListeners();
}
