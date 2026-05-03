import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHookGetUser } from '../../hooks/useHookGetUser';
import { useHookPostTeam } from '../../hooks/useHookPostTeam';
import { useHookDeleteTeam } from '../../hooks/useHookDeleteTeam';
import './user-teams-page.css';

export function UserTeamsPage({ username }: { username: string }) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const { data, loading, error } = useHookGetUser(username);
  const { createTeam, loading: creating, error: createError } = useHookPostTeam();
  const { deleteTeam, loading: deleting } = useHookDeleteTeam();

  const handleCreateTeam = async () => {
    // Валидация
    const validationErrors: { name?: string } = {};

    if (!newTeamName.trim()) {
      validationErrors.name = 'Введите название команды';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const userId = data?.id;
      const createdTeam = await createTeam(userId, newTeamName.trim());

      alert(`Команда "${createdTeam.name}" успешно создана!`);
      setShowCreateModal(false);
      setNewTeamName('');
      setErrors({});
      navigate(`/dashboard/teams/${createdTeam.id}`);
    } catch (error) {
      console.error('Ошибка создания команды:', error);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!teamId || !data?.id) return;

    // Подтверждение удаления
    if (
      !window.confirm('Вы уверены, что хотите удалить эту команду?\nЭто действие нельзя отменить.')
    ) {
      return;
    }

    try {
      await deleteTeam(teamId, data.id);
      alert('Команда успешно удалена!');
      window.location.reload(); // Обновляем страницу
    } catch (error) {
      console.error('Ошибка удаления команды:', error);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setErrors({});
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTeamName('');
    setErrors({});
  };

  // Состояния загрузки
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка данных пользователя...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Попробовать снова
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="not-found-container">
        <div className="not-found-icon">👤</div>
        <h3>Пользователь не найден</h3>
        <p>Пользователь с именем "{username}" не существует</p>
      </div>
    );

  return (
    <div className="user-teams-container">
      {/* Хедер как в PersonalStatisticsPage */}
      <div className="statistics-header">
        <div className="header-top">
          {/* Можно оставить пустым или добавить какие-то элементы */}
        </div>

        <div className="user-greeting">
          <div className="user-avatar-large">{username.charAt(0).toUpperCase()}</div>
          <div>
            <h2>Привет, {username}!</h2>
            <p className="user-meta">
              Участник {data.teams.length} команд • ID: {data.id}
            </p>
          </div>
        </div>
      </div>

      {/* Список команд */}
      <div className="teams-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <h2>Команды пользователя</h2>
            <span className="teams-count">{data.teams.length}</span>
          </div>
          {/* Кнопка добавления команды в хедере */}
          <div className="header-actions">
            <button onClick={openCreateModal} className="add-team-header-btn">
              + Добавить команду
            </button>
          </div>
        </div>
        {data.teams.length === 0 ? (
          <div className="empty-teams">
            <div className="empty-icon">👥</div>
            <h3>Нет команд</h3>
            <p>Пользователь пока не состоит ни в одной команде</p>
            <button className="create-team-btn" onClick={openCreateModal}>
              Создать первую команду
            </button>
          </div>
        ) : (
          <div className="teams-grid">
            {data.teams.map(team => (
              <div
                key={team.id}
                className="team-card"
                onClick={() => navigate(`/dashboard/teams/${team.id}`)}
              >
                {/* Кнопка удаления - только для менеджеров */}
                {team.role === 'manager' && (
                  <button
                    className="delete-icon-btn"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteTeam(team.id);
                    }}
                    disabled={deleting}
                    title="Удалить команду"
                  >
                    🗑️
                  </button>
                )}

                <div className="team-card-header">
                  <div className="team-icon">{team.name.charAt(0).toUpperCase()}</div>
                  <div className="team-info">
                    <h3 className="team-name">{team.name}</h3>
                    <div className={`team-role ${team.role.toLowerCase()}`}>
                      {team.role === 'manager' ? 'Менеджер' : 'Участник'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания команды */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-team-modal">
            <div className="modal-header">
              <h3>Создание новой команды</h3>
              <button className="close-modal-btn" onClick={closeCreateModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {createError && (
                <div className="error-message">
                  <p>{createError.message}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="teamName">Команда</label>
                <input
                  id="teamName"
                  type="text"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  placeholder="Введите название команды"
                  disabled={creating}
                  className={errors.name ? 'input-error' : ''}
                  onKeyPress={e => {
                    if (e.key === 'Enter') handleCreateTeam();
                  }}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeCreateModal} disabled={creating}>
                Отмена
              </button>
              <button
                className="create-btn"
                onClick={handleCreateTeam}
                disabled={creating || !newTeamName.trim()}
              >
                {creating ? 'Создание...' : 'Создать команду'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
