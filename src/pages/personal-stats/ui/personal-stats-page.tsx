import { useMemo, useState } from 'react';
import { BarChart2, Star, TrendingUp, Trophy, Users, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { MS_IN_WEEK } from '@/shared/lib/constants';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useHookGetUserTasks } from '@/features/user-tasks';
import { useHookGetTask } from '@/entities/task';
import { useTeam } from '@/entities/team';
import { ProfileModal } from '@/widgets/profile';
import { TeamIcon } from '@/shared/ui/team-icon';
import { useUiStore } from '@/shared/store';
import './personal-statistics-page.css';

interface PersonalStatisticsPageProps {
  username: string;
}

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

type AnalyticsMode = 'rating' | 'distribution' | 'heatmap' | 'team';

/* ── Team Analytics Sub-Component ── */
function TeamAnalyticsTab({ teams, initialTeamId }: { teams: { id: number; name: string; role: string }[]; initialTeamId?: number | null }) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId ?? teams[0]?.id ?? 0);
  const [profileMemberId, setProfileMemberId] = useState<number | null>(null);
  const { data: teamTasks, loading: tasksLoading } = useHookGetTask(selectedTeamId);
  const { data: teamData, loading: teamLoading } = useTeam(selectedTeamId);

  const memberStats = useMemo(() => {
    if (!teamData || !teamTasks) return [];
    // eslint-disable-next-line react-hooks/purity
    const weekAgo = new Date(Date.now() - MS_IN_WEEK);
    return teamData.members.map(m => {
      const tasks = teamTasks.filter(t => t.assignedToMember === m.memberId);
      const completed = tasks.filter(t => t.status === 'completed');
      const inProgress = tasks.filter(t => t.status === 'assigned' || t.status === 'in_review');
      const points = completed.reduce((s, t) => s + (t.points ?? 0), 0);
      const weekTasks = completed.filter(t => new Date(t.updatedAt) >= weekAgo);
      const weekCompleted = weekTasks.length;
      const weekPoints = weekTasks.reduce((s, t) => s + (t.points ?? 0), 0);
      return { ...m, total: tasks.length, completed: completed.length, inProgress: inProgress.length, points, weekCompleted, weekPoints };
    }).sort((a, b) => b.points - a.points);
  }, [teamData, teamTasks]);

  const leaderOfWeek = memberStats.reduce<typeof memberStats[0] | null>(
    (best, m) => (m.weekPoints > (best?.weekPoints ?? -1) ? m : best),
    null
  );

  const maxPoints = Math.max(1, ...memberStats.map(m => m.points));

  const loading = tasksLoading || teamLoading;

  return (
    <div className="an-team-analytics">

      {/* Team selector */}
      {teams.length > 1 && (
        <div className="an-team-selector">
          {teams.map(t => (
            <button
              key={t.id}
              className={`an-team-sel-btn ${selectedTeamId === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTeamId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="an-team-analytics" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
          <Skeleton height={200} borderRadius="var(--r)" />
          <Skeleton height={120} borderRadius="var(--r)" />
        </div>
      ) : (
        <div className="an-team-grid">

          {/* Member stats table */}
          <div className="card an-card an-team-table-card">
            <div className="an-card-header">
              <h3 className="h-display">Участники команды</h3>
              <span className="an-card-sub">{teamData?.name}</span>
            </div>

            {memberStats.length === 0 ? (
              <p className="an-empty">Нет участников</p>
            ) : (
              <div className="an-member-list">
                <div className="an-member-header-row">
                  <span className="an-member-col-name">Участник</span>
                  <span className="an-member-col">Выполнено</span>
                  <span className="an-member-col">В работе</span>
                  <span className="an-member-col">Очки</span>
                </div>
                {memberStats.map((m, i) => (
                  <div key={m.memberId} className="an-member-row" style={{ cursor: 'pointer' }} onClick={() => setProfileMemberId(m.memberId)}>
                    <div className="an-member-info">
                      <div className="an-member-avatar" style={{ background: memberColor(m.memberId), position: 'relative', overflow: 'hidden' }}>
                        {(m.name || m.username).charAt(0).toUpperCase()}
                        {m.userId && <img src={`/api/v1/users/${m.userId}/photo`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                      </div>
                      <div className="an-member-name-block">
                        <span className="an-member-name">{m.name || m.username}</span>
                        {i === 0 && <span className="an-member-badge">лидер</span>}
                      </div>
                    </div>
                    <div className="an-member-col">
                      <span className="mono an-member-stat-val" style={{ color: 'var(--good)' }}>{m.completed}</span>
                      <div className="an-member-bar-bg">
                        <div
                          className="an-member-bar"
                          style={{ width: `${(m.points / maxPoints) * 100}%`, background: memberColor(m.memberId) }}
                        />
                      </div>
                    </div>
                    <div className="an-member-col">
                      <span className="mono an-member-stat-val" style={{ color: 'var(--accent)' }}>{m.inProgress}</span>
                    </div>
                    <div className="an-member-col">
                      <span className="mono an-member-stat-val" style={{ color: 'var(--accent)' }}>{m.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leader of the week + weekly leaderboard */}
          <div className="an-leader-col">

            {leaderOfWeek && leaderOfWeek.weekPoints > 0 ? (
              <div className="card an-leader-card an-week-leader-card" style={{ background: `linear-gradient(135deg, ${memberColor(leaderOfWeek.memberId)}22, var(--bg-elev))` }}>
                <div className="an-leader-eyebrow">
                  <Crown size={12} style={{ display: 'inline', marginRight: 4 }} />
                  лидер недели
                </div>
                <div className="an-leader-body">
                  <div className="an-leader-avatar" style={{ background: memberColor(leaderOfWeek.memberId), position: 'relative', overflow: 'hidden' }}>
                    {(leaderOfWeek.name || leaderOfWeek.username).charAt(0).toUpperCase()}
                    {leaderOfWeek.userId && <img src={`/api/v1/users/${leaderOfWeek.userId}/photo`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                  </div>
                  <div>
                    <div className="h-display" style={{ fontSize: 18 }}>{leaderOfWeek.name || leaderOfWeek.username}</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {leaderOfWeek.weekPoints} очков за неделю
                    </div>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 5, borderRadius: 999, background: `${memberColor(leaderOfWeek.memberId)}40`, marginTop: 10 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 999, background: memberColor(leaderOfWeek.memberId), width: `${(leaderOfWeek.weekPoints / Math.max(1, ...memberStats.map(m => m.weekPoints))) * 100}%`, transition: 'width .4s ease' }} />
                </div>
              </div>
            ) : (
              <div className="card an-leader-card">
                <div className="an-leader-eyebrow">лидер недели</div>
                <p className="an-empty" style={{ margin: '8px 0 0' }}>Нет активности за неделю</p>
              </div>
            )}

            {/* Weekly leaderboard */}
            <div className="card an-card" style={{ padding: 18 }}>
              <div className="an-card-eyebrow">таблица за неделю</div>
              {memberStats.length === 0 ? (
                <p className="an-empty">Нет данных</p>
              ) : (
                <div className="an-week-board">
                  {[...memberStats]
                    .sort((a, b) => b.weekPoints - a.weekPoints)
                    .map((m, i) => (
                      <div key={m.memberId} className="an-week-row">
                        <span className="an-rank-num mono" style={{ color: i === 0 ? 'var(--accent)' : 'var(--ink-3)', minWidth: 18 }}>
                          {i === 0 ? <Star size={13} fill="currentColor" /> : i + 1}
                        </span>
                        <div className="an-member-avatar an-member-avatar--sm" style={{ background: memberColor(m.memberId), position: 'relative', overflow: 'hidden' }}>
                          {(m.name || m.username).charAt(0).toUpperCase()}
                          {m.userId && <img src={`/api/v1/users/${m.userId}/photo`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                        </div>
                        <span className="an-week-name">{m.name || m.username}</span>
                        <span className="mono an-week-count">{m.weekPoints} очк.</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {profileMemberId !== null && teamData && (
        <ProfileModal
          memberId={profileMemberId}
          userId={teamData.members.find(m => m.memberId === profileMemberId)?.userId}
          memberUsername={teamData.members.find(m => m.memberId === profileMemberId)?.username ?? `#${profileMemberId}`}
          teamName={teamData.name}
          memberRole={teamData.members.find(m => m.memberId === profileMemberId)?.role}
          tasks={teamTasks ?? []}
          onClose={() => setProfileMemberId(null)}
        />
      )}
    </div>
  );
}

export function PersonalStatisticsPage({ username }: PersonalStatisticsPageProps) {
  const { data, loading, error, refresh } = useHookGetUserTasks(username);
  const [mode, setMode] = useState<AnalyticsMode>('rating');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [filterTeam, setFilterTeam] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  const activeTeamId = useUiStore(s => s.activeTeamId);

  const { allTasks = [], assignedTasks = [], user } = data || {};

  const hasTeams = (user?.teams.length ?? 0) > 0;

  /* ── KPI strip ── */
  const kpis = useMemo(() => {
    const total    = assignedTasks.length;
    const done     = assignedTasks.filter(t => t.status === 'completed').length;
    const myPts    = assignedTasks.filter(t => t.status === 'completed').reduce((s, t) => s + (t.points ?? 0), 0);
    const rate     = total > 0 ? Math.round(done / total * 100) : 0;
    const now      = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeDays = new Set(
      assignedTasks
        .filter(t => new Date(t.updatedAt) >= monthStart)
        .map(t => t.updatedAt.slice(0, 10))
    ).size;
    return [
      { k: 'Выполнено',     v: `${rate}%`, sub: `${done} из ${total} задач`,      accent: 'var(--good)',   iconBg: 'rgba(34,197,94,.13)',  Icon: TrendingUp },
      { k: 'Мои очки',      v: myPts,      sub: `${total} назначенных`,            accent: 'var(--accent)', iconBg: 'rgba(91,141,239,.13)', Icon: Trophy },
      { k: 'Активных дней', v: activeDays, sub: 'в этом месяце',                   accent: 'var(--accent)', iconBg: 'rgba(91,141,239,.13)', Icon: BarChart2 },
      { k: 'Команд',        v: user?.teams.length ?? 0, sub: 'в которых участвую', accent: 'var(--accent)', iconBg: 'rgba(91,141,239,.08)', Icon: Users },
    ];
  }, [assignedTasks, user]);

  /* ── Rating data ── */
  const ratingData = useMemo(() => {
    if (!user) return [];
    return user.teams.map(team => {
      const tasks   = allTasks.filter(t => t.teamId === team.id);
      const mine    = assignedTasks.filter(t => t.teamId === team.id);
      const closed  = mine.filter(t => t.status === 'completed').length;
      const taken   = mine.length;
      const total   = tasks.length;
      const teamPct = total > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / total) * 100) : 0;
      return { id: team.id, name: team.name, role: team.role, taken, closed, total, teamPct, color: team.color || memberColor(team.id), emoji: team.emoji };
    }).sort((a, b) => b.closed - a.closed);
  }, [user, allTasks, assignedTasks]);

  const topTeam = ratingData[0] ?? null;

  /* ── Distribution data ── */
  const distribData = useMemo(() => {
    const total = Math.max(1, allTasks.length);
    const groups = ['open','assigned','in_review','completed'] as const;
    let acc = 0;
    return groups.map(s => {
      const count = allTasks.filter(t => t.status === s).length;
      const start = acc / total;
      acc += count;
      const end = acc / total;
      return { status: s, count, start, end, label: STATUS_LABELS[s], color: STATUS_COLORS[s] };
    });
  }, [allTasks]);

  const totalTasks = allTasks.length;

  /* ── Heatmap ── */
  const heatmapMonthData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const filtered = allTasks
      .filter(t => filterTeam == null || t.teamId === filterTeam)
      .filter(t => filterStatus == null || t.status === filterStatus);
    const days: { day: number; date: Date; count: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = filtered.filter(t => (t.updatedAt ?? '').slice(0, 10) === dateStr).length;
      days.push({ day: d, date: new Date(year, month, d), count });
    }
    return days;
  }, [allTasks, selectedMonth, filterTeam, filterStatus]);

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const startDow = (firstDay.getDay() + 6) % 7;
    const cells: (typeof heatmapMonthData[0] | null)[] = [
      ...Array(startDow).fill(null),
      ...heatmapMonthData,
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (typeof heatmapMonthData[0] | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [heatmapMonthData, selectedMonth]);

  const heatMax = Math.max(1, ...heatmapMonthData.map(d => d.count));

  /* ── State screens ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Skeleton height={48} width={240} />
      <Skeleton height={160} borderRadius="var(--r)" />
      <Skeleton height={120} borderRadius="var(--r)" />
    </div>
  );

  if (error) return (
    <div className="statistics-error">
      <h2>Ошибка загрузки</h2>
      <p>{error.message}</p>
      <button onClick={() => refresh()} className="retry-btn">Повторить</button>
    </div>
  );

  if (!user) return (
    <div className="statistics-not-found">
      <h2>Пользователь не найден</h2>
    </div>
  );

  /* ── Donut helpers ── */
  const polar = (frac: number, r: number): [number, number] => {
    const ang = frac * Math.PI * 2 - Math.PI / 2;
    return [80 + Math.cos(ang) * r, 80 + Math.sin(ang) * r];
  };
  const arc = (s: number, e: number) => {
    if (e - s >= 0.999) {
      const [x1,y1] = polar(0, 70); const [x2,y2] = polar(0.5, 70);
      const [x3,y3] = polar(0.5, 44); const [x4,y4] = polar(0, 44);
      return `M${x1} ${y1} A70 70 0 1 1 ${x2} ${y2} A70 70 0 1 1 ${x1} ${y1} M${x4} ${y4} A44 44 0 1 0 ${x3} ${y3} A44 44 0 1 0 ${x4} ${y4} Z`;
    }
    const [x1,y1] = polar(s, 70); const [x2,y2] = polar(e, 70);
    const [x3,y3] = polar(e, 44); const [x4,y4] = polar(s, 44);
    const large = (e - s) > 0.5 ? 1 : 0;
    return `M${x1} ${y1} A70 70 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A44 44 0 ${large} 0 ${x4} ${y4} Z`;
  };

  const tabs: { key: AnalyticsMode; label: string }[] = [
    { key: 'rating',       label: 'Рейтинг' },
    { key: 'distribution', label: 'Распределение' },
    { key: 'heatmap',      label: 'Тепловая карта' },
    ...(hasTeams ? [{ key: 'team' as AnalyticsMode, label: 'Команда' }] : []),
  ];

  return (
    <div className="personal-statistics-container">

      {/* Toolbar */}
      <div className="kb-toolbar">
        <div className="kb-toolbar-title">
          <h1 className="kb-team-name h-display">Аналитика</h1>
        </div>
        <div className="view-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${mode === t.key ? 'active' : ''}`}
              onClick={() => setMode(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>


      {/* KPI strip */}
      <div className="stats-grid stats-grid--kpi">
        {kpis.map(k => (
          <div key={k.k} className="stat-card">
            <div className="stat-icon" style={{ background: k.iconBg }}>
              <k.Icon size={18} color={k.accent} />
            </div>
            <div className="stat-text">
              <div className="stat-value" style={{ color: k.accent }}>{k.v}</div>
              <div className="stat-label">{k.k}</div>
              <div className="stat-subtext">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== RATING MODE ===== */}
      {mode === 'rating' && (
        <div className="an-rating-grid">

          <div className="card an-card">
            <div className="an-card-header">
              <h3 className="h-display">Рейтинг по командам</h3>
              <div className="an-legend">
                <span><span className="an-legend-dot" style={{ opacity: .3 }} />взято</span>
                <span><span className="an-legend-dot" />закрыто</span>
              </div>
            </div>
            {ratingData.length === 0 ? (
              <p className="an-empty">Нет данных — вступите в команду и получите задачи</p>
            ) : (
              <div className="an-rank-list">
                {ratingData.map((t, i) => {
                  const maxVal = Math.max(1, ...ratingData.map(x => x.taken));
                  const isExpanded = expandedTeam === t.id;
                  const closedTasks = assignedTasks.filter(tk => tk.teamId === t.id && tk.status === 'completed');
                  return (
                    <div key={t.id} className="an-rank-item">
                      <div
                        className={`an-rank-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => setExpandedTeam(isExpanded ? null : t.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="an-rank-num" style={{ color: i === 0 ? 'var(--accent)' : 'var(--ink-3)' }}>
                          {i === 0 ? <Star size={14} fill="currentColor" /> : i + 1}
                        </div>
                        <div className="an-rank-team-icon" style={{ background: t.color }}>
                          {t.emoji ? <TeamIcon name={t.emoji} size={14} color="rgba(0,0,0,.6)" /> : t.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="an-rank-body">
                          <div className="an-rank-meta">
                            <span className="an-rank-name">{t.name}</span>
                            <span className="an-rank-stat mono">{t.closed}/{t.taken} задач</span>
                          </div>
                          <div className="an-bar-bg">
                            <div className="an-bar-taken" style={{ width: `${(t.taken / maxVal) * 100}%`, background: t.color }} />
                            <div className="an-bar-closed" style={{ width: `${(t.closed / maxVal) * 100}%`, background: t.color }} />
                          </div>
                        </div>
                        <div className="an-rank-pct">
                          <span className="mono">{t.taken > 0 ? Math.round((t.closed/t.taken)*100) : 0}%</span>
                          <span className="an-rank-pct-sub">закрыл</span>
                        </div>
                        <ChevronRight size={14} className={`an-rank-chevron ${isExpanded ? 'rotated' : ''}`} />
                      </div>
                      {isExpanded && (
                        <div className="an-rank-tasks">
                          {closedTasks.length === 0 ? (
                            <p className="an-rank-tasks-empty">Нет закрытых задач</p>
                          ) : (
                            closedTasks.map(tk => (
                              <div key={tk.id} className="an-rank-task-row">
                                <div className="an-rank-task-dot" style={{ background: t.color }} />
                                <span className="an-rank-task-title">{tk.title}</span>
                                <span className="an-rank-task-pts mono">{tk.points ?? 0} очк.</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="an-leader-col">
            {topTeam && (
              <div className="card an-leader-card" style={{ background: `linear-gradient(135deg, ${topTeam.color}22, var(--bg-elev))` }}>
                <div className="an-leader-eyebrow">лидер недели</div>
                <div className="an-leader-body">
                  <div className="an-leader-avatar" style={{ background: topTeam.color, color: 'rgba(0,0,0,.6)' }}>
                    {topTeam.emoji
                      ? <TeamIcon name={topTeam.emoji} size={22} color="rgba(0,0,0,.6)" />
                      : topTeam.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="h-display" style={{ fontSize: 18 }}>{topTeam.name}</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{topTeam.closed} закрытых задач</div>
                  </div>
                </div>
                <p className="an-leader-desc">
                  Команда с наибольшим числом выполненных вами задач за всё время.
                </p>
                <div className="an-leader-bar-wrap">
                  <div className="an-leader-bar" style={{ width: `${topTeam.teamPct}%`, background: topTeam.color }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{topTeam.teamPct}% команды</span>
                </div>
              </div>
            )}

            <div className="card an-card" style={{ padding: 18 }}>
              <div className="an-card-eyebrow">статусы ваших задач</div>
              {(['open','assigned','in_review','completed'] as const).map(s => (
                <div key={s} className="an-status-row">
                  <span className="an-status-dot" style={{ background: STATUS_COLORS[s] }} />
                  <span className="an-status-label">{STATUS_LABELS[s]}</span>
                  <span className="mono an-status-count">
                    {assignedTasks.filter(t => t.status === s).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== DISTRIBUTION MODE ===== */}
      {mode === 'distribution' && (
        <div className="an-distrib-grid">

          <div className="card an-card">
            <h3 className="h-display" style={{ marginBottom: 4 }}>Распределение задач</h3>
            <p className="an-card-sub">доли по статусам — без ранжирования</p>
            <div className="an-donut-wrap">
              <svg viewBox="0 0 160 160" className="an-donut-svg">
                {totalTasks === 0 ? (
                  <circle cx="80" cy="80" r="57" fill="none" stroke="var(--line)" strokeWidth="26" />
                ) : (
                  distribData.filter(d => d.count > 0).map(d => (
                    <path key={d.status} d={arc(d.start, d.end)} fill={d.color} opacity={.9} />
                  ))
                )}
                <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--ink)">{totalTasks}</text>
                <text x="80" y="94" textAnchor="middle" fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-sans)">задач всего</text>
              </svg>
            </div>
            <div className="an-donut-legend">
              {distribData.map(d => (
                <div key={d.status} className="an-donut-leg-row">
                  <span className="an-donut-leg-dot" style={{ background: d.color }} />
                  <span className="an-donut-leg-label">{d.label}</span>
                  <span className="mono an-donut-leg-pct">
                    {totalTasks > 0 ? Math.round((d.count / totalTasks) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card an-card">
            <h3 className="h-display" style={{ marginBottom: 4 }}>По командам</h3>
            <p className="an-card-sub">ваши задачи в каждой команде</p>
            <div className="an-team-bars">
              {user.teams.length === 0 ? (
                <p className="an-empty">Нет команд</p>
              ) : (
                user.teams.map(team => {
                  const mine = assignedTasks.filter(t => t.teamId === team.id);
                  const closed = mine.filter(t => t.status === 'completed').length;
                  const maxMine = Math.max(1, ...user.teams.map(tt => assignedTasks.filter(t => t.teamId === tt.id).length));
                  return (
                    <div key={team.id} className="an-team-bar-row">
                      <div className="an-team-bar-meta">
                        <span className="an-team-bar-name">{team.name}</span>
                        <span className="mono an-team-bar-stat">{closed}/{mine.length}</span>
                      </div>
                      <div className="an-bar-bg" style={{ height: 22, borderRadius: 6 }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${(mine.length / maxMine) * 100}%`, background: memberColor(team.id), opacity: .25, borderRadius: 6 }} />
                        <div style={{ position: 'absolute', inset: 0, width: `${(closed / maxMine) * 100}%`, background: memberColor(team.id), borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== HEATMAP MODE ===== */}
      {mode === 'heatmap' && (
        <div className="card an-heatmap-card">
          <div className="an-heatmap-layout">

            <div className="an-heatmap-left">
              <div className="an-heatmap-header">
                <h3 className="h-display" style={{ margin: 0 }}>Тепловая карта</h3>
                <div className="an-month-nav">
                  <button className="an-month-btn" onClick={() => setSelectedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                    <ChevronLeft size={15} />
                  </button>
                  <span className="an-month-label">
                    {selectedMonth.toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    className="an-month-btn"
                    onClick={() => {
                      const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
                      const now = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                      if (next <= now) setSelectedMonth(next);
                    }}
                    disabled={selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              <div className="an-heatmap-calendar">
                <div className="an-heatmap-dow-row">
                  {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                    <span key={d} className="an-heatmap-dow">{d}</span>
                  ))}
                </div>
                <div className="an-heatmap-weeks">
                  {calendarGrid.map((week, wi) => (
                    <div key={wi} className="an-heatmap-week">
                      {week.map((cell, di) => (
                        <div
                          key={di}
                          className={`an-heatmap-cell${cell ? '' : ' an-heatmap-cell--empty'}`}
                          title={cell ? `${cell.date.toLocaleDateString('ru', { day: 'numeric', month: 'short' })}: ${cell.count} задач` : ''}
                          style={cell && cell.count > 0 ? {
                            background: `color-mix(in srgb, var(--accent) ${Math.round(Math.min(85, (0.18 + (cell.count / heatMax) * 0.67) * 100))}%, transparent)`,
                            borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)',
                          } : {}}
                        >
                          {cell && (
                            <span
                              className={`an-heatmap-day-num${cell.count > 0 && (cell.count / heatMax) > 0.55 ? ' an-heatmap-day-num--bright' : ''}`}
                            >
                              {cell.day}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="an-heatmap-legend">
                <span>меньше</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                  <div key={i} className="an-heatmap-swatch" style={{
                    background: `rgba(91,141,239,${v === 0 ? 0.08 : 0.18 + v * 0.67})`,
                  }} />
                ))}
                <span>больше</span>
              </div>
            </div>

            <div className="an-heatmap-right">
              <div className="an-filter-section">
                <div className="an-filter-label">Команда</div>
                <div className="an-filter-pills">
                  <button
                    className={`an-filter-pill ${filterTeam === null ? 'active' : ''}`}
                    onClick={() => setFilterTeam(null)}
                  >
                    Все
                  </button>
                  {(user?.teams ?? []).map(t => (
                    <button
                      key={t.id}
                      className={`an-filter-pill ${filterTeam === t.id ? 'active' : ''}`}
                      onClick={() => setFilterTeam(filterTeam === t.id ? null : t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="an-filter-section">
                <div className="an-filter-label">Статус</div>
                <div className="an-filter-pills">
                  <button
                    className={`an-filter-pill ${filterStatus === null ? 'active' : ''}`}
                    onClick={() => setFilterStatus(null)}
                  >
                    Все
                  </button>
                  {(['open','assigned','in_review','completed'] as const).map(s => (
                    <button
                      key={s}
                      className={`an-filter-pill ${filterStatus === s ? 'active' : ''}`}
                      onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="an-filter-section" style={{ marginTop: 'auto' }}>
                <div className="an-filter-label">Итого за месяц</div>
                <div className="an-heatmap-stats">
                  <div className="an-heatmap-stat">
                    <span className="mono an-heatmap-stat-value" style={{ color: 'var(--ink)' }}>
                      {heatmapMonthData.filter(d => d.count > 0).length}
                    </span>
                    <span className="an-heatmap-stat-label" style={{ color: 'var(--ink-3)' }}>активных дней</span>
                  </div>
                  <div className="an-heatmap-stat">
                    <span className="mono an-heatmap-stat-value" style={{ color: 'var(--accent)' }}>
                      {Math.max(0, ...heatmapMonthData.map(d => d.count))}
                    </span>
                    <span className="an-heatmap-stat-label" style={{ color: 'var(--ink-3)' }}>макс. за день</span>
                  </div>
                  <div className="an-heatmap-stat">
                    <span className="mono an-heatmap-stat-value" style={{ color: 'var(--good)' }}>
                      {heatmapMonthData.reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className="an-heatmap-stat-label" style={{ color: 'var(--ink-3)' }}>обновлений</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== TEAM MODE ===== */}
      {mode === 'team' && hasTeams && (
        <TeamAnalyticsTab
          teams={user!.teams}
          initialTeamId={activeTeamId ? Number(activeTeamId) : null}
        />
      )}

    </div>
  );
}
