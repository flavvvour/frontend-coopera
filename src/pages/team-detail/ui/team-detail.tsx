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
import { apiClient } from '@/shared/api';
import { useUserStore } from '@/features/auth-by-telegram';
import type { Team, Task, BackendTask } from '@/entities/team/index';
import changeIcon from '../../../assets/change-logo.svg';
import folderIcon from '../../../assets/folder-logo.svg';
import './team-detail.css';

// Mock данные для демонстрации
const mockTeam: Team = {
  id: '1',
  name: 'Разработка фронтенда',
  description: 'Команда разработки пользовательского интерфейса',
  createdBy: 'user1',
  createdAt: '2024-01-15',
  members: [
    { id: '1', userId: 'user1', username: 'Иван Иванов', role: 'owner', joinedAt: '2024-01-15', points: 150 },
    { id: '2', userId: 'user2', username: 'Петр Петров', role: 'member', joinedAt: '2024-01-16', points: 80 },
    { id: '3', userId: 'user3', username: 'Мария Сидорова', role: 'member', joinedAt: '2024-01-17', points: 120 },
  ],
  projects: [
    {
      id: '1',
      name: 'Главный сайт',
      description: 'Разработка основного веб-сайта компании',
      teamId: '1',
      createdAt: '2024-01-20',
      tasks: [
        {
          id: '1',
          title: 'Дизайн главной страницы',
          description: 'Создать современный дизайн для главной страницы',
          status: 'completed',
          priority: 'high',
          points: 20,
          assigneeId: 'user1',
          assigneeName: 'Иван Иванов',
          createdAt: '2024-01-20',
          updatedAt: '2024-01-22',
          projectId: '1',
          tags: ['design', 'ui']
        },
        {
          id: '2',
          title: 'Адаптивная верстка',
          description: 'Сделать верстку адаптивной для мобильных устройств',
          status: 'assigned',
          priority: 'medium',
          points: 15,
          assigneeId: 'user2',
          assigneeName: 'Петр Петров',
          createdAt: '2024-01-21',
          updatedAt: '2024-01-21',
          projectId: '1',
          tags: ['responsive', 'css']
        }
      ]
    }
  ]
};

export const TeamDetail: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useUserStore();
  const [team, setTeam] = useState<Team>(mockTeam);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(team.name);
  const [editedDescription, setEditedDescription] = useState(team.description);

  // Вычисляем activeProject динамически из team.projects
  const activeProject = team.projects[0] || null;

  // Загружаем задачи с сервера при монтировании компонента
  React.useEffect(() => {
    const loadTeamTasks = async () => {
      if (!teamId) return;
      
      try {
        const tasksData = await apiClient.getTasks(parseInt(teamId));
        
        // Преобразуем данные с бэкенда в формат фронтенда
        const tasks: Task[] = (tasksData || []).map((task: BackendTask) => {
          return {
            id: task.id.toString(),
            title: task.title,
            description: task.description || '',
            status: (task.status as Task['status']) || 'open',  // Статусы совпадают!
            priority: (task.priority as Task['priority']) || 'medium',
            points: task.points || 0,
            order: task.order,
            assigneeId: task.assignee_id?.toString() || '',
            assigneeName: task.assignee_name || '',
            createdAt: task.created_at || new Date().toISOString(),
            updatedAt: task.updated_at || new Date().toISOString(),
            projectId: activeProject?.id || '1',
            tags: []
          };
        });
        
        setTeam(prev => ({
          ...prev,
          projects: prev.projects.map((project, index) => 
            index === 0 ? { ...project, tasks } : project
          )
        }));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTeamTasks();
  }, [teamId, activeProject?.id]);

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
      setTeam(prev => ({ ...prev, name: editedName.trim() }));
      setIsEditingName(false);
      // FUTURE: Implement PUT /teams/?team_id= endpoint to update team name
    }
  };

  const handleSaveDescription = () => {
    setTeam(prev => ({ ...prev, description: editedDescription.trim() }));
    setIsEditingDescription(false);
    // FUTURE: Implement PUT /teams/?team_id= endpoint to update team description
  };

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
    if (!activeProject) return;

    // Оптимистичное обновление UI
    setTeam(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === activeProject.id 
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
              )
            }
          : project
      )
    }));

    // Отправляем на бэкенд
    try {
      const userId = user?.id || 1;
      
      // Формируем payload только с теми полями, которые были изменены
      const payload: {
        task_id?: number;
        status?: string;
        title?: string;
        description?: string;
        points?: number;
        order?: number;
        current_user_id: number;
      } = {
        task_id: parseInt(taskId),
        current_user_id: userId
      };
      
      if (updates.status) payload.status = updates.status;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.points !== undefined) payload.points = updates.points;
      if (updates.order !== undefined) payload.order = updates.order;
      
      await apiClient.updateTask(parseInt(taskId), payload);
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
        current_user_id: userId
      });

      // Добавляем задачу в локальное состояние
      const newTask: Task = {
        ...taskData,
        id: createdTask.id?.toString() || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTeam(prev => ({
        ...prev,
        projects: prev.projects.map(project =>
          project.id === activeProject.id
            ? { ...project, tasks: [...project.tasks, newTask] }
            : project
        )
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Не удалось создать задачу. Попробуйте еще раз.');
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
        <div className="team-cover" style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'none' }}>
          {!coverImage && <div className="cover-placeholder">Загрузите обложку команды</div>}
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            onChange={handleCoverImageUpload}
            style={{ display: 'none' }}
          />
          <div className="banner-actions">
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
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  autoFocus
                  className="edit-input edit-title"
                />
                <div className="edit-actions">
                  <button onClick={handleSaveName} className="btn-save" aria-label="Сохранить название">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={handleCancelEditName} className="btn-cancel" aria-label="Отменить редактирование">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <h1 onClick={() => { setEditedName(team.name); setIsEditingName(true); }} className="editable-title">
                {team.name}
                <svg className="edit-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.75 2.25L15.75 5.25L5.25 15.75H2.25V12.75L12.75 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </h1>
            )}
            
            {isEditingDescription ? (
              <div className="edit-field">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelEditDescription();
                  }}
                  autoFocus
                  className="edit-input edit-description"
                  rows={2}
                />
                <div className="edit-actions">
                  <button onClick={handleSaveDescription} className="btn-save" aria-label="Сохранить описание">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={handleCancelEditDescription} className="btn-cancel" aria-label="Отменить редактирование">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <p onClick={() => { setEditedDescription(team.description); setIsEditingDescription(true); }} className="editable-description">
                {team.description}
                <svg className="edit-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2L14 4.5L4.5 14H2V11.5L11.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            projectId={activeProject.id}
            teamMembers={team.members}
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
    </div>
  );
};