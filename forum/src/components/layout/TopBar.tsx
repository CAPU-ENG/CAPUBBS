import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';
import logo1 from '../../assets/logo/logo1.webp';
import logo2 from '../../assets/logo/logo2.webp';
import { DesktopBoardDrawer, MobileBoardSidebar } from './BoardNavigation';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('capubbs-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function TopBar({
  showThreadTitle = false,
  threadTitle,
}: {
  showThreadTitle?: boolean;
  threadTitle?: string;
}) {
  const isHomePage = !new URLSearchParams(window.location.search).has('thread');
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('capubbs-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAllLayers();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const layerOpen = boardsOpen || mobileSidebarOpen;
    document.body.classList.toggle('layer-open', layerOpen);
    return () => document.body.classList.remove('layer-open');
  }, [boardsOpen, mobileSidebarOpen]);

  const threadTitleVisible = Boolean(showThreadTitle && threadTitle);

  useEffect(() => {
    if (!threadTitleVisible) return;
    setBoardsOpen(false);
  }, [threadTitleVisible]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function closeAllLayers() {
    setBoardsOpen(false);
    setMobileSidebarOpen(false);
    setProfileOpen(false);
  }

  function openBoards() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setBoardsOpen(true);
    setProfileOpen(false);
  }

  function scheduleCloseBoards() {
    closeTimer.current = window.setTimeout(() => setBoardsOpen(false), 150);
  }

  function toggleTheme() {
    setTheme((current) => current === 'light' ? 'dark' : 'light');
  }

  const anyOverlayOpen = boardsOpen || mobileSidebarOpen;

  return (
    <>
      <header className="topbar">
        <div className="topbar-shell">
          <button
            className="icon-button lg:hidden"
            type="button"
            aria-label="打开左侧栏"
            aria-expanded={mobileSidebarOpen}
            onClick={() => {
              setMobileSidebarOpen(true);
              setProfileOpen(false);
            }}
          >
            <Menu size={20} />
          </button>

          <a href="/" aria-label="返回首页" className="brand-link">
            <img src={logo1} alt="" className="brand-mark" />
            <img src={logo2} alt="车协论坛" className="brand-wordmark" />
          </a>

          <div
            className="topbar-primary-slot ml-8 hidden h-full min-w-0 flex-1 lg:grid"
            data-thread-title-visible={threadTitleVisible}
          >
            <nav
              aria-hidden={threadTitleVisible}
              aria-label="主导航"
              className="topbar-primary-nav"
            >
              <a
                href="/"
                className={`top-nav-link ${isHomePage ? 'top-nav-link-active' : ''}`}
                tabIndex={threadTitleVisible ? -1 : undefined}
              >
                首页
              </a>
              <div
                className="flex h-full items-stretch"
                onMouseEnter={openBoards}
                onMouseLeave={scheduleCloseBoards}
                onFocus={openBoards}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) scheduleCloseBoards();
                }}
              >
                <button
                  className={`top-nav-link ${boardsOpen ? 'top-nav-link-active' : ''}`}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={boardsOpen}
                  onClick={() => setBoardsOpen((open) => !open)}
                  tabIndex={threadTitleVisible ? -1 : undefined}
                >
                  版块 <ChevronDown size={14} className={`transition-transform ${boardsOpen ? 'rotate-180' : ''}`} />
                </button>
                {boardsOpen && (
                  <div className="desktop-board-drawer-wrap">
                    <DesktopBoardDrawer onNavigate={closeAllLayers} />
                  </div>
                )}
              </div>
            </nav>

            {threadTitle && (
              <a
                aria-hidden={!threadTitleVisible}
                className="topbar-thread-title"
                href="#thread-title"
                tabIndex={threadTitleVisible ? undefined : -1}
                title={threadTitle}
              >
                <span>{threadTitle}</span>
              </a>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <a
              className="icon-button"
              href="/bbs/search/"
              aria-label="搜索"
            >
              <Search size={19} />
            </a>

            <button
              className="icon-button"
              type="button"
              aria-label={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button className="icon-button relative" type="button" aria-label="消息通知">
              <Bell size={19} />
              <span className="notification-dot" aria-label="有未读消息" />
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                className="profile-trigger"
                type="button"
                aria-label="打开头像菜单"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setBoardsOpen(false);
                }}
              >
                <img src={defaultAvatar} alt="" />
                <ChevronDown size={14} className="hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="profile-menu" role="menu">
                  <a href="/bbs/home/" role="menuitem"><UserRound size={16} />个人中心</a>
                  <a href="#settings" role="menuitem"><Settings size={16} />设置</a>
                  <button type="button" role="menuitem"><LogOut size={16} />退出登录</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {anyOverlayOpen && <button className="page-overlay" type="button" aria-label="关闭当前面板" onClick={closeAllLayers} />}

      <MobileBoardSidebar open={mobileSidebarOpen} onClose={closeAllLayers} />
    </>
  );
}
