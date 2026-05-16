import { useRef, useState, useEffect } from 'react';
import { type WallpaperKind, WALLPAPERS, setWallpaper, getWallpaper, getCustomUrl } from './WallpaperLayer';

function WallpaperPreview({ kind, customUrl }: { kind: WallpaperKind; customUrl: string }) {
  if (kind === 'none') return <div style={{ width: '100%', height: '100%', background: 'var(--bg-sunk)' }} />;
  if (kind === 'custom') {
    return customUrl
      ? <div style={{ width: '100%', height: '100%', backgroundImage: `url(${customUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ink-3)' }}>+</div>;
  }
  return <div className="wp-preview" data-kind={kind} />;
}

export function WallpaperPicker({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState<WallpaperKind>(getWallpaper);
  const [customUrl, setCustomUrl] = useState(getCustomUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => { setCurrent(getWallpaper()); setCustomUrl(getCustomUrl()); };
    window.addEventListener('coop_wallpaper_changed', handler);
    return () => window.removeEventListener('coop_wallpaper_changed', handler);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = r.result as string;
      setCustomUrl(url);
      setWallpaper('custom', url);
      setCurrent('custom');
    };
    r.readAsDataURL(f);
  };

  return (
    <div className="wp-picker" onClick={e => e.stopPropagation()}>
      <div className="wp-picker-header">
        <span>Обои</span>
        <button className="wp-picker-close" onClick={onClose}>✕</button>
      </div>
      <div className="wp-picker-grid">
        {(Object.entries(WALLPAPERS) as [WallpaperKind, string][]).map(([k, label]) => (
          <button
            key={k}
            className={`wp-picker-btn ${current === k ? 'active' : ''}`}
            onClick={() => {
              if (k === 'custom') { fileRef.current?.click(); return; }
              setWallpaper(k);
              setCurrent(k);
            }}
            title={label}
          >
            <WallpaperPreview kind={k} customUrl={customUrl} />
            <span className="wp-picker-label">{label}</span>
          </button>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
    </div>
  );
}
