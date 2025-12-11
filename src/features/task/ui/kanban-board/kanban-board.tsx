/**
 * Kanban Board (FSD: features/task)
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TeamMember } from '@/entities/team';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  TaskStatus,
} from '@/entities/task';
import { CreateTaskForm } from '../create-task-form/create-task-form';
import { TaskDetailModal } from '../task-detail-modal';
import './kanban-board.css';

// Типы для пропсов
interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: number, updates: Partial<UpdateTaskRequest>) => void;
  onUpdateStatus: (data: UpdateTaskStatusRequest) => void;
  onCreateTask: (taskData: Omit<CreateTaskRequest, 'current_user_id'>) => void;
  onDeleteTask?: (taskId: number) => void;
  teamId: number;
  teamMembers: TeamMember[];
  userMap?: Record<number, string>;
  isManager?: boolean;
  currentUserId: number;
}

// Колонки канбана
const columns: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: 'open', title: 'Бэклог', color: '#3b82f6' },
  { id: 'assigned', title: 'В работе', color: '#f59e0b' },
  { id: 'in_review', title: 'На проверке', color: '#8b5cf6' },
  { id: 'completed', title: 'Выполнено', color: '#10b981' },
];

// Вспомогательные компоненты
interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children, className }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onTaskClick?: (task: Task) => void;
  userMap?: Record<number, string>;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging = false,
  onTaskClick,
  userMap = {},
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleAssigneeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    console.log('👤 СИЛЬНЫЙ КЛИК на назначении:', {
      taskId: task.id,
      title: task.title,
      assignedToMember: task.assignedToMember,
      timestamp: Date.now(),
    });

    // Форсируем открытие модалки
    setTimeout(() => {
      onTaskClick?.(task);
    }, 10);
  };
  const assigneeStyle = {
    cursor: 'pointer',
    pointerEvents: 'auto' as const,
    userSelect: 'none' as const,
    position: 'relative' as const,
    zIndex: 1000,
  };
  const assigneeName = task.assignedToMember
    ? userMap[task.assignedToMember] || `Участник ${task.assignedToMember}`
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={() => !isSortableDragging && onTaskClick?.(task)}
      data-task-id={task.id}
    >
      <div className="task-header">
        <span className="task-points">⭐ {task.points || 0}</span>
      </div>

      <h5 className="task-title">{task.title}</h5>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-footer">
        {assigneeName ? (
          <div
            className="task-assignee"
            onClick={handleAssigneeClick}
            style={assigneeStyle} // ✅ Добавляем inline-стили
            onMouseDown={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseUp={e => e.stopPropagation()}
            title="Кликните, чтобы изменить исполнителя"
            data-testid="assignee-area"
          >
            <div className="assignee-avatar">{assigneeName.charAt(0).toUpperCase()}</div>
            <span className="assignee-name">{assigneeName}</span>
          </div>
        ) : (
          <div
            className="task-unassigned"
            onClick={handleAssigneeClick}
            style={assigneeStyle} // ✅ Добавляем inline-стили
            onMouseDown={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseUp={e => e.stopPropagation()}
            title="Кликните, чтобы назначить исполнителя"
            data-testid="unassigned-area"
          >
            👤 <span>Не назначено</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Главный компонент
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks: rawTasks,
  onUpdateTask,
  onUpdateStatus,
  onCreateTask,
  onDeleteTask,
  teamId,
  teamMembers,
  userMap = {},
  isManager = true,
  currentUserId,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ✅ ДЕТАЛЬНЫЙ АНАЛИЗ СЫРЫХ ДАННЫХ
  useEffect(() => {
    console.log('🚨 СЫРЫЕ ДАННЫЕ rawTasks (полная инспекция):');
    rawTasks.forEach((task: any, index) => {
      console.log(`Задача ${index + 1}: "${task.title}" (ID: ${task.id})`, {
        // Проверяем ВСЕ возможные поля с назначением
        assigned_to: task.assigned_to,
        assignedToMember: task.assignedToMember,
        assignee: task.assignee,
        assigned: task.assigned,
        assigneeId: task.assigneeId,
        assignedToMemberId: task.assignedToMemberId,
        assignedUserId: task.assignedUserId,
        userId: task.userId,
        // Все поля объекта
        allKeys: Object.keys(task),
        // Полный объект (ограниченно)
        objectPreview: JSON.stringify(task, null, 2).substring(0, 500),
      });
    });
  }, [rawTasks]);

  // ✅ ФУНКЦИЯ ДЛЯ НОРМАЛИЗАЦИИ ДАННЫХ С СЕРВЕРА
  // ЗАМЕНИТЕ функцию normalizeTask на эту версию:
  const normalizeTask = (rawTask: any): Task => {
    console.log(`🔍 Нормализация задачи ${rawTask.id}:`, {
      всеПоляВходящие: Object.keys(rawTask),
      значения: {
        assigned_to: rawTask.assigned_to,
        assignedToMember: rawTask.assignedToMember,
      },
    });

    // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Правильный приоритет
    const assignedToMemberValue =
      rawTask.assignedToMember !== undefined
        ? rawTask.assignedToMember
        : rawTask.assigned_to !== undefined
          ? rawTask.assigned_to
          : undefined;

    console.log(`✅ Результат для задачи ${rawTask.id}:`, {
      finalassignedToMember: assignedToMemberValue,
      было: {
        assigned_to: rawTask.assigned_to,
        assignedToMember: rawTask.assignedToMember,
      },
    });

    return {
      id: rawTask.id,
      teamId: rawTask.teamId || rawTask.team_id,
      title: rawTask.title,
      description: rawTask.description,
      points: rawTask.points,
      status: rawTask.status,
      assignedToMember: assignedToMemberValue,
      createdByUser: rawTask.createdByUser || rawTask.created_by,
      createdAt: rawTask.createdAt || rawTask.created_at,
      updatedAt: rawTask.updatedAt || rawTask.updated_at,
    };
  };

  // ✅ НОРМАЛИЗУЕМ ЗАДАЧИ ПРИ ПОЛУЧЕНИИ
  const tasks = useMemo(() => {
    console.log('🔄 Начало нормализации rawTasks...');
    const normalizedTasks = rawTasks.map(normalizeTask);

    console.log('✅ ИТОГ нормализации:', {
      всегоЗадач: normalizedTasks.length,
      задачиСНазначением: normalizedTasks.filter(t => t.assignedToMember).length,
      задачиБезНазначения: normalizedTasks.filter(t => !t.assignedToMember).length,
      детали: normalizedTasks.map(t => ({
        id: t.id,
        title: t.title,
        assignedToMember: t.assignedToMember,
        status: t.status,
      })),
    });

    return normalizedTasks;
  }, [rawTasks]);

  // // ✅ СОЗДАЕМ userMap ДЛЯ СООТВЕТСТВИЯ ID -> ИМЯ
  // const userMap = useMemo(() => {
  //   const map: Record<number, string> = {};

  //   teamMembers.forEach(member => {
  //     // Пробуем разные возможные поля с ID пользователя
  //     const possibleIds = [
  //       member.memberId,
  //       (member as any).id,
  //       (member as any).userId,
  //       (member as any).user_id,
  //     ];

  //     for (const id of possibleIds) {
  //       if (id && typeof id === 'number' && !map[id]) {
  //         map[id] = member.username || `Участник ${id}`;
  //         console.log(`✅ Добавлен в userMap: ${id} -> ${map[id]}`);
  //         break; // Нашли ID, остальные пропускаем
  //       }
  //     }
  //   });

  //   console.log('✅ Создан userMap:', {
  //     всего: Object.keys(map).length,
  //     записи: Object.entries(map),
  //   });

  //   return map;
  // }, [teamMembers]);

  // ✅ ОТЛАДОЧНЫЙ ВЫВОД ДЛЯ РЕНДЕРА
  useEffect(() => {
    console.log('🎯 ДАННЫЕ ДЛЯ РЕНДЕРИНГА KANBAN:', {
      rawTasksCount: rawTasks.length,
      normalizedTasksCount: tasks.length,
      teamMembersCount: teamMembers.length,
      userMapEntries: Object.keys(userMap).length,
    });

    // Проверяем каждую задачу
    tasks.forEach((task, index) => {
      const rawTask = rawTasks[index] as any;
      const hasAssignee = !!task.assignedToMember;
      const assigneeName = task.assignedToMember ? userMap[task.assignedToMember] : null;

      console.log(
        `Задача "${task.title}" (ID: ${task.id}):`,
        hasAssignee
          ? `✅ Назначена на: ${assigneeName || `Участник ${task.assignedToMember}`}`
          : '❌ НЕ НАЗНАЧЕНА',
        {
          normalizedassignedToMember: task.assignedToMember,
          rawassignedToMember: rawTask?.assigned_to,
          rawassignedToMemberField: rawTask?.assignedToMember,
          inUserMap: task.assignedToMember ? userMap[task.assignedToMember] : 'нет',
        }
      );
    });

    // Специальная проверка для задачи с ID 63 (которая была назначена)
    const task63 = tasks.find(t => t.id === 63);
    const rawTask63 = rawTasks.find((t: any) => t.id === 63);

    console.log('🔎 СПЕЦИАЛЬНАЯ ПРОВЕРКА задачи ID 63:', {
      task63Exists: !!task63,
      task63Details: task63,
      rawTask63Details: rawTask63,
      rawTask63AllFields: rawTask63 ? Object.keys(rawTask63) : [],
    });
  }, [tasks, rawTasks, teamMembers, userMap]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status).sort((a, b) => a.id - b.id);
  };

  const handleTaskClick = (task: Task) => {
    console.log('🔄 Открываем задачу для деталей:', {
      id: task.id,
      title: task.title,
      assignedToMember: task.assignedToMember,
      status: task.status,
      всеПоля: Object.keys(task),
      // ✅ ПРОВЕРКА userMap
      assigneeName: task.assignedToMember ? userMap[task.assignedToMember] : 'нет',
      userMapKeys: Object.keys(userMap),
    });

    // ✅ ПЕРЕДАЕМ userMap в модалку
    setSelectedTask(task);

    // ✅ ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ДАННЫХ
    if (task.assignedToMember && !userMap[task.assignedToMember]) {
      console.warn('⚠️ Исполнитель не найден в userMap!', {
        taskId: task.id,
        assignedToMember: task.assignedToMember,
        userMap: Object.keys(userMap),
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeTaskId = Number(active.id);
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Проверяем, перетаскиваем ли на колонку
    const isOverColumn = columns.some(col => col.id === over.id);

    if (isOverColumn) {
      const newStatus = over.id as TaskStatus;
      if (activeTask.status !== newStatus) {
        onUpdateStatus({
          task_id: activeTask.id,
          current_user_id: currentUserId,
          status: newStatus,
        });
      }
      return;
    }

    // Проверяем, перетаскиваем ли на задачу
    const overTaskId = Number(over.id);
    const overTask = tasks.find(t => t.id === overTaskId);
    if (!overTask) return;

    // Если задачи в разных колонках - меняем статус
    if (activeTask.status !== overTask.status) {
      onUpdateStatus({
        task_id: activeTask.id,
        current_user_id: currentUserId,
        status: overTask.status as TaskStatus,
      });
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === Number(activeId)) : null;

  // ✅ СЧЕТЧИКИ ДЛЯ ОТЛАДКИ
  const tasksWithAssignee = tasks.filter(t => t.assignedToMember).length;
  const tasksassignedToMember63 = tasks.filter(t => t.assignedToMember === 63).length;
  const tasksassignedToMember58 = tasks.filter(t => t.assignedToMember === 58).length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {/* ✅ УЛУЧШЕННАЯ ОТЛАДОЧНАЯ ПАНЕЛЬ */}
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            background: '#fef3c7',
            borderRadius: '6px',
            fontSize: '13px',
            border: '2px solid #f59e0b',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <strong style={{ color: '#92400e' }}>🚨 ОТЛАДКА KANBAN:</strong>
            <span>
              Задачи: {tasks.length} (сырых: {rawTasks.length})
            </span>
            <span>Участники: {teamMembers.length}</span>
            <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
              С назначением: {tasksWithAssignee}
            </span>

            {tasksassignedToMember63 > 0 && (
              <span
                style={{
                  color: '#059669',
                  fontWeight: 'bold',
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                ✅ На ID 63: {tasksassignedToMember63}
              </span>
            )}

            {tasksassignedToMember58 > 0 && (
              <span
                style={{
                  color: '#7c3aed',
                  fontWeight: 'bold',
                  background: '#ede9fe',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                ✅ На ID 58: {tasksassignedToMember58}
              </span>
            )}
          </div>

          {/* Детальная информация */}
          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#6b7280',
              background: '#f9fafb',
              padding: '6px',
              borderRadius: '4px',
            }}
          >
            <div>
              Участники в userMap:{' '}
              {Object.entries(userMap).map(([id, name]) => (
                <span key={id} style={{ marginRight: '6px', display: 'inline-block' }}>
                  <strong>ID {id}:</strong> {name}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '4px' }}>
              Задачи с назначением:{' '}
              {tasks
                .filter(t => t.assignedToMember)
                .map(t => (
                  <span key={t.id} style={{ marginRight: '8px' }}>
                    "{t.title}" → {t.assignedToMember}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {isManager && (
          <div className="kanban-actions">
            <button className="create-task-btn" onClick={() => setIsCreateTaskOpen(true)}>
              + Новая задача
            </button>
          </div>
        )}

        <div className="kanban-columns">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="kanban-column">
                <div className="column-header">
                  <div className="column-title">
                    <span className="column-color" style={{ backgroundColor: column.color }}></span>
                    <h4>{column.title}</h4>
                  </div>
                  <span className="column-count">{columnTasks.length}</span>
                </div>

                <SortableContext
                  id={column.id}
                  items={columnTasks.map(t => t.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id} className="column-content">
                    {columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onTaskClick={handleTaskClick}
                        userMap={userMap}
                      />
                    ))}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging userMap={userMap} /> : null}
        </DragOverlay>

        <CreateTaskForm
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreateTask={onCreateTask}
          teamId={teamId}
          teamMembers={teamMembers}
        />

        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={(taskId, updates) => onUpdateTask(taskId, updates)}
          onDeleteTask={onDeleteTask ? (taskId: number) => onDeleteTask(taskId) : undefined}
          teamMembers={teamMembers}
          userMap={userMap}
          isManager={isManager}
          currentUserId={currentUserId}
        />
      </div>
    </DndContext>
  );
};
