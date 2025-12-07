/**
 * Team Members Modal (FSD: features/team)
 *
 * Модальное окно для управления участниками команды
 * - Просмотр всех участников
 * - Приглашение новых участников (для менеджера)
 * - Удаление участников (для менеджера)
 */

import React, { useState, useEffect } from 'react';
import type { TeamMember } from '@/entities/team';
import './team-members-modal.css';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  currentUserId?: string;
  isManager?: boolean;
  onRemoveMember?: (userId: string) => void;
  onInviteMember?: (username: string) => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUserId,
  isManager = false,
  onRemoveMember,
  onInviteMember,
}) => {
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Закрываем модалку при нажатии Escape
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

  if (!isOpen) return null;

  const sortedMembers = [...members].sort((a, b) => {
    // Менеджеры в начале
    if (a.role === 'manager' && b.role !== 'manager') return -1;
    if (a.role !== 'manager' && b.role === 'manager') return 1;
    // Затем по username
    return a.username.localeCompare(b.username);
  });

  const managersCount = members.filter(m => m.role === 'manager').length;
  const membersCount = members.filter(m => m.role === 'member').length;

  const handleInvite = async () => {
    if (!inviteUsername.trim() || !onInviteMember) return;

    setIsInviting(true);
    try {
      await onInviteMember(inviteUsername.trim());
      setInviteUsername('');
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="members-modal-backdrop" onClick={handleBackdropClick}>
      <div className="members-modal">
        <div className="members-modal-header">
          <div>
            <h2>Участники команды</h2>
            <div className="members-stats-header">
              <span className="stat-item">
                👑 {managersCount} {managersCount === 1 ? 'менеджер' : 'менеджера'}
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">
                👤 {membersCount} {membersCount === 1 ? 'участник' : 'участников'}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="members-modal-body">
          {/* Форма приглашения (только для менеджера) */}
          {isManager && onInviteMember && (
            <div className="invite-section">
              <div className="invite-form">
                <input
                  type="text"
                  placeholder="Введите username участника"
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleInvite();
                  }}
                  disabled={isInviting}
                  className="invite-input"
                />
                <button
                  onClick={handleInvite}
                  disabled={!inviteUsername.trim() || isInviting}
                  className="invite-btn"
                >
                  {isInviting ? 'Приглашаю...' : '+ Пригласить'}
                </button>
              </div>
              <p className="invite-hint">
                💡 Участник должен быть зарегистрирован в системе
              </p>
            </div>
          )}

          {/* Список участников */}
          <div className="members-modal-list">
            {sortedMembers.map(member => {
              const isCurrentUser = member.userId === currentUserId;
              const canRemove = isManager && !isCurrentUser && member.role !== 'manager';

              return (
                <div
                  key={member.userId}
                  className={`member-item ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="member-avatar-modal">
                    {member.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="member-info-modal">
                    <div className="member-name-row">
                      <span className="member-name-text">{member.username}</span>
                      {isCurrentUser && <span className="you-badge-modal">Вы</span>}
                    </div>
                    <div className="member-details-row">
                      <span className={`role-badge-modal ${member.role}`}>
                        {member.role === 'manager' ? '👑 Менеджер' : '👤 Участник'}
                      </span>
                      {member.points !== undefined && (
                        <>
                          <span className="detail-divider-modal">•</span>
                          <span className="member-points-modal">⭐ {member.points}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {canRemove && onRemoveMember && (
                    <button
                      className="remove-btn-modal"
                      onClick={() => {
                        if (window.confirm(`Удалить ${member.username} из команды?`)) {
                          onRemoveMember(member.userId);
                        }
                      }}
                      aria-label="Удалить участника"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="no-members-modal">
              <p>В команде пока нет участников</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
