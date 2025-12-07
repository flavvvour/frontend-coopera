// pages/teams-page.tsx
/**
 * Teams Page (FSD: pages/teams)
 *
 * IMPLEMENTED:
 * - Display grid of user's teams with modern card design
 * - Team creation via modal form
 * - Team deletion with confirmation dialog
 * - Integration with backend API (GET, POST, DELETE /teams/)
 * - Backend data transformation (PascalCase → camelCase)
 * - Loading states and error handling
 * - Empty state with call-to-action
 *
 * FUTURE:
 * - Replace hardcoded user_id with actual authentication
 * - Add team search and filtering
 * - Implement team editing (name, description)
 * - Add pagination for large team lists
 * - Team sorting options (by name, date, members)
 * - Team invitation system
 */

import React, { useState, useEffect } from 'react';
import { CreateTeamForm } from '@/features/team/create-team-form';
import { apiClient } from '@/shared/api';
import { useUserStore } from '@/features/auth-by-telegram';
import './teams.css';

// Упрощенная модель команды для списка
interface TeamListItem {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useUserStore();

  const loadTeamsFromAPI = async () => {
    try {
      setIsLoading(true);

      const userId = user?.id;
      console.log('Loading teams for user:', { user, userId }); // DEBUG
      
      if (!userId) {
        console.warn('No user ID, skipping teams load');
        setTeams([]);
        return;
      }

      // Получаем пользователя с командами (backend возвращает teams в getUser)
      // Используем правильный telegram_id из store
      const userTelegramId = user.telegram_id;
      
      if (!userTelegramId) {
        console.warn('No telegram_id in user store');
        setTeams([]);
        return;
      }
      
      const userData = await apiClient.getUser(userTelegramId);
      console.log('User data with teams:', userData); // DEBUG
      
      if (!userData.teams || !Array.isArray(userData.teams)) {
        setTeams([]);
        return;
      }

      // Преобразуем данные команд из формата пользователя
      const transformedTeams: TeamListItem[] = userData.teams.map((team: { id: number; name: string; role: string }) => ({
        id: team.id.toString(),
        name: team.name,
        description: '',
        memberCount: 1,
        projectCount: 0,
        createdAt: new Date().toISOString(), // Используем текущую дату как fallback
      }));

      setTeams(transformedTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamsFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Перезагружаем команды при изменении user_id

  const handleCreateTeam = async (teamData: { name: string; description: string }) => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      const userId = user?.id || 1; // Fallback для тестирования

      await apiClient.createTeam({
        name: teamData.name,
        description: teamData.description,
        user_id: userId,
      });

      setIsCreateModalOpen(false);
      await loadTeamsFromAPI();
    } catch (error) {
      console.error('Failed to create team:', error);

      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(`Ошибка при создании команды: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    // Подтверждение удаления
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить команду "${team.name}"?\n\nЭто действие нельзя отменить.`
    );

    if (!confirmed) return;

    try {
      await apiClient.deleteTeam(parseInt(teamId), 1);

      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('Failed to delete team:', error);

      let errorMessage = 'Не удалось удалить команду';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        // Проверяем различные типы ошибок
        if (msg.includes('403') || msg.includes('forbidden') || msg.includes('permission')) {
          errorMessage =
            '❌ У вас нет прав на удаление этой команды.\n\nТолько владелец команды (роль Manager) может её удалить.';
        } else if (msg.includes('404') || msg.includes('not found')) {
          errorMessage = '❌ Команда не найдена. Возможно, она уже удалена.';
        } else {
          errorMessage = `❌ Ошибка: ${error.message}`;
        }
      }

      alert(errorMessage);
    }
  };

  const handleOpenTeam = (teamId: string) => {
    window.location.href = `/dashboard/teams/${teamId}`;
  };

  if (isLoading) {
    return (
      <div className="teams-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка команд...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="teams-header">
        <div className="header-content">
          <h1>Мои команды</h1>
          <p>Создавай команду мечты</p>

        </div>
        <button className="create-team-btn" onClick={() => setIsCreateModalOpen(true)}>
          + Создать команду
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>У вас пока нет команд</h3>
          <p>Создайте первую команду чтобы начать работу над проектами</p>
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            Создать команду
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card" onClick={() => handleOpenTeam(team.id)}>
              <div className="team-card-header">
                <div className="team-icon-wrapper">
                  <svg
                    className="team-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M23 21v-2a4 4 0 0 0-3-3.87"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 3.13a4 4 0 0 1 0 7.75"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <button
                  className="delete-team-btn"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  title="Удалить команду"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 6h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="team-content">
                <h3 className="team-name">{team.name}</h3>
                <p className="team-description">{team.description || 'Нет описания'}</p>
              </div>

              <div className="team-footer">
                <div className="team-meta">
                  <svg
                    className="meta-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    {team.memberCount} {team.memberCount === 1 ? 'участник' : 'участников'}
                  </span>
                </div>
                <div className="team-date">
                  {new Date(team.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTeamForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
        isLoading={isCreating}
      />
    </div>
  );
};
