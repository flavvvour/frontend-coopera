import React, { useState, useMemo, useEffect } from 'react';
import { useHookPostTask } from '../../hooks/useHookPostTask';
import { useHookGetTask } from '../../hooks/useHookGetTask';
import { useHookDeleteTask } from '../../hooks/useHookDeleteTask';
import { useHookUpdateTask } from '../../hooks/useHookUpdateTask';
import { useHookUpdateTaskStatus } from '../../hooks/useHookUpdateTaskStatus';
import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
  PatchTaskStatus,
} from '../../domain/task.types';
import './kanban-board.css';

// Типы для канбан-доски
export interface KanbanColumn {
  id: 'open' | 'assigned' | 'in_review' | 'completed';
  title: string;
  color: string;
  taskCount: number;
}

export interface KanbanBoardProps {
  teamId: number;
  currentUserId: number;
  members: Array<{ id: number; username: string; name?: string }>;
  canCreateTasks?: boolean;
  canEditTasks?: boolean;
  canDeleteTasks?: boolean;
  isManager?: boolean;
}

export function KanbanBoard({
  teamId,
  currentUserId,
  members,
  canCreateTasks = true,
  canEditTasks = true,
  canDeleteTasks = true,
  isManager = false,
}: KanbanBoardProps) {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn['id'] | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 1,
    assignedToMember: members[0]?.id || 0,
  });

  // Хуки для работы с задачами
  const { createTask, loading: creatingTask, error: createTaskError } = useHookPostTask();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useHookGetTask(teamId);
  const { deleteTask, loading: deletingTask, error: deleteTaskError } = useHookDeleteTask();
  // Состояния для редактирования
  const [editPoints, setEditPoints] = useState(1);
  const [editDescription, setEditDescription] = useState('');
  const { updateTask, loading: updatingTask, error: updateTaskError } = useHookUpdateTask();
  // Хук для изменения статуса задачи
  const { updateTaskStatus, error: updateStatusError } = useHookUpdateTaskStatus();
  // Состояния для drag & drop
  const [, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (members.length > 0) {
      members.forEach((member, index) => {
        console.log(`Member ${index}:`, {
          id: member.id,
          username: member.username,
          name: member.name,
          hasUsername: !!member.username,
          hasName: !!member.name,
        });
      });
    }
  }, [members]);

  const tasksByStatus = useMemo(() => {
    if (!localTasks.length) {
      return {
        open: [],
        assigned: [],
        in_review: [],
        completed: [],
      };
    }

    return {
      open: localTasks.filter(task => task.status === 'open'),
      assigned: localTasks.filter(task => task.status === 'assigned'),
      in_review: localTasks.filter(task => task.status === 'in_review'),
      completed: localTasks.filter(task => task.status === 'completed'),
    };
  }, [localTasks]);

  // Используем useMemo для вычисления колонок на основе задач
  const columns = useMemo((): KanbanColumn[] => {
    return [
      {
        id: 'open',
        title: 'Бэклог',
        color: '#3b82f6',
        taskCount: tasksByStatus.open.length,
      },
      {
        id: 'assigned',
        title: 'В работе',
        color: '#f59e0b',
        taskCount: tasksByStatus.assigned.length,
      },
      {
        id: 'in_review',
        title: 'На проверке',
        color: '#8b5cf6',
        taskCount: tasksByStatus.in_review.length,
      },
      {
        id: 'completed',
        title: 'Выполнено',
        color: '#10b981',
        taskCount: tasksByStatus.completed.length,
      },
    ];
  }, [tasksByStatus]);

  // Функция редактирования задачи
  const handleEditTask = async () => {
    if (!selectedTask) return;

    if (!editDescription.trim()) {
      alert('Введите описание задачи');
      return;
    }

    try {
      const updateRequest: UpdateTaskRequest = {
        currentUserId,
        taskId: selectedTask.id,
        points: editPoints,
        description: editDescription,
      };

      await updateTask(updateRequest);

      // Обновляем локальное состояние
      setLocalTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id
            ? {
                ...task,
                description: editDescription,
                points: editPoints,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );

      alert('Задача успешно обновлена!');
      setShowEditTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }
  };

  // Функция для открытия редактирования
  const openEditTaskModal = (task: Task) => {
    if (!canEditTasks) {
      alert('У вас нет прав для редактирования задач');
      return;
    }

    setSelectedTask(task);
    setEditPoints(task.points);
    setEditDescription(task.description || '');
    setShowEditTaskModal(true);
  };

  // Функция которая возвращает полное имя, если есть
  const getMemberDisplayName = (memberId: number): string => {
    // Если memberId равен 0 или undefined, значит задача не назначена
    if (!memberId || memberId === 0) {
      return 'Не назначено';
    }

    const member = members.find(m => m.id === memberId);

    if (!member) {
      return `ID: ${memberId}`;
    }
    return `@${member.username}`;
  };

  // Функция создания задачи
  const handleCreateTask = async () => {
    if (!selectedColumn) return;

    if (!newTask.title.trim()) {
      alert('Введите название задачи');
      return;
    }

    try {
      const taskRequest: CreateTaskRequest = {
        teamId,
        currentUserId,
        title: newTask.title,
        description: newTask.description,
        // Только менеджер может устанавливать баллы
        points: isManager ? newTask.points : undefined,
        assignedToMember: newTask.assignedToMember,
      };

      const createdTaskResponse = await createTask(taskRequest);

      // Явно создаем объект Task с ВСЕМИ полями (чтобы отображалось назначение нужного пользователя на задачу)
      const newTaskAsTask: Task = {
        ...createdTaskResponse,
        assignedToMember: newTask.assignedToMember,
      };

      setLocalTasks(prev => [...prev, newTaskAsTask]);

      alert('Задача успешно создана!');
      setShowCreateTaskModal(false);
      setSelectedColumn(null);
      setNewTask({
        title: '',
        description: '',
        points: 1,
        assignedToMember: members[0]?.id || 0,
      });
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
    }
  };

  // Функция удаления задачи
  const handleDeleteTask = async (taskId: number) => {
    if (!canDeleteTasks) {
      alert('У вас нет прав для удаления задач');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }

    try {
      await deleteTask(taskId, currentUserId);

      // Удаляем задачу из локального состояния
      setLocalTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

      alert('Задача успешно удалена!');
      setShowTaskDetailModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      alert('Не удалось удалить задачу');
    }
  };

  // Функция для открытия деталей задачи
  const openTaskDetails = (task: Task) => {
    if (!canEditTasks && !canDeleteTasks) {
      alert('У вас нет прав для редактирования или удаления задач');
      return;
    }

    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  const openCreateTaskModal = (columnId: KanbanColumn['id']) => {
    if (!canCreateTasks) {
      alert('У вас нет прав для создания задач');
      return;
    }
    setSelectedColumn(columnId);
    setShowCreateTaskModal(true);
  };
  // Функции для drag & drop
  const handleDragStart = (task: Task, e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('taskStatus', task.status);
    setDraggedTask(task);

    // Визуальный эффект перетаскивания
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // Сбросим эффект со старта:
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);

    // Сброс визуальных эффектов
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (columnId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(columnId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (columnId: KanbanColumn['id'], e: React.DragEvent) => {
    e.preventDefault();

    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const fromStatus = e.dataTransfer.getData('taskStatus');

    if (!taskId || fromStatus === columnId) {
      setDragOverColumn(null);
      return;
    }

    console.log(`🔄 Перемещаем задачу ${taskId} из ${fromStatus} в ${columnId}`);

    // Находим задачу
    const taskToMove = localTasks.find(task => task.id === taskId);
    if (!taskToMove) {
      alert('Задача не найдена');
      setDragOverColumn(null);
      return;
    }

    if (!canEditTasks) {
      alert('У вас нет прав для перемещения задач');
      setDragOverColumn(null);
      return;
    }

    try {
      // Сразу обновляем UI (оптимистичное обновление)
      setLocalTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: columnId, updatedAt: new Date().toISOString() }
            : task
        )
      );

      // Вызываем API для изменения статуса
      const patchRequest: PatchTaskStatus = {
        taskId: taskId,
        currentUserId: currentUserId,
        status: columnId,
      };

      console.log('📡 Отправка запроса на изменение статуса:', patchRequest);

      await updateTaskStatus(patchRequest);
    } catch (error) {
      console.error('Ошибка перемещения задачи:', error);

      setLocalTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? { ...task, status: fromStatus } : task))
      );

      alert('Не удалось переместить задачу');
    } finally {
      setDragOverColumn(null);
    }
  };

  // Функция для рендеринга задач в колонке
  const renderTasks = (columnId: KanbanColumn['id']) => {
    const columnTasks = tasksByStatus[columnId];

    if (!columnTasks || columnTasks.length === 0) {
      return null;
    }

    return (
      <div className="tasks-list">
        {columnTasks.map((task: Task) => (
          <div
            key={task.id}
            className="task-card"
            draggable={canEditTasks}
            onDragStart={e => handleDragStart(task, e)}
            onDragEnd={handleDragEnd}
            onClick={() => openTaskDetails(task)}
            style={{
              cursor: canEditTasks || canDeleteTasks ? 'pointer' : 'default',
            }}
          >
            <div className="task-card-header">
              <h4 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>
                {task.title}
              </h4>
              <span className="task-points">{task.points} очк.</span>
            </div>
            <div className="task-card-body">
              <p className={`task-description ${task.status === 'completed' ? 'completed' : ''}`}>
                {task.description || 'Без описания'}
              </p>
              <div className="task-meta">
                <span className="task-assignee">
                  👤 {getMemberDisplayName(task.assignedToMember)}
                </span>
                <span className="task-id">#{task.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="kanban-board-container">
      {/* Состояния загрузки и ошибок */}
      {tasksLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Загрузка задач...</p>
        </div>
      )}

      {tasksError && (
        <div className="error-message-container">
          <p>Ошибка загрузки задач: {tasksError.message}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      )}

      {deleteTaskError && (
        <div className="error-message-container">
          <p>Ошибка удаления задачи: {deleteTaskError.message}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Обновить
          </button>
        </div>
      )}

      {updateStatusError && (
        <div className="error-message-container">
          <p>Ошибка изменения статуса задачи: {updateStatusError.message}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Обновить
          </button>
        </div>
      )}

      {/* Канбан-доска */}
      <div className="kanban-board">
          {columns.map(column => (
            <div
              key={column.id}
              className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
              onDragOver={e => handleDragOver(column.id, e)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(column.id, e)}
            >
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="task-count">{column.taskCount}</span>
              </div>

              {/* Кнопка добавления задачи - ВСЕГДА сверху! */}
              {canCreateTasks && (
                <div className="column-add-task">
                  <button
                    className="add-task-btn-top"
                    onClick={() => openCreateTaskModal(column.id)}
                  >
                    + Добавить задачу
                  </button>
                </div>
              )}

              {/* Блок с задачами */}
              <div className="column-content">{renderTasks(column.id)}</div>
            </div>
          ))}
        </div>

      {/* Модальное окно создания задачи */}
      {showCreateTaskModal && selectedColumn && (
        <div className="modal-overlay">
          <div className="create-task-modal">
            <div className="modal-header">
              <h3>
                Создать задачу в колонке "{columns.find(c => c.id === selectedColumn)?.title}"
              </h3>
              <button className="close-modal-btn" onClick={() => setShowCreateTaskModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {createTaskError && <div className="error-message">{createTaskError.message}</div>}

              <div className="form-group">
                <label>Задача</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Введите название задачи"
                  disabled={creatingTask}
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Опишите задачу..."
                  rows={3}
                  disabled={creatingTask}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Баллы</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newTask.points}
                    onChange={e =>
                      setNewTask({ ...newTask, points: parseInt(e.target.value) || 1 })
                    }
                    disabled={creatingTask || !isManager}
                  />
                  {!isManager && (
                    <p className="field-note">Только менеджер может устанавливать баллы</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Назначить</label>
                  <select
                    value={newTask.assignedToMember}
                    onChange={e =>
                      setNewTask({ ...newTask, assignedToMember: parseInt(e.target.value) })
                    }
                    disabled={creatingTask || members.length === 0}
                  >
                    <option value={0}>Не назначено</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        @{member.username} {member.name ? `(${member.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateTaskModal(false)}
                disabled={creatingTask}
              >
                Отмена
              </button>
              <button
                className="create-btn"
                onClick={handleCreateTask}
                disabled={creatingTask || !newTask.title.trim()}
              >
                {creatingTask ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно деталей задачи */}
      {showTaskDetailModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskDetailModal(false)}>
          <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Детали задачи #{selectedTask.id}</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowTaskDetailModal(false)}
                disabled={deletingTask || updatingTask}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="task-detail-section">
                <h4>Название</h4>
                <p>{selectedTask.title}</p>
              </div>

              <div className="task-detail-section">
                <h4>Описание</h4>
                <p>{selectedTask.description || 'Нет описания'}</p>
              </div>

              <div className="task-detail-grid">
                <div className="task-detail-item">
                  <h4>Баллы</h4>
                  <p>{selectedTask.points}</p>
                </div>
                <div className="task-detail-item">
                  <h4>Статус</h4>
                  <p>{selectedTask.status}</p>
                </div>
                <div className="task-detail-item">
                  <h4>Назначена</h4>
                  <p>{getMemberDisplayName(selectedTask.assignedToMember)}</p>
                  {(() => {
                    const member = members.find(m => m.id === selectedTask.assignedToMember);
                    return member && member.name ? (
                      <p className="member-fullname">Имя: {member.name}</p>
                    ) : null;
                  })()}
                </div>
                <div className="task-detail-item">
                  <h4>Создана</h4>
                  <p>{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {canEditTasks && (
                <button
                  className="edit-btn"
                  onClick={() => {
                    setShowTaskDetailModal(false);
                    openEditTaskModal(selectedTask);
                  }}
                  disabled={deletingTask}
                >
                  Редактировать
                </button>
              )}

              {canDeleteTasks && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  disabled={deletingTask}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно редактирования задачи */}
      {showEditTaskModal && selectedTask && (
        <div className="modal-overlay">
          <div className="create-task-modal">
            <div className="modal-header">
              <h3>Редактирование задачи #{selectedTask.id}</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowEditTaskModal(false)}
                disabled={updatingTask}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {updateTaskError && (
                <div className="error-message">Ошибка: {updateTaskError.message}</div>
              )}

              <div className="form-group">
                <label>Название</label>
                <input type="text" value={selectedTask.title} disabled className="disabled-input" />
                <p className="field-note">Название нельзя изменить</p>
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Опишите задачу..."
                  rows={4}
                  disabled={updatingTask}
                />
              </div>

              <div className="form-group">
                <label>Баллы</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editPoints}
                  onChange={e => setEditPoints(parseInt(e.target.value) || 1)}
                  disabled={updatingTask || !isManager}
                  className={!isManager ? 'disabled-input' : ''}
                />
                {!isManager && (
                  <p className="field-note">Только менеджер может изменять баллы</p>
                )}
              </div>

              <div className="form-group">
                <label>Статус</label>
                <input
                  type="text"
                  value={selectedTask.status}
                  disabled
                  className="disabled-input"
                />
                <p className="field-note">Статус изменится при перетаскивании по доске</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEditTaskModal(false)}
                disabled={updatingTask}
              >
                Отмена
              </button>
              <button
                className="create-btn"
                onClick={handleEditTask}
                disabled={updatingTask || !editDescription.trim()}
              >
                {updatingTask ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
