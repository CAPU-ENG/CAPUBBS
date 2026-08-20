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
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  fetchGlobalPins,
  fetchManagementThread,
  moveManagementThread,
  toggleGlobalPin,
  type ManagementThread,
} from '../api/management';
import defaultAvatar from '../assets/avatar/default-avatar.avif';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { ALL_BOARDS } from '../data/boards';

type AdminTab = 'pins' | 'move' | 'members';
type NoticeKind = 'error' | 'info' | 'success';

type ManagedMember = {
  avatar: string;
  id: string;
  joinedAt: string;
  rights: number;
  summary: string;
};

const INITIAL_MEMBERS: ManagedMember[] = [
  { avatar: defaultAvatar, id: 'CAPU', joinedAt: '2005-09', rights: 5, summary: '论坛系统管理员' },
  { avatar: defaultAvatar, id: '网站维护', joinedAt: '2012-03', rights: 4, summary: '新版论坛维护与内容协作' },
  { avatar: defaultAvatar, id: '组织部', joinedAt: '2014-10', rights: 3, summary: '协会活动与日历维护' },
  { avatar: defaultAvatar, id: '版务小组', joinedAt: '2018-06', rights: 2, summary: '日常版务协助' },
  { avatar: defaultAvatar, id: '追风少年', joinedAt: '2022-09', rights: 1, summary: '活跃会员 · 行者足音' },
  { avatar: defaultAvatar, id: '北纬三十度', joinedAt: '2023-04', rights: 1, summary: '活跃会员 · 车友宝典' },
];

const TAB_ITEMS: Array<{ icon: typeof Pin; id: AdminTab; label: string }> = [
  { icon: Pin, id: 'pins', label: '全局置顶' },
  { icon: FileInput, id: 'move', label: '帖子挪版' },
  { icon: Users, id: 'members', label: '会员管理' },
];

