/**
 * Task Detail Modal (FSD: features/task)
 */
import React, { useState, useEffect } from 'react';
import type { TeamMember } from '@/entities/team';
import type { Task, UpdateTaskRequest } from '@/entities/task';
import { userMapper } from '@/shared/lib/userMapper';
import './task-detail-modal.css';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: number, updates: Partial<UpdateTaskRequest>) => void;
  onDeleteTask?: (taskId: number) => void;
  teamMembers: TeamMember[];
  userMap: Record<number, string>;
  isManager?: boolean;
  currentUserId?: number;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  teamMembers,
  isManager = false,
  currentUserId,
}) => {
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [usernameCache, setUsernameCache] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadUsernames() {
      if (!task || !isOpen) return;

      const telegramIds = new Set<number>();

      // task.assignedToMember - это telegram_id (416604955)
      if (task.assignedToMember) telegramIds.add(task.assignedToMember);
      if (task.createdByUser) telegramIds.add(task.createdByUser);

      // teamMembers должны содержать telegram_id
      teamMembers.forEach(member => {
        if (member.memberId) telegramIds.add(member.memberId);
      });

      if (telegramIds.size > 0) {
        try {
          const usernames = await userMapper.getUsernames(Array.from(telegramIds));
          console.log('📱 Загруженные username:', usernames);
          setUsernameCache(prev => ({ ...prev, ...usernames }));
        } catch (error) {
          console.error('Ошибка загрузки имен пользователей:', error);
        }
      }
    }

    loadUsernames();
  }, [task, isOpen, teamMembers]);

  // ✅ ОБНОВЛЕННАЯ отладочная информация - используем usernameCache вместо userMap
  useEffect(() => {
    if (task && isOpen) {
      console.log('🔍 TaskDetailModal DEBUG:', {
        taskId: task.id,
        taskassignedToMember: task.assignedToMember,
        assigneeName: task.assignedToMember ? usernameCache[task.assignedToMember] : 'нет',
        usernameCacheEntries: Object.entries(usernameCache),
        teamMembers: teamMembers.map(m => ({
          memberId: m.memberId,
          hasUsername: !!usernameCache[m.memberId],
        })),
      });
    }
  }, [task, isOpen, usernameCache, teamMembers]);

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

  // ✅ ИСПРАВЛЕННАЯ функция назначения
  const handleAssigneeChange = (memberId: number) => {
    if (!isManager || !currentUserId) return;

    console.log('🎯 Изменение исполнителя:', {
      taskId: task.id,
      memberId,
      currentUserId,
    });

    // ✅ Преобразуем в undefined вместо null
    const assignedToMemberValue = memberId === null ? undefined : memberId;

    onUpdateTask(task.id, {
      assignedToMember: assignedToMemberValue, // ✅ number | undefined
      assigned_to: assignedToMemberValue, // ✅ number | undefined
    });
    setIsAssigneeDropdownOpen(false);
  };

  // ✅ ИСПРАВЛЕННАЯ функция снятия назначения
  const handleUnassign = () => {
    if (!isManager || !currentUserId) return;

    console.log('🎯 Снятие назначения с задачи:', task.id);

    // ✅ Используем undefined вместо null
    onUpdateTask(task.id, {
      assignedToMember: undefined, // ✅ undefined вместо null
      assigned_to: undefined, // ✅ undefined вместо null
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
      archived: 'В архиве',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      open: '#3b82f6',
      assigned: '#f59e0b',
      in_review: '#8b5cf6',
      completed: '#10b981',
      archived: '#6b7280',
    };
    return colorMap[status] || '#6b7280';
  };

  // ✅ ИСПРАВЛЕНО: Получаем имя из usernameCache
  const assigneeName = task?.assignedToMember
    ? usernameCache[task.assignedToMember] || `Загрузка...`
    : undefined;

  return (
    <div className="task-detail-backdrop" onClick={handleBackdropClick}>
      <div className="task-detail-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{task.title}</h2>
            <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
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
                    disabled={!currentUserId}
                  >
                    {assigneeName ? (
                      <div className="assignee-display">
                        <div className="assignee-avatar-small">
                          {assigneeName.charAt(0).toUpperCase()}
                        </div>
                        <span>{assigneeName}</span>
                      </div>
                    ) : (
                      <div className="assignee-display">
                        <span className="unassigned-text">👤 Не назначено</span>
                      </div>
                    )}
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {isAssigneeDropdownOpen && currentUserId && (
                    <div className="assignee-dropdown">
                      {task.assignedToMember && (
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
                      {teamMembers.map(member => {
                        // ✅ ИСПРАВЛЕНО: Получаем имя из usernameCache
                        const memberName =
                          usernameCache[member.memberId] || `@user_${member.memberId}`;

                        return (
                          <button
                            key={member.memberId}
                            className={`assignee-option ${
                              task.assignedToMember === member.memberId ? 'selected' : ''
                            }`}
                            onClick={() => handleAssigneeChange(member.memberId)}
                          >
                            <div className="assignee-avatar-small">
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="assignee-info">
                              <span className="assignee-name">{memberName}</span>
                              <span className="assignee-role">
                                {member.role === 'manager' ? '👑 Менеджер' : '👤 Участник'}
                              </span>
                            </div>
                            {task.assignedToMember === member.memberId && (
                              <span className="check-mark">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="assignee-display-readonly">
                  {assigneeName ? (
                    <>
                      <div className="assignee-avatar-small">
                        {assigneeName.charAt(0).toUpperCase()}
                      </div>
                      <span>{assigneeName}</span>
                    </>
                  ) : (
                    <span className="unassigned-text">👤 Не назначено</span>
                  )}
                </div>
              )}

              {/* ✅ ОБНОВЛЕННАЯ отладочная информация - используем usernameCache */}
              <div
                style={{
                  fontSize: '11px',
                  color: '#666',
                  marginTop: '5px',
                  padding: '3px',
                  background: '#f5f5f5',
                  borderRadius: '3px',
                }}
              >
                ID: {task.assignedToMember || 'не назначено'} | Username:{' '}
                {task.assignedToMember ? usernameCache[task.assignedToMember] || 'не найден' : 'N/A'}
              </div>
            </div>

            {/* Очки */}
            <div className="info-section">
              <label className="info-label">Очки</label>
              <div className="info-value">
                <span className="points-display">⭐ {task.points || 0}</span>
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

          {/* Даты */}
          <div className="dates-section">
            <div className="date-info">
              <span className="date-label">Создано:</span>
              <span className="date-value">
                {new Date(task.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
            {task.updatedAt && (
              <div className="date-info">
                <span className="date-label">Обновлено:</span>
                <span className="date-value">
                  {new Date(task.updatedAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          {/* Кнопка удаления */}
          {isManager && onDeleteTask && (
            <div className="modal-actions">
              {!showDeleteConfirm ? (
                <button className="delete-task-button" onClick={() => setShowDeleteConfirm(true)}>
                  🗑️ Удалить задачу
                </button>
              ) : (
                <div className="delete-confirm">
                  <p>Вы уверены, что хотите удалить эту задачу?</p>
                  <div className="confirm-buttons">
                    <button className="confirm-delete-button" onClick={handleDeleteTask}>
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
