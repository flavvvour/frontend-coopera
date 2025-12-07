/**
 * Task Detail Modal (FSD: features/task)
 *
 * Модальное окно для просмотра и редактирования задачи
 * - Назначение на участников команды
 * - Изменение статуса
 * - Редактирование описания
 */

import React, { useState, useEffect } from 'react';
import type { Task, TeamMember } from '@/entities/team/index';
import './task-detail-modal.css';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  teamMembers: TeamMember[];
  isManager?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  teamMembers,
  isManager = false,
}) => {
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.assignee-selector')) {
        setIsAssigneeDropdownOpen(false);
      }
    };

    if (isAssigneeDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isAssigneeDropdownOpen]);

  // Закрываем модалку при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleAssigneeChange = (userId: string) => {
    const member = teamMembers.find(m => m.userId === userId);
    onUpdateTask(task.id, {
      assigneeId: userId,
      assigneeName: member?.username || 'Неизвестный пользователь',
    });
    setIsAssigneeDropdownOpen(false);
  };

  const handleUnassign = () => {
    if (!isManager) return;
    onUpdateTask(task.id, {
      assigneeId: '',
      assigneeName: '',
    });
    setIsAssigneeDropdownOpen(false);
  };

  const handleDeleteTask = () => {
    if (!isManager || !onDeleteTask || !task) return;
    onDeleteTask(task.id);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'Бэклог',
      assigned: 'В работе',
      in_review: 'На проверке',
      completed: 'Выполнено',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      open: '#3b82f6',
      assigned: '#f59e0b',
      in_review: '#8b5cf6',
      completed: '#10b981',
    };
    return colorMap[status] || '#6b7280';
  };

  return (
    <div className="task-detail-backdrop" onClick={handleBackdropClick}>
      <div className="task-detail-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{task.title}</h2>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(task.status) }}
            >
              {getStatusLabel(task.status)}
            </span>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="task-info-grid">
            {/* Назначение */}
            <div className="info-section">
              <label className="info-label">Исполнитель</label>
              {isManager ? (
                <div className="assignee-selector">
                  <button
                    className="assignee-button"
                    onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                  >
                  {task.assigneeName ? (
                    <div className="assignee-display">
                      <div className="assignee-avatar-small">
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </div>
                      <span>{task.assigneeName}</span>
                    </div>
                  ) : (
                    <div className="assignee-display">
                      <span className="unassigned-text">👤 Не назначено</span>
                    </div>
                  )}
                  <span className="dropdown-arrow">▼</span>
                </button>

                {isAssigneeDropdownOpen && (
                  <div className="assignee-dropdown">
                    {task.assigneeName && (
                      <>
                        <button
                          className="assignee-option unassign-option"
                          onClick={handleUnassign}
                        >
                          <span>Снять назначение</span>
                        </button>
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    {teamMembers.map(member => (
                      <button
                        key={member.userId}
                        className={`assignee-option ${
                          task.assigneeId === member.userId ? 'selected' : ''
                        }`}
                        onClick={() => handleAssigneeChange(member.userId)}
                      >
                        <div className="assignee-avatar-small">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="assignee-info">
                          <span className="assignee-name">{member.username}</span>
                          <span className="assignee-role">
                            {member.role === 'manager' ? '👑 Менеджер' : '👤 Участник'}
                          </span>
                        </div>
                        {task.assigneeId === member.userId && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                </div>
              ) : (
                <div className="assignee-display-readonly">
                  {task.assigneeName ? (
                    <>
                      <div className="assignee-avatar-small">
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </div>
                      <span>{task.assigneeName}</span>
                    </>
                  ) : (
                    <span className="unassigned-text">👤 Не назначено</span>
                  )}
                </div>
              )}
            </div>

            {/* Очки */}
            <div className="info-section">
              <label className="info-label">Очки</label>
              <div className="info-value">
                <span className="points-display">⭐ {task.points}</span>
              </div>
            </div>
          </div>

          {/* Описание */}
          {task.description && (
            <div className="description-section">
              <label className="info-label">Описание</label>
              <p className="task-description-text">{task.description}</p>
            </div>
          )}

          {/* Теги */}
          {task.tags && task.tags.length > 0 && (
            <div className="tags-section">
              <label className="info-label">Теги</label>
              <div className="task-tags">
                {task.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Даты */}
          <div className="dates-section">
            <div className="date-info">
              <span className="date-label">Создано:</span>
              <span className="date-value">
                {new Date(task.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className="date-info">
              <span className="date-label">Обновлено:</span>
              <span className="date-value">
                {new Date(task.updatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Кнопка удаления (только для менеджера) */}
          {isManager && onDeleteTask && (
            <div className="modal-actions">
              {!showDeleteConfirm ? (
                <button
                  className="delete-task-button"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  🗑️ Удалить задачу
                </button>
              ) : (
                <div className="delete-confirm">
                  <p>Вы уверены, что хотите удалить эту задачу?</p>
                  <div className="confirm-buttons">
                    <button
                      className="confirm-delete-button"
                      onClick={handleDeleteTask}
                    >
                      Да, удалить
                    </button>
                    <button
                      className="cancel-delete-button"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
