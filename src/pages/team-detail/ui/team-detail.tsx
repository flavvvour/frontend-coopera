// pages/team-detail-page.tsx
import React, { useState } from 'react';
import { CreateTaskForm, KanbanBoard } from '@/features/task';
import type { Team, Project, Task } from '@/entities/team/index';
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
          status: 'done',
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
          status: 'in-progress',
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
  const [team, setTeam] = useState<Team>(mockTeam);
  const [activeProject, setActiveProject] = useState<Project | null>(team.projects[0] || null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false); // Исправил на CreateTask

  // Если нужно использовать teamId для загрузки данных
  // useEffect(() => {
  //   if (teamId) {
  //     // Загрузка данных команды по ID
  //     loadTeamData(teamId);
  //   }
  // }, [teamId]);

  const handleCreateProject = (projectData: { name: string; description: string }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      teamId: team.id,
      createdAt: new Date().toISOString(),
      tasks: []
    };

    setTeam(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));

    setActiveProject(newProject);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!activeProject) return;

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
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeProject) return;

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
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
  };

  return (
    <div className="team-detail-page">
      {/* Хедер команды */}
      <div className="team-header">
        <div className="team-info">
          <h1>{team.name}</h1>
          <p>{team.description}</p>
        </div>
        <div className="team-stats">
          <div className="stat">
            <span className="stat-value">{team.members.length}</span>
            <span className="stat-label">участников</span>
          </div>
          <div className="stat">
            <span className="stat-value">{team.projects.length}</span>
            <span className="stat-label">проектов</span>
          </div>
        </div>
      </div>

      {/* Навигация по проектам */}
      <div className="projects-section">
        <div className="projects-header">
          <h2>📁 Проекты команды</h2>
          <button 
            className="create-project-btn"
            onClick={() => handleCreateProject({ 
              name: `Новый проект ${team.projects.length + 1}`, 
              description: 'Описание нового проекта' 
            })}
          >
            + Новый проект
          </button>
        </div>

        <div className="projects-tabs">
          {team.projects.map(project => (
            <button
              key={project.id}
              className={`project-tab ${activeProject?.id === project.id ? 'active' : ''}`}
              onClick={() => setActiveProject(project)}
            >
              {project.name}
              <span className="task-count">{project.tasks.length}</span>
            </button>
          ))}
        </div>

        {/* Канбан-доска для активного проекта */}
        {activeProject ? (
          <div className="kanban-section">
            <div className="kanban-header">
              <h3>🎯 {activeProject.name} - Канбан доска</h3>
              <p>{activeProject.description}</p>
              <button 
                className="create-task-btn"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                + Добавить задачу
              </button>
            </div>
            <KanbanBoard
              tasks={activeProject.tasks}
              onUpdateTask={handleUpdateTask}
              onCreateTask={handleCreateTask}
              projectId={activeProject.id}
              teamMembers={team.members}
            />
          </div>
        ) : (
          <div className="no-project">
            <p>Выберите проект или создайте новый чтобы начать работу с задачами</p>
          </div>
        )}
      </div>

      {/* Модалка создания задачи */}
      <CreateTaskForm
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        projectId={activeProject?.id || ''}
        teamMembers={team.members}
      />
    </div>
  );
};