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

type Board = {
  id: number;
  label: string;
  description: string;
  icon: LucideIcon;
};

type SecondaryBoard = Pick<Board, 'id' | 'label'>;

const primaryBoards: Board[] = [
  { id: 1, label: '车协工作区', description: '协会通知与日常协作', icon: Megaphone },
  { id: 2, label: '行者足音', description: '骑行见闻与路线故事', icon: Footprints },
  { id: 3, label: '车友宝典', description: '经验、装备与新手指南', icon: BookOpen },
  { id: 4, label: '纯净水', description: '轻松闲聊与校园日常', icon: Droplets },
  { id: 5, label: '考察与社会', description: '观察、实践与思考', icon: Compass },
  { id: 6, label: '五湖四海', description: '远方来信与各地车友', icon: Globe2 },
  { id: 7, label: '一技之长', description: '维修、调试与技术交流', icon: Wrench },
  { id: 9, label: '竞赛竞技', description: '训练、赛事与成绩记录', icon: Trophy },
  { id: 28, label: '网站维护', description: '站务公告与问题反馈', icon: ServerCog },
];

// 参考 bbs-new 静态版面目录；主要版面之后的项目统一放在第二层。
const otherBoards: SecondaryBoard[] = [
  { id: 8, label: '历史笔记' },
  { id: 10, label: '资料整理' },
  { id: 11, label: '回收' },
  { id: 12, label: '公告栏' },
  { id: 13, label: '新闻发布' },
  { id: 16, label: '剧组工作' },
  { id: 20, label: '游记' },
  { id: 30, label: '测试' },
  { id: 31, label: '精品集合' },
];

function boardHref(id: number) {
  return `/bbs/index.php?bid=${id}`;
}

export function DesktopBoardDrawer({ onNavigate }: { onNavigate: () => void }) {
  return (
    <section className="board-drawer" aria-label="版块导航">
      <div className="board-drawer-section">
        <div className="grid grid-cols-3 gap-2">
          {primaryBoards.map(({ id, label, description, icon: Icon }) => (
            <a className="board-tile group" href={boardHref(id)} key={id} onClick={onNavigate}>
              <span className="board-tile-icon"><Icon size={17} /></span>
              <span className="min-w-0">
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <ChevronRight className="board-tile-arrow" size={14} />
            </a>
          ))}
        </div>
      </div>

      <div className="board-drawer-section border-t border-[var(--line)]">
        <div className="flex flex-wrap gap-2">
          {otherBoards.map(({ id, label }) => (
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
            {primaryBoards.map(({ id, label, icon: Icon }) => (
              <a className="mobile-board-link" href={boardHref(id)} key={id} onClick={onClose}>
                <Icon size={16} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap gap-2">
            {otherBoards.map(({ id, label }) => (
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
