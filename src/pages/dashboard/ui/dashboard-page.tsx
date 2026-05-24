import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, useUiStore } from '@/shared/store';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Users, CheckSquare, ArrowRight, Inbox, Clock, Trophy, X, User } from 'lucide-react';

import { Sidebar } from '@/widgets/sidebar';
import { NotificationsPanel } from '@/widgets/notifications';
import { UserTeamsPage } from '@/pages/teams';
import { TeamDetailPage } from '@/pages/team-detail';
import { PersonalStatisticsPage } from '@/pages/personal-stats';
import { TeamIcon } from '@/shared/ui/team-icon';
import { useHookGetUserTasks } from '@/features/user-tasks';
import { useHookGetActivity } from '@/entities/activity';
import { useTeam } from '@/entities/team';
import { useHookPostTask } from '@/entities/task';
import type { CreateTaskRequest } from '@/entities/task';
import { addActivity } from '@/entities/activity';
import { getTeamEmoji } from '@/shared/lib/team-emoji';
import './dashboard-page.css';


const STATUS_MAP: Record<string, string> = {
  open: 'Бэклог', assigned: 'В работе', in_review: 'На проверке', completed: 'Выполнено',
};

const STATUS_ORDER: Record<string, number> = { in_review: 0, assigned: 1, open: 2 };

function statusLabel(s: string) { return STATUS_MAP[s] ?? s; }

