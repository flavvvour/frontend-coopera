import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useHookGetUser } from '@/hooks/useHookGetUser';
import { CreateTeamModal, TeamIcon } from '@/components/User/CreateTeamModal';
import {
  LayoutDashboard, KanbanSquare, BarChart2, Users, Zap, UsersRound,
  Plus, Bell, ChevronRight, ChevronLeft, Sun, Moon,
  LogOut, ChevronDown, Check, Star, PlusCircle, Image, X, Copy
} from 'lucide-react';
import { WallpaperPicker, initWallpaper } from '@/widgets/wallpaper';
import type { WallpaperKind } from '@/widgets/wallpaper';
import { patchUserSettings } from '@/api/dto/user/users.api';
import './sidebar.css';

function encodeInviteCode(teamId: number): string {
  return teamId.toString(36).toUpperCase().padStart(6, '0');
}

const TEAM_EMOJIS = ['📚','🌱','🏠','🔧','🎨','🎓','💡','🌍','🤝','🎯','⚽','🎬'];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  onNewTask?: () => void;
  onNotifClick?: () => void;
  notificationCount?: number;
}

function getTeamEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes('курс') || n.includes('диплом') || n.includes('вкр')) return '📚';
  if (n.includes('дом') || n.includes('сосед') || n.includes('ремонт')) return '🏠';
  if (n.includes('волонтер') || n.includes('помощь')) return '🤝';
  if (n.includes('спорт') || n.includes('футбол')) return '⚽';
  return '👥';
}

