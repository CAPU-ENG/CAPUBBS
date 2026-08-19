import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Compass,
  Flame,
  Footprints,
  Globe2,
  Home,
  Megaphone,
  PanelLeftClose,
  QrCode,
  SlidersHorizontal,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

type SidebarItem = { icon: LucideIcon; label: string };

const boards: SidebarItem[] = [
  { icon: Megaphone, label: '车协工作区' },
  { icon: Footprints, label: '行者足音' },
  { icon: BookOpen, label: '车友宝典' },
  { icon: Flame, label: '纯净水' },
  { icon: Compass, label: '考察与社会' },
  { icon: Globe2, label: '五湖四海' },
  { icon: Wrench, label: '一技之长' },
  { icon: Trophy, label: '竞赛竞技' },
  { icon: QrCode, label: '网站维护' },
];

function SidebarLink({ icon: Icon, label }: SidebarItem) {
  return (
    <a href="#feed" className="card-option sidebar-option flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-zinc-600">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center"><Icon size={18} /></span>
      <span>{label}</span>
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="card-surface flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-lg border border-zinc-200 p-3 shadow-panel">
      <div className="shrink-0 space-y-1">
        <a href="#feed" className="sidebar-option flex h-10 items-center gap-3 rounded-md border border-transparent bg-teal-50 px-3 text-sm font-medium text-teal-800">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center"><Home size={18} /></span>
          <span>首页</span>
        </a>
      </div>

      <div className="sidebar-board-scroll scrollbar-none mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pb-8">
        {boards.map((item) => <SidebarLink key={item.label} {...item} />)}
        <a href="#more" className="card-option sidebar-option flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-zinc-600">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center"><ChevronDown size={18} /></span>
          <span>更多</span>
        </a>
      </div>

      <div className="shrink-0 space-y-1 border-b border-zinc-200 pb-2">
        <SidebarLink icon={BarChart3} label="数据展示" />
        <SidebarLink icon={SlidersHorizontal} label="界面设置" />
      </div>
      <button type="button" className="card-option sidebar-option mt-2 flex h-10 w-full items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-zinc-600">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center"><PanelLeftClose size={18} /></span>
        <span>折叠侧栏</span>
      </button>
    </aside>
  );
}
