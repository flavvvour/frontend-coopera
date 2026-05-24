import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Pencil, Trash2, User, Send, Trash } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ANIMATION_TASK_MOVE_MS, ANIMATION_CELEBRATION_MS, SECONDS_IN_HOUR, SECONDS_IN_DAY } from '@/shared/lib/constants';
import { useHookPostTask, useHookGetTask, useHookDeleteTask, useHookUpdateTask, useHookUpdateTaskStatus, useTaskComments } from '@/entities/task';
import { addActivity } from '@/entities/activity';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
  PatchTaskStatus,
} from '@/entities/task';
import { useAuthStore } from '@/shared/store';
import './kanban-board.css';

const STATUS_LABELS: Record<string, string> = {
  open: 'Бэклог', assigned: 'В работе', in_review: 'На проверке', completed: 'Выполнено',
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:      { label: 'Бэклог',       color: '#8a8175',       bg: 'rgba(138,129,117,.12)', dot: '#8a8175'       },
  assigned:  { label: 'В работе',     color: 'var(--accent)', bg: 'rgba(91,141,239,.12)',  dot: 'var(--accent)' },
  in_review: { label: 'На проверке',  color: '#b07a10',       bg: 'rgba(220,150,40,.13)',  dot: '#b07a10'       },
  completed: { label: 'Выполнено',    color: 'var(--good)',   bg: 'rgba(74,138,91,.12)',   dot: 'var(--good)'   },
};

export interface KanbanBoardProps {
  teamId: number;
  teamName?: string;
  teamEmoji?: string;
  teamColor?: string;
  currentUserId: number;
  members: Array<{ id: number; userId?: number; username: string; name?: string; role?: string }>;
  canCreateTasks?: boolean;
  canEditTasks?: boolean;
  canDeleteTasks?: boolean;
  isManager?: boolean;
  onInvite?: () => void;
  onMemberClick?: (memberId: number) => void;
}

type ColId = 'open' | 'assigned' | 'in_review' | 'completed';

const COLUMNS: { id: ColId; title: string; color: string; dot: string }[] = [
  { id: 'open',      title: 'Бэклог',      color: '#8a8175',       dot: '#8a8175' },
  { id: 'assigned',  title: 'В работе',    color: 'var(--accent)', dot: 'var(--accent)' },
  { id: 'in_review', title: 'На проверке', color: '#b07a10',       dot: '#b07a10' },
  { id: 'completed', title: 'Выполнено',   color: 'var(--good)',   dot: 'var(--good)' },
];

const MEMBER_COLORS = [
  '#5b8def','#3b7dd8','#6fa3f5','#4c8ee8','#7ab3ff','#3572cc','#88b8f8','#2e67c4',
];

function getMemberColor(id: number) { return MEMBER_COLORS[id % MEMBER_COLORS.length]; }

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

const TAG_PALETTE = [
  { bg: 'rgba(91,141,239,.15)',  fg: '#3058c4' },
  { bg: 'rgba(74,138,91,.18)',   fg: '#2e6b3a' },
  { bg: 'rgba(200,124,209,.18)', fg: '#7a3d8a' },
  { bg: 'rgba(232,150,80,.18)',  fg: '#a0520d' },
  { bg: 'rgba(109,184,184,.20)', fg: '#1d6b6b' },
  { bg: 'rgba(232,90,90,.14)',   fg: '#b03030' },
  { bg: 'rgba(180,155,90,.18)',  fg: '#7a5c10' },
  { bg: 'rgba(160,120,220,.18)', fg: '#5a2d9a' },
];

function getTagColor(tag: string) {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}

type Priority = 'low' | 'medium' | 'high';

