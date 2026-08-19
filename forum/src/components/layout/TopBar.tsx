import { LogIn, Menu, Moon, Search, UserPlus } from 'lucide-react';
import logo1 from '../../assets/logo/logo1.webp';
import logo2 from '../../assets/logo/logo2.webp';

const actionButtonClass =
  'flex h-[var(--capubbs-topbar-button-size)] w-[var(--capubbs-topbar-button-size)] shrink-0 items-center justify-center rounded-md border border-white/[0.28] bg-white/[0.28] text-zinc-700 transition hover:border-white/45 hover:bg-white/[0.42] hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#385772]';

export function TopBar() {
  return (
    <header className="topbar-surface fixed inset-x-0 top-0 z-30 border-b shadow-sm">
      <div className="topbar-shell mx-auto flex h-[var(--capubbs-topbar-height)] max-w-[1480px] items-center gap-[var(--capubbs-topbar-gap)] px-[var(--capubbs-topbar-x)]">
        <button className={`${actionButtonClass} lg:hidden`} type="button" aria-label="展开左侧栏">
          <Menu className="topbar-icon" />
        </button>

        <a
          href="/"
          aria-label="返回首页"
          className="flex h-[var(--capubbs-topbar-button-size)] min-w-[var(--capubbs-topbar-logo-min)] shrink-0 items-center gap-0.5 rounded-sm outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[#385772]"
        >
          <img src={logo1} alt="" className="h-[var(--capubbs-topbar-logo-height)] w-auto" />
          <img
            src={logo2}
            alt="车协论坛"
            className="h-[var(--capubbs-topbar-logo-height)] w-[var(--capubbs-topbar-logo2-width)] shrink-0 object-cover object-center"
          />
        </a>

        <label className="relative hidden h-[var(--capubbs-topbar-button-size)] min-w-0 flex-1 items-center sm:flex">
          <Search className="pointer-events-none absolute left-3 text-zinc-500/80" size={18} />
          <span className="sr-only">搜索帖子标题或正文</span>
          <input
            className="h-full min-w-0 w-full rounded-md border border-white/[0.28] bg-[rgb(164_193_172_/_0.36)] pl-10 pr-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-700/[0.62] focus:border-white/45 focus:bg-[rgb(164_193_172_/_0.48)]"
            placeholder="搜索帖子标题 / 正文"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-[var(--capubbs-topbar-action-gap)]">
          <button className={`${actionButtonClass} sm:hidden`} type="button" aria-label="搜索">
            <Search className="topbar-icon" />
          </button>
          <button className={actionButtonClass} type="button" aria-label="切换暗黑模式">
            <Moon className="topbar-icon" />
          </button>
          <button className="topbar-auth topbar-login" type="button">
            <LogIn className="topbar-icon" />
            <span>登录</span>
          </button>
          <button className="topbar-auth topbar-register" type="button">
            <UserPlus className="topbar-icon" />
            <span>注册</span>
          </button>
        </div>
      </div>
    </header>
  );
}
