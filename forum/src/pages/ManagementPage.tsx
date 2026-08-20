import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  FileInput,
  LoaderCircle,
  Mail,
  MapPin,
  Pin,
  PinOff,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  fetchGlobalPins,
  fetchManagementBoardModerators,
  fetchManagementElevatedMembers,
  fetchManagementMember,
  fetchManagementMutes,
  fetchManagementThread,
  moveManagementThread,
  setManagementEmailMute,
  setManagementBoardModerator,
  setManagementMemberRights,
  toggleGlobalPin,
  type ManagementBoardModerators,
  type ManagementMember,
  type ManagementMute,
  type ManagementThread,
} from '../api/management';
import defaultAvatar from '../assets/avatar/default-avatar.avif';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS } from '../data/boards';

type AdminTab = 'pins' | 'move' | 'members' | 'moderators';
type NoticeKind = 'error' | 'info' | 'success';

const TAB_ITEMS: Array<{ icon: typeof Pin; id: AdminTab; label: string }> = [
  { icon: Pin, id: 'pins', label: '全局置顶' },
  { icon: FileInput, id: 'move', label: '帖子挪版' },
  { icon: Users, id: 'members', label: '会员管理' },
  { icon: Shield, id: 'moderators', label: '版主管理' },
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
              {activeTab === 'moderators' && <ModeratorManagementPanel />}
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
  const memberSearchRef = useRef<HTMLElement>(null);
  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [membersStatus, setMembersStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [mutes, setMutes] = useState<ManagementMute[]>([]);
  const [mutesStatus, setMutesStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [collapsedRights, setCollapsedRights] = useState<Set<number>>(() => new Set());
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);
  const elevatedMembers = useMemo(() => members.filter((member) => member.rights > 0), [members]);
  const permissionGroups = useMemo(() => {
    const groups = new Map<number, ManagementMember[]>();
    elevatedMembers.forEach((member) => {
      groups.set(member.rights, [...(groups.get(member.rights) ?? []), member]);
    });
    return Array.from(groups, ([rights, groupedMembers]) => ({ members: groupedMembers, rights }))
      .sort((left, right) => right.rights - left.rights);
  }, [elevatedMembers]);
  const selectedMember = members.find((member) => member.id === selectedId) ?? null;

  useEffect(() => {
    const controller = new AbortController();
    void fetchManagementElevatedMembers(controller.signal).then(
      (items) => {
        setMembers(items);
        setMembersStatus('ready');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setMembersStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '权限会员列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchManagementMutes(controller.signal).then(
      (items) => {
        setMutes(items);
        setMutesStatus('ready');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setMutesStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '禁言会员列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, []);

  async function loadMember(memberId: string) {
    if (isSearching) return;
    setIsSearching(true);
    setNotice(null);
    try {
      const result = await fetchManagementMember(memberId);
      setMembers((current) => {
        const existingIndex = current.findIndex((member) => member.id === result.id);
        if (existingIndex < 0) return [...current, result];
        return current.map((member, index) => index === existingIndex ? result : member);
      });
      setSelectedId(result.id);
      setNotice({ kind: 'info', text: '已找到会员，请确认身份。' });
    } catch (error) {
      setSelectedId(null);
      setNotice({ kind: 'error', text: errorMessage(error, '会员查询失败，请稍后重试。') });
    } finally {
      setIsSearching(false);
    }
  }

  function searchMember(event: FormEvent) {
    event.preventDefault();
    void loadMember(query);
  }

  function openMemberDetails(memberId: string) {
    setQuery(memberId);
    memberSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    void loadMember(memberId);
  }

  function togglePermissionGroup(rights: number) {
    setCollapsedRights((current) => {
      const next = new Set(current);
      if (next.has(rights)) next.delete(rights);
      else next.add(rights);
      return next;
    });
  }

  async function toggleLevelTwo(member: ManagementMember) {
    if (member.rights > 2 || pendingMemberId) return;
    const nextRights = member.rights === 2 ? 0 : 2;
    setPendingMemberId(member.id);
    setNotice(null);
    try {
      const updated = await setManagementMemberRights(member.id, nextRights);
      setMembers((current) => upsertManagementMember(current, updated));
      setSelectedId(updated.id);
      setNotice({
        kind: 'success',
        text: nextRights === 2
          ? `已赋予 ${member.id} 会员 2 级权限。`
          : `已取消 ${member.id} 的会员 2 级权限。`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '会员权限更新失败，请稍后重试。') });
    } finally {
      setPendingMemberId(null);
    }
  }

  async function toggleMemberMute(member: ManagementMember) {
    if (!member.email || pendingEmail) return;
    const nextMuted = !member.muted;
    setPendingEmail(member.email);
    setNotice(null);
    try {
      await setManagementEmailMute(member.email, nextMuted);
      const refreshedMutes = await fetchManagementMutes();
      setMutes(refreshedMutes);
      setMutesStatus('ready');
      setMembers((current) => current.map((item) => item.email === member.email ? { ...item, muted: nextMuted } : item));
      setNotice({
        kind: 'success',
        text: nextMuted ? `已禁言 ${member.relatedIds.join('、')}。` : `已解除 ${member.relatedIds.join('、')} 的禁言。`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, nextMuted ? '禁言失败，请稍后重试。' : '解除禁言失败，请稍后重试。') });
    } finally {
      setPendingEmail(null);
    }
  }

  async function unmuteEntry(mute: ManagementMute) {
    if (pendingEmail) return;
    setPendingEmail(mute.email);
    setNotice(null);
    try {
      await setManagementEmailMute(mute.email, false);
      setMutes(await fetchManagementMutes());
      setMutesStatus('ready');
      setMembers((current) => current.map((member) => member.email === mute.email ? { ...member, muted: false } : member));
      setNotice({ kind: 'success', text: `已解除 ${mute.ids.length > 0 ? mute.ids.join('、') : mute.email} 的禁言。` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '解除禁言失败，请稍后重试。') });
    } finally {
      setPendingEmail(null);
    }
  }

  return (
    <div className="management-grid management-members-grid">
      <section
        className="management-card management-action-card management-member-search-card"
        aria-labelledby="member-search-title"
        ref={memberSearchRef}
      >
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
            <button disabled={isSearching} type="submit">
              {isSearching ? <LoaderCircle className="animate-spin" size={15} /> : <Search size={15} />}搜索会员
            </button>
          </div>
        </form>

        {selectedMember && (
          <div className="management-member-confirmation">
            <div className="management-member-identity">
              <img alt="" src={selectedMember.avatar || defaultAvatar} />
              <div><span>已确认会员身份</span><strong>{selectedMember.id}</strong>{selectedMember.joinedAt && <p>{selectedMember.joinedAt}</p>}</div>
              <BadgeCheck size={19} />
            </div>
            <div className="management-member-email">
              <Mail size={15} />
              <div>
                <strong>{selectedMember.email || '未绑定邮箱'}</strong>
                <span>{selectedMember.relatedIds.map((id) => <em key={id}>{id}</em>)}</span>
              </div>
            </div>
            <div className="management-permission-row">
              <div><span>当前权限</span><strong>{rightsLabel(selectedMember.rights)}</strong></div>
              {selectedMember.rights > 2 ? (
                <button disabled type="button"><ShieldCheck size={15} />高级权限受保护</button>
              ) : (
                <button
                  className={selectedMember.rights === 2 ? 'management-danger-button' : 'management-primary-button'}
                  disabled={pendingMemberId !== null}
                  onClick={() => void toggleLevelTwo(selectedMember)}
                  type="button"
                >
                  {pendingMemberId === selectedMember.id ? <LoaderCircle className="animate-spin" size={15} /> : <UserCog size={15} />}
                  {selectedMember.rights === 2 ? '取消 2 级权限' : '赋予 2 级权限'}
                </button>
              )}
            </div>
            <div className="management-mute-row">
              <div><span>禁言状态</span><strong>{selectedMember.muted ? '已禁言' : '未禁言'}</strong></div>
              <button
                className={selectedMember.muted ? 'management-primary-button' : 'management-danger-button'}
                disabled={!selectedMember.email || pendingEmail !== null}
                onClick={() => void toggleMemberMute(selectedMember)}
                type="button"
              >
                {pendingEmail === selectedMember.email
                  ? <LoaderCircle className="animate-spin" size={15} />
                  : selectedMember.muted ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {selectedMember.muted ? '解除禁言' : '禁言会员'}
              </button>
            </div>
          </div>
        )}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>

      <div className="management-member-display">
        <section className="management-card management-list-card" aria-labelledby="elevated-members-title">
          <header className="management-card-heading">
            <div><h2 id="elevated-members-title">当前权限会员</h2></div>
            <span>{elevatedMembers.length} 人</span>
          </header>
          {membersStatus === 'loading' ? (
            <EmptyState icon={<LoaderCircle className="animate-spin" size={19} />}>正在加载权限会员。</EmptyState>
          ) : membersStatus === 'error' ? (
            <EmptyState icon={<CircleAlert size={19} />}>权限会员列表加载失败。</EmptyState>
          ) : elevatedMembers.length === 0 ? (
            <EmptyState icon={<Users size={19} />}>当前没有权限会员。</EmptyState>
          ) : (
            <div className="management-permission-groups">
              {permissionGroups.map((group) => {
                const collapsed = collapsedRights.has(group.rights);
                return (
                  <section className="management-permission-group" key={group.rights}>
                    <button
                      aria-expanded={!collapsed}
                      className="management-permission-group-toggle"
                      onClick={() => togglePermissionGroup(group.rights)}
                      type="button"
                    >
                      <span><strong>权限 {group.rights}</strong><em>{group.members.length} 人</em></span>
                      <ChevronDown className={collapsed ? 'is-collapsed' : ''} size={16} />
                    </button>
                    {!collapsed && (
                      <div className="management-member-list">
                        {group.members.map((member) => (
                          <button key={member.id} onClick={() => openMemberDetails(member.id)} type="button">
                            <strong>{member.id}</strong>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <section className="management-card management-list-card" aria-labelledby="muted-members-title">
          <header className="management-card-heading">
            <div><h2 id="muted-members-title">当前禁言会员</h2></div>
            <span>{mutes.length} 组</span>
          </header>
          <div className="management-mute-list">
            {mutesStatus === 'loading' ? (
              <EmptyState icon={<LoaderCircle className="animate-spin" size={19} />}>正在加载禁言会员。</EmptyState>
            ) : mutesStatus === 'error' ? (
              <EmptyState icon={<CircleAlert size={19} />}>禁言会员列表加载失败。</EmptyState>
            ) : mutes.length === 0 ? (
              <EmptyState icon={<Volume2 size={19} />}>当前没有禁言会员。</EmptyState>
            ) : mutes.map((mute) => (
              <article key={mute.email}>
                <div>
                  <strong>{mute.email}</strong>
                  <span>{mute.ids.length > 0 ? mute.ids.map((id) => <em key={id}>{id}</em>) : <em>无关联 ID</em>}</span>
                </div>
                <button
                  className="management-danger-button"
                  disabled={pendingEmail !== null}
                  onClick={() => void unmuteEntry(mute)}
                  type="button"
                >
                  {pendingEmail === mute.email ? <LoaderCircle className="animate-spin" size={14} /> : <Volume2 size={14} />}
                  解除禁言
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ModeratorManagementPanel() {
  const [boards, setBoards] = useState<ManagementBoardModerators[]>([]);
  const [boardsStatus, setBoardsStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [query, setQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<ManagementMember | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null);
  const moderatorCount = useMemo(
    () => boards.reduce((count, board) => count + board.moderators.length, 0),
    [boards],
  );
  const primaryBoards = useMemo(() => {
    const boardById = new Map(boards.map((board) => [board.boardId, board]));
    return PRIMARY_BOARDS.map((board) => boardById.get(board.id)).filter(
      (board): board is ManagementBoardModerators => Boolean(board),
    );
  }, [boards]);
  const secondaryBoards = useMemo(() => {
    const boardById = new Map(boards.map((board) => [board.boardId, board]));
    const knownBoardIds = new Set(ALL_BOARDS.map((board) => board.id));
    return [
      ...SECONDARY_BOARDS.map((board) => boardById.get(board.id)).filter(
        (board): board is ManagementBoardModerators => Boolean(board),
      ),
      ...boards.filter((board) => !knownBoardIds.has(board.boardId)),
    ];
  }, [boards]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchManagementBoardModerators(controller.signal).then(
      (items) => {
        setBoards(items);
        setBoardsStatus('ready');
      },
      (error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setBoardsStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '版主列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, []);

  async function searchMember(event: FormEvent) {
    event.preventDefault();
    if (isSearching) return;
    setIsSearching(true);
    setNotice(null);
    try {
      const result = await fetchManagementMember(query);
      setSelectedMember(result);
      setNotice({ kind: 'info', text: '已找到会员，请确认身份。' });
    } catch (error) {
      setSelectedMember(null);
      setNotice({ kind: 'error', text: errorMessage(error, '会员查询失败，请稍后重试。') });
    } finally {
      setIsSearching(false);
    }
  }

  function replaceBoard(updatedBoard: ManagementBoardModerators) {
    setBoards((current) => current.map((board) => board.boardId === updatedBoard.boardId ? updatedBoard : board));
  }

  async function addModerator() {
    const boardId = Number(selectedBoardId);
    if (!selectedMember || !boardId || pendingAction) return;
    const actionKey = `add-${boardId}-${selectedMember.id}`;
    setPendingAction(actionKey);
    setNotice(null);
    try {
      const updatedBoard = await setManagementBoardModerator(boardId, selectedMember.id, 'add');
      replaceBoard(updatedBoard);
      try {
        setSelectedMember(await fetchManagementMember(selectedMember.id));
      } catch {
        // 版主名单已更新，会员信息刷新失败不应覆盖成功结果。
      }
      setNotice({ kind: 'success', text: `已将 ${selectedMember.id} 添加为“${updatedBoard.boardName}”版主。` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '添加版主失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function removeModerator(board: ManagementBoardModerators, username: string) {
    if (pendingAction) return;
    const actionKey = `remove-${board.boardId}-${username}`;
    setPendingAction(actionKey);
    setNotice(null);
    try {
      const updatedBoard = await setManagementBoardModerator(board.boardId, username, 'remove');
      replaceBoard(updatedBoard);
      if (selectedMember?.id === username) {
        try {
          setSelectedMember(await fetchManagementMember(username));
        } catch {
          // 版主名单已更新，会员信息刷新失败不应覆盖成功结果。
        }
      }
      setNotice({ kind: 'success', text: `已取消 ${username} 的“${board.boardName}”版主身份。` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '取消版主失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  const selectedBoard = boards.find((board) => board.boardId === Number(selectedBoardId)) ?? null;
  const alreadyModerator = Boolean(selectedMember && selectedBoard?.moderators.includes(selectedMember.id));

  function renderModeratorBoard(board: ManagementBoardModerators) {
    return (
      <section className="management-board-moderator-row" key={board.boardId}>
        <header><h3>{board.boardName}</h3><span>{board.moderators.length} 人</span></header>
        {board.moderators.length === 0 ? (
          <p>暂无版主</p>
        ) : (
          <div className="management-board-moderators">
            {board.moderators.map((moderator) => {
              const actionKey = `remove-${board.boardId}-${moderator}`;
              return (
                <article key={moderator}>
                  <strong>{moderator}</strong>
                  <button
                    aria-label={`取消 ${moderator} 的${board.boardName}版主身份`}
                    disabled={pendingAction !== null}
                    onClick={() => void removeModerator(board, moderator)}
                    type="button"
                  >
                    {pendingAction === actionKey ? <LoaderCircle className="animate-spin" size={14} /> : <UserMinus size={14} />}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="management-grid management-members-grid">
      <section className="management-card management-action-card" aria-labelledby="moderator-search-title">
        <header className="management-card-heading">
          <div><h2 id="moderator-search-title">查找会员</h2></div>
        </header>
        <form className="management-lookup-form" onSubmit={searchMember}>
          <label htmlFor="moderator-member-id">会员 ID</label>
          <div className="management-input-action">
            <input
              id="moderator-member-id"
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedMember(null);
                setNotice(null);
              }}
              placeholder="输入完整会员 ID"
              type="search"
              value={query}
            />
            <button disabled={isSearching} type="submit">
              {isSearching ? <LoaderCircle className="animate-spin" size={15} /> : <Search size={15} />}搜索会员
            </button>
          </div>
        </form>

        {selectedMember && (
          <div className="management-member-confirmation">
            <div className="management-member-identity">
              <img alt="" src={selectedMember.avatar || defaultAvatar} />
              <div><span>已确认会员身份</span><strong>{selectedMember.id}</strong>{selectedMember.joinedAt && <p>{selectedMember.joinedAt}</p>}</div>
              <BadgeCheck size={19} />
            </div>
            <div className="management-moderator-assignment">
              <label>
                <span>目标版块</span>
                <select onChange={(event) => setSelectedBoardId(event.target.value)} value={selectedBoardId}>
                  <option value="">请选择版块</option>
                  {boards.map((board) => <option key={board.boardId} value={board.boardId}>{board.boardName}</option>)}
                </select>
              </label>
              <button
                className="management-primary-button"
                disabled={!selectedBoard || alreadyModerator || pendingAction !== null}
                onClick={() => void addModerator()}
                type="button"
              >
                {pendingAction?.startsWith('add-') ? <LoaderCircle className="animate-spin" size={15} /> : <UserPlus size={15} />}
                {alreadyModerator ? '已是本版版主' : '添加版主'}
              </button>
            </div>
          </div>
        )}
        {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      </section>

      <section className="management-card management-list-card" aria-labelledby="moderators-title">
        <header className="management-card-heading">
          <div><h2 id="moderators-title">当前版主</h2></div>
          <span>{moderatorCount} 人</span>
        </header>
        {boardsStatus === 'loading' ? (
            <EmptyState icon={<LoaderCircle className="animate-spin" size={19} />}>正在加载版主。</EmptyState>
          ) : boardsStatus === 'error' ? (
            <EmptyState icon={<CircleAlert size={19} />}>版主列表加载失败。</EmptyState>
          ) : (
            <div className="management-board-moderator-groups">
              <div className="management-board-moderator-list">
                {primaryBoards.map(renderModeratorBoard)}
              </div>
              {secondaryBoards.length > 0 && (
                <details className="management-secondary-moderators">
                  <summary>
                    <span>其他版块</span>
                    <small>{secondaryBoards.length} 个版块</small>
                    <ChevronDown size={15} />
                  </summary>
                  <div className="management-board-moderator-list">
                    {secondaryBoards.map(renderModeratorBoard)}
                  </div>
                </details>
              )}
            </div>
          )}
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

function upsertManagementMember(members: ManagementMember[], nextMember: ManagementMember) {
  const existingIndex = members.findIndex((member) => member.id === nextMember.id);
  const nextMembers = existingIndex < 0
    ? [...members, nextMember]
    : members.map((member, index) => index === existingIndex ? nextMember : member);
  return nextMembers.sort((left, right) => right.rights - left.rights || left.id.localeCompare(right.id, 'zh-CN'));
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
  if (rights === 2) return '权限 2 · 活动管理';
  if (rights === 1) return '权限 1';
  return '权限 0 · 普通会员';
}
