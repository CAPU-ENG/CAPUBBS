import { BadgeCheck, Check, ChevronDown, ChevronRight, Circle, ExternalLink, Focus, GitBranch, Home, Network, Plus, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchYahouLineage, saveYahouLineage } from '../../api/yahouLineage';
import {
  buildYahouIndex, findYahouMembers, yahouAncestors,
  YAHOU_STATUSES, YAHOU_STATUS_LABELS,
  type YahouLineage, type YahouMember, type YahouMutation, type YahouStatus,
} from '../../data/yahouLineage';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { DialogPresence } from '../layout/DialogPresence';
import { YahouLineageOverview } from './YahouLineageOverview';

const OVERVIEW_DESKTOP_QUERY = '(min-width: 1024px)';

export function YahouLineagePanel() {
  const { status: authStatus, viewer } = useAuth();
  const canEdit = authStatus === 'authenticated' && (viewer?.rights ?? 0) >= 3;
  const [data, setData] = useState<YahouLineage | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => Boolean(window.matchMedia?.(OVERVIEW_DESKTOP_QUERY).matches));

  useEffect(() => {
    const viewport = window.matchMedia?.(OVERVIEW_DESKTOP_QUERY);
    if (!viewport) return;
    const syncViewport = () => {
      setIsDesktop(viewport.matches);
      if (!viewport.matches) setOverviewOpen(false);
    };
    syncViewport();
    viewport.addEventListener('change', syncViewport);
    return () => viewport.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadError('');
    setData(null);
    void fetchYahouLineage(controller.signal).then((document) => {
      if (!controller.signal.aborted) setData(document);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : '押后谱系加载失败。');
    });
    return () => controller.abort();
  }, [reload]);

  return (
    <section className="toolbox-workspace yahou-workspace" aria-labelledby="yahou-lineage-title">
      <header className="toolbox-workspace-header">
        <span className="toolbox-workspace-icon"><GitBranch size={17} /></span>
        <h1 id="yahou-lineage-title">押后谱系</h1>
        <div className="yahou-header-actions">
          {isDesktop ? (
            <button aria-expanded={overviewOpen} aria-haspopup="dialog" className="toolbox-secondary-button" disabled={!data} onClick={() => setOverviewOpen(true)} type="button"><Network size={16} />谱系总览</button>
          ) : null}
          <button aria-label="刷新押后谱系" className="toolbox-icon-button" disabled={saving} onClick={() => setReload((value) => value + 1)} type="button"><RefreshCw size={16} /></button>
        </div>
      </header>
      {loadError ? (
        <p className="yahou-load-state toolbox-feedback-error" role="alert">{loadError}</p>
      ) : !data ? (
        <p className="yahou-load-state" role="status"><LoadingSpinner size={18} />正在加载押后谱系</p>
      ) : (
        <YahouTree canEdit={canEdit} data={data} key={reload} onData={setData} onSaving={setSaving} />
      )}
      {isDesktop ? (
        <DialogPresence>
          {overviewOpen && data ? (
            <YahouLineageOverview data={data} onClose={() => setOverviewOpen(false)} />
          ) : null}
        </DialogPresence>
      ) : null}
    </section>
  );
}

