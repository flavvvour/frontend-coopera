// features/task/kanban-board.tsx
import React, { useState } from 'react';
import type { Task, TeamMember } from '@/entities/team/index';
import { CreateTaskForm } from '../create-task-form/create-task-form';
import './kanban-board.css';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projectId: string;
  teamMembers: TeamMember[];
}

const columns = [
  { id: 'todo', title: '📝 К выполнению', color: '#ef4444' },
  { id: 'in-progress', title: '🔄 В работе', color: '#3b82f6' },
  { id: 'review', title: '👀 На проверке', color: '#f59e0b' },
  { id: 'done', title: '✅ Выполнено', color: '#10b981' }
] as const;

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTask,
  onCreateTask,
  projectId,
  teamMembers
}) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTask) {
      onUpdateTask(draggedTask, { status });
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="kanban-board">
      <div className="kanban-actions">
        <button 
          className="create-task-btn"
          onClick={() => setIsCreateTaskOpen(true)}
        >
          + Создать задачу
        </button>
      </div>

      <div className="kanban-columns">
        {columns.map(column => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task['status'])}
          >
            <div className="column-header" style={{ borderLeftColor: column.color }}>
              <h4>{column.title}</h4>
              <span className="column-count">{getTasksByStatus(column.id as Task['status']).length}</span>
            </div>
            
            <div className="column-content">
              {getTasksByStatus(column.id as Task['status']).map(task => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className="task-header">
                    <span className="task-priority" data-priority={task.priority}>
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span className="task-points">{task.points} баллов</span>
                  </div>
                  
                  <h5 className="task-title">{task.title}</h5>
                  <p className="task-description">{task.description}</p>
                  
                  <div className="task-footer">
                    {task.assigneeName && (
                      <span className="task-assignee">👤 {task.assigneeName}</span>
                    )}
                    {task.dueDate && (
                      <span className="task-due">📅 {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                    )}
                  </div>

                  {task.tags.length > 0 && (
                    <div className="task-tags">
                      {task.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskForm
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={onCreateTask}
        projectId={projectId}
        teamMembers={teamMembers}
      />
    </div>
  );
};