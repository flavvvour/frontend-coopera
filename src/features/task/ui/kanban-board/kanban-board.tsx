/**
 * Kanban Board (FSD: features/task)
 *
 * IMPLEMENTED:
 * - Drag-and-drop functionality using @dnd-kit library
 * - 4 columns: To Do, In Progress, Review, Done
 * - Sortable tasks within columns
 * - Visual feedback during drag (drag overlay)
 * - Task status update on drop
 * - Keyboard accessibility for drag-and-drop
 * - TaskCard component with assignee info
 *
 * FUTURE:
 * - Column customization (add/remove/rename columns)
 * - Task filtering by assignee, priority, tags
 * - Swimlanes grouping (by assignee, priority)
 * - Column collapse/expand
 * - Task search within board
 * - Quick task editing (inline)
 */

import React, { useState } from 'react';
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
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TeamMember } from '@/entities/team/index';
import { CreateTaskForm } from '../create-task-form/create-task-form';
import { TaskDetailModal } from '../task-detail-modal';
import './kanban-board.css';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId: string;
  teamMembers: TeamMember[];
  isManager?: boolean; // Может ли пользователь создавать задачи
}

const columns = [
  { id: 'open', title: 'Бэклог', color: '#3b82f6' },
  { id: 'assigned', title: 'В работе', color: '#f59e0b' },
  { id: 'in_review', title: 'На проверке', color: '#8b5cf6' },
  { id: 'completed', title: 'Выполнено', color: '#10b981' },
] as const;

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
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Не открываем модалку при начале drag
    if (isSortableDragging || isDragging) return;
    
    e.stopPropagation();
    onTaskClick?.(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={handleClick}
    >
      <div className="task-header">
        <span className="task-points">⭐ {task.points}</span>
      </div>

      <h5 className="task-title">{task.title}</h5>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-footer">
        {task.assigneeName ? (
          <div className="task-assignee">
            <div className="assignee-avatar">
              {task.assigneeName.charAt(0).toUpperCase()}
            </div>
            <span className="assignee-name">{task.assigneeName}</span>
          </div>
        ) : (
          <span className="task-unassigned">👤 Не назначено</span>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  projectId,
  teamMembers,
  isManager = true, // По умолчанию true для обратной совместимости
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = active.id as string;
    const activeTask = tasks.find(t => t.id === activeTaskId);

    if (!activeTask) return;

    // Не обновляем здесь, чтобы избежать множественных обновлений
    // Обновление будет в handleDragEnd
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Проверяем, перетаскиваем ли на колонку
    const isOverColumn = columns.some(col => col.id === over.id);
    
    if (isOverColumn) {
      // Перетаскиваем на колонку - меняем статус
      const newStatus = over.id as Task['status'];
      if (activeTask.status !== newStatus) {
        onUpdateTask(activeTask.id, { status: newStatus });
      }
      return;
    }

    // Проверяем, перетаскиваем ли на задачу
    const overTask = tasks.find(t => t.id === over.id);
    if (!overTask) return;

    // Если задачи в разных колонках - меняем статус
    if (activeTask.status !== overTask.status) {
      onUpdateTask(activeTask.id, { status: overTask.status });
      return;
    }

    // Если перетаскиваем на задачу в той же колонке (сортировка)
    const columnTasks = tasks
      .filter(t => t.status === activeTask.status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = columnTasks.findIndex(t => t.id === active.id);
    const newIndex = columnTasks.findIndex(t => t.id === over.id);

    if (oldIndex === newIndex) return;

    // Рассчитываем новый order
    let newOrder: number;

    if (newIndex === 0) {
      // Перемещаем в начало - order меньше первой задачи
      newOrder = Math.max(0, (columnTasks[0].order || 0) - 1);
    } else if (newIndex === columnTasks.length - 1) {
      // Перемещаем в конец - order больше последней задачи
      newOrder = (columnTasks[columnTasks.length - 1].order || columnTasks.length - 1) + 1;
    } else if (oldIndex < newIndex) {
      // Перемещаем вниз - между newIndex-1 и newIndex
      const prevOrder = columnTasks[newIndex - 1]?.order || newIndex - 1;
      const nextOrder = columnTasks[newIndex]?.order || newIndex;
      newOrder = Math.floor((prevOrder + nextOrder) / 2);
    } else {
      // Перемещаем вверх - между newIndex и newIndex+1
      const prevOrder = columnTasks[newIndex]?.order || newIndex;
      const nextOrder = columnTasks[newIndex + 1]?.order || newIndex + 1;
      newOrder = Math.floor((prevOrder + nextOrder) / 2);
    }

    onUpdateTask(activeTask.id, { order: newOrder });
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {isManager && (
          <div className="kanban-actions">
            <button className="create-task-btn" onClick={() => setIsCreateTaskOpen(true)}>
              + Новая задача
            </button>
          </div>
        )}

        <div className="kanban-columns">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id as Task['status']);
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
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id} className="column-content">
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                    ))}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>

        <CreateTaskForm
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreateTask={onCreateTask}
          projectId={projectId}
          teamMembers={teamMembers}
        />

        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          teamMembers={teamMembers}
          isManager={isManager}
        />
      </div>
    </DndContext>
  );
};
