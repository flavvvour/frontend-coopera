/**
 * Team Members Widget (FSD: widgets/team-members)
 *
 * Отображение всех участников команды с их ролями, статусом и статистикой
 */

import React from 'react';
import './team-members.css';

// Используем тот же интерфейс, что и в TeamDetail
interface TeamMember {
  id: string;
  userId: string;
  username: string;
  role: 'manager' | 'member';
  joinedAt: string;
  points: number;
  email?: string;
  avatar?: string;
}

interface TeamMembersProps {
  members: TeamMember[];
  currentUserId?: string;
  isManager?: boolean;
  onRemoveMember?: (userId: string) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
  members,
  currentUserId,
  isManager = false,
  onRemoveMember,
}) => {
  const sortedMembers = [...members].sort((a, b) => {
    // Менеджеры в начале
    if (a.role === 'manager' && b.role !== 'manager') return -1;
    if (a.role !== 'manager' && b.role === 'manager') return 1;
    // Затем по username
    return a.username.localeCompare(b.username);
  });

  const managersCount = members.filter(m => m.role === 'manager').length;
  const membersCount = members.filter(m => m.role === 'member').length;

  return (
    <div className="team-members-widget">
      <div className="members-header">
        <h3>Участники команды</h3>
        <div className="members-stats">
          <span className="stat">
            <span className="stat-icon">👑</span>
            {managersCount} {managersCount === 1 ? 'менеджер' : 'менеджера'}
          </span>
          <span className="stat-divider">•</span>
          <span className="stat">
            <span className="stat-icon">👤</span>
            {membersCount} {membersCount === 1 ? 'участник' : 'участников'}
          </span>
        </div>
      </div>

      <div className="members-list">
        {sortedMembers.map(member => {
          const isCurrentUser = member.userId === currentUserId;
          const canRemove = isManager && !isCurrentUser && member.role !== 'manager';

          return (
            <div
              key={member.id} // Используем id вместо userId
              className={`member-card ${isCurrentUser ? 'current-user' : ''}`}
            >
              <div className="member-avatar">{member.username.charAt(0).toUpperCase()}</div>

              <div className="member-info">
                <div className="member-name">
                  {member.username}
                  {isCurrentUser && <span className="you-badge">Вы</span>}
                </div>
                <div className="member-details">
                  <span className={`role-badge ${member.role}`}>
                    {member.role === 'manager' ? '👑 Менеджер' : '👤 Участник'}
                  </span>
                  {member.points !== undefined && (
                    <>
                      <span className="detail-divider">•</span>
                      <span className="member-points">⭐ {member.points} очков</span>
                    </>
                  )}
                </div>
                {member.joinedAt && (
                  <div className="member-joined">
                    Присоединился:{' '}
                    {new Date(member.joinedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>

              {canRemove && onRemoveMember && (
                <button
                  className="remove-member-btn"
                  onClick={() => {
                    if (window.confirm(`Удалить ${member.username} из команды?`)) {
                      onRemoveMember(member.userId);
                    }
                  }}
                  aria-label="Удалить участника"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="no-members">
          <p>В команде пока нет участников</p>
        </div>
      )}
    </div>
  );
};