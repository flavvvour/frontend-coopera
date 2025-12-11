// features/task/ui/create-task-form.tsx
import React, { useState } from 'react';
import type { CreateTaskRequest } from '@/entities/task';
import type { TeamMember } from '@/entities/team';
import './create-task-form.css';

// Тип для формы (без current_user_id, его добавит родитель)
type CreateTaskFormData = Omit<CreateTaskRequest, 'current_user_id'>;

interface CreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: CreateTaskFormData) => void;
  teamId: number;
  teamMembers: TeamMember[];
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  teamId,
  teamMembers,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 5,
    assigned_to: undefined as number | undefined, // snake_case как в API
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      // Собираем данные в формате API
      onCreateTask({
        team_id: teamId,
        title: formData.title,
        description: formData.description || undefined,
        points: formData.points,
        assigned_to: formData.assigned_to,
        // current_user_id добавится на уровне вызова компонента
      });

      // Сброс формы
      setFormData({
        title: '',
        description: '',
        points: 5,
        assigned_to: undefined,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Создать задачу</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Название задачи *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Что нужно сделать?"
              required
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Подробное описание задачи..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Баллы</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.points}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  points: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Исполнитель (опционально)</label>
            <select
              value={formData.assigned_to || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  assigned_to: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            >
              <option value="">Не назначен</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.memberId}>
                  {member.username} ({member.role === 'manager' ? '👑' : '👤'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={!formData.title.trim()}>
              Создать задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
