import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  FileInput,
  LoaderCircle,
  MapPin,
  Pin,
  PinOff,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import defaultAvatar from '../assets/avatar/default-avatar.avif';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { ALL_BOARDS } from '../data/boards';

type AdminTab = 'pins' | 'move' | 'members';
type NoticeKind = 'error' | 'info' | 'success';

type ThreadSummary = {
  author: string;
  board: string;
  boardId: number;
  id: number;
  title: string;
  url: string;
};

type GlobalPin = ThreadSummary & {
  pinnedAt: string;
};

type ManagedMember = {
  avatar: string;
  id: string;
  joinedAt: string;
  rights: number;
  summary: string;
};

const INITIAL_PINS: GlobalPin[] = [
  {
    author: 'CAPU',
    board: '公告栏',
    boardId: 12,
    id: 18426,
    pinnedAt: '2026-08-18',
    title: '论坛使用说明与新版功能反馈汇总',
    url: '/?bid=12&tid=18426',
  },
  {
    author: '组织部',
    board: '车协工作区',
    boardId: 1,
    id: 18397,
    pinnedAt: '2026-08-11',
    title: '本学期车协活动日历及报名方式',
    url: '/?bid=1&tid=18397',
  },
  {
    author: '网站维护',
    board: '网站维护',
    boardId: 28,
    id: 18352,
    pinnedAt: '2026-07-29',
    title: '新版论坛测试期间的已知问题',
    url: '/?bid=28&tid=18352',
  },
];

const MOCK_THREADS: Record<number, Omit<ThreadSummary, 'id' | 'url'>> = {
  18431: { author: '追风少年', board: '行者足音', boardId: 2, title: '暑期环湖骑行记录与路线整理' },
  18435: { author: '北纬三十度', board: '车友宝典', boardId: 3, title: '长途骑行装备清单：从轻量化开始' },
  18440: { author: '山城车手', board: '竞赛竞技', boardId: 9, title: '九月公路车计时赛报名帖' },
};

const INITIAL_MEMBERS: ManagedMember[] = [
  { avatar: defaultAvatar, id: 'CAPU', joinedAt: '2005-09', rights: 5, summary: '论坛系统管理员' },
  { avatar: defaultAvatar, id: '网站维护', joinedAt: '2012-03', rights: 4, summary: '新版论坛维护与内容协作' },
  { avatar: defaultAvatar, id: '组织部', joinedAt: '2014-10', rights: 3, summary: '协会活动与日历维护' },
  { avatar: defaultAvatar, id: '版务小组', joinedAt: '2018-06', rights: 2, summary: '日常版务协助' },
  { avatar: defaultAvatar, id: '追风少年', joinedAt: '2022-09', rights: 1, summary: '活跃会员 · 行者足音' },
  { avatar: defaultAvatar, id: '北纬三十度', joinedAt: '2023-04', rights: 1, summary: '活跃会员 · 车友宝典' },
];

const TAB_ITEMS: Array<{ description: string; icon: typeof Pin; id: AdminTab; label: string }> = [
  { description: '管理跨版块展示的帖子', icon: Pin, id: 'pins', label: '全局置顶' },
  { description: '将帖子迁移至目标版块', icon: FileInput, id: 'move', label: '帖子挪版' },
  { description: '查看与调整会员权限', icon: Users, id: 'members', label: '会员管理' },
];