function getTeamDisplay(emoji: string | undefined, color: string | undefined, name: string) {
  return {
    emoji: emoji || getTeamEmoji(name),
    color: color || 'var(--bg-sunk)',
  };
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCollapseChange,
  onNewTask,
  onNotifClick,
  notificationCount = 0,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [wpPickerOpen, setWpPickerOpen] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const teamMenuRef = useRef<HTMLDivElement>(null);

  const username = sessionStorage.getItem('username') ?? '';
  const { data: user, refetch: refetchUser } = useHookGetUser(username);

  useEffect(() => {
    const handler = () => refetchUser();
    window.addEventListener('coop_team_created', handler);
    window.addEventListener('coop_teams_updated', handler);
    return () => {
      window.removeEventListener('coop_team_created', handler);
      window.removeEventListener('coop_teams_updated', handler);
    };
  }, []);

  // extract teamId from URL if present; persist last visited team
  const teamIdMatch = location.pathname.match(/\/dashboard\/teams\/(\d+)/);
  const urlTeamId = teamIdMatch ? Number(teamIdMatch[1]) : null;

  useEffect(() => {
    if (urlTeamId) sessionStorage.setItem('coop_last_team', String(urlTeamId));
  }, [urlTeamId]);

  const savedTeamId = (() => {
    const s = sessionStorage.getItem('coop_last_team');
    return s ? Number(s) : null;
  })();

  const activeTeamId = urlTeamId ?? savedTeamId;
  const activeTeam = user?.teams.find(t => t.id === activeTeamId) ?? user?.teams[0] ?? null;

  // Initialize theme and wallpaper from user data when it loads
  useEffect(() => {
    if (!user) return;
    // Init theme from user settings
    const userTheme = user.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', userTheme);
    setDark(userTheme === 'dark');
    // Init wallpaper from user settings
    initWallpaper(user.wallpaper as WallpaperKind || 'none', user.wallpaperCustomUrl || '', user.id);
  }, [user?.id]);

  // Apply theme changes to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Save theme to DB when dark state changes (only after user is loaded)
  useEffect(() => {
    if (!user) return;
    patchUserSettings(user.id, user.wallpaper || 'none', user.wallpaperCustomUrl || '', dark ? 'dark' : 'light').catch(() => {});
  }, [dark]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (teamMenuRef.current && !teamMenuRef.current.contains(e.target as Node)) {
        setTeamMenuOpen(false);
      }
    }
    if (teamMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [teamMenuOpen]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapseChange?.(next);
  };

  const navItems = [
    { id: 'dashboard',  label: 'Главная',           Icon: LayoutDashboard, path: '/dashboard' },
    { id: 'teams',      label: 'Команды',            Icon: UsersRound,      path: '/dashboard/teams' },
    { id: 'kanban',     label: 'Канбан',             Icon: KanbanSquare,    path: activeTeam ? `/dashboard/teams/${activeTeam.id}` : '/dashboard/teams' },
    { id: 'analytics',  label: 'Аналитика',          Icon: BarChart2,       path: '/dashboard/statistics' },
    { id: 'team',       label: 'Участники',          Icon: Users,           path: activeTeam ? `/dashboard/teams/${activeTeam.id}?tab=members` : '/dashboard/teams' },
    { id: 'autoassign', label: 'Автораспределение',  Icon: Zap,             path: activeTeam ? `/dashboard/teams/${activeTeam.id}?tab=autoassign` : '/dashboard/teams' },
  ];

  const isActive = (path: string) => {
    const base = path.split('?')[0];
    const tab = new URLSearchParams(path.split('?')[1] ?? '').get('tab');
    if (base === '/dashboard') return location.pathname === '/dashboard';
    if (base === '/dashboard/teams') return location.pathname === '/dashboard/teams';
    if (tab) return location.pathname.startsWith(base) && location.search.includes(`tab=${tab}`);
    if (base.includes('/dashboard/teams/')) return location.pathname.startsWith(base) && !location.search.includes('tab=');
    return location.pathname.startsWith(base);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('telegram_id');
    sessionStorage.removeItem('photo_url');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('coop_last_team');
    navigate('/');
  };

  const switchTeam = (teamId: number) => {
    setTeamMenuOpen(false);
    navigate(`/dashboard/teams/${teamId}`);
  };

  const openCreateModal = () => {
    setTeamMenuOpen(false);
    setShowCreateModal(true);
  };

  return (
    <>
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* Logo + collapse */}
      <div className="sidebar-logo">
        {!collapsed && <span className="sidebar-logo-text">Coopera</span>}
        <button className="sidebar-collapse-btn" onClick={toggle} title={collapsed ? 'Развернуть' : 'Свернуть'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Team Switcher */}
      <div className="sidebar-team-wrap" ref={teamMenuRef}>
        <button
          className={`sidebar-team-btn ${teamMenuOpen ? 'open' : ''}`}
          onClick={() => setTeamMenuOpen(v => !v)}
          title={collapsed ? (activeTeam?.name ?? 'Команды') : ''}
        >
          <span
            className="sidebar-team-emoji"
            style={activeTeam ? { background: getTeamDisplay(activeTeam.emoji, activeTeam.color, activeTeam.name).color } : { background: 'var(--bg-sunk)' }}
          >
            <TeamIcon name={activeTeam ? getTeamDisplay(activeTeam.emoji, activeTeam.color, activeTeam.name).emoji : 'Users'} size={18} />
          </span>
          {!collapsed && (
            <>
              <span className="sidebar-team-info">
                <span className="sidebar-team-name">{activeTeam?.name ?? 'Выбрать команду'}</span>
                <span className="sidebar-team-role">{activeTeam?.role ?? ''}</span>
              </span>
              <ChevronDown size={14} className={`sidebar-team-chevron ${teamMenuOpen ? 'rotated' : ''}`} />
            </>
          )}
        </button>

        {teamMenuOpen && (
          <div className="sidebar-team-menu pop-in">
            <div className="sidebar-team-menu-label">ваши команды</div>
            {(user?.teams ?? []).map(t => (
              <button
                key={t.id}
                className={`sidebar-team-item ${t.id === activeTeam?.id ? 'active' : ''}`}
                onClick={() => switchTeam(t.id)}
              >
                <span
                  className="sidebar-team-item-emoji"
                  style={{ background: getTeamDisplay(t.emoji, t.color, t.name).color }}
                >
                  <TeamIcon name={getTeamDisplay(t.emoji, t.color, t.name).emoji} size={16} />
                </span>
                <span className="sidebar-team-item-name">{t.name}</span>
                {t.id === activeTeam?.id && <Check size={13} className="sidebar-team-item-check" />}
              </button>
            ))}
            <div className="sidebar-team-menu-divider" />
            <button className="sidebar-team-create" onClick={openCreateModal}>
              <PlusCircle size={14} />
              <span>Создать команду</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={id}
              to={path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="sidebar-nav-icon" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div className="sidebar-actions">
        {!collapsed && <div className="sidebar-section-label">быстрые действия</div>}
        <button
          className="sidebar-action-btn"
          onClick={onNewTask}
          title={collapsed ? 'Новая задача' : ''}
        >
          <Plus size={17} />
          {!collapsed && <span>Новая задача</span>}
        </button>
        <button
          className={`sidebar-action-btn sidebar-notif-btn ${notificationCount > 0 ? 'has-badge' : ''}`}
          title={collapsed ? 'Уведомления' : ''}
          data-count={notificationCount > 9 ? '9+' : notificationCount}
          onClick={onNotifClick}
        >
          <Bell size={17} />
          {!collapsed && <span>Уведомления</span>}
        </button>
      </div>

      {/* Footer: user + theme */}
      <div className="sidebar-footer" style={{ position: 'relative' }}>
        {wpPickerOpen && <WallpaperPicker onClose={() => setWpPickerOpen(false)} />}
        <div className="sidebar-user" title={collapsed ? (user?.username ?? '') : ''}>
          <div className="sidebar-user-avatar" style={{ background: 'var(--accent)' }}>
            {user?.id && !photoFailed
              ? <img src={`/api/v1/users/${user.id}/photo`} alt={user.username} onError={() => setPhotoFailed(true)} />
              : <span>{getInitials(user?.username ?? 'U')}</span>
            }
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.username ?? '…'}</span>
              <span className="sidebar-user-handle">@{user?.username ?? ''}</span>
            </div>
          )}
        </div>

        <div className="sidebar-footer-btns">
          <button
            className="sidebar-icon-btn"
            onClick={() => setWpPickerOpen(v => !v)}
            title="Обои"
          >
            <Image size={16} />
          </button>
          <button
            className="sidebar-icon-btn"
            onClick={() => setDark(v => !v)}
            title={dark ? 'Светлая тема' : 'Тёмная тема'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {!collapsed && (
            <button className="sidebar-icon-btn" onClick={handleLogout} title="Выйти">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>

    {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};
