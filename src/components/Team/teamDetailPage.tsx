import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeam } from '../../hooks/useHookGetTeam';
import { useHookGetUser } from '../../hooks/useHookGetUser';
import { useHookInviteByUsername } from '../../hooks/useHookInviteByUsername';
import { useHookDeleteMember } from '../../hooks/useHookDeleteMember';
import { useHookGetUserById } from '../../hooks/useHookGetUser'; // Импортируйте новый хук
import { KanbanBoard } from '../../components/Team/KanbanBoard'; // Импортируем KanbanBoard
import './team-detail-page.css';

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'kanban'>('kanban');
  // состояние для добавления пользователя в команду
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [usernameToAdd, setUsernameToAdd] = useState('');
  // Получаем данные о команде
  const {
    data: team,
    loading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useTeam(teamId ? Number(teamId) : 0);

  const { data: creatorData, loading: creatorLoading } = useHookGetUserById(
    team?.createdByUser || 0
  );

  const getCreatorDisplay = () => {
    if (!team) return '';

    // Пробуем получить через отдельный API запрос
    if (creatorData) {
      return `@${creatorData.username}`;
    }

    // Если загрузка еще идет
    if (creatorLoading) {
      return 'Загрузка...';
    }

    // Если ошибка или создатель в списке участников
    const creatorInMembers = team.members.find(m => m.memberId === team.createdByUser);
    if (creatorInMembers?.username) {
      return `@${creatorInMembers.username}`;
    }

    // Fallback
    return `ID: ${team.createdByUser}`;
  };

  // Получаем данные о текущем пользователе
  const username = localStorage.getItem('username') ?? '';
  const {
    inviteByUsername,
    loading: invitingUser,
    error: inviteError,
    isAlreadyInTeamError,
    isUserNotFoundError,
  } = useHookInviteByUsername();
  const { data: foundUser, loading: searchingUser } = useHookGetUser(usernameToAdd);
  useEffect(() => {}, [usernameToAdd]);
  const isAlreadyMember = team?.members.some(
    member => foundUser && member.memberId === foundUser.id
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

  // Cчитываем ID пользователей из данных команды
  const getMembersForKanban = () => {
    if (!team) return [];

    return team.members.map(member => ({
      id: member.memberId,
      username: member.username,
    }));
  };

  const handleInviteMember = async () => {
    if (!usernameToAdd.trim() || !team) return;

    try {
      await inviteByUsername(team.id, usernameToAdd);
      alert(`Пользователь ${usernameToAdd} успешно добавлен в команду!`);
      setShowInviteModal(false);
      setUsernameToAdd('');

      // Обновляем данные команды
      await refetchTeam();
      console.log('Данные команды обновлены!');
    } catch (error) {
      console.error('Ошибка добавления участника:', error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!team || !currentUser) return;

    const memberExists = team.members.some(m => m.memberId === memberId);
    if (!memberExists) {
      alert('Участник не найден в команде!');
      return;
    }

    if (team.createdByUser === memberId) {
      alert('Нельзя удалить создателя команды!');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этого участника из команды?')) {
      return;
    }

    try {
      await deleteMember(memberId, team.id, currentUser.id);
      alert('Участник успешно удален из команды!');

      // Обновляем данные команды
      await refetchTeam();
      console.log('Данные команды обновлены после удаления!');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('не найден')) {
          alert('Участник уже удален из команды');
          await refetchTeam();
        } else {
          alert(`Ошибка: ${error.message}`);
        }
      }
      console.error('Ошибка удаления участника:', error);
    }
  };

  // Состояния загрузки
  if (teamLoading || userLoading) {
    return (
      <div className="team-detail-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка информации о команде...</p>
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
        <div className="not-found-icon">👥</div>
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
        <div className="not-found-icon">👤</div>
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
      {/* Хлебные крошки */}
      <nav className="breadcrumbs">
        <Link to="/dashboard">Главная</Link>
        <span> / </span>
        <Link to="/dashboard/teams">Команды</Link>
        <span> / </span>
        <span className="current">{team.name}</span>
      </nav>

      {/* Заголовок команды */}
      <header className="team-header">
        <div className="team-avatar">
          <div className="avatar-circle">{team.name.charAt(0).toUpperCase()}</div>
          {isUserMemberOfTeam && <div className={`user-role-badge ${userRoleInTeam}`}></div>}
        </div>
        <div className="team-info">
          <h1>{team.name}</h1>
          <div className="team-meta">
            <span className="meta-item">
              <span className="meta-label">ID:</span>
              <span className="meta-value">#{team.id}</span>
            </span>
            <span className="meta-item">
              <span className="meta-label">Создана:</span>
              <span className="meta-value">
                {new Date(team.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </span>
            <span className="meta-item">
              <span className="meta-label">Создатель:</span>
              <span className="meta-value">{getCreatorDisplay()}</span>
            </span>
            {isUserMemberOfTeam && (
              <span className="meta-item">
                <span className="meta-label">Ваша роль:</span>
                <span className={`meta-value role-${userRoleInTeam}`}>
                  {userRoleInTeam === 'manager' ? 'Менеджер' : 'Участник'}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="team-actions">
          {canEditTeam && (
            <button className="action-btn edit-btn" onClick={() => setShowInviteModal(true)}>
              Редактировать
            </button>
          )}
          {isUserMemberOfTeam && (
            <button className="action-btn invite-btn" onClick={() => setShowInviteModal(true)}>
              Пригласить
            </button>
          )}
        </div>
      </header>

      {/* Вкладки */}
      <div className="team-tabs">
        <button
          className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          Канбан-доска
        </button>
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Участники ({team.members.length})
        </button>
      </div>

      {/* Основной контент */}
      <div className="team-content">
        {activeTab === 'members' ? (
          /* Вкладка участников */
          <div className="team-members-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>Участники команды</h2>
                <span className="members-count">{team.members.length}</span>
              </div>
              {canEditTeam && (
                <button className="add-member-btn-small" onClick={() => setShowInviteModal(true)}>
                  + Добавить участника
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
                        className={`member-row ${isCurrentUser ? 'current-user' : ''}`}
                      >
                        <div className="member-cell">
                          <div className="member-avatar">
                            {member.username?.charAt(0).toUpperCase() || '?'}
                            {isCurrentUser && <span className="you-badge">Вы</span>}
                          </div>
                          <div className="member-info">
                            <div className="member-username">
                              @{member.username}
                              {isCreator && <span className="creator-badge">Создатель</span>}
                            </div>
                            <div className="member-id">ID: #{member.memberId}</div>
                          </div>
                        </div>
                        <div className="member-cell">
                          <span className={`role-badge ${member.role.toLowerCase()}`}>
                            {member.role === 'manager' ? 'Менеджер' : 'Участник'}
                          </span>
                        </div>
                        {canEditTeam && !isCurrentUser && (
                          <div className="member-cell">
                            <button className="small-btn">Изменить роль</button>
                            {member.role !== 'manager' && (
                              <button
                                className="small-btn danger-btn"
                                onClick={() => handleRemoveMember(member.memberId)}
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
        ) : isUserMemberOfTeam ? (
          /* Вкладка канбан-доски - для участников */
          <KanbanBoard
            teamId={team.id}
            currentUserId={currentUser.id}
            members={getMembersForKanban()}
            canCreateTasks={canCreateTasks}
            canEditTasks={isUserMemberOfTeam}
            canDeleteTasks={isManager}
            isManager={isManager}
          />
        ) : (
          /* Вкладка канбан-доски - для не участников */
          <div className="not-authorized-kanban">
            <div className="not-authorized-icon">🔒</div>
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
        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Пригласить участника</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowInviteModal(false)}
                  disabled={invitingUser}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Показываем ошибку только если она есть */}
                {inviteError && (
                  <div
                    className={`message-box ${
                      isAlreadyInTeamError
                        ? 'warning-box'
                        : isUserNotFoundError
                          ? 'info-box'
                          : 'error-box'
                    }`}
                  >
                    {isAlreadyInTeamError && '⚠️ '}
                    {inviteError.message}
                  </div>
                )}
                {deleteMemberError && (
                  <div className="error-message">Ошибка удаления: {deleteMemberError.message}</div>
                )}
                <div className="form-group">
                  <label>username</label>
                  <input
                    type="text"
                    value={usernameToAdd}
                    onChange={e => setUsernameToAdd(e.target.value)}
                    placeholder="Введите username пользователя"
                    disabled={invitingUser}
                    className="username-input"
                  />
                </div>
                {/* Live-предпросмотр */}
                {usernameToAdd.trim() && !searchingUser && foundUser && (
                  <div className="user-preview">
                    <div className="search-user-info">
                      <strong>Найден пользователь:</strong>
                      <div>Username: {foundUser.username}</div>
                      <div>ID: #{foundUser.id}</div>
                      {isAlreadyMember && (
                        <div className="warning-text">⚠️ Этот пользователь уже в команде</div>
                      )}
                      {isSelf && <div className="warning-text">⚠️ Это вы сами</div>}
                    </div>
                  </div>
                )}
                {usernameToAdd.trim() && searchingUser && (
                  <div className="searching-text">🔍 Поиск пользователя...</div>
                )}
                {usernameToAdd.trim() && !searchingUser && !foundUser && (
                  <div className="error-text">❌ Пользователь не найден</div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowInviteModal(false)}
                  disabled={invitingUser}
                >
                  Отмена
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleInviteMember}
                  disabled={
                    invitingUser || !usernameToAdd.trim() || !foundUser || isAlreadyMember || isSelf
                  }
                >
                  {invitingUser ? 'Добавление...' : 'Добавить участника'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
