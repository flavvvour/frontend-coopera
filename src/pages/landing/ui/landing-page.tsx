import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import '@/widgets/kanban/ui/kanban-board.css';
import './landing-page.css';

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.491 11.74 18.51 5.64c.635-.232 1.189.155.983 1.118l-2.19 10.32c-.162.73-.594.906-1.205.563l-3.28-2.418-1.584 1.524c-.175.175-.322.322-.66.322l.236-3.338 6.077-5.49c.264-.234-.058-.364-.41-.13L4.128 13.887l-3.22-.998c-.7-.22-.714-.7.147-1.035z" fill="currentColor"/>
    </svg>
  );
}

/* ─────────────────────────────── types ─────────────────────────────── */

type TaskCol = 'open' | 'assigned' | 'in_review' | 'completed';
type Priority = 'low' | 'medium' | 'high';

interface DemoTask {
  id: number;
  title: string;
  col: TaskCol;
  tags: string[];
  priority: Priority;
  assigneeId: number;
  assigneeName: string;
  points: number;
  date: string;
}

/* ─────────────────────────────── data ──────────────────────────────── */

const COL_ORDER: TaskCol[] = ['open', 'assigned', 'in_review', 'completed'];

/* Exact match with kanban-board.tsx COLUMNS */
const COL_META: Record<TaskCol, { label: string; color: string }> = {
  open:      { label: 'Бэклог',      color: '#8a8175'       },
  assigned:  { label: 'В работе',    color: 'var(--accent)'  },
  in_review: { label: 'На проверке', color: '#b07a10'        },
  completed: { label: 'Выполнено',   color: 'var(--good)'    },
};

/* Exact match with kanban-board.tsx TAG_PALETTE */
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

/* Exact match with kanban-board.tsx PRIORITY_META */
const PRIORITY_META: Record<Priority, { short: string; color: string }> = {
  low:    { short: '',    color: 'var(--ink-3)'   },
  medium: { short: 'ср',  color: 'var(--accent)'  },
  high:   { short: 'выс', color: 'var(--danger)'  },
};

const MEMBER_COLORS = ['#5b8def','#3b7dd8','#6fa3f5','#4c8ee8','#7ab3ff','#3572cc','#88b8f8','#2e67c4'];
function getMemberColor(id: number) { return MEMBER_COLORS[id % MEMBER_COLORS.length]; }

const DEMO_TASKS: DemoTask[] = [
  { id: 1, title: 'Дизайн главной страницы', col: 'open',      tags: ['ui/ux'],   priority: 'high',   assigneeId: 11, assigneeName: 'АК', points: 30, date: '21 мая' },
  { id: 2, title: 'API авторизации',          col: 'assigned',  tags: ['backend'], priority: 'medium', assigneeId: 5,  assigneeName: 'МС', points: 50, date: '19 мая' },
  { id: 3, title: 'Интеграция Telegram',      col: 'assigned',  tags: ['bot'],     priority: 'high',   assigneeId: 12, assigneeName: 'ДВ', points: 40, date: '20 мая' },
  { id: 4, title: 'Тесты компонентов',        col: 'in_review', tags: ['qa'],      priority: 'low',    assigneeId: 20, assigneeName: 'ЕП', points: 20, date: '18 мая' },
  { id: 5, title: 'Деплой на сервер',         col: 'in_review', tags: ['devops'],  priority: 'medium', assigneeId: 11, assigneeName: 'АК', points: 35, date: '17 мая' },
  { id: 6, title: 'Документация API',         col: 'completed', tags: ['docs'],    priority: 'low',    assigneeId: 5,  assigneeName: 'МС', points: 25, date: '15 мая' },
];


