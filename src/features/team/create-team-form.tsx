// features/team/create-team-form.tsx
import React, { useState } from 'react';
import { useTeamManagement } from './model/use-team-management';
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
  onCreateTeam
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createTeam } = useTeamManagement(); // ← ДОБАВЬТЕ ХУК

  const handleSubmit = async (e: React.FormEvent) => { // ← СДЕЛАЙТЕ ASYNC
    e.preventDefault();
    e.stopPropagation();
    
    if (name.trim()) {
      setIsLoading(true);
      
      try {
        console.log('🔄 Creating team...');
        
        // ← ВЫЗОВ АПИ ДОБАВЬТЕ ЗДЕСЬ
        const result = await createTeam({
          name: name.trim(),
          description: description.trim(),
          userId: 1 // ← временно, нужно получить ID текущего пользователя
        });
        
        console.log('✅ Team created successfully:', result);
        
        // Вызываем колбэк родительского компонента
        onCreateTeam({
          name: name.trim(),
          description: description.trim()
        });
        
        // Сбрасываем форму
        setName('');
        setDescription('');
        onClose();
        
      } catch (error) {
        console.error('❌ Failed to create team:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Создать новую команду</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="team-form">
          <div className="form-group">
            <label htmlFor="team-name">Название команды *</label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Разработка фронтенда"
              required
              disabled={isLoading} // ← БЛОКИРУЕМ ПРИ ЗАГРУЗКЕ
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="team-description">Описание</label>
            <textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите цель команды..."
              rows={4}
              disabled={isLoading} // ← БЛОКИРУЕМ ПРИ ЗАГРУЗКЕ
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={isLoading} // ← БЛОКИРУЕМ ПРИ ЗАГРУЗКЕ
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!name.trim() || isLoading} // ← БЛОКИРУЕМ ПРИ ЗАГРУЗКЕ
            >
              {isLoading ? 'Создание...' : 'Создать команду'} {/* ← ИНДИКАТОР ЗАГРУЗКИ */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};