// features/team/ui/invite-member-form.tsx
import React, { useState } from 'react';
import './invite-member-form.css';

interface InviteMemberFormProps {
  teamId: number;
  onInvite: (username: string, teamId: number) => Promise<void>; // ✅ Измените на username
  onClose: () => void;
}

export const InviteMemberForm: React.FC<InviteMemberFormProps> = ({
  teamId,
  onInvite,
  onClose,
}) => {
  const [username, setUsername] = useState(''); // ✅ Измените с email на username
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Введите username пользователя');
      return;
    }

    // Можно добавить базовую валидацию username
    if (username.length < 3) {
      setError('Username должен быть не менее 3 символов');
      return;
    }

    setLoading(true);
    try {
      await onInvite(username, teamId); // ✅ Теперь передаем username и teamId
      setUsername('');
      // Можно показать сообщение об успехе и закрыть
      // или оставить форму открытой для добавления еще одного пользователя
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Добавить участника в команду</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invite-form">
          <div className="form-group">
            <label>Username пользователя *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Введите username"
              disabled={loading}
              required
              autoFocus
            />
            <div className="form-hint">💡 Участник должен быть зарегистрирован в системе</div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={!username.trim() || loading}>
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
