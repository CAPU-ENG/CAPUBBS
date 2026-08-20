import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Compass,
  Droplets,
  Footprints,
  Globe2,
  Megaphone,
  ServerCog,
  Trophy,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import logo1 from '../../assets/logo/logo1.webp';
import logo2 from '../../assets/logo/logo2.webp';
import { PRIMARY_BOARDS, SECONDARY_BOARDS } from '../../data/boards';

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
  return `/?bid=${id}`;
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

      <div className="board-drawer-section flex items-center border-t border-[var(--line)]">
        <a className="supplement-link" href="/index/data.php" onClick={onNavigate}>
          <BarChart3 size={15} /> 数据展示
        </a>
      </div>
    </section>
  );
}

export function MobileBoardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside
      aria-hidden={!open}
      aria-label="移动端左侧栏"
      className={`mobile-sidebar ${open ? 'mobile-sidebar-open' : ''}`}
    >
      <div className="flex h-16 items-center border-b border-[var(--line)] px-4">
        <a className="flex min-w-0 items-center gap-0.5" href="/" onClick={onClose}>
          <img src={logo1} alt="" className="h-7 w-auto" />
          <img src={logo2} alt="车协论坛" className="h-7 w-[76px] object-cover object-center" />
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

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <a className="supplement-link" href="/index/data.php" onClick={onClose}>
            <BarChart3 size={16} /> 数据展示
          </a>
        </div>
      </div>
    </aside>
  );
}
