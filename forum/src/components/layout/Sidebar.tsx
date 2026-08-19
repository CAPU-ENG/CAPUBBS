import {
  Bike,
  Compass,
  House,
  MessageCircle,
  Settings2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

type NavigationItem = {
  icon: LucideIcon;
  label: string;
};

const primaryItems: NavigationItem[] = [
  { icon: House, label: '社区首页' },
  { icon: MessageCircle, label: '最新讨论' },
  { icon: Sparkles, label: '精华归档' },
];

const boardItems: NavigationItem[] = [
  { icon: Bike, label: '骑行与路线' },
  { icon: Compass, label: '装备与维修' },
  { icon: MessageCircle, label: '校园生活' },
];

function NavigationGroup({ items, active = false }: { items: NavigationItem[]; active?: boolean }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = active && index === 0;

        return (
          <a className={`sidebar-link${isActive ? ' sidebar-link-active' : ''}`} href="#main-feed" key={item.label}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
            <span>{item.label}</span>
            {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current" /> : null}
          </a>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="surface sticky top-20 flex min-h-[calc(100vh-6rem)] flex-col p-3">
      <div>
        <p className="sidebar-label">浏览</p>
        <NavigationGroup items={primaryItems} active />
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="sidebar-label m-0 p-0">版块</p>
          <span className="text-[10px] font-semibold tracking-wider text-moss/70">03</span>
        </div>
        <NavigationGroup items={boardItems} />
      </div>

      <div className="mt-auto border-t border-ink/10 pt-3">
        <a className="sidebar-link" href="#interface-settings">
          <Settings2 aria-hidden="true" size={18} strokeWidth={1.7} />
          <span>界面设置</span>
        </a>
        <p className="px-3 pb-1 pt-4 text-[10px] leading-relaxed text-moss/70">CAPUBBS · UI Preview</p>
      </div>
    </aside>
  );
}