function BentoDashboard({ username }: { username: string }) {
  const { data, loading } = useHookGetUserTasks(username);
  const { assignedTasks, user } = data;
  const navigate = useNavigate();

  const activeTasks = useMemo(
    () => [...assignedTasks]
      .filter(t => t.status === 'assigned' || t.status === 'in_review')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [assignedTasks]
  );

  const newTasks = useMemo(
    () => [...assignedTasks]
      .filter(t => t.status !== 'completed')
      .sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)),
    [assignedTasks]
  );

  const teamMap = useMemo(
    () => Object.fromEntries((user?.teams ?? []).map(t => [t.id, t])),
    [user?.teams]
  );

  const myPoints = useMemo(
    () => assignedTasks.filter(t => t.status === 'completed').reduce((s, t) => s + (t.points ?? 0), 0),
    [assignedTasks]
  );

  const completedCount = useMemo(
    () => assignedTasks.filter(t => t.status === 'completed').length,
    [assignedTasks]
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <Skeleton height={48} width={200} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[0,1,2].map(i => <Skeleton key={i} height={140} borderRadius="var(--r)" />)}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="kb-toolbar">
        <div className="kb-toolbar-title">
          <h1 className="kb-team-name h-display">Привет, {user?.username ?? username}!</h1>
          <span className="kb-total mono">{today}</span>
        </div>
        <div className="kb-toolbar-right">
          <Link to="statistics" className="btn btn-sm row gap-6 dash-analytics-btn">
            Аналитика <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="dash-kpi-row">
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon dash-kpi-icon--accent">
            <Clock size={18} color="var(--accent)" />
          </div>
          <div className="dash-kpi-text">
            <span className="dash-kpi-val">{activeTasks.length}</span>
            <span className="dash-kpi-label">в работе</span>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon dash-kpi-icon--good">
            <CheckSquare size={18} color="var(--good)" />
          </div>
          <div className="dash-kpi-text">
            <span className="dash-kpi-val">{completedCount}</span>
            <span className="dash-kpi-label">выполнено</span>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon dash-kpi-icon--accent">
            <Trophy size={18} color="var(--accent)" />
          </div>
          <div className="dash-kpi-text">
            <span className="dash-kpi-val">{myPoints}</span>
            <span className="dash-kpi-label">очков</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* New tasks */}
        <div className="card dash-card">
          <div className="dash-card-header between">
            <div className="row gap-8">
              <div className="dash-card-icon dash-card-icon--accent">
                <Inbox size={15} color="var(--accent)" />
              </div>
              <span className="dash-card-title">Новые задачи</span>
              {newTasks.length > 0 && (
                <span className="dash-card-count">{newTasks.length}</span>
              )}
            </div>
          </div>

          {newTasks.length === 0 ? (
            <div className="dash-empty-state">
              <CheckSquare size={28} color="var(--good)" />
              <p>Всё выполнено!</p>
              <span>Новых задач нет</span>
            </div>
          ) : (
            <div className="dash-task-list">
              {newTasks.map(t => {
                const team = teamMap[t.teamId];
                return (
                  <div key={t.id} className={`dash-task-card dash-task-card--${t.status}`} onClick={() => navigate(`/dashboard/teams/${t.teamId}`)}>
                    <span className="dash-task-card-title">{t.title}</span>
                    <div className="dash-task-card-footer">
                      {team && (
                        <div className="dash-task-card-team">
                          <div
                            className="dash-task-card-team-avatar"
                            style={{ background: team.color || 'var(--accent-tint)' }}
                          >
                            <TeamIcon name={team.emoji || getTeamEmoji(team.name)} size={11} />
                          </div>
                          <span className="dash-task-card-team-name">{team.name}</span>
                        </div>
                      )}
                      <div className="dash-task-card-right">
                        <span className={`dash-task-chip dash-task-chip--${t.status}`}>{statusLabel(t.status)}</span>
                        {(t.points ?? 0) > 0 && <span className="dash-task-card-pts mono">{t.points} очк.</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="card dash-card">
          <div className="dash-card-header between">
            <div className="row gap-8">
              <div className="dash-card-icon dash-card-icon--accent">
                <Users size={15} color="var(--accent)" />
              </div>
              <span className="dash-card-title">Команды</span>
            </div>
            <Link to="teams" className="dash-card-link row gap-4">
              Все <ArrowRight size={13} />
            </Link>
          </div>

          {(user?.teams ?? []).length === 0 ? (
            <div className="dash-empty-state">
              <Users size={28} color="var(--ink-3)" />
              <p>Нет команд</p>
              <span>Создайте или вступите в команду</span>
            </div>
          ) : (
            <div className="dash-teams-list">
              {(user?.teams ?? []).map(t => {
                const emoji = t.emoji || getTeamEmoji(t.name);
                const color = t.color || 'var(--bg-sunk)';
                return (
                  <button
                    key={t.id}
                    className="dash-team-item"
                    onClick={() => navigate(`/dashboard/teams/${t.id}`)}
                  >
                    <div className="dash-team-icon" style={{ background: color }}>
                      <TeamIcon name={emoji} size={15} />
                    </div>
                    <span className="dash-team-name">{t.name}</span>
                    <span className={`dash-team-role-badge ${t.role}`}>
                      {t.role === 'manager' ? 'Менеджер' : 'Участник'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const MEMBER_COLORS = ['#5b8def','#e07b6a','#6abf8a','#c47fd5','#e0a84b','#4fc4cf','#e06ab5','#8aab5b'];
function qMemberColor(id: number) { return MEMBER_COLORS[id % MEMBER_COLORS.length]; }

type QPriority = 'low' | 'medium' | 'high';
const QPRIORITY: Record<QPriority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

function QAvatar({ userId, name, size, bg }: { userId?: number; name: string; size: number; bg: string }) {
  const [loaded, setLoaded] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <span className="avatar" style={{ background: bg, width: size, height: size, fontSize: size * 0.38, flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && initials}
      {userId && (
        <img
          src={`/api/v1/users/${userId}/photo`}
          alt={name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </span>
  );
}

function QuickNewTaskModal({ teamId, currentUserId, currentUsername, onClose }: {
  teamId: number; currentUserId: number; currentUsername: string; onClose: () => void;
}) {
  const { data: team } = useTeam(teamId);
  const { createTask, loading: creating, error: createError } = useHookPostTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(0);
  const [priority, setPriority] = useState<QPriority>('low');
  const [points, setPoints] = useState(1);

  const isManager = useMemo(
    () => team?.members.some(m => m.userId === currentUserId && m.role === 'manager') ?? false,
    [team, currentUserId]
  );

  const handleCreate = async () => {
    if (!title.trim() || !team) return;
    const req: CreateTaskRequest = {
      teamId,
      currentUserId,
      title: title.trim(),
      description,
      points: isManager ? points : undefined,
      assignedToMember: assignedTo,
      tags: [],
      priority,
    };
    try {
      await createTask(req);
      addActivity({
        type: 'task_created',
        title: title.trim(),
        detail: `${currentUsername} создал · ${team.name}`,
        teamId,
        teamEmoji: team.emoji,
        teamColor: team.color,
      });
      onClose();
    } catch { /* error shown via createError */ }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
        <button className="kb-detail-close" onClick={onClose}><X size={16} /></button>
        <div className="kb-create-header">
          <h2 className="h-display kb-create-title">Новая задача</h2>
          {team && <p className="kb-create-subtitle">{team.name}</p>}
        </div>
        <div className="kb-create-body">
          {createError && <div className="error-message" style={{ marginBottom: 4 }}>{createError.message}</div>}

          <div className="kb-create-field">
            <div className="kb-create-label">Название</div>
            <input className="coop-input" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Например: «Подготовить главу 3»" autoFocus disabled={creating}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>

          <div className="kb-create-field">
            <div className="kb-create-label">Описание</div>
            <textarea className="coop-input" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Опишите задачу…" rows={3} disabled={creating} />
          </div>

          <div className="kb-create-field">
            <div className="kb-create-label">Исполнитель</div>
            <div className="kb-assignee-picker">
              <button className={`kb-assignee-opt ${assignedTo === 0 ? 'active' : ''}`}
                onClick={() => setAssignedTo(0)} type="button">
                <span className="avatar" style={{ background: 'var(--line)', width: 24, height: 24, fontSize: 9 }}><User size={10} /></span>
                <span>Не назначено</span>
              </button>
              {(team?.members ?? []).map(m => (
                <button key={m.memberId} className={`kb-assignee-opt ${assignedTo === m.memberId ? 'active' : ''}`}
                  onClick={() => setAssignedTo(m.memberId)} type="button">
                  <QAvatar userId={m.userId} name={m.username ?? ''} size={24} bg={qMemberColor(m.memberId)} />
                  <span>{m.username}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="kb-create-field">
            <div className="kb-create-label">Приоритет</div>
            <div className="kb-priority-seg">
              {(['low','medium','high'] as QPriority[]).map(v => (
                <button key={v} className={`kb-priority-opt ${priority === v ? 'active' : ''}`}
                  onClick={() => setPriority(v)} type="button">{QPRIORITY[v]}</button>
              ))}
            </div>
          </div>

          {isManager && (
            <div className="kb-create-field">
              <div className="kb-create-label">Баллы</div>
              <div className="kb-pts-stepper">
                <button type="button" className="kb-pts-btn" onClick={() => setPoints(p => Math.max(1, p - 1))} disabled={creating || points <= 1}>−</button>
                <input className="kb-pts-val mono" type="number" min="1" max="100" value={points}
                  onChange={e => setPoints(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))} disabled={creating} />
                <button type="button" className="kb-pts-btn" onClick={() => setPoints(p => Math.min(100, p + 1))} disabled={creating || points >= 100}>+</button>
              </div>
            </div>
          )}
        </div>
        <div className="kb-create-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={creating}>Отмена</button>
          <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={creating || !title.trim()}>
            {creating ? 'Создание…' : 'Создать задачу'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamDetailPageKeyed() {
  const { teamId } = useParams<{ teamId: string }>();
  return <TeamDetailPage key={teamId} />;
}

export const DashboardPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const username = useAuthStore(s => s.username) ?? '';
  const userId = useAuthStore(s => s.userId);
  const activeTeamId = useUiStore(s => s.activeTeamId);
  const { data: activityData } = useHookGetActivity(userId ? parseInt(userId, 10) : 0);
  const unreadCount = useMemo(() => activityData?.filter(a => !a.is_read).length ?? 0, [activityData]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        onNotifClick={() => setNotifOpen(v => !v)}
        onNewTask={() => setShowNewTask(true)}
        notificationCount={unreadCount}
      />
      <main className="app-main">
        <Routes>
          <Route path="/"             element={<BentoDashboard username={username} />} />
          <Route path="teams"         element={<UserTeamsPage username={username} />} />
          <Route path="teams/:teamId" element={<TeamDetailPageKeyed />} />
          <Route path="statistics"    element={<PersonalStatisticsPage username={username} />} />
          <Route path="*"             element={<Navigate to="" replace />} />
        </Routes>
      </main>
      {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
      {showNewTask && activeTeamId && userId && (
        <QuickNewTaskModal
          teamId={parseInt(activeTeamId, 10)}
          currentUserId={parseInt(userId, 10)}
          currentUsername={username}
          onClose={() => setShowNewTask(false)}
        />
      )}
      {showNewTask && !activeTeamId && (
        <div className="modal-overlay" onClick={() => setShowNewTask(false)}>
          <div className="kb-create-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px 32px' }}>
            <button className="kb-detail-close" onClick={() => setShowNewTask(false)}><X size={16} /></button>
            <Users size={36} color="var(--ink-3)" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Выберите команду</p>
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Перейдите в команду, чтобы создать задачу</p>
          </div>
        </div>
      )}
    </div>
  );
};
