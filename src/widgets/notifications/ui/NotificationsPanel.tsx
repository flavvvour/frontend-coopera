import React, { useState } from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { markAllActivityRead, markSingleActivityRead, deleteAllActivity } from '@/entities/activity';
import type { ActivityEntryDTO } from '@/entities/activity';
import { useHookGetActivity } from '@/entities/activity';
import { useAuthStore } from '@/shared/store';
import './notifications-panel.css';

export interface ActivityEntry {
  id: string;
  actorUserId?: number;
  teamId?: number;
  teamEmoji?: string;
  teamColor?: string;
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_moved' | 'auto_assigned' | 'team_created' | 'member_removed';
  title: string;
  detail: string;
  timestamp: number;
  read: boolean;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} дн назад`;
  return new Date(ms).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function mapDTOToEntry(dto: ActivityEntryDTO): ActivityEntry {
  return {
    id: String(dto.id),
    actorUserId: dto.user_id,
    teamId: dto.team_id,
    teamEmoji: dto.team_emoji,
    teamColor: dto.team_color,
    type: dto.type as ActivityEntry['type'],
    title: dto.title,
    detail: dto.detail,
    timestamp: new Date(dto.created_at).getTime(),
    read: dto.is_read,
  };
}

const USER_COLORS  = ['#5b8def','#3b7dd8','#7ab3ff','#4c8ee8','#88b8f8','#3572cc','#6fa3f5','#2e67c4'];
const TEAM_COLORS  = ['#4caf87','#3d9e75','#56b38e','#38896a','#74c9a8','#2d7a5e','#6abf99','#2a6b52'];

function strHash(s: string, palette: string[]): string {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return palette[Math.abs(h) % palette.length];
}

function initials(s: string): string {
  const words = s.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : s.slice(0, 2).toUpperCase();
}

interface ParsedDetail {
  actor?: string;
  team?: string;
  moveFrom?: string;
  moveTo?: string;
  rest?: string;
}

function parseDetail(detail: string, _type: ActivityEntry['type']): ParsedDetail {
  const parts = detail.split('·').map(s => s.trim());
  let actor: string | undefined;
  let team: string | undefined;
  let moveFrom: string | undefined;
  let moveTo: string | undefined;

  if (parts[0]) {
    const sp = parts[0].indexOf(' ');
    if (sp > 0) actor = parts[0].slice(0, sp);
  }

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (p.includes('→')) {
      const [f, t] = p.split('→').map(s => s.trim());
      moveFrom = f; moveTo = t;
    } else if (!p.includes('исполнитель') && !p.includes('очк')) {
      if (!team) team = p;
    }
  }

  return { actor, team, moveFrom, moveTo };
}

function NotifAvatar({ name, palette, size = 20, userId, teamId }: { name: string; palette: string[]; size?: number; userId?: number; teamId?: number }) {
  const [photoLoaded, setPhotoLoaded] = React.useState(false);
  const bg = strHash(name, palette);
  const photoSrc = userId ? `/api/v1/users/${userId}/photo` : teamId ? `/api/v1/teams/${teamId}/photo` : null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      fontSize: size * 0.42, fontWeight: 700, flexShrink: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      {!photoLoaded && initials(name)}
      {photoSrc && (
        <img
          src={photoSrc}
          alt={name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: photoLoaded ? 'block' : 'none' }}
          onLoad={() => setPhotoLoaded(true)}
          onError={() => setPhotoLoaded(false)}
        />
      )}
    </span>
  );
}

type TypeBadge = { label: string; cls: string };

const STATUS_BADGE: Record<string, { bg: string; dot: string; color: string }> = {
  'Бэклог':     { bg: 'rgba(138,129,117,.12)', dot: '#8a8175',        color: '#8a8175' },
  'В работе':   { bg: 'rgba(91,141,239,.14)',  dot: 'var(--accent)',  color: 'var(--accent)' },
  'На проверке':{ bg: 'rgba(220,150,40,.14)',  dot: '#b07a10',        color: '#b07a10' },
  'Выполнено':  { bg: 'rgba(74,138,91,.14)',   dot: 'var(--good)',    color: 'var(--good)' },
};


function renderMoveStatusOnly(detail: string): React.ReactNode {
  const parts = detail.split('·').map(s => s.trim());
  for (const part of parts) {
    if (part.includes('→')) {
      const [from, to] = part.split('→').map(s => s.trim());
      const fs = STATUS_BADGE[from];
      const ts = STATUS_BADGE[to];
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {fs ? (
            <span className="notif-status-badge" style={{ background: fs.bg, color: fs.color }}>{from}</span>
          ) : <span>{from}</span>}
          <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>→</span>
          {ts ? (
            <span className="notif-status-badge" style={{ background: ts.bg, color: ts.color }}>{to}</span>
          ) : <span>{to}</span>}
        </span>
      );
    }
  }
  return null;
}

function getTypeBadge(type: ActivityEntry['type']): TypeBadge {
  switch (type) {
    case 'task_created':   return { label: 'Создана',    cls: 'notif-item-type--blue' };
    case 'task_updated':   return { label: 'Обновлена',  cls: 'notif-item-type--orange' };
    case 'task_deleted':   return { label: 'Удалена',    cls: 'notif-item-type--red' };
    case 'task_moved':     return { label: 'Перенесена', cls: 'notif-item-type--purple' };
    case 'auto_assigned':  return { label: 'Назначена',  cls: 'notif-item-type--blue' };
    case 'team_created':   return { label: 'Команда',    cls: 'notif-item-type--green' };
    case 'member_removed': return { label: 'Участник',   cls: 'notif-item-type--muted' };
    default:               return { label: 'Событие',    cls: 'notif-item-type--muted' };
  }
}


interface NotificationsPanelProps {
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const storedUserId = useAuthStore(s => s.userId);
  const currentUserId = storedUserId ? parseInt(storedUserId, 10) : 0;
  const { data: rawActivity, loading: activityLoading, refetch } = useHookGetActivity(currentUserId);
  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>({});

  const localActivity: ActivityEntry[] = (rawActivity ?? []).map(dto => ({
    ...mapDTOToEntry(dto),
    read: localOverrides[String(dto.id)] ?? dto.is_read,
  }));

  const markAllRead = async () => {
    if (currentUserId <= 0) return;
    try {
      await markAllActivityRead(currentUserId);
      const overrides: Record<string, boolean> = {};
      localActivity.forEach(a => { overrides[a.id] = true; });
      setLocalOverrides(overrides);
      void refetch();
    } catch { /* ignore */ }
  };

  const handleItemClick = async (item: ActivityEntry) => {
    if (item.read) return;
    if (currentUserId <= 0) return;
    setLocalOverrides(prev => ({ ...prev, [item.id]: true }));
    markSingleActivityRead(parseInt(item.id, 10), currentUserId).catch(() => { /* ignore */ });
  };

  const clearAll = async () => {
    if (currentUserId <= 0) return;
    try {
      await deleteAllActivity(currentUserId);
      setLocalOverrides({});
      void refetch();
    } catch { /* ignore */ }
  };

  const allActivity = [...localActivity]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  const unreadCount = localActivity.filter(a => !a.read).length;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel pop-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            <Bell size={15} />
            <span>Уведомления</span>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </div>
          <div className="notif-header-right">
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={markAllRead} title="Отметить все прочитанными">
                <CheckCheck size={14} />
              </button>
            )}
            <button className="notif-close-btn" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="notif-body">
          {activityLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 12px' }}>
              {[0,1,2,3].map(i => <Skeleton key={i} height={56} borderRadius="var(--r-sm)" />)}
            </div>
          )}

          {!activityLoading && allActivity.length === 0 && (
            <div className="notif-empty">
              <div className="notif-empty-icon">
                <Bell size={26} />
              </div>
              <p>Нет уведомлений</p>
              <span>Здесь появятся обновления по задачам и командам</span>
            </div>
          )}

          {!activityLoading && allActivity.length > 0 && (
            <div className="notif-list">
              {allActivity.map(item => {
                const badge = getTypeBadge(item.type);
                const parsed = parseDetail(item.detail, item.type);
                return (
                  <div
                    key={item.id}
                    className={`notif-item ${!item.read ? 'notif-item--unread' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="notif-item-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span className="notif-item-type-plain">{badge.label}</span>
                        <span className="notif-item-time" style={{ marginLeft: 'auto' }}>{timeAgo(item.timestamp)}</span>
                      </div>
                      <span className="notif-item-title">{item.title}</span>
                      {item.type === 'task_moved' && item.detail && (
                        <div className="notif-item-detail">{renderMoveStatusOnly(item.detail)}</div>
                      )}
                      {(parsed.actor || parsed.team) && (
                        <div className="notif-item-meta">
                          {parsed.actor && (
                            <span className="notif-meta-chip">
                              <NotifAvatar name={parsed.actor} palette={USER_COLORS} size={16} userId={item.actorUserId} />
                              <span className="notif-meta-text">{parsed.actor}</span>
                            </span>
                          )}
                          {parsed.actor && parsed.team && <span className="notif-meta-sep">·</span>}
                          {parsed.team && (
                            <span className="notif-meta-chip">
                              {item.teamEmoji ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 16, height: 16, borderRadius: '50%',
                                  background: item.teamColor || 'var(--bg-sunk)',
                                  fontSize: 10, flexShrink: 0,
                                }}>
                                  {item.teamEmoji}
                                </span>
                              ) : (
                                <NotifAvatar name={parsed.team} palette={TEAM_COLORS} size={16} />
                              )}
                              <span className="notif-meta-text">{parsed.team}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {localActivity.length > 0 && (
          <div className="notif-footer">
            <button className="notif-clear-btn" onClick={clearAll}>Очистить историю</button>
          </div>
        )}
      </div>
    </div>
  );
};
