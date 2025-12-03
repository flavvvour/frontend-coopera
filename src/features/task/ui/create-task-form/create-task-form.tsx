// features/task/ui/create-task-form.tsx
import React, { useState } from 'react';
import type { TeamMember, Task } from '@/entities/team/index'; // Добавил Task
import './create-task-form.css';

interface CreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void; // 🔥 Исправил тип
  projectId: string;
  teamMembers: TeamMember[];
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projectId,
  teamMembers,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 5,
    assigneeId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreateTask({
        ...formData,
        projectId,
        status: 'open',
        priority: 'medium',
        tags: [],
      });
      setFormData({
        title: '',
        description: '',
        points: 5,
        assigneeId: '',
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
              onChange={e => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
            />
          </div>

          <div className="form-group">
            <label>Исполнитель (опционально)</label>
            <select
              value={formData.assigneeId}
              onChange={e => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
            >
              <option value="">Не назначен</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.userId}>
                  {member.username}
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