const PRIORITY_META: Record<Priority, { label: string; short: string; color: string; border: string }> = {
  low:    { label: 'Низкий',   short: '',    color: 'var(--ink-3)',   border: 'transparent' },
  medium: { label: 'Средний',  short: 'ср',  color: 'var(--accent)', border: 'var(--accent)' },
  high:   { label: 'Высокий',  short: 'выс', color: 'var(--danger)',  border: 'var(--danger)' },
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'только что';
  if (diff < SECONDS_IN_HOUR) return `${Math.floor(diff / 60)} мин`;
  if (diff < SECONDS_IN_DAY) return `${Math.floor(diff / SECONDS_IN_HOUR)} ч`;
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function pluralTasks(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} задача`;
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return `${n} задачи`;
  return `${n} задач`;
}

/* ---- Member avatar with photo fallback ---- */
function MemberAvatar({ userId, name, size, bg, className }: { userId?: number; name: string; size: number; bg: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const initials = getInitials(name);
  return (
    <span className={className ?? 'avatar'} style={{ background: bg, width: size, height: size, fontSize: size * 0.38, flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && initials}
      {userId && (
        <img
          src={`/api/v1/users/${userId}/photo`}
          alt={name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </span>
  );
}

/* ---- Confetti particles ---- */
function Confetti() {
  const colors = ['var(--accent)','var(--good)','var(--warn)','#f4c243','#c084fc'];
  return (
    <div className="kb-confetti" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="kb-confetti-dot"
          style={{
            left: `${10 + i * 8}%`,
            background: colors[i % colors.length],
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---- Task detail modal with comments ---- */
interface TaskDetailModalProps {
  task: Task;
  members: Array<{ id: number; userId?: number; username: string }>;
  currentUserId: number;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  deleting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
  onProfileClick: (memberId: number) => void;
}

function TaskDetailModal({ task, members, currentUserId, canEditTasks, canDeleteTasks, deleting, onClose, onEdit, onDelete, onProfileClick }: TaskDetailModalProps) {
  const sm = STATUS_META[task.status] ?? STATUS_META.open;
  const assigneeName = members.find(m => m.id === task.assignedToMember)?.username ?? '—';
  const assigneeColor = getMemberColor(task.assignedToMember ?? 0);
  const currentUsername = useAuthStore.getState().username ?? 'Участник';

  const { comments, loading: commentsLoading, send, remove } = useTaskComments(task.id);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSend = async () => {
    const text = commentText.trim();
    if (!text || sending) return;
    setSending(true);
    setCommentText('');
    await send(currentUserId, currentUsername, text);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="kb-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="kb-detail-close" onClick={onClose}><X size={16} /></button>

        <h2 className="h-display kb-detail-title">{task.title}</h2>

        {/* Two-column body */}
        <div className="kb-detail-body">
          <div className="kb-detail-main">
            <div className="kb-detail-section">
              <div className="kb-detail-section-label">Описание</div>
              {task.description
                ? <p className="kb-detail-desc">{task.description}</p>
                : <p className="kb-detail-desc" style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Описание не добавлено</p>
              }
            </div>

            {/* Comments */}
            <div className="kb-comments">
              <div className="kb-comments-label">
                Комментарии{comments.length > 0 && <span className="kb-comments-count"> · {comments.length}</span>}
              </div>

              <div className="kb-comments-list">
                {commentsLoading && <div className="kb-comments-empty">Загрузка…</div>}
                {!commentsLoading && comments.length === 0 && (
                  <div className="kb-comments-empty">Пока нет комментариев</div>
                )}
                {comments.map(c => {
                  const avatarColor = getMemberColor(members.find(m => m.userId === c.user_id)?.id ?? (c.user_id % 8));
                  const isOwn = c.user_id === currentUserId;
                  return (
                    <div key={c.id} className="kb-comment-item">
                      <MemberAvatar userId={c.user_id} name={c.username} size={26} bg={avatarColor} className="kb-comment-avatar" />
                      <div className="kb-comment-body">
                        <div className="kb-comment-header">
                          <span className="kb-comment-author">{c.username}</span>
                          <span className="kb-comment-time">{timeAgo(new Date(c.created_at).getTime())}</span>
                          {isOwn && c.id > 0 && (
                            <button className="kb-comment-delete" onClick={() => remove(c.id, currentUserId)} title="Удалить">
                              <Trash size={11} />
                            </button>
                          )}
                        </div>
                        <div className="kb-comment-text">{c.text}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="kb-comments-input-row">
                <MemberAvatar userId={currentUserId} name={currentUsername} size={26} bg={getMemberColor(members.find(m => m.userId === currentUserId)?.id ?? 0)} className="kb-comment-avatar" />
                <input
                  className="kb-comments-input"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Написать комментарий…"
                />
                <button className="kb-comments-send" onClick={handleSend} disabled={!commentText.trim() || sending}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          <aside className="kb-detail-sidebar">
            <KbSidebarField label="Статус">
              <span className="kb-detail-status-pill" style={{ color: sm.color }}>
                {sm.label}
              </span>
            </KbSidebarField>

            <KbSidebarField label="Исполнитель">
              {task.assignedToMember ? (
                <button className="kb-detail-assignee-btn" onClick={() => onProfileClick(task.assignedToMember!)}>
                  <MemberAvatar userId={members.find(m => m.id === task.assignedToMember)?.userId} name={assigneeName} size={26} bg={assigneeColor} />
                  <div>
                    <div className="kb-detail-assignee-name">{assigneeName}</div>
                    <div className="kb-detail-assignee-handle mono">@{assigneeName}</div>
                  </div>
                </button>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>не назначен</span>
              )}
            </KbSidebarField>

            {task.priority && task.priority !== 'low' && (
              <KbSidebarField label="Приоритет">
                <span className="kb-priority-label" style={{ color: PRIORITY_META[task.priority as Priority]?.color ?? 'var(--ink-2)' }}>
                  {PRIORITY_META[task.priority as Priority]?.label ?? task.priority}
                </span>
              </KbSidebarField>
            )}

            {task.tags && task.tags.length > 0 && (
              <KbSidebarField label="Тэги">
                <div className="kb-card-tags">
                  {task.tags.map(tag => {
                    const tc = getTagColor(tag);
                    return (
                      <span key={tag} className="kb-tag-chip" style={{ background: tc.bg, color: tc.fg }}>{tag}</span>
                    );
                  })}
                </div>
              </KbSidebarField>
            )}

            <KbSidebarField label="Баллы">
              <span className="mono kb-detail-points">{task.points ?? '—'}</span>
            </KbSidebarField>

            <KbSidebarField label="Создана">
              <span className="mono kb-detail-date-val">
                {new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
            </KbSidebarField>

            <div className="kb-detail-sidebar-actions">
              {canEditTasks && (
                <button
                  className="btn btn-primary btn-sm row gap-6"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={onEdit}
                  disabled={deleting}
                >
                  <Pencil size={13} /> Редактировать
                </button>
              )}
              {canDeleteTasks && (
                <button
                  className="btn btn-sm row gap-6"
                  style={{ width: '100%', justifyContent: 'center', background: 'rgba(192,86,63,.08)', color: 'var(--danger)', borderColor: 'rgba(192,86,63,.2)' }}
                  onClick={() => onDelete(task.id)}
                  disabled={deleting}
                >
                  <Trash2 size={13} /> {deleting ? 'Удаление…' : 'Удалить'}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({
  teamId,
  teamName = 'команде',
  teamEmoji,
  teamColor,
  currentUserId,
  members,
  canCreateTasks = true,
  canEditTasks = true,
  canDeleteTasks = true,
  isManager = false,
  onInvite,
  onMemberClick,
}: KanbanBoardProps) {
  const [showCreate, setShowCreate]     = useState(false);
  const [showDetail, setShowDetail]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [selected, setSelected]         = useState<Task | null>(null);
  const [newTask, setNewTask]           = useState({
    title: '', description: '', points: 1,
    assignedToMember: 0,
    tags: [] as string[], priority: 'low' as Priority,
  });
  const [tagInput, setTagInput]         = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editTitle, setEditTitle]       = useState('');
  const [editPoints, setEditPoints]     = useState(1);
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags]         = useState<string[]>([]);
  const [editPriority, setEditPriority] = useState<Priority>('low');
  const [editAssignedTo, setEditAssignedTo] = useState<number>(0);
  const [editTagInput, setEditTagInput] = useState('');
  const [dragOverCol, setDragOverCol]   = useState<string | null>(null);
  const [justMoved, setJustMoved]       = useState<number | null>(null);
  const [celebrate, setCelebrate]       = useState<number | null>(null);
  const [filterMember, setFilterMember] = useState<number | null>(null);
  const [filterTag, setFilterTag]       = useState<string | null>(null);
  const [localTasks, setLocalTasks]     = useState<Task[]>([]);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const currentUsername = useAuthStore(s => s.username) ?? 'Участник';

  const { createTask, loading: creating, error: createError } = useHookPostTask();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useHookGetTask(teamId);
  const { deleteTask, loading: deleting } = useHookDeleteTask(teamId);
  const { updateTask, loading: updating, error: updateError } = useHookUpdateTask(teamId);
  const { updateTaskStatus, error: updateStatusError } = useHookUpdateTaskStatus(teamId);

  useEffect(() => {
    if (tasks) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTasks(tasks);
      const allTags = Array.from(new Set(tasks.flatMap(t => t.tags ?? [])));
      setAvailableTags(allTags);
    }
  }, [tasks]);

  useEffect(() => () => { if (celebrateTimer.current) clearTimeout(celebrateTimer.current); }, []);


  const filtered = useMemo(() => {
    let result = localTasks;
    if (filterMember) result = result.filter(t => t.assignedToMember === filterMember);
    if (filterTag) result = result.filter(t => (t.tags ?? []).includes(filterTag));
    return result;
  }, [localTasks, filterMember, filterTag]);

  const byStatus = useMemo(() => ({
    open:      filtered.filter(t => t.status === 'open'),
    assigned:  filtered.filter(t => t.status === 'assigned'),
    in_review: filtered.filter(t => t.status === 'in_review'),
    completed: filtered.filter(t => t.status === 'completed'),
  }), [filtered]);

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
    setNewTask(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags : [...p.tags, tag] }));
    setTagInput('');
  };

  const toggleTag = (tag: string) => {
    setNewTask(p => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag] }));
  };

  const getMemberName = useCallback((id: number) => {
    if (!id) return 'Не назначено';
    return members.find(m => m.id === id)?.username ?? `#${id}`;
  }, [members]);

  const handleCreate = async () => {
    if (!newTask.title.trim()) return;
    try {
      const req: CreateTaskRequest = {
        teamId, currentUserId,
        title: newTask.title,
        description: newTask.description,
        points: isManager ? newTask.points : undefined,
        assignedToMember: newTask.assignedToMember,
        tags: newTask.tags,
        priority: newTask.priority,
      };
      const created = await createTask(req);
      setLocalTasks(prev => [...prev, {
        ...created,
        assignedToMember: newTask.assignedToMember,
        tags: newTask.tags,
        priority: newTask.priority,
      }]);
      if (newTask.tags.length > 0) {
        setAvailableTags(prev => Array.from(new Set([...prev, ...newTask.tags])));
      }
      addActivity({
        type: 'task_created',
        title: newTask.title,
        detail: `${currentUsername} создал · ${teamName} · исполнитель: ${getMemberName(newTask.assignedToMember)} · ${newTask.points ?? 1} очк.`,
        teamId, teamEmoji, teamColor,
      });
      setShowCreate(false);
      setNewTask({ title: '', description: '', points: 1, assignedToMember: 0, tags: [], priority: 'low' });
      setTagInput('');
    } catch { /* ignore */ }
  };

  const handleEdit = async () => {
    if (!selected || !editTitle.trim()) return;
    try {
      const req: UpdateTaskRequest = {
        currentUserId,
        taskId: selected.id,
        points: editPoints,
        description: editDescription,
        title: editTitle,
        tags: editTags,
        priority: editPriority,
        assignedToMember: isManager ? (editAssignedTo || undefined) : undefined,
      };
      await updateTask(req);
      setLocalTasks(prev => prev.map(t =>
        t.id === selected.id ? { ...t, title: editTitle, description: editDescription, points: editPoints, tags: editTags, priority: editPriority, assignedToMember: isManager ? editAssignedTo : selected.assignedToMember, updatedAt: new Date().toISOString() } : t
      ));
      addActivity({ type: 'task_updated', title: editTitle, detail: `${currentUsername} обновил · ${teamName}`, teamId, teamEmoji, teamColor });
      setShowEdit(false);
      setSelected(null);
    } catch { /* ignore */ }
  };

  const addEditTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
    setEditTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
    setEditTagInput('');
  };

  const toggleEditTag = (tag: string) => {
    setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleDeleteTag = async (tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
    if (filterTag === tag) setFilterTag(null);
    const affected = localTasks.filter(t => (t.tags ?? []).includes(tag));
    setLocalTasks(prev => prev.map(t =>
      (t.tags ?? []).includes(tag) ? { ...t, tags: (t.tags ?? []).filter(tt => tt !== tag) } : t
    ));
    await Promise.allSettled(affected.map(t =>
      updateTask({
        currentUserId,
        taskId: t.id,
        points: t.points ?? 1,
        description: t.description ?? '',
        title: t.title,
        tags: (t.tags ?? []).filter(tt => tt !== tag),
        priority: t.priority ?? 'low',
      })
    ));
  };

  const handleDelete = async (taskId: number) => {
    if (!canDeleteTasks) return;
    const deletedTask = localTasks.find(t => t.id === taskId);
    try {
      await deleteTask(taskId, currentUserId);
      setLocalTasks(prev => prev.filter(t => t.id !== taskId));
      if (deletedTask) {
        addActivity({ type: 'task_deleted', title: deletedTask.title, detail: `${currentUsername} удалил · ${teamName}`, teamId, teamEmoji, teamColor });
      }
      setShowDetail(false);
      setSelected(null);
    } catch { /* ignore */ }
  };

  const handleDragStart = (task: Task, e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('fromStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('dragging');
    setDragOverCol(null);
  };

  const handleDrop = (colId: ColId, e: React.DragEvent) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const from   = e.dataTransfer.getData('fromStatus') as ColId;
    setDragOverCol(null);
    if (!taskId || from === colId || !canEditTasks) return;

    const movedTask = localTasks.find(t => t.id === taskId);
    setJustMoved(taskId);
    setTimeout(() => setJustMoved(null), ANIMATION_TASK_MOVE_MS);

    if (colId === 'completed') {
      setCelebrate(taskId);
      celebrateTimer.current = setTimeout(() => setCelebrate(null), ANIMATION_CELEBRATION_MS);
    }

    if (movedTask) {
      addActivity({
        type: 'task_moved',
        title: movedTask.title,
        detail: `${currentUsername} перенёс · ${STATUS_LABELS[from] ?? from} → ${STATUS_LABELS[colId] ?? colId} · ${teamName}`,
        teamId, teamEmoji, teamColor,
      });
    }

    const req: PatchTaskStatus = { taskId, currentUserId, status: colId };
    void updateTaskStatus(req);
  };

  if (tasksLoading) {
    return (
      <div className="kb-skeleton">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="kb-skeleton-col">
            <Skeleton height={24} width="60%" />
            {[0, 1, 2].map(j => (
              <Skeleton key={j} height={80} borderRadius="var(--r)" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kb-wrapper">
      {/* Error banner */}
      {(tasksError || updateStatusError) && (
        <div className="error-message" style={{ marginBottom: 12 }}>
          {tasksError?.message ?? updateStatusError?.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="kb-toolbar">
        <div className="kb-toolbar-title">
          <h1 className="kb-team-name h-display">{teamName}</h1>
          <span className="kb-total mono">{pluralTasks(localTasks.length)}</span>
        </div>
        <div className="kb-toolbar-right">
          {/* Member filter chips */}
          <div className="kb-filters row gap-6">
            <button
              className={`kb-filter-chip ${filterMember === null ? 'active' : ''}`}
              onClick={() => setFilterMember(null)}
            >все участники</button>
            {members.map(m => (
              <button
                key={m.id}
                className={`kb-filter-avatar ${filterMember === m.id ? 'active' : ''}`}
                onClick={() => setFilterMember(filterMember === m.id ? null : m.id)}
                title={`@${m.username}`}
                style={{ background: getMemberColor(m.id), position: 'relative', overflow: 'hidden' }}
              >
                <MemberAvatar userId={m.userId} name={m.username} size={26} bg={getMemberColor(m.id)} />
              </button>
            ))}
          </div>

          {/* Tag filters */}
          {availableTags.length > 0 && (
            <>
              <div className="kb-toolbar-sep" />
              <div className="kb-filters row gap-6">
                {availableTags.map(tag => {
                  const tc = getTagColor(tag);
                  const active = filterTag === tag;
                  return (
                    <span
                      key={tag}
                      className="kb-tag-chip"
                      style={{
                        background: active ? tc.bg : 'var(--bg-elev)',
                        color: active ? tc.fg : 'var(--ink-3)',
                        border: active ? '1px solid transparent' : '1px solid var(--line)',
                        fontSize: 11,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    >
                      {tag}
                      {isManager && (
                        <button
                          className="kb-tag-delete-btn"
                          onClick={e => { e.stopPropagation(); handleDeleteTag(tag); }}
                          title="Удалить тэг"
                        >
                          <X size={9} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </>
          )}
          <div className="kb-toolbar-sep" />
          {canCreateTasks && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              <Plus size={13} /> Новая задача
            </button>
          )}
          {onInvite && isManager && (
            <button className="btn btn-sm" onClick={onInvite}>
              + Пригласить
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="kb-board">
        {COLUMNS.map(col => (
          <div
            key={col.id}
            className={`kb-col ${dragOverCol === col.id ? 'drop-target' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={e => handleDrop(col.id, e)}
          >
            {/* Column header */}
            <div className="kb-col-header row between">
              <div className="row gap-8">
                <span className="kb-col-title" style={{ color: col.color }}>{col.title}</span>
              </div>
              <div className="row gap-6">
                <span className="kb-col-count">{byStatus[col.id].length}</span>
                {canCreateTasks && (
                  <button
                    className="kb-col-add"
                    onClick={() => setShowCreate(true)}
                    title="Добавить задачу"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Cards */}
            <div className="kb-col-inner">
              {byStatus[col.id].map(task => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  memberName={getMemberName(task.assignedToMember)}
                  memberColor={getMemberColor(task.assignedToMember)}
                  memberUserId={members.find(m => m.id === task.assignedToMember)?.userId}
                  canEdit={canEditTasks}
                  justMoved={justMoved === task.id}
                  celebrate={celebrate === task.id}
                  onClick={() => { setSelected(task); setShowDetail(true); }}
                  onDragStart={e => handleDragStart(task, e)}
                  onDragEnd={handleDragEnd}
                />
              ))}

              {byStatus[col.id].length === 0 && (
                <div className="kb-col-empty">Добавьте задачу</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
            <button className="kb-detail-close" onClick={() => setShowCreate(false)}><X size={16} /></button>

            <div className="kb-create-header">
              <h2 className="h-display kb-create-title">Новая задача</h2>
              <p className="kb-create-subtitle">В колонке «Бэклог»</p>
            </div>

            <div className="kb-create-body">
              {createError && <div className="error-message" style={{ marginBottom: 4 }}>{createError.message}</div>}

              {/* Название */}
              <div className="kb-create-field">
                <div className="kb-create-label">Название</div>
                <input
                  className="coop-input"
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Например: «Подготовить главу 3»"
                  autoFocus
                  disabled={creating}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>

              {/* Описание */}
              <div className="kb-create-field">
                <div className="kb-create-label">Описание</div>
                <textarea
                  className="coop-input"
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Опишите задачу…"
                  rows={3}
                  disabled={creating}
                />
              </div>

              {/* Исполнитель */}
              <div className="kb-create-field">
                <div className="kb-create-label">Исполнитель</div>
                <div className="kb-assignee-picker">
                  <button
                    className={`kb-assignee-opt ${newTask.assignedToMember === 0 ? 'active' : ''}`}
                    onClick={() => setNewTask(p => ({ ...p, assignedToMember: 0 }))}
                    type="button"
                  >
                    <span className="avatar" style={{ background: 'var(--line)', width: 24, height: 24, fontSize: 9 }}>
                      <User size={10} />
                    </span>
                    <span>Не назначено</span>
                  </button>
                  {members.map(m => (
                    <button
                      key={m.id}
                      className={`kb-assignee-opt ${newTask.assignedToMember === m.id ? 'active' : ''}`}
                      onClick={() => setNewTask(p => ({ ...p, assignedToMember: m.id }))}
                      type="button"
                    >
                      <MemberAvatar userId={m.userId} name={m.username} size={24} bg={getMemberColor(m.id)} />
                      <span>{m.username}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Тип (теги) */}
              <div className="kb-create-field">
                <div className="kb-create-label">Тип</div>
                <div className="kb-tag-picker">
                  {availableTags.map(tag => {
                    const tc = getTagColor(tag);
                    const active = newTask.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        className="kb-tag-chip"
                        style={{
                          background: active ? tc.bg : 'var(--bg-elev)',
                          color: active ? tc.fg : 'var(--ink-2)',
                          border: active ? '1px solid transparent' : '1px solid var(--line)',
                        }}
                        onClick={() => toggleTag(tag)}
                        type="button"
                      >
                        {tag}
                      </button>
                    );
                  })}
                  <div className="kb-tag-input-wrap">
                    <input
                      className="kb-tag-input"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                      placeholder="+ новый тег"
                    />
                  </div>
                </div>
              </div>

              {/* Приоритет */}
              <div className="kb-create-field">
                <div className="kb-create-label">Приоритет</div>
                <div className="kb-priority-seg">
                  {(['low','medium','high'] as Priority[]).map(v => (
                    <button
                      key={v}
                      className={`kb-priority-opt ${newTask.priority === v ? 'active' : ''}`}
                      onClick={() => setNewTask(p => ({ ...p, priority: v }))}
                      type="button"
                    >
                      {PRIORITY_META[v].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Баллы (только менеджер) */}
              {isManager && (
                <div className="kb-create-field">
                  <div className="kb-create-label">Баллы</div>
                  <div className="kb-pts-stepper">
                    <button type="button" className="kb-pts-btn" onClick={() => setNewTask(p => ({ ...p, points: Math.max(1, p.points - 1) }))} disabled={creating || newTask.points <= 1}>−</button>
                    <input
                      className="kb-pts-val mono"
                      type="number" min="1" max="100"
                      value={newTask.points}
                      onChange={e => setNewTask(p => ({ ...p, points: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) }))}
                      disabled={creating}
                    />
                    <button type="button" className="kb-pts-btn" onClick={() => setNewTask(p => ({ ...p, points: Math.min(100, p.points + 1) }))} disabled={creating || newTask.points >= 100}>+</button>
                  </div>
                </div>
              )}
            </div>

            <div className="kb-create-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)} disabled={creating}>Отмена</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={creating || !newTask.title.trim()}>
                {creating ? 'Создание…' : 'Создать задачу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail modal ── */}
      {showDetail && selected && (
        <TaskDetailModal
          task={selected}
          members={members}
          currentUserId={currentUserId}
          canEditTasks={canEditTasks}
          canDeleteTasks={canDeleteTasks}
          deleting={deleting}
          onClose={() => setShowDetail(false)}
          onEdit={() => {
            setShowDetail(false);
            setEditTitle(selected.title);
            setEditPoints(selected.points);
            setEditDescription(selected.description || '');
            setEditTags(selected.tags ?? []);
            setEditPriority((selected.priority as Priority) ?? 'low');
            setEditAssignedTo(selected.assignedToMember ?? 0);
            setEditTagInput('');
            setShowEdit(true);
          }}
          onDelete={_id => setDeleteConfirmTask(selected)}
          onProfileClick={id => onMemberClick?.(id)}
        />
      )}

      {/* ── Edit modal ── */}
      {showEdit && selected && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="kb-create-modal" onClick={e => e.stopPropagation()}>
            <button className="kb-detail-close" onClick={() => setShowEdit(false)}><X size={16} /></button>

            <div className="kb-create-header">
              <h2 className="h-display kb-create-title">Редактирование задачи</h2>
              <p className="kb-create-subtitle">Изменения сохранятся сразу</p>
            </div>

            <div className="kb-create-body">
              {updateError && <div className="error-message" style={{ marginBottom: 4 }}>{updateError.message}</div>}

              {/* Название */}
              <div className="kb-create-field">
                <div className="kb-create-label">Название</div>
                <input
                  className="coop-input"
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Название задачи"
                  autoFocus
                  disabled={updating}
                />
              </div>

              {/* Описание */}
              <div className="kb-create-field">
                <div className="kb-create-label">Описание</div>
                <textarea
                  className="coop-input"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Опишите задачу…"
                  rows={3}
                  disabled={updating}
                />
              </div>

              {/* Тип (теги) */}
              <div className="kb-create-field">
                <div className="kb-create-label">Тип</div>
                <div className="kb-tag-picker">
                  {availableTags.map(tag => {
                    const tc = getTagColor(tag);
                    const active = editTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        className="kb-tag-chip"
                        style={{
                          background: active ? tc.bg : 'var(--bg-elev)',
                          color: active ? tc.fg : 'var(--ink-2)',
                          border: active ? '1px solid transparent' : '1px solid var(--line)',
                        }}
                        onClick={() => toggleEditTag(tag)}
                        type="button"
                      >
                        {tag}
                      </button>
                    );
                  })}
                  <div className="kb-tag-input-wrap">
                    <input
                      className="kb-tag-input"
                      value={editTagInput}
                      onChange={e => setEditTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditTag(editTagInput); } }}
                      placeholder="+ новый тег"
                    />
                  </div>
                </div>
              </div>

              {/* Приоритет */}
              <div className="kb-create-field">
                <div className="kb-create-label">Приоритет</div>
                <div className="kb-priority-seg">
                  {(['low','medium','high'] as Priority[]).map(v => (
                    <button
                      key={v}
                      className={`kb-priority-opt ${editPriority === v ? 'active' : ''}`}
                      onClick={() => setEditPriority(v)}
                      type="button"
                    >
                      {PRIORITY_META[v].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Исполнитель (менеджер) */}
              {isManager && (
                <div className="kb-create-field">
                  <div className="kb-create-label">Исполнитель</div>
                  <div className="kb-assignee-picker">
                    <button
                      type="button"
                      className={`kb-assignee-opt ${editAssignedTo === 0 ? 'active' : ''}`}
                      onClick={() => setEditAssignedTo(0)}
                      disabled={updating}
                    >
                      <span className="avatar" style={{ background: 'var(--line)', width: 22, height: 22, fontSize: 9 }}>
                        <User size={10} />
                      </span>
                      <span>Не назначено</span>
                    </button>
                    {members.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        className={`kb-assignee-opt ${editAssignedTo === m.id ? 'active' : ''}`}
                        onClick={() => setEditAssignedTo(m.id)}
                        disabled={updating}
                      >
                        <MemberAvatar userId={m.userId} name={m.username} size={22} bg={getMemberColor(m.id)} />
                        <span>@{m.username}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Баллы (менеджер) */}
              {isManager && (
                <div className="kb-create-field">
                  <div className="kb-create-label">Баллы</div>
                  <div className="kb-pts-stepper">
                    <button type="button" className="kb-pts-btn" onClick={() => setEditPoints(p => Math.max(1, p - 1))} disabled={updating || editPoints <= 1}>−</button>
                    <input
                      className="kb-pts-val mono"
                      type="number" min="1" max="100"
                      value={editPoints}
                      onChange={e => setEditPoints(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      disabled={updating}
                    />
                    <button type="button" className="kb-pts-btn" onClick={() => setEditPoints(p => Math.min(100, p + 1))} disabled={updating || editPoints >= 100}>+</button>
                  </div>
                </div>
              )}
            </div>

            <div className="kb-create-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(false)} disabled={updating}>Отмена</button>
              <button className="btn btn-primary btn-sm" onClick={handleEdit} disabled={updating || !editTitle.trim()}>
                {updating ? 'Сохранение…' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmTask && (
        <ConfirmModal
          title="Удалить задачу?"
          description={`«${deleteConfirmTask.title}» будет удалена без возможности восстановления.`}
          confirmLabel="Удалить"
          onConfirm={() => { handleDelete(deleteConfirmTask.id); setDeleteConfirmTask(null); }}
          onCancel={() => setDeleteConfirmTask(null)}
        />
      )}
    </div>
  );
}

/* ── Card component ── */
interface KanbanCardProps {
  task: Task;
  memberName: string;
  memberColor: string;
  memberUserId?: number;
  canEdit: boolean;
  justMoved: boolean;
  celebrate: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

function KanbanCard({ task, memberName, memberColor, memberUserId, canEdit, justMoved, celebrate, onClick, onDragStart, onDragEnd }: KanbanCardProps) {
  const tags = task.tags ?? [];
  const pm = PRIORITY_META[(task.priority as Priority) ?? 'low'];
  return (
    <div
      className={`kb-card pop-in ${justMoved ? 'just-moved' : ''} ${celebrate ? 'celebrate' : ''}`}
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {celebrate && <Confetti />}

      {/* Tags + priority */}
      {(tags.length > 0 || (task.priority && task.priority !== 'low')) && (
        <div className="kb-card-header">
          <div className="kb-card-tags">
            {tags.map(tag => {
              const tc = getTagColor(tag);
              return (
                <span key={tag} className="kb-tag-chip" style={{ background: tc.bg, color: tc.fg, border: '1px solid transparent', fontSize: 10, padding: '2px 7px' }}>
                  {tag}
                </span>
              );
            })}
          </div>
          {task.priority && task.priority !== 'low' && (
            <span className="kb-card-priority-badge" style={{ color: pm.color }}>{pm.short}</span>
          )}
        </div>
      )}

      {/* Title */}
      <p className={`kb-card-title ${task.status === 'completed' ? 'done' : ''}`}>{task.title}</p>

      {/* Description */}
      {task.description && <p className="kb-card-desc">{task.description}</p>}

      {/* Footer: assignee avatar + points + date */}
      <div className="kb-card-footer">
        <div className="kb-card-assignee-row">
          {memberName !== 'Не назначено' ? (
            <MemberAvatar userId={memberUserId} name={memberName} size={20} bg={memberColor} />
          ) : (
            <span className="avatar" style={{ background: 'var(--line)', width: 20, height: 20, fontSize: 8, flexShrink: 0 }} title="Не назначено">
              <User size={9} />
            </span>
          )}
          {task.points != null && (
            <span className="kb-card-pts">{task.points} очк.</span>
          )}
        </div>
        <div className="row gap-6" style={{ alignItems: 'center' }}>
          {(task.commentCount ?? 0) > 0 && (
            <span className="kb-card-comments">
              <Send size={10} strokeWidth={2} />
              {task.commentCount}
            </span>
          )}
          <span className="kb-card-date mono">
            {new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar field ── */
function KbSidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kb-sidebar-field">
      <div className="kb-sidebar-label">{label}</div>
      {children}
    </div>
  );
}
