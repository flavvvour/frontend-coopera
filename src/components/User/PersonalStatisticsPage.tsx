// components/User/PersonalStatisticsPage.tsx
import { useMemo, useState } from 'react';
import { useHookGetUserTasks } from '../../hooks/useHookGetUserTasks';
import './personal-statistics-page.css';

interface PersonalStatisticsPageProps {
  username: string;
}

interface TeamStat {
  id: number;
  name: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  myTasks: number;
  myCompletedTasks: number;
  completionRate: number;
  myCompletionRate: number;
}

interface Statistics {
  overall: {
    totalTeams: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    openTasks: number;
    completionRate: number;
    totalPoints: number;
    averagePoints: number;
  };
  personal: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    openTasks: number;
    completionRate: number;
    totalPoints: number;
    averagePoints: number;
    efficiency: number; // Новый показатель - эффективность
  };
  teamStats: TeamStat[];
}

export function PersonalStatisticsPage({ username }: PersonalStatisticsPageProps) {
  const { data, loading, error, refresh } = useHookGetUserTasks(username);
  const [activeView, setActiveView] = useState<'overview' | 'teams' | 'personal'>('overview');

  const statistics = useMemo<Statistics | null>(() => {
    const { allTasks = [], assignedTasks = [], user } = data || {};

    if (!user || allTasks.length === 0) {
      return null;
    }

    // Статусы задач
    const COMPLETED_STATUS = 'completed';
    const IN_PROGRESS_STATUSES = ['assigned', 'in_review', 'in_progress'];
    const OPEN_STATUS = 'open';

    // Общая статистика
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === COMPLETED_STATUS).length;
    const inProgressTasks = allTasks.filter(t => IN_PROGRESS_STATUSES.includes(t.status)).length;
    const openTasks = allTasks.filter(t => t.status === OPEN_STATUS).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalPoints = allTasks.reduce((sum, task) => sum + task.points, 0);
    const averagePoints = totalTasks > 0 ? totalPoints / totalTasks : 0;

    // Личная статистика
    const myTotalTasks = assignedTasks.length;
    const myCompletedTasks = assignedTasks.filter(t => t.status === COMPLETED_STATUS).length;
    const myInProgressTasks = assignedTasks.filter(t =>
      IN_PROGRESS_STATUSES.includes(t.status)
    ).length;
    const myOpenTasks = assignedTasks.filter(t => t.status === OPEN_STATUS).length;
    const myCompletionRate = myTotalTasks > 0 ? (myCompletedTasks / myTotalTasks) * 100 : 0;
    const myTotalPoints = assignedTasks.reduce((sum, task) => sum + task.points, 0);
    const myAveragePoints = myTotalTasks > 0 ? myTotalPoints / myTotalTasks : 0;

    // Эффективность (отношение выполненных задач к общему числу задач в командах)
    const efficiency = totalTasks > 0 ? (myCompletedTasks / completedTasks) * 100 : 0;

    // Статистика по командам
    const teamStats = user.teams.map(team => {
      const teamTasks = allTasks.filter(t => t.teamId === team.id);
      const teamAssignedTasks = assignedTasks.filter(t => t.teamId === team.id);

      const teamTotalTasks = teamTasks.length;
      const teamCompletedTasks = teamTasks.filter(t => t.status === COMPLETED_STATUS).length;
      const teamMyTasks = teamAssignedTasks.length;
      const teamMyCompletedTasks = teamAssignedTasks.filter(
        t => t.status === COMPLETED_STATUS
      ).length;

      return {
        id: team.id,
        name: team.name,
        role: team.role,
        totalTasks: teamTotalTasks,
        completedTasks: teamCompletedTasks,
        myTasks: teamMyTasks,
        myCompletedTasks: teamMyCompletedTasks,
        completionRate: teamTotalTasks > 0 ? (teamCompletedTasks / teamTotalTasks) * 100 : 0,
        myCompletionRate: teamMyTasks > 0 ? (teamMyCompletedTasks / teamMyTasks) * 100 : 0,
      };
    });

    return {
      overall: {
        totalTeams: user.teams.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        openTasks,
        completionRate,
        totalPoints,
        averagePoints,
      },
      personal: {
        totalTasks: myTotalTasks,
        completedTasks: myCompletedTasks,
        inProgressTasks: myInProgressTasks,
        openTasks: myOpenTasks,
        completionRate: myCompletionRate,
        totalPoints: myTotalPoints,
        averagePoints: myAveragePoints,
        efficiency,
      },
      teamStats,
    };
  }, [data]);

  const formatNumber = (num: number) => {
    if (num % 1 === 0) return num.toString();
    return num.toFixed(1);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="statistics-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-error">
        <h2>Ошибка загрузки данных</h2>
        <p>{error.message}</p>
        <button onClick={() => refresh()} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="statistics-not-found">
        <h2>Пользователь не найден</h2>
        <p>Не удалось загрузить данные пользователя</p>
      </div>
    );
  }

  return (
    <div className="personal-statistics-container">
      <div className="statistics-header">
        <div className="header-top">
          {/* <h1>Личная статистика</h1> */}
          {/* <button onClick={refresh} className="refresh-btn" title="Обновить данные">
            🔄
          </button> */}
        </div>

        <div className="user-greeting">
          <div className="user-avatar-large">{username.charAt(0).toUpperCase()}</div>
          <div>
            <h2>Привет, {username}!</h2>
            <p className="user-meta">
              Участник {data.user.teams.length} команд • ID: {data.user.id}
            </p>
          </div>
        </div>

        {/* Переключение вкладок */}
        <div className="view-tabs">
          <button
            className={`tab-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            Обзор
          </button>
          <button
            className={`tab-btn ${activeView === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveView('personal')}
          >
            Личная
          </button>
          <button
            className={`tab-btn ${activeView === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveView('teams')}
          >
            Команды
          </button>
        </div>
      </div>

      {/* Обзорная статистика */}
      {activeView === 'overview' && statistics && (
        <>
          <div className="statistics-section">
            <h3>Основные показатели</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{statistics.personal.totalTasks}</div>
                <div className="stat-label">Ваши задачи</div>
                <div className="stat-subtext">
                  {formatPercentage(statistics.personal.completionRate)} выполнено
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{statistics.personal.completedTasks}</div>
                <div className="stat-label">Выполнено</div>
                <div className="stat-subtext">
                  {formatNumber(statistics.personal.averagePoints)} очков/задачу
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{formatPercentage(statistics.personal.efficiency)}</div>
                <div className="stat-label">Эффективность</div>
                <div className="stat-subtext">
                  {statistics.personal.completedTasks} из {statistics.overall.completedTasks} задач
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-value">{statistics.personal.totalPoints}</div>
                <div className="stat-label">Всего очков</div>
                <div className="stat-subtext">{statistics.personal.totalTasks} задач</div>
              </div>
            </div>
          </div>

          <div className="stats-comparison">
            <div className="comparison-card">
              <h4>📋 Распределение задач</h4>
              <div className="progress-bars">
                <div className="progress-item">
                  <span>Выполнено</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill completed"
                      style={{ width: `${statistics.overall.completionRate}%` }}
                    ></div>
                  </div>
                  <span>
                    {statistics.overall.completedTasks} из {statistics.overall.totalTasks}
                  </span>
                </div>
                <div className="progress-item">
                  <span>Ваши выполненные</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill personal"
                      style={{ width: `${statistics.personal.completionRate}%` }}
                    ></div>
                  </div>
                  <span>
                    {statistics.personal.completedTasks} из {statistics.personal.totalTasks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Личная статистика */}
      {activeView === 'personal' && statistics && (
        <div className="statistics-section">
          <h3>👤 Ваша производительность</h3>
          <div className="personal-stats-grid">
            <div className="stat-card detailed">
              <h4>Задачи по статусам</h4>
              <div className="status-breakdown">
                <div className="status-item open">
                  <span className="status-dot"></span>
                  <span>Открытые</span>
                  <span className="status-count">{statistics.personal.openTasks}</span>
                </div>
                <div className="status-item in-progress">
                  <span className="status-dot"></span>
                  <span>В работе</span>
                  <span className="status-count">{statistics.personal.inProgressTasks}</span>
                </div>
                <div className="status-item completed">
                  <span className="status-dot"></span>
                  <span>Выполненные</span>
                  <span className="status-count">{statistics.personal.completedTasks}</span>
                </div>
              </div>
            </div>

            <div className="stat-card detailed">
              <h4>Очки и рейтинг</h4>
              <div className="points-info">
                <div className="points-total">
                  <div className="points-label">Всего очков</div>
                  <div className="points-value">{statistics.personal.totalPoints}</div>
                </div>
                <div className="points-average">
                  <div className="points-label">Среднее за задачу</div>
                  <div className="points-value">
                    {formatNumber(statistics.personal.averagePoints)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика по командам */}
      {activeView === 'teams' && statistics && (
        <div className="statistics-section">
          <h3>Участие в командах</h3>
          <div className="team-stats-container">
            <div className="team-stats-header">
              <div>Команда</div>
              <div>Роль</div>
              <div>Всего задач</div>
              <div>Выполнено</div>
              <div>Ваши задачи</div>
              <div>Выполненные (личные)</div>
              <div>Прогресс</div>
            </div>

            {statistics.teamStats.map(team => (
              <div key={team.id} className="team-stat-row">
                <div className="team-name-cell">
                  <span className="team-icon">👥</span>
                  {team.name}
                </div>
                <div className="team-role-cell">
                  <span className={`role-badge ${team.role.toLowerCase()}`}>
                    {team.role === 'manager' ? 'Менеджер' : 'Участник'}
                  </span>
                </div>
                <div className="team-data-cell">{team.totalTasks}</div>
                <div className="team-data-cell">
                  <span className="team-completed">{team.completedTasks}</span>
                  <span className="team-percentage">({formatPercentage(team.completionRate)})</span>
                </div>
                <div className="team-data-cell">{team.myTasks}</div>
                <div className="team-data-cell">
                  <span className="team-completed">{team.myCompletedTasks}</span>
                  <span className="team-percentage">
                    ({formatPercentage(team.myCompletionRate)})
                  </span>
                </div>
                <div className="team-progress-cell">
                  <div className="team-progress-bar">
                    <div
                      className="team-progress-fill"
                      style={{ width: `${team.myCompletionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
