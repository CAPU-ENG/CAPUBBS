import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  History,
  LoaderCircle,
  LogIn,
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
import { useAuth } from '../../context/AuthContext';
import { getLoginPathWithReturnTo } from '../../utils/authRoutes';
import { USER_CENTER_PATH } from '../../utils/userRoutes';
import { MessageCenter } from '../messages/MessageCenter';
import { getBoardById } from '../../data/boards';
import { usePinnedBoardIds } from '../../hooks/usePinnedBoards';
import { useTheme } from '../../hooks/useTheme';

export function TopBar({
  contextHref = '#page-title',
  contextTitle,
  minimal = false,
  showContextTitle = false,
}: {
  contextHref?: string;
  contextTitle?: string;
  minimal?: boolean;
  showContextTitle?: boolean;
}) {
  const { logout, status: authStatus, updateViewerUnreadMessages, viewer } = useAuth();
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const params = new URLSearchParams(window.location.search);
  const isHomePage = window.location.pathname === '/'
    && !params.has('tid')
    && !params.has('thread')
    && !params.has('bid')
    && !params.has('board');
  const isSearchPage = window.location.pathname.replace(/\/+$/, '') === '/search';
  const isManagePage = window.location.pathname.replace(/\/+$/, '') === '/manage';
  const canManageForum = authStatus === 'authenticated' && (viewer?.rights ?? 0) >= 3;
  const currentBoardId = Number(params.get('bid') ?? params.get('board'));
  const pinnedBoards = usePinnedBoardIds()
    .map(getBoardById)
    .filter((board) => board !== undefined);
  const { theme, toggleTheme } = useTheme();
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [boardDrawerCenter, setBoardDrawerCenter] = useState<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const boardTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileContextTitleRef = useRef<HTMLAnchorElement | null>(null);
  const mobileContextTitleTextRef = useRef<HTMLSpanElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAllLayers();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' && authStatus !== 'restoring') setProfileOpen(false);
  }, [authStatus]);

  useEffect(() => {
    const layerOpen = boardsOpen || mobileSidebarOpen;
    document.body.classList.toggle('layer-open', layerOpen);
    return () => document.body.classList.remove('layer-open');
  }, [boardsOpen, mobileSidebarOpen]);

  const contextTitleVisible = Boolean(showContextTitle && contextTitle);

  useLayoutEffect(() => {
    const titleContainer = mobileContextTitleRef.current;
    const titleText = mobileContextTitleTextRef.current;
    const topBar = topBarRef.current;
    if (!contextTitle || !titleContainer || !titleText || !topBar) return;
    const titleContainerElement = titleContainer;
    const titleTextElement = titleText;
    const topBarElement = topBar;

    let active = true;
    let frame = 0;

    function fitTitleToAvailableWidth() {
      frame = 0;
      titleTextElement.style.fontSize = '';
      topBarElement.style.removeProperty('--mobile-context-topbar-height');
      if (window.matchMedia('(min-width: 1024px)').matches) return;

      const containerStyle = window.getComputedStyle(titleContainerElement);
      const horizontalPadding = Number.parseFloat(containerStyle.paddingLeft)
        + Number.parseFloat(containerStyle.paddingRight);
      const availableWidth = titleContainerElement.clientWidth - horizontalPadding;
      const requiredWidth = titleTextElement.scrollWidth;
      if (!availableWidth) return;

      const baseFontSize = Number.parseFloat(window.getComputedStyle(titleTextElement).fontSize);
      if (!baseFontSize) return;
      const fittedFontSize = requiredWidth > availableWidth
        ? baseFontSize * (availableWidth / requiredWidth) * 0.98
        : baseFontSize;
      if (fittedFontSize < baseFontSize) titleTextElement.style.fontSize = `${fittedFontSize}px`;

      const defaultTopBarHeight = Number.parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue('--topbar-height'),
      ) || 56;
      topBarElement.style.setProperty(
        '--mobile-context-topbar-height',
        `${defaultTopBarHeight * (fittedFontSize / baseFontSize)}px`,
      );
    }

    function scheduleTitleFit() {
      if (!active) return;
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(fitTitleToAvailableWidth);
    }

    const resizeObserver = new ResizeObserver(scheduleTitleFit);
    resizeObserver.observe(titleContainerElement);
    scheduleTitleFit();
    void document.fonts.ready.then(scheduleTitleFit);
    document.fonts.addEventListener('loadingdone', scheduleTitleFit);

    return () => {
      active = false;
      resizeObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', scheduleTitleFit);
      if (frame) window.cancelAnimationFrame(frame);
      topBarElement.style.removeProperty('--mobile-context-topbar-height');
    };
  }, [contextTitle]);

  useEffect(() => {
    if (!contextTitleVisible) return;
    setBoardsOpen(false);
  }, [contextTitleVisible]);

  useEffect(() => {
    if (!boardsOpen) return;

    function updateBoardDrawerCenter() {
      const triggerBounds = boardTriggerRef.current?.getBoundingClientRect();
      if (triggerBounds) setBoardDrawerCenter(triggerBounds.left + triggerBounds.width / 2);
    }

    updateBoardDrawerCenter();
    window.addEventListener('resize', updateBoardDrawerCenter);
    return () => window.removeEventListener('resize', updateBoardDrawerCenter);
  }, [boardsOpen]);

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
    const triggerBounds = boardTriggerRef.current?.getBoundingClientRect();
    if (triggerBounds) setBoardDrawerCenter(triggerBounds.left + triggerBounds.width / 2);
    setBoardsOpen(true);
    setProfileOpen(false);
  }

  function scheduleCloseBoards() {
    closeTimer.current = window.setTimeout(() => setBoardsOpen(false), 150);
  }

  if (minimal) {
    return (
      <header className="topbar">
        <div className="topbar-shell">
          <a href="/" aria-label="返回首页" className="brand-link">
            <img src={logo1} alt="" className="brand-mark" />
            <img src={logo2} alt="车协论坛" className="brand-wordmark" />
          </a>

          <button
            className="icon-button ml-auto"
            type="button"
            aria-label={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>
    );
  }

  const anyOverlayOpen = boardsOpen || mobileSidebarOpen;

  return (
    <>
      <header
        className="topbar"
        data-context-title-visible={contextTitleVisible}
        ref={topBarRef}
      >
        <div className="topbar-shell" data-context-title-visible={contextTitleVisible}>
          {contextTitle && (
            <a
              aria-hidden={!contextTitleVisible}
              className="topbar-mobile-context-title"
              href={contextHref}
              ref={mobileContextTitleRef}
              tabIndex={contextTitleVisible ? undefined : -1}
              title={contextTitle}
            >
              <span ref={mobileContextTitleTextRef}>{contextTitle}</span>
            </a>
          )}

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
            data-context-title-visible={contextTitleVisible}
          >
            <nav
              aria-hidden={contextTitleVisible}
              aria-label="主导航"
              className="topbar-primary-nav"
            >
              <a
                href="/"
                className={`top-nav-link ${isHomePage ? 'top-nav-link-active' : ''}`}
                tabIndex={contextTitleVisible ? -1 : undefined}
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
                  ref={boardTriggerRef}
                  aria-haspopup="true"
                  aria-expanded={boardsOpen}
                  onClick={() => setBoardsOpen((open) => !open)}
                  tabIndex={contextTitleVisible ? -1 : undefined}
                >
                  版块 <ChevronDown size={14} className={`transition-transform ${boardsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {canManageForum && (
                <a
                  href="/manage"
                  className={`top-nav-link ${isManagePage ? 'top-nav-link-active' : ''}`}
                  tabIndex={contextTitleVisible ? -1 : undefined}
                >
                  管理
                </a>
              )}
              {pinnedBoards.map((board) => (
                <a
                  aria-current={currentBoardId === board.id ? 'page' : undefined}
                  className={`top-nav-link top-nav-pinned-link ${currentBoardId === board.id ? 'top-nav-link-active' : ''}`}
                  href={`/?bid=${board.id}`}
                  key={board.id}
                  tabIndex={contextTitleVisible ? -1 : undefined}
                  title={board.label}
                >
                  {board.label}
                </a>
              ))}
            </nav>

            {contextTitle && (
              <a
                aria-hidden={!contextTitleVisible}
                className="topbar-context-title"
                href={contextHref}
                tabIndex={contextTitleVisible ? undefined : -1}
                title={contextTitle}
              >
                <span>{contextTitle}</span>
              </a>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <a
              className={`icon-button ${isSearchPage ? 'icon-button-active' : ''}`}
              href="/search"
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

            {authStatus === 'authenticated' && (
              <MessageCenter
                initialUnreadCount={viewer?.unreadMessages ?? 0}
                onBeforeOpen={() => {
                  setBoardsOpen(false);
                  setMobileSidebarOpen(false);
                  setProfileOpen(false);
                }}
                onUnreadChange={updateViewerUnreadMessages}
              />
            )}

            <a
              className="legacy-forum-link"
              href="/bbs/index/"
              aria-label="切换回旧论坛"
              title="切换回旧论坛"
            >
              <History size={17} />
              <span>旧论坛</span>
            </a>

            {authPending ? (
              <span className="auth-session-loading" aria-label="正在恢复登录状态">
                <LoaderCircle className="animate-spin" size={17} />
              </span>
            ) : authStatus === 'guest' ? (
              <a className="topbar-login-link" href={getLoginPathWithReturnTo()}>
                <LogIn size={15} />登录
              </a>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="profile-trigger"
                  type="button"
                  aria-label={`${viewer?.username ?? '用户'}的个人菜单`}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setBoardsOpen(false);
                  }}
                >
                  <img
                    src={viewer?.avatar || defaultAvatar}
                    alt=""
                    onError={(event) => {
                      if (event.currentTarget.src !== defaultAvatar) event.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <ChevronDown size={14} className="hidden sm:block" />
                </button>

                {profileOpen && (
                  <div aria-label="个人菜单" className="profile-menu" role="menu">
                    <a href={USER_CENTER_PATH} role="menuitem" onClick={() => setProfileOpen(false)}>
                      <UserRound size={16} />个人中心
                    </a>
                    <a href="/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <Settings size={16} />设置
                    </a>
                    <button
                      className="profile-menu-logout"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        void logout()
                          .catch(() => undefined)
                          .then(() => window.location.reload());
                      }}
                    >
                      <LogOut size={16} />退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {boardsOpen && !contextTitleVisible && (
          <div
            className="desktop-board-drawer-wrap"
            style={{ left: boardDrawerCenter === null ? '50%' : `${boardDrawerCenter}px` }}
            onMouseEnter={openBoards}
            onMouseLeave={scheduleCloseBoards}
            onFocus={openBoards}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) scheduleCloseBoards();
            }}
          >
            <DesktopBoardDrawer onNavigate={closeAllLayers} />
          </div>
        )}
      </header>

      {anyOverlayOpen && <button className="page-overlay" type="button" aria-label="关闭当前面板" onClick={closeAllLayers} />}

      <MobileBoardSidebar open={mobileSidebarOpen} onClose={closeAllLayers} />
    </>
  );
}
