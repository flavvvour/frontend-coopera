import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Task } from '@/domain/task.types';
import './profile-modal.css';

const MEMBER_COLORS = [
  '#5b8def','#3b7dd8','#6fa3f5','#4c8ee8','#7ab3ff','#3572cc','#88b8f8','#2e67c4',
];
function memberColor(id: number) { return MEMBER_COLORS[id % MEMBER_COLORS.length]; }

const STATUS_LABELS: Record<string, string> = {
  open: 'Бэклог', assigned: 'В работе', in_review: 'На проверке', completed: 'Выполнено',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'rgba(91,141,239,.4)', assigned: 'var(--accent)', in_review: 'var(--accent)', completed: 'var(--good)',
};

interface ProfileModalProps {
  memberId: number;
  userId?: number;
  memberUsername: string;
  teamName: string;
  memberRole?: string;
  tasks: Task[];
  onClose: () => void;
}

export function ProfileModal({ memberId, userId, memberUsername, teamName, memberRole = 'Участник', tasks, onClose }: ProfileModalProps) {
  const color = memberColor(memberId);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const myTasks = useMemo(() => tasks.filter(t => t.assignedToMember === memberId), [tasks, memberId]);
  const closed  = useMemo(() => myTasks.filter(t => t.status === 'completed').length, [myTasks]);
  const active  = useMemo(() => myTasks.filter(t => ['assigned', 'in_review'].includes(t.status)).length, [myTasks]);
  const points  = useMemo(() => myTasks.filter(t => t.status === 'completed').reduce((s, t) => s + (t.points ?? 0), 0), [myTasks]);

  const activeTasks = useMemo(
    () => myTasks.filter(t => ['assigned', 'in_review'].includes(t.status)).slice(0, 4),
    [myTasks]
  );

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    myTasks.forEach(t => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [myTasks]);


  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>

        {/* Banner */}
        <div className="profile-modal-banner" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <button className="profile-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Avatar */}
        <div className="profile-modal-avatar-wrap">
          <div className="profile-modal-avatar" style={{ background: color }}>
            {!photoLoaded && <span style={{ position: 'absolute' }}>{memberUsername.slice(0, 2).toUpperCase()}</span>}
            {userId && (
              <img
                src={`/api/v1/users/${userId}/photo`}
                alt={memberUsername}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: photoLoaded ? 'block' : 'none' }}
                onLoad={() => setPhotoLoaded(true)}
                onError={() => setPhotoLoaded(false)}
              />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="profile-modal-body">
          <div className="profile-modal-name-row">
            <div>
              <h2 className="profile-modal-name">{memberUsername}</h2>
              <div className="profile-modal-meta">
                <span className={`profile-modal-role ${memberRole === 'manager' ? 'manager' : ''}`}>
                  {memberRole === 'manager' ? 'Менеджер' : 'Участник'}
                </span>
                <span className="profile-modal-team">в {teamName}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-modal-stats">
            {[
              { n: myTasks.length, l: 'задач всего' },
              { n: closed,          l: 'закрыто' },
              { n: active,          l: 'в работе' },
              { n: points,          l: 'очков' },
            ].map(({ n, l }) => (
              <div key={l} className="profile-modal-stat">
                <span className="profile-modal-stat-n mono">{n}</span>
                <span className="profile-modal-stat-l">{l}</span>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          {myTasks.length > 0 && (
            <>
              <div className="profile-modal-section-label" style={{ marginTop: 18 }}>статусы задач</div>
              <div className="profile-modal-status-list">
                {(['open','assigned','in_review','completed'] as const).map(s => (
                  <div key={s} className="profile-modal-status-row">
                    <span className="profile-modal-status-dot" style={{ background: STATUS_COLORS[s] }} />
                    <span className="profile-modal-status-label">{STATUS_LABELS[s]}</span>
                    <span className="mono profile-modal-status-count">{statusCounts[s] ?? 0}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Active tasks */}
          {activeTasks.length > 0 && (
            <>
              <div className="profile-modal-section-label" style={{ marginTop: 18 }}>сейчас работает над</div>
              <div className="profile-modal-task-list">
                {activeTasks.map(t => (
                  <div key={t.id} className="profile-modal-task-row">
                    <span className="profile-modal-task-title">{t.title}</span>
                    <span className="mono profile-modal-task-pts">{t.points ?? 0} очк.</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {myTasks.length === 0 && (
            <p className="profile-modal-empty">Нет задач в этой команде</p>
          )}
        </div>
      </div>
    </div>
  );
}