function YahouTree({ canEdit, data, onData, onSaving }: {
  canEdit: boolean;
  data: YahouLineage;
  onData: (data: YahouLineage) => void;
  onSaving: (saving: boolean) => void;
}) {
  const index = useMemo(() => buildYahouIndex(data), [data]);
  const [opened, setOpened] = useState(() => new Set<string>());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null | undefined>();
  const [query, setQuery] = useState('');
  const [draftStatus, setDraftStatus] = useState<YahouStatus>('pending');
  const [apprenticeId, setApprenticeId] = useState('');
  const [apprenticeStatus, setApprenticeStatus] = useState<YahouStatus>('pending');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const selected = selectedId == null ? undefined : index.members.get(selectedId);
  const selectedChildren = selectedId === undefined ? [] : index.children.get(selectedId) ?? [];
  const matches = useMemo(() => findYahouMembers(index, query), [index, query]);
  const counts = useMemo(() => data.nodes.reduce((result, member) => {
    result[member.status] += 1;
    return result;
  }, { pending: 0, passed: 0, qualified: 0 }), [data]);
  const roots = focusId === null ? index.children.get(null) ?? [] : [index.members.get(focusId)].filter((item): item is YahouMember => Boolean(item));

  useEffect(() => {
    if (!scrollTarget) return;
    // Use dataset matching instead of interpolating user IDs into selectors.
    const element = Array.from(treeRef.current?.querySelectorAll<HTMLElement>('[data-yahou-id]') ?? [])
      .find((item) => item.dataset.yahouId === scrollTarget);
    element?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    element?.focus({ preventScroll: true });
    setScrollTarget(null);
  }, [scrollTarget]);

  useEffect(() => {
    if (selectedId !== undefined && !scrollTarget) detailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [selectedId]);

  function selectMember(id: string | null) {
    if (savingRef.current) return;
    setSelectedId(id);
    setDraftStatus(id === null ? 'qualified' : index.members.get(id)?.status ?? 'pending');
    setApprenticeId('');
    setApprenticeStatus('pending');
    setNotice(null);
  }

  function focusBranch(id: string | null) {
    setFocusId(id);
    setQuery('');
    if (id !== null) setOpened((current) => new Set([...current, id]));
  }

  function locateMember(id: string) {
    if (savingRef.current) return;
    const path = yahouAncestors(index, id);
    // Keep the target within four visible generations even in an 18-generation lineage.
    setFocusId(path.length > 4 ? path[path.length - 4].id : null);
    setOpened((current) => new Set([...current, ...path.map((member) => member.id)]));
    setQuery('');
    selectMember(id);
    setScrollTarget(id);
  }

  async function mutate(mutation: YahouMutation) {
    if (!canEdit || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    onSaving(true);
    setNotice(null);
    try {
      const updated = await saveYahouLineage(data.revision, mutation);
      onData(updated);
      if (mutation.action === 'add') {
        setApprenticeId('');
        setOpened((current) => new Set([...current, ...(mutation.parentId === null ? [] : [mutation.parentId])]));
      }
      setNotice({ error: false, text: mutation.action === 'add' ? `已添加 ${mutation.id}。` : '状态已更新。' });
    } catch (error) {
      setNotice({ error: true, text: error instanceof Error ? error.message : '保存失败，请重试。' });
    } finally {
      savingRef.current = false;
      setSaving(false);
      onSaving(false);
    }
  }

  function addApprentice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = apprenticeId.trim();
    if (selectedId === undefined || !id) return;
    if (index.members.has(id)) {
      setNotice({ error: true, text: '这个 ID 已在谱系中，不能重复添加或更换师傅。' });
      return;
    }
    void mutate({ action: 'add', id, parentId: selectedId, status: apprenticeStatus });
  }

  function memberButton(member: YahouMember) {
    return (
      <button
        aria-pressed={selectedId === member.id}
        className={`yahou-member yahou-${member.status}${selectedId === member.id ? ' is-selected' : ''}`}
        data-yahou-id={member.id}
        onClick={() => selectMember(member.id)}
        title={`${member.id} · ${YAHOU_STATUS_LABELS[member.status]}`}
        type="button"
      >
        <StatusIcon status={member.status} /><span>{member.id}</span>
        <span className="sr-only">，{YAHOU_STATUS_LABELS[member.status]}</span>
      </button>
    );
  }

  function renderBranch(member: YahouMember, depth: number) {
    const children = index.children.get(member.id) ?? [];
    const isOpen = opened.has(member.id);
    const branches = children.filter((child) => index.children.has(child.id));
    const leaves = children.filter((child) => !index.children.has(child.id));
    return (
      <li className="yahou-branch" key={member.id}>
        <div className="yahou-branch-head">
          {children.length ? (
            <button
              aria-label={`${isOpen ? '收起' : '展开'} ${member.id} 的后代`}
              aria-expanded={isOpen}
              className="yahou-toggle"
              onClick={() => setOpened((current) => {
                const next = new Set(current);
                if (next.has(member.id)) next.delete(member.id); else next.add(member.id);
                return next;
              })}
              type="button"
            >{isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
          ) : <span className="yahou-toggle-space" />}
          {memberButton(member)}
          {children.length ? <span className="yahou-count" title={`${children.length} 位徒弟，${index.descendants.get(member.id)} 位后代`}>{index.descendants.get(member.id)}</span> : null}
        </div>
        {isOpen && children.length > 0 ? depth >= 3 ? (
          <button className="yahou-focus-link" onClick={() => focusBranch(member.id)} type="button"><Focus size={14} />查看 {index.descendants.get(member.id)} 位后代</button>
        ) : (
          <div className="yahou-children">
            {leaves.length ? <ul className="yahou-leaves">{leaves.map((child) => <li key={child.id}>{memberButton(child)}</li>)}</ul> : null}
            {branches.length ? <ul className="yahou-branches">{branches.map((child) => renderBranch(child, depth + 1))}</ul> : null}
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <div className="yahou-body">
      <div className="yahou-toolbar">
        <label className="yahou-search"><Search size={16} /><span className="sr-only">搜索 ID</span><input onChange={(event) => setQuery(event.target.value)} placeholder="搜索 ID" type="search" value={query} /></label>
        <div className="yahou-toolbar-actions">
          <button className="toolbox-secondary-button" onClick={() => setOpened(new Set(Array.from(index.children.keys()).filter((id): id is string => id !== null)))} type="button">展开分支</button>
          <button className="toolbox-secondary-button" onClick={() => setOpened(new Set())} type="button">收起分支</button>
        </div>
      </div>
      <div aria-label="押后状态统计" className="yahou-legend">
        {YAHOU_STATUSES.map((status) => <span className={`yahou-${status}`} key={status}><StatusIcon status={status} />{YAHOU_STATUS_LABELS[status]}<strong>{counts[status]}</strong></span>)}
      </div>

      {query.trim() ? (
        <section aria-label="ID 搜索结果" className="yahou-results">
          <div className="yahou-results-heading"><span role="status">{matches.length} 个结果</span><button aria-label="关闭搜索" className="toolbox-icon-button" onClick={() => setQuery('')} type="button"><X size={15} /></button></div>
          {matches.map((member) => <button className="yahou-result" key={member.id} onClick={() => locateMember(member.id)} type="button"><span className={`yahou-${member.status}`}><StatusIcon status={member.status} /><strong>{member.id}</strong></span><span>{['实践部', ...yahouAncestors(index, member.id).slice(0, -1).map((ancestor) => ancestor.id)].join(' → ')}</span></button>)}
        </section>
      ) : null}

      {selectedId !== undefined ? (
        <section aria-label="节点详情" className="yahou-detail" ref={detailRef}>
          <div className="yahou-detail-heading"><strong>{selectedId ?? '实践部'}</strong>{selected ? <span className={`yahou-status-label yahou-${selected.status}`}><StatusIcon status={selected.status} />{YAHOU_STATUS_LABELS[selected.status]}</span> : null}<button aria-label="关闭节点详情" className="toolbox-icon-button" disabled={saving} onClick={() => setSelectedId(undefined)} type="button"><X size={15} /></button></div>
          {selected ? <div className="yahou-ancestry">{['实践部', ...yahouAncestors(index, selected.id).map((member) => member.id)].join(' → ')}</div> : null}
          <div className="yahou-detail-actions">
            <span>{selected ? `第 ${index.generations.get(selected.id)} 代 · ${selectedChildren.length} 位徒弟 · ${index.descendants.get(selected.id)} 位后代` : `${data.nodes.length} 人 · ${index.children.get(null)?.length ?? 0} 个师门`}</span>
            <button className="toolbox-secondary-button" onClick={() => focusBranch(selectedId)} type="button"><Focus size={14} />{selectedId === null ? '全部师门' : '聚焦此支'}</button>
            {selected ? <a className="toolbox-secondary-button" href={getForumNavigationHref(`/bbs/user?name=${encodeURIComponent(selected.id)}`, window.location.href)}><ExternalLink size={14} />个人主页</a> : null}
          </div>
          {canEdit ? (
            <div className="yahou-edit">
              {selected ? <form className="yahou-form" onSubmit={(event) => { event.preventDefault(); void mutate({ action: 'status', id: selected.id, status: draftStatus }); }}><label>状态<select disabled={saving} onChange={(event) => setDraftStatus(event.target.value as YahouStatus)} value={draftStatus}>{YAHOU_STATUSES.map((status) => <option disabled={selectedChildren.length > 0 && status !== 'qualified'} key={status} value={status}>{YAHOU_STATUS_LABELS[status]}</option>)}</select></label><button className="toolbox-primary-button" disabled={saving || draftStatus === selected.status} type="submit">更新状态</button></form> : null}
              {selectedId === null || selected?.status === 'qualified' ? <form className="yahou-form" onSubmit={addApprentice}><label>{selectedId === null ? '直属 ID' : '徒弟 ID'}<input autoComplete="off" disabled={saving} maxLength={100} onChange={(event) => setApprenticeId(event.target.value)} required value={apprenticeId} /></label><label>初始状态<select disabled={saving} onChange={(event) => setApprenticeStatus(event.target.value as YahouStatus)} value={apprenticeStatus}>{YAHOU_STATUSES.map((status) => <option key={status} value={status}>{YAHOU_STATUS_LABELS[status]}</option>)}</select></label><button className="toolbox-primary-button" disabled={saving || !apprenticeId.trim()} type="submit"><Plus size={15} />添加</button></form> : null}
            </div>
          ) : null}
          {notice ? <p className={`toolbox-feedback ${notice.error ? 'toolbox-feedback-error' : 'toolbox-feedback-success'}`} role={notice.error ? 'alert' : 'status'}>{notice.text}</p> : null}
        </section>
      ) : null}

      <nav aria-label="当前师门路径" className="yahou-path"><button onClick={() => { focusBranch(null); selectMember(null); }} type="button"><Home size={15} />实践部</button>{focusId !== null ? yahouAncestors(index, focusId).map((member) => <span key={member.id}><ChevronRight size={14} /><button aria-current={member.id === focusId ? 'location' : undefined} onClick={() => focusBranch(member.id)} type="button">{member.id}</button></span>) : null}</nav>
      <div className={`yahou-tree${focusId === null ? '' : ' is-focused'}`} ref={treeRef}>
        {roots.map((member) => <ul aria-label={`${member.id} 师门`} className="yahou-family" key={member.id}>{renderBranch(member, 0)}</ul>)}
        {!roots.length ? <p className="yahou-empty">暂无师徒关系</p> : null}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: YahouStatus }) {
  const Icon = status === 'qualified' ? BadgeCheck : status === 'passed' ? Check : Circle;
  return <Icon aria-hidden="true" size={14} />;
}