export function ManagementPage() {
  const { status: authStatus, viewer } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(readTabFromLocation);
  const authPending = authStatus === 'loading' || authStatus === 'restoring';
  const isAuthorized = authStatus === 'authenticated' && (viewer?.rights ?? 0) >= 3;

  function selectTab(tab: AdminTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

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
          <section className="management-workspace" aria-label="论坛管理">
            <nav aria-label="管理功能" className="management-tabs">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    aria-pressed={selected}
                    className={selected ? 'management-tab-active' : ''}
                    key={tab.id}
                    onClick={() => selectTab(tab.id)}
                    type="button"
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="management-tabpanel">
              {activeTab === 'pins' && <GlobalPinsPanel />}
              {activeTab === 'move' && <MoveThreadPanel />}
              {activeTab === 'members' && <MemberManagementPanel />}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GlobalPinsPanel() {
  const [pins, setPins] = useState<ManagementThread[]>([]);
  const [pinsStatus, setPinsStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [threadUrl, setThreadUrl] = useState('');
  const [candidate, setCandidate] = useState<ManagementThread | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [pendingThreadKey, setPendingThreadKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchGlobalPins(controller.signal).then(
      (items) => {
        setPins(items);
        setPinsStatus('ready');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPinsStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '全局置顶列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, []);

  async function inspectThread(event: FormEvent) {
    event.preventDefault();
    if (isLookingUp) return;
    setIsLookingUp(true);
    setNotice(null);
    try {
      const result = await fetchManagementThread(threadUrl);
      setCandidate(result);
      setNotice({ kind: 'info', text: '已找到帖子，请确认标题与作者后再置顶。' });
    } catch (error) {
      setCandidate(null);
      setNotice({ kind: 'error', text: errorMessage(error, '帖子查询失败，请稍后重试。') });
    } finally {
      setIsLookingUp(false);
    }
  }

  async function addPin() {
    if (!candidate) return;
    if (pinsStatus !== 'ready') {
      setNotice({ kind: 'error', text: '全局置顶列表尚未加载完成，请稍后重试。' });
      return;
    }
    if (pins.some((pin) => threadKey(pin) === threadKey(candidate))) {
      setNotice({ kind: 'error', text: '这个帖子已经在全局置顶列表中。' });
      return;
    }
    setPendingThreadKey(threadKey(candidate));
    setNotice(null);
    try {
      await toggleGlobalPin(candidate);
      setPins(await fetchGlobalPins());
      setCandidate(null);
      setThreadUrl('');
      setPinsStatus('ready');
      setNotice({ kind: 'success', text: '帖子已加入全局置顶。' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '全局置顶失败，请稍后重试。') });
    } finally {
      setPendingThreadKey(null);
    }
  }

  async function removePin(pin: ManagementThread) {
    const key = threadKey(pin);
    if (pendingThreadKey) return;
    setPendingThreadKey(key);
    setNotice(null);
    try {
      await toggleGlobalPin(pin);
      setPins(await fetchGlobalPins());
      setPinsStatus('ready');
      setNotice({ kind: 'success', text: `已取消“${pin.title}”的全局置顶。` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '取消全局置顶失败，请稍后重试。') });
    } finally {
      setPendingThreadKey(null);
    }
  }

  return (
    <div className="management-grid">
      <section className="management-card management-action-card" aria-labelledby="add-global-pin-title">
        <header className="management-card-heading">
          <div><h2 id="add-global-pin-title">添加全局置顶</h2></div>
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
              placeholder="粘贴帖子链接"
              type="text"
              value={threadUrl}
            />
            <button disabled={isLookingUp || pendingThreadKey !== null} type="submit">
              {isLookingUp ? <LoaderCircle className="animate-spin" size={15} /> : <Search size={15} />}查询帖子
            </button>
          </div>
        </form>
        {candidate && (
          <ThreadConfirmation
            actionLabel="确认全局置顶"
            disabled={pinsStatus !== 'ready' || pendingThreadKey !== null}
            onConfirm={() => void addPin()}
            pending={pendingThreadKey === threadKey(candidate)}
            thread={candidate}
          />
        )}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>

      <section className="management-card management-list-card" aria-labelledby="global-pins-title">
        <header className="management-card-heading">
          <div><h2 id="global-pins-title">当前全局置顶</h2></div>
          <span>{pins.length} 篇</span>
        </header>
        <div className="management-thread-list">
          {pinsStatus === 'loading' ? (
            <EmptyState icon={<LoaderCircle className="animate-spin" size={19} />}>正在加载全局置顶。</EmptyState>
          ) : pinsStatus === 'error' ? (
            <EmptyState icon={<CircleAlert size={19} />}>全局置顶列表加载失败。</EmptyState>
          ) : pins.length === 0 ? (
            <EmptyState icon={<PinOff size={19} />}>目前没有全局置顶帖。</EmptyState>
          ) : pins.map((pin) => (
            <article key={threadKey(pin)}>
              <span className="management-row-icon"><Pin size={15} /></span>
              <div className="management-row-main">
                <a href={pin.url}>{pin.title}<ExternalLink size={12} /></a>
                <p><span>{pin.board}</span><i />作者 {pin.author}</p>
              </div>
              <button
                className="management-danger-button"
                disabled={pendingThreadKey !== null}
                onClick={() => void removePin(pin)}
                type="button"
              >
                {pendingThreadKey === threadKey(pin) ? <LoaderCircle className="animate-spin" size={14} /> : <PinOff size={14} />}
                取消置顶
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MoveThreadPanel() {
  const [threadUrl, setThreadUrl] = useState('');
  const [candidate, setCandidate] = useState<ManagementThread | null>(null);
  const [targetBoardId, setTargetBoardId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);

  async function inspectThread(event: FormEvent) {
    event.preventDefault();
    if (isLookingUp || isMoving) return;
    setIsLookingUp(true);
    setNotice(null);
    try {
      const result = await fetchManagementThread(threadUrl);
      setCandidate(result);
      setTargetBoardId('');
      setNotice({ kind: 'info', text: '已找到帖子，请核对信息并选择目标版块。' });
    } catch (error) {
      setCandidate(null);
      setNotice({ kind: 'error', text: errorMessage(error, '帖子查询失败，请稍后重试。') });
    } finally {
      setIsLookingUp(false);
    }
  }

  async function moveThread(event: FormEvent) {
    event.preventDefault();
    if (!candidate || !targetBoardId || isMoving) return;
    const targetBoard = ALL_BOARDS.find((board) => board.id === Number(targetBoardId));
    if (!targetBoard) return;
    if (targetBoard.id === candidate.boardId) {
      setNotice({ kind: 'error', text: '目标版块与当前版块相同，请重新选择。' });
      return;
    }
    setIsMoving(true);
    setNotice(null);
    try {
      const result = await moveManagementThread(candidate, targetBoard.id);
      setCandidate(null);
      setThreadUrl('');
      setTargetBoardId('');
      setNotice({
        kind: 'success',
        text: `“${candidate.title}”已迁移至“${targetBoard.label}”（新帖子编号 #${result.threadId}）。`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '帖子迁移失败，请稍后重试。') });
    } finally {
      setIsMoving(false);
    }
  }

  return (
    <div className="management-single-column">
      <section className="management-card management-move-card" aria-label="帖子挪版">
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
            <button disabled={isLookingUp || isMoving} type="submit">
              {isLookingUp ? <LoaderCircle className="animate-spin" size={15} /> : <Search size={15} />}查询帖子
            </button>
          </div>
        </form>

        {candidate && (
          <form className="management-move-confirm" onSubmit={moveThread}>
            <ThreadIdentity thread={candidate} />
            <div className="management-board-transfer">
              <div><span>当前版块</span><strong>{candidate.board}</strong></div>
              <ArrowRight size={18} />
              <label>
                <span>目标版块</span>
                <select disabled={isMoving} onChange={(event) => setTargetBoardId(event.target.value)} required value={targetBoardId}>
                  <option value="">请选择目标版块</option>
                  {ALL_BOARDS.filter((board) => board.id !== candidate.boardId).map((board) => (
                    <option key={board.id} value={board.id}>{board.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="management-primary-button" disabled={!targetBoardId || isMoving} type="submit">
              {isMoving ? <LoaderCircle className="animate-spin" size={15} /> : <FileInput size={15} />}确认迁移帖子
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
      <section className="management-card management-action-card" aria-labelledby="member-search-title">
        <header className="management-card-heading">
          <div><h2 id="member-search-title">查找会员</h2></div>
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

      <section className="management-card management-list-card" aria-labelledby="elevated-members-title">
        <header className="management-card-heading">
          <div><h2 id="elevated-members-title">当前高权限会员</h2></div>
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
    </div>
  );
}

function ThreadConfirmation({ actionLabel, disabled, onConfirm, pending, thread }: {
  actionLabel: string;
  disabled: boolean;
  onConfirm: () => void;
  pending: boolean;
  thread: ManagementThread;
}) {
  return (
    <div className="management-thread-confirmation">
      <ThreadIdentity thread={thread} />
      <button className="management-primary-button" disabled={disabled} onClick={onConfirm} type="button">
        {pending ? <LoaderCircle className="animate-spin" size={15} /> : <MapPin size={15} />}{actionLabel}
      </button>
    </div>
  );
}

function ThreadIdentity({ thread }: { thread: ManagementThread }) {
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

function threadKey(thread: ManagementThread) {
  return `${thread.boardId}-${thread.id}`;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function readTabFromLocation(): AdminTab {
  const requested = new URLSearchParams(window.location.search).get('tab');
  return TAB_ITEMS.some((tab) => tab.id === requested) ? requested as AdminTab : 'pins';
}

function rightsLabel(rights: number) {
  if (rights >= 4) return `权限 ${rights} · 管理员`;
  if (rights === 3) return '权限 3 · 版面管理';
  if (rights === 2) return '权限 2 · 协作会员';
  return '权限 1 · 普通会员';
}
