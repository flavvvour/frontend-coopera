/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateTaskForm, KanbanBoard } from '@/features/task';
import { ImageCropModal } from '@/features/team/image-crop-modal';
import { InviteMemberForm } from '@/features/team/invite-member-form';
import { TeamMembersModal } from '@/features/team/team-members-modal';
import { apiClient } from '@/shared/api';
import { useHookGetUser } from '@/hooks/useHookGetUser'; // Добавляем хук
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/entities/task';
import type { Team, MemberRole, TeamMember } from '@/entities';
import './team-detail.css';

// Интерфейс для участника команды в UI (дополняет TeamMemberEntity)
interface UIMember {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  role: MemberRole;
  joinedAt: string;
  points: number;
  email?: string;
  avatar?: string;
}

// Интерфейс для проекта в UI
interface UIProject {
  id: string;
  name: string;
  description: string;
  teamId: string;
  createdAt: string;
  tasks: Task[];
}

// Интерфейс для команды с дополнительными данными для UI
interface TeamWithUI extends Omit<Team, 'members'> {
  description: string;
  coverImage?: string;
  members: UIMember[];
  projects: UIProject[];
}

interface TeamMemberWithUser {
  id: number;
  teamId: number;
  memberId: number;
  role: MemberRole;
  createdAt: string;
  username: string;
  points?: number;
  email?: string;
  avatar?: string;
  userId?: number;
}

