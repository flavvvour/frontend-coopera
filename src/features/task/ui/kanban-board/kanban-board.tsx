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
import './kanban-board.css';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projectId: string;
  teamMembers: TeamMember[];
}

const columns = [
  { id: 'todo', title: 'Бэклог', color: '#3b82f6' },
  { id: 'in-progress', title: 'В работе', color: '#f59e0b' },
  { id: 'review', title: 'На проверке', color: '#8b5cf6' },
  { id: 'done', title: 'Выполнено', color: '#10b981' }
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
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <div className="task-header">
        <span className={`task-priority priority-${task.priority}`}>
          {task.priority === 'high' ? '!' : task.priority === 'medium' ? '•' : ''}
        </span>
        <span className="task-points">{task.points}</span>
      </div>
      
      <h5 className="task-title">{task.title}</h5>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-footer">
        {task.assigneeName && (
          <span className="task-assignee">{task.assigneeName}</span>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
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
  projectId,
  teamMembers
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTaskId = active.id as string;
    const activeTask = tasks.find(t => t.id === activeTaskId);
    
    if (!activeTask) return;

    // Проверяем, перетаскиваем ли на колонку
    const isOverColumn = columns.some(col => col.id === over.id);
    
    if (isOverColumn) {
      // Перетаскиваем на пустую колонку
      const newStatus = over.id as Task['status'];
      if (activeTask.status !== newStatus) {
        onUpdateTask(activeTaskId, { status: newStatus });
      }
    } else {
      // Проверяем, перетаскиваем ли на другую задачу
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && activeTask.status !== overTask.status) {
        // Перетаскиваем на задачу в другой колонке - меняем статус
        onUpdateTask(activeTaskId, { status: overTask.status });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    if (active.id === over.id) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    
    // Проверяем, перетаскиваем ли на задачу или на колонку
    const overTask = tasks.find(t => t.id === over.id);
    
    if (!activeTask) return;
    
    // Если перетаскиваем на задачу в той же колонке (сортировка)
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = tasks
        .filter(t => t.status === activeTask.status)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const oldIndex = columnTasks.findIndex(t => t.id === active.id);
      const newIndex = columnTasks.findIndex(t => t.id === over.id);
      
      if (oldIndex === newIndex) return;
      
      // Рассчитываем новый order:
      // Если перемещаем вниз, берем order целевой задачи + 1
      // Если перемещаем вверх, берем order целевой задачи
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
    }
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
        <div className="kanban-actions">
          <button 
            className="create-task-btn"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            + Новая задача
          </button>
        </div>

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
                      <TaskCard key={task.id} task={task} />
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
      </div>
    </DndContext>
  );
};