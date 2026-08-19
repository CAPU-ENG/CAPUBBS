import { Bell, Menu, Search, UserRound } from 'lucide-react';

export function TopBar() {
  return (
    <header className="topbar-shell">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:gap-5">
        <button className="icon-button lg:hidden" type="button" aria-label="打开导航">
          <Menu aria-hidden="true" size={19} strokeWidth={1.8} />
        </button>

        <a className="brand-lockup" href="/" aria-label="CAPUBBS 首页">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="min-w-0">
            <strong className="block font-display text-lg font-bold leading-none tracking-[0.08em] text-ink sm:text-xl">
              CAPU BBS
            </strong>
            <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.24em] text-moss/80 sm:block">
              Cycling Association Forum
            </span>
          </span>
        </a>

        <label className="search-frame ml-auto hidden max-w-xl flex-1 md:flex">
          <Search aria-hidden="true" size={17} strokeWidth={1.8} />
          <span className="sr-only">搜索社区</span>
          <input type="search" placeholder="搜索主题、版块或用户" />
          <kbd>⌘ K</kbd>
        </label>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button className="icon-button md:hidden" type="button" aria-label="搜索">
            <Search aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
          <button className="icon-button hidden sm:grid" type="button" aria-label="通知">
            <Bell aria-hidden="true" size={18} strokeWidth={1.8} />
            <span className="notification-dot" />
          </button>
          <button className="user-button hidden sm:flex" type="button">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lake text-white">
              <UserRound aria-hidden="true" size={17} strokeWidth={1.8} />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-ink">游客</span>
              <span className="block text-[10px] text-moss">登录 / 注册</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
