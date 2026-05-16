import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { Users, CheckSquare, ArrowRight, Inbox, Clock, Trophy, TrendingUp } from 'lucide-react';

import { Sidebar } from '@/widgets/sidebar';
import { NotificationsPanel } from '@/widgets/notifications';
import { WallpaperLayer } from '@/widgets/wallpaper';
import { UserTeamsPage } from '@/components/User/userTeamsPage';
import { TeamDetailPage } from '@/components/Team/teamDetailPage';
import { PersonalStatisticsPage } from '@/components/User/PersonalStatisticsPage';
import { TeamIcon } from '@/components/User/CreateTeamModal';
import { useHookGetUserTasks } from '@/hooks/useHookGetUserTasks';
import type { Task } from '@/domain/task.types';
import './dashboard-page.css';

function getTeamEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('курс') || n.includes('диплом') || n.includes('вкр')) return 'GraduationCap';
  if (n.includes('дом') || n.includes('сосед') || n.includes('ремонт')) return 'Wrench';
  if (n.includes('волонтер') || n.includes('помощь')) return 'Heart';
  if (n.includes('спорт') || n.includes('футбол')) return 'Trophy';
  return 'Users';
}


function getWeekActivity(tasks: Task[]) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('ru', { weekday: 'short' });
    const count = tasks.filter(t => {
      const diff = Math.floor((now.getTime() - new Date(t.createdAt).getTime()) / 86400000);
      return diff === 6 - i;
    }).length;
    return { label, count };
  });
}

const STATUS_MAP: Record<string, string> = {
  open: 'Бэклог', assigned: 'В работе', in_review: 'На проверке', completed: 'Выполнено',
};

function statusLabel(s: string) { return STATUS_MAP[s] ?? s; }

function BentoDashboard({ username }: { username: string }) {
  const { data, loading, refresh } = useHookGetUserTasks(username);
  const { allTasks, assignedTasks, user } = data;
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('coop_activity_updated', handler);
    window.addEventListener('coop_team_created', handler);
    window.addEventListener('coop_teams_updated', handler);
    return () => {
      window.removeEventListener('coop_activity_updated', handler);
      window.removeEventListener('coop_team_created', handler);
      window.removeEventListener('coop_teams_updated', handler);
    };
  }, [refresh]);

  const STATUS_ORDER: Record<string, number> = { in_review: 0, assigned: 1, open: 2 };

  const activeTasks = useMemo(
    () => [...assignedTasks]
      .filter(t => t.status === 'assigned' || t.status === 'in_review')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [assignedTasks]
  );

  const inboxTasks = useMemo(
    () => assignedTasks.filter(t => t.status === 'open'),
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
      <div className="dash-loading">
        <div className="dash-spinner" />
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
          <div className="dash-kpi-icon" style={{ background: 'rgba(91,141,239,.1)' }}>
            <Clock size={18} color="var(--accent)" />
          </div>
          <div className="dash-kpi-text">
            <span className="dash-kpi-val">{activeTasks.length}</span>
            <span className="dash-kpi-label">в работе</span>
          </div>
        </div>
<div className="dash-kpi-card">
          <div className="dash-kpi-icon" style={{ background: 'rgba(34,197,94,.1)' }}>
            <CheckSquare size={18} color="var(--good)" />
          </div>
          <div className="dash-kpi-text">
            <span className="dash-kpi-val">{completedCount}</span>
            <span className="dash-kpi-label">выполнено</span>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon" style={{ background: 'rgba(91,141,239,.1)' }}>
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
              <div className="dash-card-icon" style={{ background: 'rgba(91,141,239,.1)' }}>
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
                            style={{ background: team.color || 'rgba(91,141,239,.15)' }}
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
              <div className="dash-card-icon" style={{ background: 'rgba(91,141,239,.1)' }}>
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

function TeamDetailPageKeyed() {
  const { teamId } = useParams<{ teamId: string }>();
  return <TeamDetailPage key={teamId} />;
}

export const DashboardPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const username = sessionStorage.getItem('username') || '';

  useEffect(() => {
    const fetchUnread = async () => {
      const userId = sessionStorage.getItem('user_id');
      if (!userId) return;
      try {
        const { getActivity } = await import('@/api/dto/activity/activity.api');
        const entries = await getActivity(parseInt(userId, 10));
        setUnreadCount(entries.filter(a => !a.is_read).length);
      } catch {}
    };
    fetchUnread();
    const handler = () => fetchUnread();
    window.addEventListener('coop_activity_updated', handler);
    return () => window.removeEventListener('coop_activity_updated', handler);
  }, []);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <WallpaperLayer />
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        onNotifClick={() => setNotifOpen(v => !v)}
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
    </div>
  );
};
