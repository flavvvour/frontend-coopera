import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/shared/store';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useHookPatchTeamAutoassign, useTeam } from '@/entities/team';
import { Users, Lock, UserX, AlertTriangle, Search, X, Zap, Copy, Check, Link2, Clock, CheckSquare, TrendingUp, BarChart2 } from 'lucide-react';
import { useHookGetUser } from '@/entities/user';
import { useHookInviteByUsername } from '@/features/invite-member';
import { useHookDeleteMember } from '@/entities/membership';
import { useHookGetTask } from '@/entities/task';
import { KanbanBoard } from '@/widgets/kanban';
import { ProfileModal } from '@/widgets/profile';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { addActivity } from '@/entities/activity';
import { encodeInviteCode } from '@/shared/lib/invite';
import { COPY_FEEDBACK_TIMEOUT_MS, DEBOUNCE_SEARCH_MS } from '@/shared/lib/constants';
import './team-detail-page.css';

const PHOTO_URL = (id: number) => `/api/v1/users/${id}/photo`;

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'members' | 'kanban' | 'autoassign' | 'analytics') ?? 'kanban';
  const [profileMemberId, setProfileMemberId] = useState<number | null>(null);
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<number | null>(null);
  const [removeMemberError, setRemoveMemberError] = useState<string | null>(null);
  // состояние для добавления пользователя в команду
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState<boolean>(true);
  const { patch: patchAutoassign } = useHookPatchTeamAutoassign();
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());
  // Получаем данные о команде
  const {
    data: team,
    loading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useTeam(teamId ? Number(teamId) : 0);

  // Initialize autoAssignEnabled from team data
  useEffect(() => {
    if (team?.autoassign !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAutoAssignEnabled(team.autoassign);
    }
  }, [team?.autoassign]);

  const { data: teamTasks } = useHookGetTask(team?.id || 0);

  // Получаем данные о текущем пользователе
  const username = useAuthStore(s => s.username) ?? '';
  const {
    inviteByUsername,
    clearError: clearInviteError,
    loading: invitingUser,
    error: inviteError,
    isAlreadyInTeamError,
    isUserNotFoundError,
  } = useHookInviteByUsername();
  const [debouncedUsername, setDebouncedUsername] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(usernameToAdd.trim()), DEBOUNCE_SEARCH_MS);
    return () => clearTimeout(t);
  }, [usernameToAdd]);
  const { data: foundUser, loading: searchingUser } = useHookGetUser(debouncedUsername);
  const isAlreadyMember = team?.members.some(
    member => foundUser && (
      member.memberId === foundUser.id ||
      Number(member.memberId) === Number(foundUser.id) ||
      member.username === foundUser.username
    )
  );

  const { data: currentUser, loading: userLoading, error: userError } = useHookGetUser(username);
  // Проверка, что это не сам пользователь:
  const isSelf = foundUser?.username === currentUser?.username;
  const isUserMemberOfTeam =
    currentUser && team ? currentUser.teams.some(userTeam => userTeam.id === team.id) : false;

  // Проверяем роль пользователя в этой команде
  const getUserRoleInTeam = () => {
    if (!currentUser || !team) return null;
    const userTeam = currentUser.teams.find(t => t.id === team.id);
    return userTeam ? userTeam.role : null;
  };

  const userRoleInTeam = getUserRoleInTeam();
  const isManager = userRoleInTeam === 'manager';

  // Проверяем права (у вас только manager и member)
  const canEditTeam = isManager; // Только менеджер может редактировать
  const canCreateTasks = isUserMemberOfTeam; // Все участники команды могут создавать задачи
  const { deleteMember, loading: deletingMember, error: deleteMemberError } = useHookDeleteMember();

  const handlePhotoError = (memberId: number) => {
    setFailedPhotos(prev => new Set([...prev, memberId]));
  };

  // Cчитываем ID пользователей из данных команды
  const getMembersForKanban = () => {
    if (!team) return [];

    return team.members.map(member => ({
      id: member.memberId,
      userId: member.userId,
      username: member.username,
    }));
  };

  const handleInviteMember = async () => {
    if (!usernameToAdd.trim() || !team) return;

    try {
      await inviteByUsername(team.id, usernameToAdd);
      setShowInviteModal(false);
      setUsernameToAdd('');
      await refetchTeam();
    } catch { /* error displayed via isAlreadyInTeamError / isUserNotFoundError */ }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!team || !currentUser) return;
    setRemoveMemberError(null);

    const memberExists = team.members.some(m => m.memberId === memberId);
    if (!memberExists) {
      setRemoveMemberError('Участник не найден в команде');
      return;
    }

    if (team.createdByUser === memberId) {
      setRemoveMemberError('Нельзя удалить создателя команды');
      return;
    }

    setRemoveMemberConfirm(memberId);
  };

  const confirmRemoveMember = async () => {
    if (!team || !currentUser || removeMemberConfirm === null) return;
    const memberId = removeMemberConfirm;
    const removedName = team.members.find(m => m.memberId === memberId)?.username ?? 'Участник';
    setRemoveMemberConfirm(null);
    try {
      await deleteMember(memberId, team.id, currentUser.id);
      await refetchTeam();
      addActivity({ type: 'member_removed', title: removedName, detail: `Удалён из «${team.name}»`, teamId: team.id, teamEmoji: team.emoji, teamColor: team.color });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('не найден')) {
          await refetchTeam();
        } else {
          setRemoveMemberError(error.message);
        }
      }
    }
  };

  // Состояния загрузки
  if (teamLoading || userLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <Skeleton height={40} width={280} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton height={24} width="60%" />
              {[0,1].map(j => <Skeleton key={j} height={80} borderRadius="var(--r)" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Состояния ошибок
  if (teamError) {
    return (
      <div className="team-detail-error">
        <h2>Ошибка загрузки команды</h2>
        <p>{teamError.message}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="retry-btn">
            Попробовать снова
          </button>
          <button onClick={() => navigate('/dashboard/teams')} className="back-btn">
            Назад к списку команд
          </button>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="team-detail-error">
        <h2>Ошибка загрузки пользователя</h2>
        <p>{userError.message}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()} className="retry-btn">
            Попробовать снова
          </button>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-not-found">
        <div className="not-found-icon"><Users size={26} color="#aeaeb2" /></div>
        <h2>Команда не найдена</h2>
        <p>Команда с ID {teamId} не существует или была удалена</p>
        <button onClick={() => navigate('/dashboard/teams')} className="back-btn">
          Вернуться к списку команд
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="team-not-found">
        <div className="not-found-icon"><UserX size={26} color="#aeaeb2" /></div>
        <h2>Пользователь не найден</h2>
        <p>Не удалось загрузить данные пользователя</p>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="team-detail-container">
      {/* Основной контент */}
      <div className="team-content">
        {activeTab === 'members' ? (
          /* Вкладка участников */
          <div className="team-members-section">
            <div className="kb-toolbar">
              <div className="kb-toolbar-title">
                <h1 className="kb-team-name h-display">Участники</h1>
                <span className="kb-total mono">{team.members.length} чел.</span>
              </div>
              {canEditTeam && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}>
                  + Добавить
                </button>
              )}
            </div>


            <div className="members-list">
              {team.members.length === 0 ? (
                <div className="empty-members">
                  <p>В команде пока нет участников</p>
                  {canEditTeam && (
                    <button className="add-member-btn">Добавить первого участника</button>
                  )}
                </div>
              ) : (
                <div className="members-table">
                  <div className="members-table-header">
                    <div className="header-cell">Участник</div>
                    <div className="header-cell">Роль</div>
                    {canEditTeam && <div className="header-cell">Действия</div>}
                  </div>
                  {team.members.map(member => {
                    const isCurrentUser = currentUser.id === member.memberId;
                    const isCreator = team.createdByUser === member.memberId;

                    return (
                      <div
                        key={member.memberId}
                        className="member-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setProfileMemberId(member.memberId)}
                      >
                        <div className="member-cell">
                          <div className="member-avatar">
                            {!failedPhotos.has(member.userId)
                              ? <img src={PHOTO_URL(member.userId)} alt={member.username} className="member-avatar__img" onError={() => handlePhotoError(member.userId)} />
                              : member.username?.charAt(0).toUpperCase() || '?'
                            }
                          </div>
                          <div className="member-info">
                            <div className="member-username">
                              @{member.username}
                              {isCreator && <span className="creator-badge">Создатель</span>}
                            </div>
                          </div>
                        </div>
                        <div className="member-cell">
                          <span className={`role-badge ${member.role.toLowerCase()}`}>
                            {member.role === 'manager' ? 'Менеджер' : 'Участник'}
                          </span>
                        </div>
                        {canEditTeam && !isCurrentUser && (
                          <div className="member-cell">
                            {member.role !== 'manager' && (
                              <button
                                className="small-btn danger-btn"
                                onClick={e => { e.stopPropagation(); handleRemoveMember(member.memberId); }}
                                disabled={deletingMember}
                              >
                                {deletingMember ? 'Удаление...' : 'Удалить'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'autoassign' ? (
          /* Вкладка автораспределения */
          <div className="aa-section">

            {/* Header */}
            <div className="kb-toolbar">
              <div className="kb-toolbar-title">
                <h1 className="kb-team-name h-display">Автораспределение</h1>
              </div>
            </div>

            {/* Stats */}
            <div className="aa-stats-grid">
              <div className="aa-stat-card">
                <div className="aa-stat-icon-wrap">
                  <Clock size={17} color="var(--accent)" />
                </div>
                <div className="aa-stat-text">
                  <span className="aa-stat-val mono">10с</span>
                  <span className="aa-stat-label">интервал воркера</span>
                </div>
              </div>
              <div className="aa-stat-card aa-stat-card--status">
                <div className={`aa-stat-icon-wrap${autoAssignEnabled ? ' aa-stat-icon-wrap--active' : ''}`}>
                  <CheckSquare size={17} color="var(--accent)" />
                </div>
                <div className="aa-stat-text">
                  <span className="aa-stat-val mono" style={{ color: 'var(--accent)' }}>
                    {autoAssignEnabled ? 'Активно' : 'Выкл'}
                  </span>
                  <span className="aa-stat-label">статус</span>
                </div>
                <button
                  className={`aa-switch ${autoAssignEnabled ? 'on' : ''}`}
                  onClick={() => {
                    const next = !autoAssignEnabled;
                    setAutoAssignEnabled(next);
                    if (currentUser && team) {
                      patchAutoassign(team.id, currentUser.id, next).catch(() => {});
                    }
                  }}
                >
                  <span className="aa-switch-knob" />
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="aa-info-card">
              <div className="aa-info-icon-wrap">
                <Zap size={15} color="var(--accent)" />
              </div>
              <div className="aa-info-body">
                <span className="aa-info-title">Как работает автораспределение</span>
                <p className="aa-info-text">
                  Фоновый воркер каждые 10 секунд проверяет задачи в статусе «Бэклог».
                  При наличии свободных задач система выбирает участника с наименьшей нагрузкой
                  и назначает ему задачу, переводя её в статус «В работе».
                </p>
              </div>
            </div>

          </div>
        ) : activeTab === 'analytics' ? (
          /* Вкладка аналитики */
          (() => {
            const tasks = teamTasks ?? [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in_review' || t.status === 'assigned').length;
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div className="team-analytics-section">
                <div className="kb-toolbar">
                  <div className="kb-toolbar-title">
                    <h1 className="kb-team-name h-display">Аналитика команды</h1>
                    <span className="kb-total mono">{totalTasks} задач</span>
                  </div>
                </div>

                <div className="team-an-kpi-row">
                  <div className="team-an-kpi-card">
                    <div className="team-an-kpi-icon" style={{ background: 'rgba(91,141,239,.12)' }}>
                      <BarChart2 size={18} color="var(--accent)" />
                    </div>
                    <div className="team-an-kpi-body">
                      <span className="team-an-kpi-val mono">{totalTasks}</span>
                      <span className="team-an-kpi-label">Всего задач</span>
                    </div>
                  </div>
                  <div className="team-an-kpi-card">
                    <div className="team-an-kpi-icon" style={{ background: 'rgba(74,138,91,.12)' }}>
                      <CheckSquare size={18} color="var(--good)" />
                    </div>
                    <div className="team-an-kpi-body">
                      <span className="team-an-kpi-val mono" style={{ color: 'var(--good)' }}>{completedTasks}</span>
                      <span className="team-an-kpi-label">Завершено</span>
                    </div>
                  </div>
                  <div className="team-an-kpi-card">
                    <div className="team-an-kpi-icon" style={{ background: 'rgba(251,191,36,.12)' }}>
                      <Clock size={18} color="var(--warn)" />
                    </div>
                    <div className="team-an-kpi-body">
                      <span className="team-an-kpi-val mono" style={{ color: 'var(--warn)' }}>{inProgressTasks}</span>
                      <span className="team-an-kpi-label">В работе</span>
                    </div>
                  </div>
                  <div className="team-an-kpi-card">
                    <div className="team-an-kpi-icon" style={{ background: 'rgba(91,141,239,.12)' }}>
                      <TrendingUp size={18} color="var(--accent)" />
                    </div>
                    <div className="team-an-kpi-body">
                      <span className="team-an-kpi-val mono">{completionRate}%</span>
                      <span className="team-an-kpi-label">Выполнено</span>
                    </div>
                  </div>
                </div>

                <div className="team-an-members-table">
                  {team.members.map(member => {
                    const memberTasks = tasks.filter(t => t.assignedToMember === member.memberId);
                    const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
                    const memberPoints = memberTasks
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + (t.points ?? 0), 0);

                    return (
                      <div key={member.memberId} className="team-an-member-row">
                        <div className="member-avatar">
                          {!failedPhotos.has(member.userId)
                            ? <img src={PHOTO_URL(member.userId)} alt={member.username} className="member-avatar__img" onError={() => handlePhotoError(member.userId)} />
                            : member.username?.charAt(0).toUpperCase() || '?'
                          }
                        </div>
                        <div className="team-an-member-name">
                          <span className="member-username">@{member.username ?? `#${member.memberId}`}</span>
                          <span className={`role-badge ${member.role.toLowerCase()}`}>
                            {member.role === 'manager' ? 'Менеджер' : 'Участник'}
                          </span>
                        </div>
                        <div className="team-an-member-stats">
                          <div className="team-an-stat">
                            <span className="team-an-stat-val mono">{memberTasks.length}</span>
                            <span className="team-an-stat-label">Назначено</span>
                          </div>
                          <div className="team-an-stat">
                            <span className="team-an-stat-val mono" style={{ color: 'var(--good)' }}>{memberCompleted}</span>
                            <span className="team-an-stat-label">Завершено</span>
                          </div>
                          <div className="team-an-stat">
                            <span className="team-an-stat-val mono" style={{ color: 'var(--accent)' }}>{memberPoints}</span>
                            <span className="team-an-stat-label">Очков</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : isUserMemberOfTeam ? (
          /* Вкладка канбан-доски - для участников */
          <KanbanBoard
            teamId={team.id}
            teamName={team.name}
            teamEmoji={team.emoji}
            teamColor={team.color}
            currentUserId={currentUser.id}
            members={getMembersForKanban()}
            canCreateTasks={canCreateTasks}
            canEditTasks={isUserMemberOfTeam}
            canDeleteTasks={isManager}
            isManager={isManager}
            onInvite={() => setShowInviteModal(true)}
            onMemberClick={setProfileMemberId}
          />
        ) : (
          /* Вкладка канбан-доски - для не участников */
          <div className="not-authorized-kanban">
            <div className="not-authorized-icon"><Lock size={26} color="#aeaeb2" /></div>
            <h3>Доступ к канбан-доске ограничен</h3>
            <p>Только участники команды могут просматривать и создавать задачи.</p>
            <button
              className="join-team-btn"
              onClick={() => {
                /* Логика вступления в команду */
              }}
            >
              Вступить в команду
            </button>
          </div>
        )}
        {showInviteModal && (() => {
          const inviteCode = teamId ? encodeInviteCode(parseInt(teamId)) : '';
          const inviteLink = `${window.location.origin}/join/${inviteCode}`;
          const copyLink = () => {
            navigator.clipboard.writeText(inviteLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
          };
          return (
            <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
              <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
                <button className="kb-detail-close" onClick={() => setShowInviteModal(false)} disabled={invitingUser}>
                  <X size={16} />
                </button>

                <div className="kb-create-header">
                  <h2 className="h-display kb-create-title">Пригласить участника</h2>
                  <p className="kb-create-subtitle">Только зарегистрированные пользователи Coopera могут быть добавлены</p>
                </div>

                <div className="kb-create-body">
                  {inviteError && (
                    <div className={`message-box ${isAlreadyInTeamError ? 'warning-box' : isUserNotFoundError ? 'info-box' : 'error-box'}`} style={{ marginBottom: 4 }}>
                      {isAlreadyInTeamError && <AlertTriangle size={14} style={{ marginRight: 4 }} />}
                      {inviteError.message}
                    </div>
                  )}
                  {deleteMemberError && (
                    <div className="error-message" style={{ marginBottom: 4 }}>Ошибка удаления: {deleteMemberError.message}</div>
                  )}

                  <div className="kb-create-field">
                    <div className="kb-create-label">Username в Telegram</div>
                    <input
                      type="text"
                      className="coop-input"
                      value={usernameToAdd}
                      onChange={e => { setUsernameToAdd(e.target.value); clearInviteError(); }}
                      placeholder="Например: ivan_petrov"
                      disabled={invitingUser}
                      autoFocus
                    />
                  </div>

                  {usernameToAdd.trim() && searchingUser && (
                    <div className="kb-invite-status row gap-6" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                      <Search size={13} /> Поиск пользователя…
                    </div>
                  )}
                  {usernameToAdd.trim() && !searchingUser && foundUser && (
                    isSelf ? (
                      <div className="kb-invite-user-card kb-invite-user-card--self">
                        <div className="kb-invite-user-avatar" style={{ background: 'rgba(91,141,239,.18)', color: 'var(--accent)' }}>
                          {foundUser.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="kb-invite-user-info">
                          <div className="kb-invite-user-name">@{foundUser.username}</div>
                          <div className="kb-invite-user-badge kb-invite-user-badge--self">Это вы сами</div>
                        </div>
                      </div>
                    ) : isAlreadyMember ? (
                      <div className="kb-invite-user-card kb-invite-user-card--member">
                        <div className="kb-invite-user-avatar" style={{ background: 'rgba(91,141,239,.18)', color: 'var(--accent)' }}>
                          {foundUser.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="kb-invite-user-info">
                          <div className="kb-invite-user-name">@{foundUser.username}</div>
                          <div className="kb-invite-user-badge kb-invite-user-badge--member">Уже в команде</div>
                        </div>
                      </div>
                    ) : (
                      <div className="kb-invite-user-card kb-invite-user-card--ready">
                        <div className="kb-invite-user-avatar" style={{ background: 'rgba(91,141,239,.15)', color: 'var(--accent)' }}>
                          {foundUser.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="kb-invite-user-info">
                          <div className="kb-invite-user-name">@{foundUser.username}</div>
                          <div className="kb-invite-user-badge kb-invite-user-badge--ready">
                            <Check size={11} /> Будет добавлен в команду
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Не найден — предлагаем ссылку */}
                  {usernameToAdd.trim() && !searchingUser && !foundUser && (
                    <div className="kb-invite-not-found">
                      <div className="kb-invite-not-found-msg row gap-6">
                        <X size={13} /> Пользователь не найден в Coopera
                      </div>
                      <p className="kb-invite-not-found-hint">
                        Пригласите человека зарегистрироваться — отправьте ссылку:
                      </p>
                      <div className="kb-invite-link-row">
                        <span className="kb-invite-link-val mono">{inviteLink}</span>
                        <button className="btn btn-ghost btn-sm row gap-6" onClick={copyLink} type="button">
                          {linkCopied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Копировать</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Подсказка — всегда видна */}
                  {!usernameToAdd.trim() && (
                    <div className="kb-invite-tip row gap-6">
                      <Link2 size={12} />
                      Или поделитесь ссылкой-приглашением:
                      <button className="btn btn-ghost btn-sm row gap-6" onClick={copyLink} type="button" style={{ marginLeft: 'auto' }}>
                        {linkCopied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Скопировать ссылку</>}
                      </button>
                    </div>
                  )}
                </div>

                <div className="kb-create-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)} disabled={invitingUser}>
                    Отмена
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleInviteMember}
                    disabled={invitingUser || !usernameToAdd.trim() || !foundUser || isAlreadyMember || isSelf}
                  >
                    {invitingUser ? 'Добавление…' : 'Добавить участника'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Profile modal — opened from member rows */}
      {profileMemberId !== null && team && (
        <ProfileModal
          memberId={profileMemberId}
          userId={team.members.find(m => m.memberId === profileMemberId)?.userId}
          memberUsername={team.members.find(m => m.memberId === profileMemberId)?.username ?? `#${profileMemberId}`}
          teamName={team.name}
          memberRole={team.members.find(m => m.memberId === profileMemberId)?.role}
          tasks={teamTasks ?? []}
          onClose={() => setProfileMemberId(null)}
        />
      )}

      {removeMemberConfirm !== null && team && (
        <ConfirmModal
          title="Удалить участника?"
          description={`«${team.members.find(m => m.memberId === removeMemberConfirm)?.username ?? 'Участник'}» будет удалён из команды.`}
          confirmLabel="Удалить"
          onConfirm={confirmRemoveMember}
          onCancel={() => setRemoveMemberConfirm(null)}
        />
      )}

      {removeMemberError && (
        <ConfirmModal
          title="Невозможно удалить"
          description={removeMemberError}
          confirmLabel="Понятно"
          cancelLabel="Закрыть"
          danger={false}
          onConfirm={() => setRemoveMemberError(null)}
          onCancel={() => setRemoveMemberError(null)}
        />
      )}
    </div>
  );
}
