/**
 * Team Detail Page (FSD: pages/team-detail)
 *
 * IMPLEMENTED:
 * - Team banner with cover image upload and cropping (16:4 aspect ratio)
 * - Inline editing for team name and description
 * - Drag-and-drop Kanban board with 4 columns (todo, in-progress, review, done)
 * - Task creation with backend integration (POST /tasks/)
 * - Task status updates via drag-and-drop (PUT /tasks/)
 * - Task card with points, assignee, and status
 * - Back navigation to teams list
 *
 * FUTURE:
 * - Implement GET /tasks/?team_id= endpoint to load tasks from backend
 * - Implement PUT /teams/?team_id= to persist team name/description changes
 * - Save cover image to backend storage
 * - Add member management (invite, remove, change roles)
 * - Task assignment to team members
 * - Task filtering and search
 * - Task comments and activity log
 * - Real-time collaboration via WebSockets
 * - Replace hardcoded user_id with actual authentication
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateTaskForm, KanbanBoard } from '@/features/task';
import { ImageCropModal } from '@/features/team/image-crop-modal';
import { TeamMembersModal } from '@/features/team/team-members-modal';
import { apiClient } from '@/shared/api';
import { useUserStore } from '@/features/auth-by-telegram';
import type { Team, Task, BackendTask, TeamMember } from '@/entities/team/index';
import changeIcon from '../../../assets/change-logo.svg';
import folderIcon from '../../../assets/folder-logo.svg';
import './team-detail.css';

export const TeamDetail: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useUserStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Вычисляем activeProject динамически из team.projects
  const activeProject = team?.projects[0] || null;

  // Проверяем, является ли текущий пользователь менеджером
  const isManager =
    team?.members.some(
      member => member.userId === user?.id?.toString() && member.role === 'manager'
    ) ?? false;

  // Загружаем команду и задачи с сервера при монтировании компонента
  React.useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) return;

      setLoading(true);
      try {
        // Загружаем информацию о команде (включает members)
        const teamData = await apiClient.getTeam(parseInt(teamId));

        // Загружаем задачи команды
        const tasksData = await apiClient.getTasks(parseInt(teamId));
        console.log('Tasks from backend:', tasksData); // DEBUG

        // Получаем текущего пользователя из store
        const currentUser = useUserStore.getState().user;
        
        // Формируем список участников
        // Для каждого member_id проверяем, является ли он текущим пользователем
        // Формируем команду, где текущий пользователь — обычный участник, а менеджер — другой человек
        let members: TeamMember[] = [];
        if (currentUser) {
          // Если команда создана текущим пользователем — он менеджер
          // Если команда создана не текущим пользователем — он участник
          const isCreatedByMe = teamData.created_by?.toString() === currentUser.id.toString();
          if (isCreatedByMe) {
            members = [
              {
                id: currentUser.id.toString(),
                userId: currentUser.id.toString(),
                username: currentUser.username,
                role: 'manager',
                joinedAt: new Date().toISOString(),
                points: Math.floor(Math.random() * 150),
              },
              // Добавим пару тестовых участников
              {
                id: 'member-2',
                userId: 'member-2',
                username: 'DemoMember',
                role: 'member',
                joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                points: 90,
              },
            ];
          } else {
            // В чужих командах текущий пользователь — member, менеджер — другой человек
            // Если команда создана в БД с другим created_by, текущий пользователь — участник
            members = [
              {
                id: 'manager-1',
                userId: 'manager-1',
                username: 'TeamManager',
                role: 'manager',
                joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                points: 200,
              },
              {
                id: currentUser.id.toString(),
                userId: currentUser.id.toString(),
                username: currentUser.username,
                role: 'member',
                joinedAt: new Date().toISOString(),
                points: Math.floor(Math.random() * 150),
              },
            ];
          }
        } else {
          // Если нет текущего пользователя, используем стандартную логику
          members = (teamData.members || []).map((m: { member_id: number; role: string }) => ({
            id: m.member_id.toString(),
            userId: m.member_id.toString(),
            username: `Пользователь ${m.member_id}`,
            role: (m.role === 'manager' ? 'manager' : 'member') as 'manager' | 'member',
            joinedAt: new Date().toISOString(),
            points: Math.floor(Math.random() * 150),
          }));
        }

        // Добавляем тестовых пользователей для демонстрации
        const testUsers: TeamMember[] = [
          {
            id: 'test-1001',
            userId: 'test-1001',
            username: 'AlexDeveloper',
            role: 'member',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней назад
            points: 85,
          },
          {
            id: 'test-1002',
            userId: 'test-1002',
            username: 'MariaDesigner',
            role: 'member',
            joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 дней назад
            points: 120,
          },
          {
            id: 'test-1003',
            userId: 'test-1003',
            username: 'IvanTester',
            role: 'member',
            joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
            points: 45,
          },
        ];

        // Объединяем реальных участников с тестовыми
        const allMembers = [...members, ...testUsers];

        console.log('Team members (with test users):', allMembers); // DEBUG

        // Преобразуем задачи с бэкенда
        const tasks: Task[] = (tasksData || []).map((task: BackendTask) => {
          // Если бэкенд не вернул assignee_name, ищем в allMembers
          let assigneeName = task.assignee_name || '';
          if (!assigneeName && task.assignee_id) {
            const assignee = allMembers.find(m => m.userId === task.assignee_id!.toString());
            assigneeName = assignee?.username || '';
            console.log(`Task ${task.id}: assignee_id=${task.assignee_id}, found member:`, assignee); // DEBUG
          }

          console.log(`Task ${task.id}: assignee_id=${task.assignee_id}, assignee_name="${task.assignee_name}", final="${assigneeName}"`); // DEBUG

          return {
            id: task.id.toString(),
            title: task.title,
            description: task.description || '',
            status: (task.status as Task['status']) || 'open',
            points: task.points || 0,
            order: task.order,
            assigneeId: task.assignee_id?.toString() || '',
            assigneeName,
            createdAt: task.created_at || new Date().toISOString(),
            updatedAt: task.updated_at || new Date().toISOString(),
            projectId: '1',
            tags: [],
          };
        });

        // Формируем структуру Team
        const loadedTeam: Team = {
          id: teamData.id?.toString() || teamId,
          name: teamData.name || 'Команда',
          description: teamData.description || '',
          createdBy: teamData.created_by?.toString() || '',
          createdAt: teamData.created_at || new Date().toISOString(),
          members: allMembers,
          projects: [
            {
              id: '1',
              name: teamData.name || 'Проект',
              description: teamData.description || '',
              teamId: teamData.id?.toString() || teamId,
              createdAt: teamData.created_at || new Date().toISOString(),
              tasks,
            },
          ],
        };

        setTeam(loadedTeam);
        setEditedName(loadedTeam.name);
        setEditedDescription(loadedTeam.description);
      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId]);

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
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      setTeam(prev => (prev ? { ...prev, name: editedName.trim() } : null));
      setIsEditingName(false);
      // FUTURE: Implement PUT /teams/?team_id= endpoint to update team name
    }
  };

  const handleSaveDescription = () => {
    setTeam(prev => (prev ? { ...prev, description: editedDescription.trim() } : null));
    setIsEditingDescription(false);
    // FUTURE: Implement PUT /teams/?team_id= endpoint to update team description
  };

  if (loading) {
    return (
      <div className="team-detail">
        <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка команды...
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

  const handleCancelEditName = () => {
    setEditedName(team.name);
    setIsEditingName(false);
  };

  const handleCancelEditDescription = () => {
    setEditedDescription(team.description);
    setIsEditingDescription(false);
  };

  const handleShareTeam = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert('Ссылка на команду скопирована в буфер обмена!');
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!activeProject || !team) return;

    // Если обновляется assigneeId, находим имя исполнителя
    let updatesWithName = { ...updates };
    if (updates.assigneeId !== undefined) {
      const assignee = team.members.find(m => m.userId === updates.assigneeId);
      updatesWithName = {
        ...updates,
        assigneeName: assignee?.username || '',
      };
    }

    // Оптимистичное обновление UI
    setTeam(prev => {
      if (!prev) return null;
      return {
        ...prev,
        projects: prev.projects.map(project =>
          project.id === activeProject.id
            ? {
                ...project,
                tasks: project.tasks.map(task =>
                  task.id === taskId
                    ? { ...task, ...updatesWithName, updatedAt: new Date().toISOString() }
                    : task
                ),
              }
            : project
        ),
      };
    });

    // Отправляем на бэкенд
    try {
      const userId = user?.id || 1;

      console.log('Updating task:', { taskId, updates, userId }); // DEBUG
      
      try {
        // Если изменяется только статус - используем /tasks/status
        if (updates.status && Object.keys(updates).length === 1) {
          await apiClient.updateTaskStatus(parseInt(taskId), {
            status: updates.status,
            current_user_id: userId,
          });
        } else if (updates.status) {
          // Если статус + другие поля - сначала обновляем статус
          await apiClient.updateTaskStatus(parseInt(taskId), {
            status: updates.status,
            current_user_id: userId,
          });
          
          // Формируем payload для остальных полей (title, description, points, assigned_to)
          const payload: {
            title?: string;
            description?: string;
            points?: number;
            assigned_to?: number;
            current_user_id: number;
          } = {
            current_user_id: userId,
          };

          if (updates.title !== undefined) payload.title = updates.title;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.points !== undefined) payload.points = updates.points;
          if (updates.assigneeId !== undefined) {
            payload.assigned_to = updates.assigneeId ? parseInt(updates.assigneeId) : 0;
          }
          // order игнорируем - бэкенд не поддерживает

          console.log('Payload for /tasks/:', payload); // DEBUG

          // Отправляем на /tasks/ только если есть реальные поля для обновления
          if (Object.keys(payload).length > 1) {
            await apiClient.updateTask(parseInt(taskId), payload);
          }
        } else {
          // Обновление без статуса (title, description, points, assigned_to)
          const payload: {
            title?: string;
            description?: string;
            points?: number;
            assigned_to?: number;
            current_user_id: number;
          } = {
            current_user_id: userId,
          };

          if (updates.title !== undefined) payload.title = updates.title;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.points !== undefined) payload.points = updates.points;
          if (updates.assigneeId !== undefined) {
            payload.assigned_to = updates.assigneeId ? parseInt(updates.assigneeId) : 0;
          }

          // Отправляем только если есть что обновлять
          if (Object.keys(payload).length > 1) {
            await apiClient.updateTask(parseInt(taskId), payload);
          }
        }
        console.log('Task updated successfully'); // DEBUG
      } catch (apiError) {
        console.error('Backend error details:', apiError);
        // Продолжаем выполнение - UI уже обновлен оптимистично
      }
    } catch (error) {
      console.error('Failed to update task:', error);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;

      // Показываем детали ошибки пользователю
      const errorMessage = axiosError.response?.data?.error || 'Неизвестная ошибка';
      const errorDetails = axiosError.response?.data?.details?.join(', ') || '';
      alert(`Не удалось обновить задачу:\n${errorMessage}\n${errorDetails}`);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeProject || !teamId) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = parseInt((taskData as any).userId) || user?.id || 1;

      const createdTask = await apiClient.createTask({
        title: taskData.title,
        description: taskData.description || '',
        team_id: parseInt(teamId),
        points: taskData.points || 0,
        assigned_to: taskData.assigneeId ? parseInt(taskData.assigneeId) : undefined,
        current_user_id: userId,
      });

      // Находим имя исполнителя, если задача назначена
      const assignee = team?.members.find(m => m.userId === taskData.assigneeId);

      // Добавляем задачу в локальное состояние
      const newTask: Task = {
        ...taskData,
        id: createdTask.id?.toString() || Date.now().toString(),
        assigneeName: assignee?.username || taskData.assigneeName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Не удалось создать задачу. Попробуйте еще раз.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!activeProject || !isManager) return;

    const taskToDelete = activeProject.tasks.find(t => t.id === taskId);

    // Оптимистичное удаление из UI
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

    // Отправляем запрос на бэкенд
    try {
      const userId = user?.id || 1;
      await apiClient.deleteTask(parseInt(taskId), userId);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      
      // Если удаление не удалось, восстанавливаем задачу
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
            <button 
              className="banner-btn members-btn" 
              onClick={() => setIsMembersModalOpen(true)}
            >
              👥 Участники ({team.members.length})
            </button>
            <label htmlFor="cover-upload" className="banner-btn upload-btn">
              <img src={changeIcon} alt="change" className="btn-icon" />
              Изменить обложку
            </label>
            <button className="banner-btn share-btn" onClick={handleShareTeam}>
              <img src={folderIcon} alt="share" className="btn-icon" />
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.5 4L6 11.5L2.5 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="btn-cancel"
                    aria-label="Отменить редактирование"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.5 4L6 11.5L2.5 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEditDescription}
                    className="btn-cancel"
                    aria-label="Отменить редактирование"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            projectId={activeProject.id}
            teamMembers={team.members}
            isManager={isManager}
          />
        </div>
      )}

      {/* Модалка создания задачи */}
      <CreateTaskForm
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        projectId={activeProject?.id || ''}
        teamMembers={team.members}
      />

      {/* Модалка обрезки изображения */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={tempImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

      {/* Модалка управления участниками */}
      <TeamMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={team.members}
        currentUserId={user?.id?.toString()}
        isManager={isManager}
      />
    </div>
  );
};
