import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, AlertTriangle, UserX, Pencil, X } from 'lucide-react';
import { TeamIcon, TEAM_ICON_NAMES, TEAM_COLORS } from '@/shared/ui/team-icon';
import { useHookGetUser } from '@/entities/user';
import { useHookDeleteTeam, useHookPatchTeamMeta } from '@/entities/team';
import { CreateTeamModal } from '@/features/create-team';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { queryKeys } from '@/shared/query-keys';
import { addActivity } from '@/entities/activity';
import { getTeamEmoji } from '@/shared/lib/team-emoji';
import './user-teams-page.css';

function pluralTeams(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} команда`;
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return `${n} команды`;
  return `${n} команд`;
}

export function UserTeamsPage({ username }: { username: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [editingTeam, setEditingTeam] = useState<{ id: number; name: string; emoji?: string; color?: string } | null>(null);
  const [editIcon, setEditIcon] = useState('BookOpen');
  const [editColor, setEditColor] = useState('#d4ede6');

  const { data, loading, error } = useHookGetUser(username);
  const { deleteTeam, loading: deleting } = useHookDeleteTeam();
  const { patchMeta, loading: patching } = useHookPatchTeamMeta();

  const openEditMeta = (e: React.MouseEvent, team: { id: number; name: string; emoji?: string; color?: string }) => {
    e.stopPropagation();
    setEditIcon(team.emoji || getTeamEmoji(team.name));
    setEditColor(team.color || '#d4ede6');
    setEditingTeam(team);
  };

  const saveEditMeta = async () => {
    if (!editingTeam || !data?.id) return;
    try {
      await patchMeta(editingTeam.id, data.id, editIcon, editColor);
      setEditingTeam(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(username) });
    } catch { /* ignore */ }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!teamId || !data?.id) return;
    const team = data.teams?.find(t => t.id === teamId);
    try {
      await deleteTeam(teamId, data.id);
      setDeleteConfirm(null);
      addActivity({
        type: 'task_deleted',
        title: team?.name ?? 'Команда',
        detail: `${username} · удалил команду`,
      });
      void queryClient.invalidateQueries({ queryKey: ['user'] });
      void queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
    } catch { /* ignore */ }
  };

  if (loading)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1, 2].map(i => <Skeleton key={i} height={72} borderRadius="var(--r)" />)}
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon"><AlertTriangle size={28} color="var(--ink-3)" /></div>
        <h3>Ошибка загрузки</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()} className="retry-button">Попробовать снова</button>
      </div>
    );

  if (!data)
    return (
      <div className="not-found-container">
        <div className="not-found-icon"><UserX size={28} color="var(--ink-3)" /></div>
        <h3>Пользователь не найден</h3>
        <p>Пользователь «{username}» не существует</p>
      </div>
    );

  return (
    <div className="user-teams-container">

      {/* Toolbar */}
      <div className="kb-toolbar">
        <div className="kb-toolbar-title">
          <h1 className="kb-team-name h-display">Мои команды</h1>
          <span className="kb-total mono">{pluralTeams(data.teams.length)}</span>
        </div>
        <div className="kb-toolbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            <Plus size={13} /> Создать команду
          </button>
        </div>
      </div>

      {/* Grid */}
      {data.teams.length === 0 ? (
        <div className="ut-empty">
          <div className="ut-empty-icon"><Users size={28} /></div>
          <h3>Нет команд</h3>
          <p>Создайте первую команду и пригласите участников</p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Создать команду
          </button>
        </div>
      ) : (
        <div className="ut-grid">
          {data.teams.map(team => {
            const emoji = team.emoji || getTeamEmoji(team.name);
            const color = team.color || null;
            const isManager = team.role === 'manager';
            return (
              <div
                key={team.id}
                className="ut-card"
                onClick={() => navigate(`/dashboard/teams/${team.id}`)}
              >
                <button
                  className="ut-edit-btn"
                  onClick={e => openEditMeta(e, { id: team.id, name: team.name, emoji: team.emoji, color: team.color })}
                  title="Изменить иконку"
                >
                  <Pencil size={12} />
                </button>
                {isManager && (
                  <button
                    className="ut-delete-btn"
                    onClick={e => { e.stopPropagation(); setDeleteConfirm({ id: team.id, name: team.name }); }}
                    disabled={deleting}
                    title="Удалить команду"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <div className="ut-card-icon" style={color ? { background: color } : undefined}>
                  <TeamIcon name={emoji} size={22} />
                </div>
                <div className="ut-card-body">
                  <h3 className="ut-card-name">{team.name}</h3>
                  <div className="ut-card-meta">
                    <span className={`ut-role-badge ${isManager ? 'manager' : 'member'}`}>
                      {isManager ? 'Менеджер' : 'Участник'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && <CreateTeamModal onClose={() => setModalOpen(false)} />}

      {deleteConfirm && (
        <ConfirmModal
          title="Удалить команду?"
          description={`«${deleteConfirm.name}» будет удалена. Это действие нельзя отменить.`}
          confirmLabel="Удалить"
          onConfirm={() => { handleDeleteTeam(deleteConfirm.id); setDeleteConfirm(null); }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {editingTeam && (
        <div className="modal-overlay" onClick={() => setEditingTeam(null)}>
          <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
            <button className="kb-detail-close" onClick={() => setEditingTeam(null)}><X size={16} /></button>
            <div className="kb-create-header">
              <h2 className="h-display kb-create-title">Иконка команды</h2>
              <p className="kb-create-subtitle">{editingTeam.name}</p>
            </div>
            <div className="kb-create-body">
              {/* Превью */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <div className="ct-avatar-preview" style={{ background: editColor, width: 56, height: 56, fontSize: 28, borderRadius: 16 }}>
                  <TeamIcon name={editIcon} size={28} />
                </div>
              </div>
              {/* Иконки */}
              <div className="kb-create-field">
                <div className="kb-create-label">Иконка</div>
                <div className="ct-emoji-row">
                  {TEAM_ICON_NAMES.map(name => (
                    <button
                      key={name}
                      className={`ct-emoji-btn ${editIcon === name ? 'active' : ''}`}
                      onClick={() => setEditIcon(name)}
                      type="button"
                    >
                      <TeamIcon name={name} size={16} />
                    </button>
                  ))}
                </div>
              </div>
              {/* Цвет */}
              <div className="kb-create-field">
                <div className="kb-create-label">Цвет</div>
                <div className="ct-color-row">
                  {TEAM_COLORS.map(c => (
                    <button key={c} className={`ct-color-btn ${editColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setEditColor(c)} type="button" />
                  ))}
                </div>
              </div>
            </div>
            <div className="kb-create-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingTeam(null)}>Отмена</button>
              <button className="btn btn-primary btn-sm" onClick={saveEditMeta} disabled={patching}>
                {patching ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
