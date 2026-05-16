import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Copy, Check, X, ArrowRight,
  BookOpen, GraduationCap, Code2, Briefcase, Palette,
  Globe, Heart, Users, Layers, Rocket, Trophy,
  Building2, Leaf, Wrench, Camera, Music, Star, Zap, FlaskConical,
} from 'lucide-react';
import { useHookGetUser } from '../../hooks/useHookGetUser';
import { useHookPostTeam } from '../../hooks/useHookPostTeam';
import { addActivity } from '@/widgets/notifications';

function encodeInviteCode(teamId: number): string {
  return teamId.toString(36).toUpperCase().padStart(6, '0');
}

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  BookOpen, GraduationCap, Code2, Briefcase, Palette,
  Globe, Heart, Users, Layers, Rocket, Trophy,
  Building2, Leaf, Wrench, Camera, Music, Star, Zap, FlaskConical,
};

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_ICON_NAMES = Object.keys(TEAM_ICON_MAP);

export function TeamIcon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const Icon = TEAM_ICON_MAP[name];
  if (Icon) return <Icon size={size} color={color} />;
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{name}</span>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TEAM_COLORS = ['#d4ede6','#fde8d8','#e8ddf7','#ddeedd','#fef0d4','#f5dde5','#d8eef5'];

type TeamTypeId = 'study' | 'volun' | 'commun' | 'other';

const TYPE_PRESETS: Record<TeamTypeId, { icons: string[]; colors: string[]; defaultIcon: string; defaultColor: string; hint: string }> = {
  study: {
    icons:        ['BookOpen','GraduationCap','FlaskConical','Code2','Layers','Star'],
    colors:       ['#dbe4f8','#d8eef5','#e8ddf7','#ddeedd'],
    defaultIcon:  'GraduationCap',
    defaultColor: '#dbe4f8',
    hint:         'Учёба, исследования, дипломные работы',
  },
  volun: {
    icons:        ['Heart','Globe','Leaf','Users','Trophy','Zap'],
    colors:       ['#d4ede6','#fde8d8','#ddeedd','#fef0d4'],
    defaultIcon:  'Heart',
    defaultColor: '#d4ede6',
    hint:         'НКО, волонтёрство, помощь людям',
  },
  commun: {
    icons:        ['Users','Building2','Music','Camera','Star','Globe'],
    colors:       ['#fef0d4','#f5dde5','#fde8d8','#e8ddf7'],
    defaultIcon:  'Users',
    defaultColor: '#fef0d4',
    hint:         'Клубы, соседи, сообщества по интересам',
  },
  other: {
    icons:        ['Rocket','Briefcase','Wrench','Palette','Zap','Layers'],
    colors:       ['#e8ddf7','#d8eef5','#fde8d8','#d4ede6'],
    defaultIcon:  'Rocket',
    defaultColor: '#e8ddf7',
    hint:         'Любой проект со своей структурой',
  },
};

const TEAM_TYPES: { id: TeamTypeId; t: string; d: string }[] = [
  { id: 'study',  t: 'Учёба',        d: 'курсовая, ВКР, диплом' },
  { id: 'volun',  t: 'Волонтёрство', d: 'НКО, помощь, акции' },
  { id: 'commun', t: 'Сообщество',   d: 'соседи, кружок, клуб' },
  { id: 'other',  t: 'Другое',       d: 'своя структура задач' },
];

type CreateStep = 'form' | 'success';

interface CreateTeamModalProps {
  onClose: () => void;
}