export function ManagementPage() {
  const { status: authStatus, viewer } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('pins');
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const isAuthorized = authStatus === 'authenticated' && (viewer?.rights ?? 0) >= 3;

  return (
    <div className="management-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="management-shell">
        {authPending ? (
          <ManagementState icon={<LoaderCircle className="animate-spin" size={22} />} title="正在确认管理权限">
            正在读取当前会员身份，请稍候。
          </ManagementState>
        ) : !isAuthorized ? (
          <ManagementState icon={<ShieldAlert size={22} />} title="无法进入论坛管理">
            此页面仅对权限值大于或等于 3 的会员开放。
          </ManagementState>
        ) : (
          <section className="management-panel" aria-labelledby="management-title">
            <header className="management-heading">
              <div className="management-heading-copy">
                <span className="management-title-icon"><ShieldCheck size={20} /></span>
                <div>
                  <div className="management-title-line">
                    <h1 id="management-title">论坛管理</h1>
                    <em>权限 {viewer?.rights}</em>
                  </div>
                  <p>管理全局内容、帖子版块与会员权限</p>
                </div>
              </div>
              <div className="management-operator">
                <span>当前操作员</span>
                <strong>{viewer?.username}</strong>
              </div>
            </header>

            <div className="management-body">
              <div aria-label="管理功能" className="management-tabs" role="tablist">
                {TAB_ITEMS.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      aria-controls={`management-tabpanel-${tab.id}`}
                      aria-selected={selected}
                      className={selected ? 'management-tab-active' : ''}
                      id={`management-tab-${tab.id}`}
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      type="button"
                    >
                      <span><Icon size={17} /></span>
                      <span><strong>{tab.label}</strong><small>{tab.description}</small></span>
                    </button>
                  );
                })}
              </div>

              <div
                aria-labelledby={`management-tab-${activeTab}`}
                className="management-tabpanel"
                id={`management-tabpanel-${activeTab}`}
                role="tabpanel"
              >
                {activeTab === 'pins' && <GlobalPinsPanel />}
                {activeTab === 'move' && <MoveThreadPanel />}
                {activeTab === 'members' && <MemberManagementPanel />}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GlobalPinsPanel() {
  const [pins, setPins] = useState(INITIAL_PINS);
  const [threadUrl, setThreadUrl] = useState('');
  const [candidate, setCandidate] = useState<ThreadSummary | null>(null);
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);

  function inspectThread(event: FormEvent) {
    event.preventDefault();
    const result = resolveMockThread(threadUrl);
    if (!result) {
      setCandidate(null);
      setNotice({ kind: 'error', text: '未识别到有效帖子链接，请检查链接中的帖子编号。' });
      return;
    }
    setCandidate(result);
    setNotice({ kind: 'info', text: '已找到帖子，请确认标题与作者后再置顶。' });
  }

  function addPin() {
    if (!candidate) return;
    if (pins.some((pin) => pin.id === candidate.id)) {
      setNotice({ kind: 'error', text: '这个帖子已经在全局置顶列表中。' });
      return;
    }
    setPins((current) => [{ ...candidate, pinnedAt: formatToday() }, ...current]);
    setCandidate(null);
    setThreadUrl('');
    setNotice({ kind: 'success', text: '模拟操作完成：帖子已加入全局置顶。' });
  }

  function removePin(pin: GlobalPin) {
    setPins((current) => current.filter((item) => item.id !== pin.id));
    setNotice({ kind: 'success', text: `模拟操作完成：已取消“${pin.title}”的全局置顶。` });
  }

  return (
    <div className="management-grid">
      <section className="management-card management-list-card" aria-labelledby="global-pins-title">
        <header className="management-card-heading">
          <div><h2 id="global-pins-title">当前全局置顶</h2><p>这些帖子会在所有版块的帖子列表顶部展示。</p></div>
          <span>{pins.length} 篇</span>
        </header>
        <div className="management-thread-list">
          {pins.length === 0 ? (
            <EmptyState icon={<PinOff size={19} />}>目前没有全局置顶帖。</EmptyState>
          ) : pins.map((pin) => (
            <article key={pin.id}>
              <span className="management-row-icon"><Pin size={15} /></span>
              <div className="management-row-main">
                <a href={pin.url}>{pin.title}<ExternalLink size={12} /></a>
                <p><span>{pin.board}</span><i />作者 {pin.author}<i />置顶于 {pin.pinnedAt}</p>
              </div>
              <button className="management-danger-button" onClick={() => removePin(pin)} type="button">
                <PinOff size={14} />取消置顶
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="management-card management-action-card" aria-labelledby="add-global-pin-title">
        <header className="management-card-heading">
          <div><h2 id="add-global-pin-title">添加全局置顶</h2><p>输入帖子链接，先核对帖子身份。</p></div>
        </header>
        <form className="management-lookup-form" onSubmit={inspectThread}>
          <label htmlFor="global-pin-url">帖子链接</label>
          <div className="management-input-action">
            <input
              id="global-pin-url"
              onChange={(event) => {
                setThreadUrl(event.target.value);
                setCandidate(null);
                setNotice(null);
              }}
              placeholder="例如 /?bid=2&tid=18431"
              type="text"
              value={threadUrl}
            />
            <button type="submit"><Search size={15} />查询帖子</button>
          </div>
          <small>演示帖子编号：18431、18435、18440</small>
        </form>
        {candidate && <ThreadConfirmation actionLabel="确认全局置顶" onConfirm={addPin} thread={candidate} />}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>
    </div>
  );
}

function MoveThreadPanel() {
  const [threadUrl, setThreadUrl] = useState('');
  const [candidate, setCandidate] = useState<ThreadSummary | null>(null);
  const [targetBoardId, setTargetBoardId] = useState('');
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);

  function inspectThread(event: FormEvent) {
    event.preventDefault();
    const result = resolveMockThread(threadUrl);
    if (!result) {
      setCandidate(null);
      setNotice({ kind: 'error', text: '未识别到有效帖子链接，请检查链接中的帖子编号。' });
      return;
    }
    setCandidate(result);
    setTargetBoardId('');
    setNotice({ kind: 'info', text: '已找到帖子，请核对信息并选择目标版块。' });
  }

  function moveThread(event: FormEvent) {
    event.preventDefault();
    if (!candidate || !targetBoardId) return;
    const targetBoard = ALL_BOARDS.find((board) => board.id === Number(targetBoardId));
    if (!targetBoard) return;
    if (targetBoard.id === candidate.boardId) {
      setNotice({ kind: 'error', text: '目标版块与当前版块相同，请重新选择。' });
      return;
    }
    setNotice({ kind: 'success', text: `模拟操作完成：“${candidate.title}”将迁移至“${targetBoard.label}”。` });
    setCandidate(null);
    setThreadUrl('');
    setTargetBoardId('');
  }

  return (
    <div className="management-single-column">
      <section className="management-card management-move-card" aria-labelledby="move-thread-title">
        <header className="management-card-heading">
          <div><h2 id="move-thread-title">帖子挪版</h2><p>每次仅迁移一个主题帖，楼内回复会随主题一同移动。</p></div>
        </header>
        <div className="management-move-flow" aria-hidden="true">
          <span className={candidate ? 'is-complete' : 'is-current'}><b>1</b>查询帖子</span>
          <ArrowRight size={15} />
          <span className={candidate ? 'is-current' : ''}><b>2</b>确认并迁移</span>
        </div>
        <form className="management-lookup-form management-move-lookup" onSubmit={inspectThread}>
          <label htmlFor="move-thread-url">帖子链接</label>
          <div className="management-input-action">
            <input
              id="move-thread-url"
              onChange={(event) => {
                setThreadUrl(event.target.value);
                setCandidate(null);
                setNotice(null);
              }}
              placeholder="粘贴需要迁移的帖子链接"
              type="text"
              value={threadUrl}
            />
            <button type="submit"><Search size={15} />查询帖子</button>
          </div>
          <small>演示帖子编号：18431、18435、18440</small>
        </form>

        {candidate && (
          <form className="management-move-confirm" onSubmit={moveThread}>
            <ThreadIdentity thread={candidate} />
            <div className="management-board-transfer">
              <div><span>当前版块</span><strong>{candidate.board}</strong></div>
              <ArrowRight size={18} />
              <label>
                <span>目标版块</span>
                <select onChange={(event) => setTargetBoardId(event.target.value)} required value={targetBoardId}>
                  <option value="">请选择目标版块</option>
                  {ALL_BOARDS.filter((board) => board.id !== candidate.boardId).map((board) => (
                    <option key={board.id} value={board.id}>{board.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="management-primary-button" disabled={!targetBoardId} type="submit">
              <FileInput size={15} />确认迁移帖子
            </button>
          </form>
        )}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>
    </div>
  );
}

function MemberManagementPanel() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);
  const elevatedMembers = useMemo(() => members.filter((member) => member.rights > 1), [members]);
  const selectedMember = members.find((member) => member.id === selectedId) ?? null;

  function searchMember(event: FormEvent) {
    event.preventDefault();
    const result = members.find((member) => member.id.toLocaleLowerCase() === query.trim().toLocaleLowerCase());
    if (!result) {
      setSelectedId(null);
      setNotice({ kind: 'error', text: '没有找到这个会员 ID，请检查后重试。' });
      return;
    }
    setSelectedId(result.id);
    setNotice({ kind: 'info', text: '已找到会员，请确认身份与当前权限。' });
  }

  function toggleLevelTwo(member: ManagedMember) {
    if (member.rights > 2) return;
    const nextRights = member.rights === 2 ? 1 : 2;
    setMembers((current) => current.map((item) => item.id === member.id ? { ...item, rights: nextRights } : item));
    setNotice({
      kind: 'success',
      text: nextRights === 2
        ? `模拟操作完成：已赋予 ${member.id} 会员 2 级权限。`
        : `模拟操作完成：已取消 ${member.id} 的会员 2 级权限。`,
    });
  }

  return (
    <div className="management-grid management-members-grid">
      <section className="management-card management-list-card" aria-labelledby="elevated-members-title">
        <header className="management-card-heading">
          <div><h2 id="elevated-members-title">当前高权限会员</h2><p>展示所有权限值大于 1 的会员。</p></div>
          <span>{elevatedMembers.length} 人</span>
        </header>
        <div className="management-member-list">
          {elevatedMembers.map((member) => (
            <button key={member.id} onClick={() => {
              setQuery(member.id);
              setSelectedId(member.id);
              setNotice({ kind: 'info', text: '已选择会员，请在右侧确认权限。' });
            }} type="button">
              <img alt="" src={member.avatar} />
              <span><strong>{member.id}</strong><small>{member.summary}</small></span>
              <em data-rights={member.rights}>权限 {member.rights}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="management-card management-action-card" aria-labelledby="member-search-title">
        <header className="management-card-heading">
          <div><h2 id="member-search-title">查找会员</h2><p>按完整 ID 搜索并确认会员身份。</p></div>
        </header>
        <form className="management-lookup-form" onSubmit={searchMember}>
          <label htmlFor="member-id">会员 ID</label>
          <div className="management-input-action">
            <input
              id="member-id"
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedId(null);
                setNotice(null);
              }}
              placeholder="输入完整会员 ID"
              type="search"
              value={query}
            />
            <button type="submit"><Search size={15} />搜索会员</button>
          </div>
          <small>演示 ID：版务小组、追风少年、北纬三十度</small>
        </form>

        {selectedMember && (
          <div className="management-member-confirmation">
            <div className="management-member-identity">
              <img alt="" src={selectedMember.avatar} />
              <div><span>已确认会员身份</span><strong>{selectedMember.id}</strong><p>{selectedMember.summary} · 加入于 {selectedMember.joinedAt}</p></div>
              <BadgeCheck size={19} />
            </div>
            <div className="management-permission-row">
              <div><span>当前权限</span><strong>{rightsLabel(selectedMember.rights)}</strong></div>
              {selectedMember.rights > 2 ? (
                <button disabled type="button"><ShieldCheck size={15} />高级权限受保护</button>
              ) : (
                <button
                  className={selectedMember.rights === 2 ? 'management-danger-button' : 'management-primary-button'}
                  onClick={() => toggleLevelTwo(selectedMember)}
                  type="button"
                >
                  <UserCog size={15} />{selectedMember.rights === 2 ? '取消 2 级权限' : '赋予 2 级权限'}
                </button>
              )}
            </div>
          </div>
        )}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>
    </div>
  );
}

function ThreadConfirmation({ actionLabel, onConfirm, thread }: {
  actionLabel: string;
  onConfirm: () => void;
  thread: ThreadSummary;
}) {
  return (
    <div className="management-thread-confirmation">
      <ThreadIdentity thread={thread} />
      <button className="management-primary-button" onClick={onConfirm} type="button">
        <MapPin size={15} />{actionLabel}
      </button>
    </div>
  );
}

function ThreadIdentity({ thread }: { thread: ThreadSummary }) {
  return (
    <div className="management-thread-identity">
      <span>请确认帖子信息</span>
      <a href={thread.url}>{thread.title}<ExternalLink size={12} /></a>
      <dl>
        <div><dt>作者</dt><dd>{thread.author}</dd></div>
        <div><dt>当前版块</dt><dd>{thread.board}</dd></div>
        <div><dt>帖子编号</dt><dd>#{thread.id}</dd></div>
      </dl>
    </div>
  );
}

function ManagementNotice({ children, kind }: { children: ReactNode; kind: NoticeKind }) {
  return (
    <p aria-live="polite" className="management-notice" data-kind={kind}>
      {kind === 'success' ? <BadgeCheck size={15} /> : <CircleAlert size={15} />}{children}
    </p>
  );
}

function EmptyState({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return <div className="management-empty"><span>{icon}</span>{children}</div>;
}

function ManagementState({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="management-state">
      <span>{icon}</span>
      <h1>{title}</h1>
      <p>{children}</p>
      <a href="/">返回首页</a>
    </section>
  );
}

function resolveMockThread(value: string): ThreadSummary | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, window.location.origin);
    const pathThreadId = url.pathname.match(/\/(?:threads?|thread)\/(\d+)/i)?.[1];
    const threadId = Number(url.searchParams.get('tid') ?? url.searchParams.get('thread') ?? pathThreadId);
    const summary = MOCK_THREADS[threadId];
    if (!Number.isInteger(threadId) || threadId <= 0 || !summary) return null;
    return {
      ...summary,
      id: threadId,
      url: `/?bid=${summary.boardId}&tid=${threadId}`,
    };
  } catch {
    return null;
  }
}

function rightsLabel(rights: number) {
  if (rights >= 4) return `权限 ${rights} · 管理员`;
  if (rights === 3) return '权限 3 · 版面管理';
  if (rights === 2) return '权限 2 · 协作会员';
  return '权限 1 · 普通会员';
}

function formatToday() {
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date()).replaceAll('/', '-');
}
