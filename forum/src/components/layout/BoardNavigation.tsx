import {
  Archive,
  BarChart3,
  BookOpen,
  ChevronRight,
  Compass,
  CornerUpLeft,
  Dices,
  Droplets,
  Footprints,
  Globe2,
  House,
  Megaphone,
  ServerCog,
  Settings,
  Trophy,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { LoadingSpinner as LoaderCircle } from './LoadingSpinner';
import logo1 from '../../assets/logo/logo1.webp';
import logo2 from '../../assets/logo/logo2.webp';
import { fetchRandomThread } from '../../api/randomThread';
import { PRIMARY_BOARDS, SECONDARY_BOARDS } from '../../data/boards';
import { toForumHref } from '../../utils/forumBasePath';
import { saveForumMode, SHARED_FORUM_ENTRY_PATH } from '../../utils/forumMode';

const boardIcons: Record<number, LucideIcon> = {
  1: Megaphone,
  2: Footprints,
  3: BookOpen,
  4: Droplets,
  5: Compass,
  6: Globe2,
  7: Wrench,
  9: Trophy,
  28: ServerCog,
};

function boardHref(id: number) {
  return toForumHref(`/?bid=${id}`);
}

function RandomThreadButton({ onNavigate }: { onNavigate: () => void }) {
  const [loading, setLoading] = useState(false);

  async function navigateToRandomThread() {
    if (loading) return;
    setLoading(true);

    try {
      const { bid, tid } = await fetchRandomThread();
      onNavigate();
      window.location.assign(toForumHref(`/?bid=${bid}&tid=${tid}&p=1`));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '随机帖子加载失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      aria-busy={loading}
      className="supplement-link"
      disabled={loading}
      type="button"
      onClick={() => void navigateToRandomThread()}
    >
      {loading ? <LoaderCircle className="animate-spin" size={15} /> : <Dices size={15} />}
      试试手气
    </button>
  );
}

export function DesktopBoardDrawer({ onNavigate }: { onNavigate: () => void }) {
  return (
    <section className="board-drawer" aria-label="版块导航">
      <div className="board-drawer-section">
        <div className="grid grid-cols-3 gap-2">
          {PRIMARY_BOARDS.map(({ id, label }) => {
            const Icon = boardIcons[id];
            return (
              <a className="board-tile group" href={boardHref(id)} key={id} onClick={onNavigate}>
                <span className="board-tile-icon"><Icon size={15} /></span>
                <strong>{label}</strong>
                <ChevronRight className="board-tile-arrow" size={14} />
              </a>
            );
          })}
        </div>
      </div>

      <div className="board-drawer-section border-t border-[var(--line)]">
        <div className="flex flex-wrap gap-2">
          {SECONDARY_BOARDS.map(({ id, label }) => (
            <a className="supplement-link" href={boardHref(id)} key={id} onClick={onNavigate}>{label}</a>
          ))}
        </div>
      </div>

      <div className="board-drawer-section flex flex-wrap items-center gap-2 border-t border-[var(--line)]">
        <a className="supplement-link" href={toForumHref('/data')} onClick={onNavigate}>
          <BarChart3 size={15} /> 数据展示
        </a>
        <a className="supplement-link" href={toForumHref('/toolbox')} onClick={onNavigate}>
          <Wrench size={15} /> 工具箱
        </a>
        <RandomThreadButton onNavigate={onNavigate} />
        <a className="supplement-link" href={toForumHref('/archive-room')} onClick={onNavigate}>
          <Archive size={15} /> 档案室
        </a>
        <a className="supplement-link" href="https://www.chexie.space/" onClick={onNavigate}>
          <House size={15} /> 车协家园
        </a>
      </div>
    </section>
  );
}

export function MobileBoardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      aria-hidden={!open}
      aria-label="移动端左侧栏"
      className={`mobile-sidebar ${open ? 'mobile-sidebar-open' : ''}`}
    >
      <div className="flex h-16 items-center border-b border-[var(--line)] px-4">
        <a className="flex min-w-0 items-center gap-0.5" href={toForumHref('/')} onClick={onClose}>
          <img src={logo1} alt="" className="h-7 w-auto" />
          <img src={logo2} alt="车协论坛" className="mobile-sidebar-wordmark h-7 w-[76px] object-cover object-center" />
        </a>
        <button className="icon-button ml-auto" type="button" aria-label="关闭左侧栏" onClick={onClose}>
          <X size={19} />
        </button>
      </div>

      <div className="mobile-sidebar-scroll">
        <div>
          <div className="grid grid-cols-2 gap-2">
            {PRIMARY_BOARDS.map(({ id, label }) => {
              const Icon = boardIcons[id];
              return (
                <a className="mobile-board-link" href={boardHref(id)} key={id} onClick={onClose}>
                  <Icon size={16} />
                  <span>{label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap gap-2">
            {SECONDARY_BOARDS.map(({ id, label }) => (
              <a className="supplement-link" href={boardHref(id)} key={id} onClick={onClose}>{label}</a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
          <a className="supplement-link" href={toForumHref('/data')} onClick={onClose}>
            <BarChart3 size={16} /> 数据展示
          </a>
          <a className="supplement-link" href={toForumHref('/toolbox')} onClick={onClose}>
            <Wrench size={16} /> 工具箱
          </a>
          <RandomThreadButton onNavigate={onClose} />
          <a className="supplement-link" href={toForumHref('/archive-room')} onClick={onClose}>
            <Archive size={16} /> 档案室
          </a>
          <a className="supplement-link" href="https://www.chexie.space/" onClick={onClose}>
            <House size={16} /> 车协家园
          </a>
        </div>

        <div className="mobile-sidebar-guest-links">
          <a className="supplement-link" href={toForumHref('/settings')} onClick={onClose}>
            <Settings size={16} /> 设置
          </a>
          <a
            className="supplement-link"
            href={SHARED_FORUM_ENTRY_PATH}
            data-forum-entry-reload="true"
            onClick={() => {
              saveForumMode('legacy');
              onClose();
            }}
          >
            <CornerUpLeft size={16} /> 回到旧论坛
          </a>
        </div>
      </div>
    </aside>
  );
}