export const TeamDetail: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();

  // Используем хук для получения пользователя вместо стора
  // Предполагаем, что мы знаем username текущего пользователя
  const username = localStorage.getItem('username') || 'flavvvour'; // Можно получать из контекста или пропсов
  const { data: user, loading: userLoading, error: userError } = useHookGetUser(username);

  const [team, setTeam] = useState<TeamWithUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Вычисляем activeProject динамически из team.projects
  const activeProject = team?.projects[0] || null;

  // Проверяем, является ли текущий пользователь менеджером
  const isManager = React.useMemo(
    () =>
      team?.members.some(
        member => member.userId === user?.id?.toString() && member.role === 'manager'
      ) ?? false,
    [team, user]
  );

  const handleInviteMember = async (username: string) => {
    try {
      if (!user || !teamId) {
        throw new Error('Пользователь не авторизован или команда не выбрана');
      }

      // Проверяем права (только менеджер может добавлять)
      if (!isManager) {
        throw new Error('Только менеджер может добавлять участников');
      }

      // Используем apiClient вместо прямого fetch
      await apiClient.addTeamMemberByUsername({
        teamId: parseInt(teamId),
        username: username,
        currentUserId: user.id || 0,
      });

      // Закрываем форму
      setShowInviteForm(false);

      // Обновляем данные команды
      await loadTeamData();

      // Показываем уведомление
      alert(`Пользователь ${username} успешно добавлен в команду!`);
    } catch (error: any) {
      console.error('Failed to add team member:', error);
      alert(error.message || 'Ошибка при добавлении участника');
      throw error;
    }
  };

  const loadTeamData = useCallback(async () => {
    if (!teamId || !user) {
      console.log('Missing teamId or user:', { teamId, user });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const teamIdNum = parseInt(teamId);

      // Загружаем информацию о команде
      const teamData = await apiClient.getTeam(teamIdNum);
      console.log('🔍 Team Data from API:', teamData);

      // Загружаем задачи команды
      const tasksData = await apiClient.getTasks(teamIdNum);

      // Формируем список участников С РЕАЛЬНЫМИ USERNAME
      const members: UIMember[] = [];

      // Создаем маппинг userId -> username
      const staticUserMapping: Record<number, string> = {
        2: 'flavvvour',
        63: 'flavvvour_from_frontend',
        67: 'alexey',
        68: 'ekaterina',
        69: 'mikhail',
        70: 'anna',
        71: 'sergey',
      };

      // Добавляем создателя команды как менеджера
      if (teamData.created_by) {
        const creatorId = teamData.created_by;
        const creatorUsername = staticUserMapping[creatorId] || `user_${creatorId}`;

        members.push({
          id: creatorId.toString(),
          userId: creatorId.toString(),
          username: creatorUsername,
          displayName: `@${creatorUsername}`,
          role: 'manager',
          joinedAt: teamData.created_at,
          points: 200,
        });
      }

      // Добавляем остальных участников из teamData.members
      if (teamData.members && Array.isArray(teamData.members)) {
        teamData.members.forEach((member: { member_id: number; role: string }) => {
          if (member.member_id !== teamData.created_by) {
            const memberId = member.member_id;
            const memberUsername = staticUserMapping[memberId] || `user_${memberId}`;

            members.push({
              id: memberId.toString(),
              userId: memberId.toString(),
              username: memberUsername,
              displayName: `@${memberUsername}`,
              role: (member.role as MemberRole) || 'member',
              joinedAt: new Date().toISOString(),
              points: Math.floor(Math.random() * 150),
            });
          }
        });
      }

      // Добавляем текущего пользователя, если его еще нет в участниках
      const currentUserId = user.id?.toString();
      if (currentUserId && !members.some(m => m.userId === currentUserId)) {
        const currentUserInternalId = parseInt(currentUserId);
        const currentUsername =
          staticUserMapping[currentUserInternalId] || user.username || `user_${currentUserId}`;
        const isCreator = teamData.created_by?.toString() === currentUserId;

        members.push({
          id: currentUserId,
          userId: currentUserId,
          username: currentUsername,
          displayName: `@${currentUsername}`,
          role: isCreator ? 'manager' : 'member',
          joinedAt: new Date().toISOString(),
          points: Math.floor(Math.random() * 150),
        });
      }

      // Создаем userMap для Kanban
      const userMapForKanban: Record<number, string> = {};
      members.forEach(member => {
        const userId = parseInt(member.userId);
        userMapForKanban[userId] = member.displayName;
      });

      console.log('✅ Создан userMap:', userMapForKanban);

      // Преобразуем задачи с бэкенда
      const tasks: Task[] = (tasksData || []).map((task: any) => {
        return {
          id: task.id,
          teamId: task.team_id || teamIdNum,
          title: task.title,
          description: task.description || '',
          points: task.points,
          status: task.status,
          assignedToMember: task.assigned_to || null,
          createdByUser: task.created_by || user?.id || 0,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        };
      });

      // Формируем структуру команды для UI
      const loadedTeam: TeamWithUI = {
        id: teamData.id,
        name: teamData.name,
        createdAt: teamData.created_at,
        createdByUser: teamData.created_by,
        description: teamData.description || '',
        members,
        projects: [
          {
            id: '1',
            name: teamData.name || 'Основной проект',
            description: `Проект команды ${teamData.name}`,
            teamId: teamData.id.toString(),
            createdAt: teamData.created_at,
            tasks,
          },
        ],
      };

      setTeam(loadedTeam);
      setEditedName(loadedTeam.name);
      setEditedDescription(loadedTeam.description);
      setUserMap(userMapForKanban);
    } catch (err) {
      console.error('Failed to load team data:', err);
      setError('Не удалось загрузить данные команды');
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  useEffect(() => {
    if (user && !userLoading && !userError) {
      loadTeamData();
    }
  }, [loadTeamData, user, userLoading, userError]);

  useEffect(() => {
    if (userError) {
      console.error('Failed to load user:', userError);
      // Можно сделать редирект на страницу авторизации
      // navigate('/auth');
    }
  }, [userError, navigate]);

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageSrc = e.target?.result as string;
        setTempImageSrc(imageSrc);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setCoverImage(croppedImage);
    // TODO: Сохранить обложку на бэкенде
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !team || !teamId) return;

    try {
      // TODO: Реализовать обновление названия команды на бэкенде
      setTeam(prev => (prev ? { ...prev, name: editedName.trim() } : null));
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to save team name:', err);
      alert('Не удалось сохранить название команды');
    }
  };

  const handleSaveDescription = async () => {
    if (!team || !teamId) return;

    try {
      // TODO: Реализовать обновление описания команды на бэкенде
      setTeam(prev => (prev ? { ...prev, description: editedDescription.trim() } : null));
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Failed to save team description:', err);
      alert('Не удалось сохранить описание команды');
    }
  };

  const handleCancelEditName = () => {
    if (team) {
      setEditedName(team.name);
      setIsEditingName(false);
    }
  };

  const handleCancelEditDescription = () => {
    if (team) {
      setEditedDescription(team.description);
      setIsEditingDescription(false);
    }
  };

  const convertToTeamMembersForTaskForm = useCallback(
    (uiMembers: UIMember[]): any[] => {
      return uiMembers.map(member => ({
        id: parseInt(member.id) || 0,
        teamId: parseInt(team?.id?.toString() || '0'),
        memberId: parseInt(member.id) || 0,
        role: member.role,
        createdAt: member.joinedAt,
        username: member.username,
        email: member.email,
        avatar: member.avatar,
        points: member.points,
        userId: member.userId,
        joinedAt: member.joinedAt,
      }));
    },
    [team]
  );

  const handleShareTeam = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert('Ссылка на команду скопирована в буфер обмена!');
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<UpdateTaskRequest>) => {
    if (!activeProject || !team || !user) return;

    console.log('🔄 Обновление задачи:', { taskId, updates });

    // Оптимистичное обновление UI
    setTeam(prev => {
      if (!prev) return null;

      return {
        ...prev,
        projects: prev.projects.map(project =>
          project.id === activeProject.id
            ? {
                ...project,
                tasks: project.tasks.map(task => {
                  if (task.id !== taskId) return task;

                  const assignedToMemberValue =
                    (updates as any).assignedToMember !== undefined
                      ? (updates as any).assignedToMember
                      : updates.assigned_to;

                  const updatedTask: Task = {
                    ...task,
                    ...(updates.title !== undefined && { title: updates.title }),
                    ...(updates.description !== undefined && { description: updates.description }),
                    ...(updates.points !== undefined && { points: updates.points }),
                    ...(assignedToMemberValue !== undefined && {
                      assignedToMember: assignedToMemberValue,
                    }),
                    ...(updates.status !== undefined && { status: updates.status }),
                    updatedAt: new Date().toISOString(),
                  };

                  console.log('✅ Оптимистичное обновление задачи:', updatedTask);
                  return updatedTask;
                }),
              }
            : project
        ),
      };
    });

    // Отправляем на бэкенд
    try {
      const userId = user.id || 1;

      const updateData: any = {
        taskId: taskId,
        currentUserId: userId,
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.points !== undefined) updateData.points = updates.points;
      if (updates.status !== undefined) updateData.status = updates.status;

      if ((updates as any).assignedToMember !== undefined) {
        updateData.assigned_to = (updates as any).assignedToMember;
      } else if (updates.assigned_to !== undefined) {
        updateData.assigned_to = updates.assigned_to;
      }

      const updateFields = Object.keys(updateData).filter(
        key => !['taskId', 'currentUserId'].includes(key)
      );

      if (updateFields.length > 0) {
        console.log('📤 Отправка на API:', updateData);
        await apiClient.updateTask(updateData);
        console.log('✅ Задача обновлена на бэкенде');
      }
    } catch (err) {
      console.error('❌ Ошибка обновления задачи:', err);
      loadTeamData();
    }
  };

  const handleUpdateTaskStatus = useCallback(
    async (data: { task_id: number; current_user_id: number; status: string }) => {
      try {
        setTeam(prev => {
          if (!prev) return prev;

          const currentActiveProject = prev.projects[0];
          if (!currentActiveProject) return prev;

          return {
            ...prev,
            projects: prev.projects.map(project =>
              project.id === currentActiveProject.id
                ? {
                    ...project,
                    tasks: project.tasks.map(task =>
                      task.id === data.task_id
                        ? {
                            ...task,
                            status: data.status,
                            updatedAt: new Date().toISOString(),
                          }
                        : task
                    ),
                  }
                : project
            ),
          };
        });

        await apiClient.updateTaskStatus({
          taskId: data.task_id,
          currentUserId: data.current_user_id,
          status: data.status,
        });
        console.log('Статус задачи обновлен:', data);
      } catch (err) {
        console.error('Failed to update task status:', err);
        alert('Не удалось обновить статус задачи');
        loadTeamData();
      }
    },
    [loadTeamData]
  );

  const currentUserIdNumber = user?.id ? parseInt(user.id.toString()) : -1;

  const convertToTeamMembers = useCallback(
    (uiMembers: UIMember[]): TeamMember[] => {
      console.log('Преобразование участников для KanbanBoard:');
      return uiMembers.map(member => {
        const userId = parseInt(member.userId) || 0;
        console.log(`- ${member.displayName}: userId=${userId}`);

        return {
          id: userId,
          memberId: userId,
          userId: userId,
          username: member.displayName,
          role: member.role,
          createdAt: member.joinedAt,
          points: member.points || 0,
          teamId: parseInt(team?.id?.toString() || '0'),
        } as TeamMember & { username: string; userId: number };
      });
    },
    [team]
  );

  const convertToTeamMemberWithUser = useCallback(
    (uiMembers: UIMember[]): TeamMemberWithUser[] => {
      return uiMembers.map(member => ({
        id: parseInt(member.id) || 0,
        teamId: parseInt(team?.id?.toString() || '0'),
        memberId: parseInt(member.userId) || 0,
        role: member.role,
        createdAt: member.joinedAt,
        username: member.username,
        points: member.points,
        email: member.email,
        avatar: member.avatar,
        userId: parseInt(member.userId) || 0,
      }));
    },
    [team]
  );

  const handleCreateTask = async (
    taskData: Omit<CreateTaskRequest, 'current_user_id' | 'team_id'>
  ) => {
    if (!activeProject || !teamId || !user) return;

    try {
      const userId = user.id || 1;

      const createData = {
        teamId: parseInt(teamId),
        currentUserId: userId,
        title: taskData.title,
        description: taskData.description || '',
        points: taskData.points || 0,
        assignedToMember: taskData.assigned_to,
      };

      const createdTask = await apiClient.createTask(createData);

      const newTask: Task = {
        id: createdTask.id || Date.now(),
        teamId: parseInt(teamId),
        title: taskData.title,
        description: taskData.description,
        points: taskData.points,
        status: 'open',
        assignedToMember: taskData.assigned_to,
        createdByUser: userId,
        createdAt: new Date().toISOString(),
      };

      setTeam(prev => {
        if (!prev) return null;
        return {
          ...prev,
          projects: prev.projects.map(project =>
            project.id === activeProject.id
              ? { ...project, tasks: [...project.tasks, newTask] }
              : project
          ),
        };
      });
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Не удалось создать задачу. Попробуйте еще раз.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!activeProject || !isManager || !user) return;

    const taskToDelete = activeProject.tasks.find(t => t.id === taskId);

    setTeam(prev => {
      if (!prev) return null;
      return {
        ...prev,
        projects: prev.projects.map(project =>
          project.id === activeProject.id
            ? {
                ...project,
                tasks: project.tasks.filter(task => task.id !== taskId),
              }
            : project
        ),
      };
    });

    try {
      const userId = user.id || 1;
      await apiClient.deleteTask(taskId, userId);
    } catch (err) {
      console.error('Failed to delete task:', err);

      if (taskToDelete) {
        setTeam(prev => {
          if (!prev) return null;
          return {
            ...prev,
            projects: prev.projects.map(project =>
              project.id === activeProject.id
                ? {
                    ...project,
                    tasks: [...project.tasks, taskToDelete],
                  }
                : project
            ),
          };
        });
      }
      alert('Не удалось удалить задачу. Попробуйте еще раз.');
    }
  };

  const handleRemoveMember = useCallback(
    async (userId: number) => {
      if (!teamId || !user || !isManager) return;

      try {
        await apiClient.removeMember({
          teamId: parseInt(teamId),
          userId: userId,
          currentUserId: user.id || 0,
        });

        loadTeamData();
      } catch (err) {
        console.error('Failed to remove member:', err);
        alert('Не удалось удалить участника');
      }
    },
    [teamId, user, isManager, loadTeamData]
  );

  if (userLoading) {
    return (
      <div className="team-detail">
        <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка пользователя...
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="team-detail">
        <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>Пользователь не авторизован</p>
          <button onClick={() => navigate('/auth')} style={{ marginTop: '1rem' }}>
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="team-detail">
        <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка команды...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-detail">
        <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <button onClick={loadTeamData} style={{ marginTop: '1rem' }}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail">
        <div
          className="error-state"
          style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}
        >
          Команда не найдена
        </div>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      {/* Кнопка "Назад" */}
      <button className="back-button" onClick={() => navigate('/dashboard/teams')}>
        ← Назад к командам
      </button>

      {/* Баннер команды с обложкой */}
      <div className="team-banner">
        <div
          className="team-cover"
          style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'none' }}
        >
          {!coverImage && <div className="cover-placeholder">Загрузите обложку команды</div>}
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            onChange={handleCoverImageUpload}
            style={{ display: 'none' }}
          />

          <div className="banner-actions">
            <button className="banner-btn members-btn" onClick={() => setIsMembersModalOpen(true)}>
              👥 Участники ({team.members.length})
            </button>

            {isManager && (
              <button className="banner-btn add-member-btn" onClick={() => setShowInviteForm(true)}>
                ➕ Добавить участника
              </button>
            )}

            <label htmlFor="cover-upload" className="banner-btn upload-btn">
              Изменить обложку
            </label>
            <button className="banner-btn share-btn" onClick={handleShareTeam}>
              Поделиться
            </button>
          </div>
        </div>

        <div className="team-info-banner">
          <div className="team-main-info">
            {isEditingName ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  autoFocus
                  className="edit-input edit-title"
                />
                <div className="edit-actions">
                  <button
                    onClick={handleSaveName}
                    className="btn-save"
                    aria-label="Сохранить название"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="btn-cancel"
                    aria-label="Отменить редактирование"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <h1
                onClick={() => {
                  setEditedName(team.name);
                  setIsEditingName(true);
                }}
                className="editable-title"
              >
                {team.name}
                <svg
                  className="edit-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.75 2.25L15.75 5.25L5.25 15.75H2.25V12.75L12.75 2.25Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h1>
            )}

            {isEditingDescription ? (
              <div className="edit-field">
                <textarea
                  value={editedDescription}
                  onChange={e => setEditedDescription(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') handleCancelEditDescription();
                  }}
                  autoFocus
                  className="edit-input edit-description"
                  rows={2}
                />
                <div className="edit-actions">
                  <button
                    onClick={handleSaveDescription}
                    className="btn-save"
                    aria-label="Сохранить описание"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEditDescription}
                    className="btn-cancel"
                    aria-label="Отменить редактирование"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <p
                onClick={() => {
                  setEditedDescription(team.description);
                  setIsEditingDescription(true);
                }}
                className="editable-description"
              >
                {team.description}
                <svg
                  className="edit-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 2L14 4.5L4.5 14H2V11.5L11.5 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Канбан-доска */}
      {activeProject && (
        <div className="kanban-section">
          <KanbanBoard
            tasks={activeProject.tasks}
            onUpdateTask={handleUpdateTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            teamId={parseInt(teamId || '0')}
            teamMembers={convertToTeamMembers(team.members)}
            userMap={userMap}
            isManager={isManager}
            currentUserId={currentUserIdNumber}
          />
        </div>
      )}

      {/* Модалка создания задачи */}
      {activeProject && (
        <CreateTaskForm
          isOpen={false}
          onClose={() => {}}
          onCreateTask={handleCreateTask}
          teamId={parseInt(teamId || '0')}
          teamMembers={convertToTeamMembersForTaskForm(team.members)}
        />
      )}

      {/* Модалка обрезки изображения */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={tempImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {showInviteForm && team?.id && (
        <InviteMemberForm
          teamId={parseInt(team.id.toString())}
          onInvite={handleInviteMember}
          onClose={() => setShowInviteForm(false)}
        />
      )}

      {/* Модалка управления участниками */}
      <TeamMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={convertToTeamMemberWithUser(team.members) as any}
        currentUserId={currentUserIdNumber}
        isManager={isManager}
        onRemoveMember={handleRemoveMember}
        onInviteMember={username => handleInviteMember(username)}
      />
    </div>
  );
};
