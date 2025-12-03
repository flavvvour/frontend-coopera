// features/team/create-team-form.tsx
import React, { useState } from 'react';
import './create-team-form.css';

interface CreateTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (teamData: { name: string; description: string }) => void;
  isLoading?: boolean;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({
  isOpen,
  onClose,
  onCreateTeam,
  isLoading: externalLoading,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!name.trim() || externalLoading) {
      return;
    }

    // Вызываем только callback родителя - он сам создаст команду
    onCreateTeam({
      name: name.trim(),
      description: description.trim(),
    });

    // Сбрасываем форму
    setName('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Создать новую команду</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="team-form">
          <div className="form-group">
            <label htmlFor="team-name">Название команды *</label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Разработка фронтенда"
              required
              disabled={externalLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="team-description">Описание</label>
            <textarea
              id="team-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишите цель команды..."
              rows={4}
              disabled={externalLoading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={externalLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim() || externalLoading}
            >
              {externalLoading ? 'Создание...' : 'Создать команду'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