export function CreateTeamModal({ onClose }: CreateTeamModalProps) {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username') ?? '';
  const { data } = useHookGetUser(username);
  const { createTeam, loading: creating, error: createError } = useHookPostTeam();

  const [createStep, setCreateStep] = useState<CreateStep>('form');
  const [newTeamName, setNewTeamName] = useState('');
  const [teamType, setTeamType] = useState<TeamTypeId>('study');
  const [teamEmoji, setTeamEmoji] = useState(TYPE_PRESETS.study.defaultIcon);
  const [teamColor, setTeamColor] = useState(TYPE_PRESETS.study.defaultColor);
  const [nameError, setNameError] = useState('');
  const [createdTeamId, setCreatedTeamId] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const preset = TYPE_PRESETS[teamType];
  const inviteCode = createdTeamId ? encodeInviteCode(createdTeamId) : '';

  const switchType = (id: TeamTypeId) => {
    setTeamType(id);
    setTeamEmoji(TYPE_PRESETS[id].defaultIcon);
    setTeamColor(TYPE_PRESETS[id].defaultColor);
  };

  const handleClose = () => {
    if (createStep === 'success' && createdTeamId) navigate(`/dashboard/teams/${createdTeamId}`);
    onClose();
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) { setNameError('Введите название команды'); return; }
    if (!data?.id) return;
    try {
      const created = await createTeam(data.id, newTeamName.trim(), teamEmoji, teamColor);
      setCreatedTeamId(created.id);
      setCreateStep('success');
      window.dispatchEvent(new CustomEvent('coop_team_created'));
      addActivity({
        type: 'team_created',
        title: `Команда «${created.name}» создана`,
        detail: `«${created.name}» создана`,
        teamId: created.id,
        teamEmoji: teamEmoji || undefined,
        teamColor: teamColor || undefined,
      });
    } catch { /* empty */ }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
        <button className="kb-detail-close" onClick={handleClose}><X size={16} /></button>

        <div className="kb-create-header">
          {createStep === 'form' ? (
            <>
              <h2 className="h-display kb-create-title">Создать команду</h2>
              <p className="kb-create-subtitle">Выберите тип — иконки и цвета подберутся сами</p>
            </>
          ) : (
            <>
              <h2 className="h-display kb-create-title">Команда создана!</h2>
              <p className="kb-create-subtitle">Поделитесь кодом с участниками</p>
            </>
          )}
        </div>

        {createStep === 'form' && (
          <>
            <div className="kb-create-body">
              {createError && (
                <div className="error-message" style={{ marginBottom: 4 }}>
                  <AlertTriangle size={14} style={{ marginRight: 6 }} /> {createError.message}
                </div>
              )}

              {/* Тип — первым */}
              <div className="kb-create-field">
                <div className="kb-create-label">Тип команды</div>
                <div className="ct-type-grid">
                  {TEAM_TYPES.map(tp => (
                    <button
                      key={tp.id}
                      className={`ct-type-btn ${teamType === tp.id ? 'active' : ''}`}
                      onClick={() => switchType(tp.id)}
                      type="button"
                    >
                      <div className="ct-type-icon">
                        <TeamIcon name={TYPE_PRESETS[tp.id].defaultIcon} size={14} />
                      </div>
                      <div className="ct-type-title">{tp.t}</div>
                      <div className="ct-type-desc">{tp.d}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Название + превью */}
              <div className="kb-create-field">
                <div className="kb-create-label">Название</div>
                <div className="ct-avatar-row">
                  <div className="ct-avatar-preview" style={{ background: teamColor }}>
                    <TeamIcon name={teamEmoji} size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      className={`coop-input ${nameError ? 'coop-input--error' : ''}`}
                      type="text"
                      value={newTeamName}
                      onChange={e => { setNewTeamName(e.target.value); setNameError(''); }}
                      placeholder="Название команды"
                      disabled={creating}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleCreateTeam(); }}
                    />
                    {nameError && <p className="coop-field-error">{nameError}</p>}
                  </div>
                </div>
              </div>

              {/* Иконки — только для этого типа */}
              <div className="kb-create-field">
                <div className="kb-create-label">Иконка</div>
                <div className="ct-emoji-row">
                  {preset.icons.map(name => (
                    <button
                      key={name}
                      className={`ct-emoji-btn ${teamEmoji === name ? 'active' : ''}`}
                      onClick={() => setTeamEmoji(name)}
                      type="button"
                    >
                      <TeamIcon name={name} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Цвета — только для этого типа */}
              <div className="kb-create-field">
                <div className="kb-create-label">Цвет</div>
                <div className="ct-color-row">
                  {preset.colors.map(c => (
                    <button key={c} className={`ct-color-btn ${teamColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setTeamColor(c)} type="button" />
                  ))}
                </div>
              </div>
            </div>

            <div className="kb-create-footer">
              <button className="btn btn-ghost btn-sm" onClick={handleClose} disabled={creating}>Отмена</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateTeam} disabled={creating || !newTeamName.trim()}>
                {creating ? 'Создание…' : 'Создать команду'}
              </button>
            </div>
          </>
        )}

        {createStep === 'success' && (
          <>
            <div className="kb-create-body">
              <div className="invite-code-box ct-invite-gradient">
                <div className="ct-invite-eyebrow">код приглашения</div>
                <span className="invite-code">{inviteCode}</span>
                <button className="invite-copy-btn" onClick={copyCode}>
                  {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                  {codeCopied ? 'Скопировано' : 'Скопировать'}
                </button>
              </div>
            </div>
            <div className="kb-create-footer">
              <button className="btn btn-primary btn-sm row gap-6" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { onClose(); navigate(`/dashboard/teams/${createdTeamId}`); }}>
                Перейти в команду <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