const TEAM_MEMBERS = [
  { id: 11, name: 'Алексей',  role: 'Тимлид',       photo: 'https://i.pravatar.cc/80?img=11', points: 340, tasks: 8 },
  { id: 5,  name: 'Мария',    role: 'Разработчик',  photo: 'https://i.pravatar.cc/80?img=5',  points: 280, tasks: 6 },
  { id: 12, name: 'Дмитрий',  role: 'Дизайнер',     photo: 'https://i.pravatar.cc/80?img=12', points: 195, tasks: 4 },
  { id: 20, name: 'Елена',    role: 'QA-инженер',   photo: 'https://i.pravatar.cc/80?img=20', points: 165, tasks: 5 },
];

/* ─────────────────────────── components ────────────────────────────── */

function PhotoAvatar({ src, name, size = 36 }: { src: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const bg = getMemberColor(name.charCodeAt(0));
  if (err) {
    return (
      <span
        className="lp-photo-av lp-photo-av--init"
        style={{ width: size, height: size, minWidth: size, fontSize: Math.round(size * 0.4), background: bg }}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className="lp-photo-av"
      width={size}
      height={size}
      onError={() => setErr(true)}
    />
  );
}

/* ── Demo card — exact structure of real KanbanCard ── */
function DemoCard({
  task,
  justMoved,
  onDragStart,
  onDragEnd,
}: {
  task: DemoTask;
  justMoved: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}) {
  const pm = PRIORITY_META[task.priority];
  const hasTags = task.tags.length > 0 || task.priority !== 'low';
  return (
    <div
      className={`kb-card pop-in${justMoved ? ' just-moved' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Tags + priority — same as real KanbanCard */}
      {hasTags && (
        <div className="kb-card-header">
          <div className="kb-card-tags">
            {task.tags.map(tag => {
              const tc = getTagColor(tag);
              return (
                <span
                  key={tag}
                  className="kb-tag-chip"
                  style={{ background: tc.bg, color: tc.fg, border: '1px solid transparent', fontSize: 10, padding: '2px 7px' }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
          {task.priority !== 'low' && (
            <span className="kb-card-priority-badge" style={{ color: pm.color }}>{pm.short}</span>
          )}
        </div>
      )}

      {/* Title */}
      <p className={`kb-card-title${task.col === 'completed' ? ' done' : ''}`}>{task.title}</p>

      {/* Footer: assignee photo + points | date */}
      <div className="kb-card-footer">
        <div className="kb-card-assignee-row">
          <PhotoAvatar
            src={`https://i.pravatar.cc/40?img=${task.assigneeId}`}
            name={task.assigneeName}
            size={20}
          />
          <span className="kb-card-pts">{task.points} очк.</span>
        </div>
        <span className="kb-card-date mono">{task.date}</span>
      </div>
    </div>
  );
}

/* ── Demo Kanban — uses real kb-* CSS classes + native HTML5 DnD ── */
function DemoKanban() {
  const [tasks, setTasks] = useState<DemoTask[]>(DEMO_TASKS);
  const [dragOverCol, setDragOverCol] = useState<TaskCol | null>(null);
  const [justMoved, setJustMoved] = useState<number | null>(null);

  const handleDragStart = useCallback((taskId: number, e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('dragging');
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback((col: TaskCol, e: React.DragEvent) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    setDragOverCol(null);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, col } : t));
    setJustMoved(taskId);
    setTimeout(() => setJustMoved(null), 600);
  }, []);

  return (
    <div className="kb-board lp-demo-board">
      {COL_ORDER.map(col => {
        const meta = COL_META[col];
        const colTasks = tasks.filter(t => t.col === col);
        return (
          <div
            key={col}
            className={`kb-col${dragOverCol === col ? ' drop-target' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOverCol(col); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={e => handleDrop(col, e)}
          >
            <div className="kb-col-header row between">
              <span className="kb-col-title" style={{ color: meta.color }}>{meta.label}</span>
              <span className="kb-col-count">{colTasks.length}</span>
            </div>
            <div className="kb-col-inner">
              {colTasks.map(task => (
                <DemoCard
                  key={task.id}
                  task={task}
                  justMoved={justMoved === task.id}
                  onDragStart={e => handleDragStart(task.id, e)}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="kb-col-empty">Перетащите задачу сюда</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function MiniBarChart() {
  const bars = [
    { h: 40, l: 'Пн' }, { h: 65, l: 'Вт' }, { h: 50, l: 'Ср' },
    { h: 80, l: 'Чт' }, { h: 55, l: 'Пт' }, { h: 90, l: 'Сб' }, { h: 70, l: 'Вс' },
  ];
  return (
    <div className="lp-bar-chart">
      {bars.map(b => (
        <div key={b.l} className="lp-bar-col">
          <div className="lp-bar" style={{ height: `${b.h}%` }} />
          <span className="lp-bar-label">{b.l}</span>
        </div>
      ))}
    </div>
  );
}



/* ─────────────────────────── auto-assign visual ─────────────────────── */

const AA_MEMBERS = [
  { name: 'Алексей', initials: 'АК', color: '#5b8def', load: 5 },
  { name: 'Мария',   initials: 'МС', color: '#4caf87', load: 2 },
  { name: 'Дмитрий', initials: 'ДВ', color: '#e08a5b', load: 4 },
];

function AutoAssignVisual() {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'assigned'>('idle');
  const [scanIdx, setScanIdx] = useState(-1);

  useEffect(() => {
    const run = () => {
      setPhase('idle');
      setScanIdx(-1);
      setTimeout(() => { setPhase('scanning'); setScanIdx(0); }, 500);
      setTimeout(() => setScanIdx(1), 1000);
      setTimeout(() => setScanIdx(2), 1500);
      setTimeout(() => { setPhase('assigned'); setScanIdx(1); }, 2200);
    };
    run();
    const id = setInterval(() => { run(); }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-aa-vis">
      <div className={`lp-aa-vis-card ${phase !== 'idle' ? 'lp-aa-vis-card--show' : ''}`}>
        <div className="lp-aa-vis-card-top">
          <span className="lp-aa-vis-card-dot" />
          <span className="lp-aa-vis-card-label">Новая задача</span>
          <span className="lp-aa-vis-card-badge">Авто</span>
        </div>
        <div className="lp-aa-vis-card-title">Доработать онбординг</div>
        <div className="lp-aa-vis-card-pts">5 очков · Высокий приоритет</div>
      </div>

      <div className={`lp-aa-vis-arrow ${phase !== 'idle' ? 'lp-aa-vis-arrow--show' : ''}`}>
        <div className="lp-aa-vis-arrow-track">
          <div className="lp-aa-vis-arrow-dot" />
        </div>
        <span className="lp-aa-vis-arrow-label">анализ загрузки</span>
      </div>

      <div className="lp-aa-vis-members">
        {AA_MEMBERS.map((m, i) => (
          <div
            key={i}
            className={[
              'lp-aa-vis-row',
              phase === 'scanning' && scanIdx === i ? 'lp-aa-vis-row--scan' : '',
              phase === 'assigned' && i === 1 ? 'lp-aa-vis-row--winner' : '',
              phase === 'assigned' && i !== 1 ? 'lp-aa-vis-row--dim' : '',
            ].join(' ').trim()}
          >
            <div className="lp-aa-vis-av" style={{ background: m.color }}>{m.initials}</div>
            <div className="lp-aa-vis-info">
              <span className="lp-aa-vis-name">{m.name}</span>
              <div className="lp-aa-vis-track">
                <div className="lp-aa-vis-fill" style={{ width: `${Math.round((m.load / 6) * 100)}%`, background: m.color }} />
              </div>
            </div>
            <span className="lp-aa-vis-load">{m.load} зад.</span>
            {phase === 'assigned' && i === 1 && <span className="lp-aa-vis-check">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── main component ────────────────────────── */

export const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sects = document.querySelectorAll('.lp-section');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.07 },
    );
    sects.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const goLogin = () => { window.location.href = '/login'; };

  return (
    <div className="lp-root">

      {/* ══════════ HEADER ══════════ */}
      <header className={`lp-header${scrollY > 20 ? ' lp-header--scrolled' : ''}`}>
        <div className="lp-header-inner">
          <div className="lp-logo">Coopera<span className="lp-logo-dot">.</span></div>
          <nav className="lp-nav">
            <a href="#features">Возможности</a>
            <a href="#autoassign">Автораспределение</a>
            <a href="#team-section">Команда</a>
          </nav>
          <button className="lp-header-cta" onClick={goLogin}>Войти</button>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="lp-hero lp-section">
        <div className="lp-hero-bg"   aria-hidden style={{ transform: `translateY(${scrollY * 0.28}px)` }} />
        <div className="lp-hero-grid" aria-hidden style={{ transform: `translateY(${scrollY * 0.06}px)` }} />
        <div className="lp-hero-orb lp-hero-orb--1" aria-hidden style={{ transform: `translateY(${scrollY * 0.16}px)` }} />
        <div className="lp-hero-orb lp-hero-orb--2" aria-hidden style={{ transform: `translateY(${scrollY * 0.40}px)` }} />
        <div className="lp-hero-orb lp-hero-orb--3" aria-hidden style={{ transform: `translateY(${scrollY * 0.24}px)` }} />
        <div className="lp-hero-orb lp-hero-orb--4" aria-hidden />
        <div className="lp-hero-orb lp-hero-orb--5" aria-hidden />
        <div className="lp-hero-orb lp-hero-orb--6" aria-hidden />

        <div className="lp-hero-inner">
          {/* ── LEFT: text ── */}
          <div className="lp-hero-content lp-hero-content--centered">
            <h1 className="lp-hero-title">
              Платформа для<br />
              <span className="lp-hero-accent">командной работы</span>
            </h1>
            <p className="lp-hero-sub">
              Канбан-доски, умное автораспределение задач, аналитика команды,
              геймификация и вход через Telegram.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-accent lp-btn-lg" onClick={goLogin}>
                <TelegramIcon size={22} />Войти через Telegram
              </button>
              <a href="#features" className="lp-btn-ghost lp-btn-lg">Узнать больше</a>
            </div>
          </div>
        </div>

        <div className="lp-hero-scroll-hint" aria-hidden>
          <div className="lp-hero-scroll-arrow-wrap">
            <div className="lp-hero-scroll-arrow" />
          </div>
        </div>
      </section>

      {/* ══════════ KANBAN DEMO ══════════ */}
      <section className="lp-kanban-demo-section lp-section">
        <div className="lp-kanban-demo-header">
          <div className="lp-section-label">Демо</div>
          <h2 className="lp-section-title">Попробуйте канбан<br />прямо сейчас</h2>
          <p className="lp-section-sub">Перетащите карточки между колонками — так работает ваша команда в Coopera.</p>
        </div>
        <div className="lp-kanban-demo-board-wrap">
          <DemoKanban />
        </div>
      </section>


      {/* ══════════ AUTO-ASSIGNMENT ══════════ */}
      <section id="autoassign" className="lp-autoassign-section lp-section">
        <div className="lp-container">
          <div className="lp-aa-inner">
            <div className="lp-aa-content">
              <div className="lp-section-label">Автоматизация</div>
              <h2 className="lp-section-title">
                Автораспределение<br />
                <span className="lp-hero-accent">задач</span>
              </h2>
              <p className="lp-aa-sub">
                Система сама анализирует загрузку участников и назначает задачи
                на наименее занятых. Никаких совещаний по делегированию.
              </p>
              <ul className="lp-aa-list">
                {[
                  'Балансировка нагрузки по количеству активных задач',
                  'Мгновенное уведомление исполнителя в Telegram',
                  'Тимлид видит весь процесс в реальном времени',
                  'Включается одним переключателем в настройках команды',
                ].map((item, i) => (
                  <li key={i} className="lp-aa-list-item">
                    <CheckCircle size={17} className="lp-check-green" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="lp-header-cta lp-btn-self-start" onClick={goLogin}>
                Попробовать <ChevronRight size={18} />
              </button>
            </div>
            <div className="lp-aa-demo-wrap">
              <AutoAssignVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="lp-features lp-section">
        <div className="lp-container">
          <div className="lp-section-label">Возможности</div>
          <h2 className="lp-section-title">Инструменты,<br />которые работают</h2>

          <div className="lp-bento-new">

            {/* Analytics — wide left */}
            <div className="lp-bnc lp-bnc--analytics">
              <div className="lp-bnc-eyebrow">Аналитика</div>
              <h3 className="lp-bnc-title">Производительность команды</h3>
              <p className="lp-bnc-sub">Прогресс по дням, рейтинги участников и узкие места — в одном месте.</p>
              <div className="lp-bnc-chart-wrap">
                <MiniBarChart />
              </div>
              <div className="lp-bnc-members-row">
                {TEAM_MEMBERS.map(m => (
                  <div key={m.id} className="lp-bnc-member">
                    <PhotoAvatar src={m.photo} name={m.name} size={36} />
                    <div>
                      <div className="lp-bnc-member-name">{m.name.split(' ')[0]}</div>
                      <div className="lp-bnc-member-pts">{m.points}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification — narrow right */}
            <div className="lp-bnc lp-bnc--game">
              <div className="lp-bnc-eyebrow">Геймификация</div>
              <h3 className="lp-bnc-title">Соревнуйтесь&nbsp;— результат растёт</h3>
              <div className="lp-bnc-lb">
                {TEAM_MEMBERS.map((m, i) => (
                  <div key={m.id} className={`lp-bnc-lb-row${i === 0 ? ' lp-bnc-lb-row--top' : ''}`}>
                    <span className="lp-bnc-lb-rank">{i === 0 ? '🏆' : `#${i + 1}`}</span>
                    <PhotoAvatar src={m.photo} name={m.name} size={34} />
                    <div className="lp-bnc-lb-info">
                      <span className="lp-bnc-lb-name">{m.name.split(' ')[0]}</span>
                      <div className="lp-bnc-lb-bar-wrap">
                        <div className="lp-bnc-lb-bar" style={{ width: `${Math.round((m.points / 340) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="lp-bnc-lb-pts">{m.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram — narrow left */}
            <div className="lp-bnc lp-bnc--tg">
              <div className="lp-bnc-eyebrow">Авторизация</div>
              <h3 className="lp-bnc-title">Войдите через Telegram</h3>
              <div className="lp-bnc-tg-hero">
                <div className="lp-bnc-tg-bigicon">
                  <TelegramIcon size={48} />
                </div>
                <div className="lp-bnc-tg-hero-text">
                  <span className="lp-bnc-tg-hero-title">Один клик</span>
                  <span className="lp-bnc-tg-hero-sub">Без паролей и форм</span>
                </div>
              </div>
              <button className="lp-btn-ghost lp-bnc-tg-login-btn" onClick={goLogin}>
                <TelegramIcon size={18} />
                Войти через Telegram
              </button>
              <div className="lp-bnc-tg-social">
                <div className="lp-bnc-tg-avatars">
                  {['11','5','12','20'].map((id, i) => (
                    <img
                      key={id}
                      src={`https://i.pravatar.cc/32?img=${id}`}
                      className="lp-bnc-tg-av"
                      style={{ zIndex: 4 - i }}
                      alt=""
                    />
                  ))}
                </div>
                <span className="lp-bnc-tg-social-text">Уже используют сотни команд</span>
              </div>
            </div>

            {/* Notifications — wide right */}
            <div className="lp-bnc lp-bnc--notifs">
              <div className="lp-bnc-eyebrow">Уведомления</div>
              <h3 className="lp-bnc-title">Всегда в курсе событий</h3>
              <p className="lp-bnc-sub">Задачи, изменения и достижения — сразу в интерфейсе и Telegram.</p>
              <div className="lp-bnc-notif-list">

                {/* Item 1 — unread, task moved */}
                <div className="lp-bnc-notif-item lp-bnc-notif-item--unread">
                  <div className="lp-bnc-notif-body">
                    <div className="lp-bnc-notif-row">
                      <span className="lp-bnc-notif-type">Перенесена</span>
                      <span className="lp-bnc-notif-time">2 мин назад</span>
                    </div>
                    <span className="lp-bnc-notif-title">Деплой на сервер</span>
                    <div className="lp-bnc-notif-detail">
                      <span className="lp-bnc-notif-status lp-bnc-notif-status--review">На проверке</span>
                      <span className="lp-bnc-notif-arrow">→</span>
                      <span className="lp-bnc-notif-status lp-bnc-notif-status--done">Выполнено</span>
                    </div>
                    <div className="lp-bnc-notif-meta">
                      <span className="lp-bnc-notif-avatar" style={{ background: '#5b8def' }}>АК</span>
                      <span className="lp-bnc-notif-meta-text">Алексей</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      

      {/* ══════════ CTA ══════════ */}
      <section className="lp-cta lp-section">
        <div className="lp-cta-bg" aria-hidden />
        <div className="lp-container">
          <div className="lp-cta-inner">
            <h2 className="lp-cta-title">Начните работать<br />эффективнее сегодня</h2>
            <p className="lp-cta-sub">Присоединяйтесь к 1 000+ командам, которые уже используют Coopera</p>
            <button className="lp-btn-accent lp-btn-lg lp-cta-btn" onClick={goLogin}>
              Начать бесплатно <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="lp-footer-new">
        <div className="lp-footer-new-top">
          <div className="lp-footer-new-brand">
            <div className="lp-footer-new-logo">Coopera<span className="lp-footer-new-logo-dot">.</span></div>
            <p className="lp-footer-new-tagline">Платформа для командной работы с Telegram-авторизацией</p>
            <div className="lp-footer-new-contact">
              <span>Есть вопросы?</span>
              <a href="mailto:coopera@university.ru" className="lp-footer-new-email">
                Напишите нам →
              </a>
            </div>
          </div>
          <div className="lp-footer-new-cols">
            <div className="lp-footer-new-col">
              <div className="lp-footer-new-col-title">Платформа</div>
              <a href="#features">Канбан-доски</a>
              <a href="#autoassign">Автораспределение</a>
              <a href="#features">Геймификация</a>
              <a href="#features">Уведомления</a>
            </div>
            <div className="lp-footer-new-col">
              <div className="lp-footer-new-col-title">Возможности</div>
              <a href="#team-section">Управление командой</a>
              <a href="#autoassign">Умное назначение</a>
              <a href="#features">Аналитика</a>
            </div>
            <div className="lp-footer-new-col">
              <div className="lp-footer-new-col-title">Авторизация</div>
              <a href="/login">Войти через Telegram</a>
            </div>
            <div className="lp-footer-new-col">
              <div className="lp-footer-new-col-title">Coopera</div>
              <a href="#features">О проекте</a>
              <a href="https://t.me/coopera_dev_bot" target="_blank" rel="noopener noreferrer">Telegram-бот</a>
              <a href="https://github.com/flavvvour" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>

        <div className="lp-footer-new-bottom">
          <button className="lp-footer-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑ Наверх
          </button>
          <div className="lp-footer-new-copy">© 2026 Coopera · Университет им. Н.И. Лобачевского</div>
          <div className="lp-footer-new-socials">
            <a href="https://t.me/coopera_dev_bot" className="lp-footer-social-icon" target="_blank" rel="noopener noreferrer" aria-label="Telegram">✈</a>
            <a href="https://github.com/flavvvour" className="lp-footer-social-icon" target="_blank" rel="noopener noreferrer" aria-label="GitHub">⌥</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
