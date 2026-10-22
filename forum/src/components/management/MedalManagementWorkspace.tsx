import { DialogLayer, DialogPresence } from '../layout/DialogPresence';
import { ListPagination } from '../layout/ListPagination';
import {
  BadgeCheck,
  CircleAlert,
  FileSpreadsheet,
  Medal,
  Pencil,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Upload,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Papa from 'papaparse';
import { readSheet } from 'read-excel-file/browser';
import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  checkMedalMembers,
  createMedalDefinition,
  deleteMedalDefinition,
  fetchMedalDefinitions,
  fetchMedalMembers,
  grantMedalMembers,
  removeMedalMember,
  updateMedalMember,
  updateMedalDefinition,
  type MedalAssignmentInput,
  type MedalDefinition,
  type MedalMember,
  type MedalMemberCheck,
} from '../../api/medals';
import { useListPagination } from '../../hooks/useListPagination';
import { useStaggerEntrance } from '../../hooks/useStaggerEntrance';
import { getPublicProfilePath } from '../../utils/userRoutes';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { MedalDesignerPanel } from './MedalDesignerPanel';
import { type MedalDraft, type MedalTextureId } from './medalDesign';
import { Button } from '../Button';

const MEMBER_PAGE_SIZE = 20;

type LoadState = 'error' | 'loading' | 'ready';
type CatalogSort = 'members' | 'name' | 'newest';
type Notice = { kind: 'error' | 'success'; text: string } | null;

export function MedalManagementWorkspace() {
  const workspaceRef = useStaggerEntrance<HTMLElement>([
    '.management-medal-catalog-list > button',
    '.management-medal-member-table > tbody > tr',
    '.management-medal-batch-table:not(.management-medal-example-table) > tbody > tr',
  ].join(', '));
  const [medals, setMedals] = useState<MedalDefinition[]>([]);
  const [members, setMembers] = useState<MedalMember[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number | null>>({});
  const [selectedId, setSelectedId] = useState('');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogSort, setCatalogSort] = useState<CatalogSort>('newest');
  const [definitionsStatus, setDefinitionsStatus] = useState<LoadState>('loading');
  const [definitionsReload, setDefinitionsReload] = useState(0);
  const [membersReload, setMembersReload] = useState(0);
  const [membersStatus, setMembersStatus] = useState<LoadState>('ready');
  const [detailTab, setDetailTab] = useState<'edit' | 'issue' | 'members'>('members');
  const [issueMode, setIssueMode] = useState<'batch' | 'single'>('single');
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [singleId, setSingleId] = useState('');
  const [singleRole, setSingleRole] = useState('');
  const [individualCheck, setIndividualCheck] = useState<MedalMemberCheck | null>(null);
  const [batchFileName, setBatchFileName] = useState('');
  const [batchRows, setBatchRows] = useState<MedalMemberCheck[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const selectedMedal = medals.find((medal) => medal.id === selectedId) ?? medals[0] ?? null;
  const selectedMedalId = selectedMedal?.id ?? '';
  const catalogMedals = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase();
    const matched = query
      ? medals.filter((medal) => medal.name.toLocaleLowerCase().includes(query))
      : medals.slice();
    if (catalogSort === 'name') {
      matched.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    } else if (catalogSort === 'members') {
      matched.sort((a, b) => (memberCounts[b.id] ?? -1) - (memberCounts[a.id] ?? -1));
    }
    return matched;
  }, [catalogQuery, catalogSort, medals, memberCounts]);
  const availableBatchRows = useMemo(
    () => batchRows.filter((row) => row.state === 'available'),
    [batchRows],
  );
  const initialDraft = editorMode === 'edit' && selectedMedal
    ? pickDraft(selectedMedal)
    : { description: '', imageSource: '', name: '', textureId: 'swirl' as MedalTextureId };

  useEffect(() => {
    const controller = new AbortController();
    setDefinitionsStatus('loading');
    void fetchMedalDefinitions(controller.signal).then(
      (items) => {
        setMedals(items);
        setMemberCounts(Object.fromEntries(items.map((medal) => [medal.id, medal.memberCount ?? null])));
        setSelectedId((current) => items.some((medal) => medal.id === current) ? current : items[0]?.id ?? '');
        setDefinitionsStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setDefinitionsStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '勋章列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, [definitionsReload]);

  useEffect(() => {
    if (!selectedMedalId) {
      setMembers([]);
      setMembersStatus('ready');
      return;
    }
    const controller = new AbortController();
    setMembersStatus('loading');
    void fetchMedalMembers(selectedMedalId, controller.signal).then(
      (items) => {
        setMembers(items);
        setMemberCounts((current) => ({ ...current, [selectedMedalId]: items.length }));
        setMembersStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setMembersStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '勋章成员加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, [membersReload, selectedMedalId]);

  function selectMedal(id: string) {
    setSelectedId(id);
    setEditorMode(null);
    setDetailTab('members');
    setRemoveTarget(null);
    resetImports();
    setNotice(null);
  }

  async function saveMedal(draft: MedalDraft) {
    if (pendingAction) return;
    setPendingAction('medal-save');
    setNotice(null);
    try {
      const image = draft.imageSource.startsWith('data:image/')
        ? await medalImageFile(draft.imageSource)
        : undefined;
      if (editorMode === 'create') {
        if (!image) throw new Error('请先上传并裁剪勋章图片。');
        const created = await createMedalDefinition({
          description: draft.description,
          image,
          name: draft.name,
          textureId: draft.textureId,
        });
        setMedals((current) => [created, ...current]);
        setMemberCounts((current) => ({ ...current, [created.id]: 0 }));
        setSelectedId(created.id);
        setMembers([]);
        setNotice({ kind: 'success', text: '勋章已创建。' });
      } else if (selectedMedal) {
        const updated = await updateMedalDefinition(selectedMedal.id, {
          ...(image ? { image } : {}),
          description: draft.description,
          name: draft.name,
          textureId: draft.textureId,
        });
        setMedals((current) => current.map((medal) => medal.id === updated.id ? updated : medal));
        setNotice({ kind: 'success', text: '勋章已更新。' });
      }
      setEditorMode(null);
      setDetailTab('members');
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '勋章保存失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function deleteSelectedMedal() {
    if (!selectedMedal || pendingAction) return;
    setPendingAction('medal-delete');
    setNotice(null);
    try {
      await deleteMedalDefinition(selectedMedal.id);
      const selectedIndex = medals.findIndex((medal) => medal.id === selectedMedal.id);
      const nextMedals = medals.filter((medal) => medal.id !== selectedMedal.id);
      setMedals(nextMedals);
      setSelectedId(nextMedals[Math.min(selectedIndex, nextMedals.length - 1)]?.id ?? '');
      setDeleteOpen(false);
      setEditorMode(null);
      setNotice({ kind: 'success', text: '勋章已删除。' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '勋章删除失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function importIndividual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMedal || !singleId.trim() || pendingAction) return;
    setPendingAction('single-import');
    setIndividualCheck(null);
    setNotice(null);
    try {
      const checks = await checkMedalMembers(selectedMedal.id, [{
        role: singleRole.trim(),
        username: singleId.trim(),
      }]);
      const check = checks[0] ?? null;
      setIndividualCheck(check);
      if (!check || check.state !== 'available') return;
      const results = await grantMedalMembers(selectedMedal.id, [check]);
      const added = results.filter((result) => result.status === 'added').length;
      const updatedMembers = await fetchMedalMembers(selectedMedal.id);
      setMembers(updatedMembers);
      setMemberCounts((current) => ({ ...current, [selectedMedal.id]: updatedMembers.length }));
      setSingleId('');
      setSingleRole('');
      setIndividualCheck(null);
      setNotice({
        kind: 'success',
        text: added
          ? `已向 ${check.member?.username ?? check.username} 发放“${selectedMedal.name}”勋章`
          : '该会员已经拥有此勋章。',
      });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '勋章发放失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function loadBatchFile(file: File) {
    if (!selectedMedal || pendingAction) return;
    setPendingAction('batch-check');
    setBatchFileName(file.name);
    setBatchRows([]);
    setNotice(null);
    try {
      const rows = file.name.toLocaleLowerCase().endsWith('.csv')
        ? await readCsvRows(file)
        : await readSheet(file);
      const assignments = normalizeAssignmentRows(rows);
      const checks = await checkMedalMembers(selectedMedal.id, assignments);
      setBatchRows(checks);
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '表格读取失败，请检查文件内容。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function importBatch() {
    if (!selectedMedal || availableBatchRows.length === 0 || pendingAction) return;
    setPendingAction('batch-import');
    setNotice(null);
    try {
      const results = await grantMedalMembers(selectedMedal.id, availableBatchRows);
      const added = results.filter((result) => result.status === 'added').length;
      const updatedMembers = await fetchMedalMembers(selectedMedal.id);
      setMembers(updatedMembers);
      setMemberCounts((current) => ({ ...current, [selectedMedal.id]: updatedMembers.length }));
      setBatchRows([]);
      setBatchFileName('');
      setNotice({ kind: 'success', text: `已向 ${added} 名会员发放“${selectedMedal.name}”勋章` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '批量发放失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function removeSelectedMember() {
    if (!selectedMedal || !removeTarget || pendingAction) return;
    const medal = selectedMedal;
    const username = removeTarget;
    setPendingAction('member-remove');
    setNotice(null);
    try {
      await removeMedalMember(medal.id, username);
      const remaining = members.filter((member) => member.username !== username);
      setMembers(remaining);
      setMemberCounts((current) => ({ ...current, [medal.id]: remaining.length }));
      setNotice({ kind: 'success', text: `已从“${medal.name}”勋章移除 ${username}` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '移除勋章成员失败，请稍后重试。') });
    } finally {
      setRemoveTarget(null);
      setPendingAction(null);
    }
  }

  async function saveMember(username: string, newUsername: string, role: string) {
    if (!selectedMedal || pendingAction) return null;
    setPendingAction('member-save');
    setNotice(null);
    try {
      const updated = await updateMedalMember(selectedMedal.id, username, { newUsername, role });
      setMembers((current) => current.map((member) => member.username === username ? updated : member));
      setNotice({
        kind: 'success',
        text: updated.username === username
          ? `已更新 ${username} 的活动职务`
          : `已将 ${username} 的勋章记录改为 ${updated.username}`,
      });
      return updated;
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '保存成员失败，请稍后重试。') });
      return null;
    } finally {
      setPendingAction(null);
    }
  }

  function resetImports() {
    setSingleId('');
    setSingleRole('');
    setIndividualCheck(null);
    setBatchFileName('');
    setBatchRows([]);
  }

  const loadMessage = definitionsStatus === 'loading'
    ? '正在加载勋章'
    : definitionsStatus === 'error'
      ? '勋章列表加载失败'
      : null;

  return (
    <>
      <section className="management-card management-medal-workspace" ref={workspaceRef}>
        <header className="management-card-heading">
          <h2>勋章管理</h2>
          <Button
            variant="primary"
            disabled={Boolean(pendingAction) || editorMode === 'create'}
            onClick={() => { setEditorMode('create'); setNotice(null); }}
            type="button"
          >
            <Plus size={15} />新建勋章
          </Button>
        </header>

        {loadMessage ? (
          <div className="management-medal-empty"><Medal size={24} /><strong>{loadMessage}</strong>{definitionsStatus === 'error' ? <Button onClick={() => { setNotice(null); setDefinitionsReload((value) => value + 1); }}><RefreshCw aria-hidden="true" size={15} />重新加载</Button> : null}</div>
        ) : (
          <div className="management-medal-workspace-body">
            <aside aria-label="勋章列表" className="management-medal-catalog">
              <header><strong>勋章列表</strong><span>{catalogQuery.trim() ? `${catalogMedals.length} / ${medals.length}` : medals.length}</span></header>
              <div className="management-medal-catalog-tools">
                <label className="management-medal-catalog-search">
                  <Search aria-hidden="true" size={14} />
                  <input aria-label="搜索勋章" className="forum-input" onChange={(event) => setCatalogQuery(event.target.value)} placeholder="搜索勋章" type="search" value={catalogQuery} />
                </label>
                <select aria-label="勋章排序" className="forum-input" onChange={(event) => setCatalogSort(event.target.value as CatalogSort)} value={catalogSort}>
                  <option value="newest">按时间</option>
                  <option value="name">按名称</option>
                  <option value="members">按人数</option>
                </select>
              </div>
              <div className="management-medal-catalog-list">
                {catalogMedals.length === 0 ? <p className="management-medal-catalog-empty">无匹配勋章</p> : null}
                {catalogMedals.map((medal) => (
                  <button
                    aria-pressed={selectedMedal?.id === medal.id}
                    className={selectedMedal?.id === medal.id ? 'is-selected' : ''}
                    key={medal.id}
                    onClick={() => selectMedal(medal.id)}
                    type="button"
                  >
                    <MedalThumbnail imagePath={medal.smallImagePath} />
                    <span className="management-medal-catalog-name"><strong>{medal.name}</strong></span>
                    <span aria-label={memberCounts[medal.id] === null ? '人数加载失败' : undefined} className="management-medal-catalog-count">{formatMemberCount(memberCounts[medal.id])}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="management-medal-detail">
              {editorMode ? (
                <MedalDesignerPanel
                  initialDraft={initialDraft}
                  key={`${editorMode}-${editorMode === 'edit' ? selectedMedal?.id : 'new'}`}
                  mode={editorMode}
                  onCancel={() => setEditorMode(null)}
                  onSave={(draft) => { void saveMedal(draft); }}
                  saving={pendingAction === 'medal-save'}
                />
              ) : selectedMedal ? (
                <>
                  <header className="management-medal-detail-heading">
                    <div className="management-medal-detail-identity">
                      <MedalThumbnail imagePath={selectedMedal.smallImagePath} />
                      <div><h3>{selectedMedal.name}</h3><span>{members.length} 名成员</span></div>
                    </div>
                    <div className="management-medal-detail-actions">
                      <button aria-label="编辑勋章" disabled={Boolean(pendingAction)} onClick={() => setEditorMode('edit')} title="编辑勋章" type="button"><Pencil size={16} /></button>
                      <button aria-label="删除勋章" className="is-danger" disabled={Boolean(pendingAction)} onClick={() => { setRemoveTarget(null); setDeleteOpen(true); }} title="删除勋章" type="button"><Trash2 size={16} /></button>
                    </div>
                  </header>

                  <nav aria-label="勋章详情" className="management-medal-detail-tabs">
                    <button className={detailTab === 'members' ? 'is-selected' : ''} onClick={() => setDetailTab('members')} type="button"><Users size={15} />成员名单</button>
                    <button className={detailTab === 'edit' ? 'is-selected' : ''} onClick={() => { setDetailTab('edit'); setNotice(null); }} type="button"><UserCog size={15} />编辑成员</button>
                    <button className={detailTab === 'issue' ? 'is-selected' : ''} onClick={() => { setDetailTab('issue'); setNotice(null); }} type="button"><UserPlus size={15} />发放勋章</button>
                  </nav>

                  {detailTab === 'members' ? (
                    <MemberList
                      members={members}
                      onRetry={() => { setNotice(null); setMembersReload((value) => value + 1); }}
                      resetKey={selectedMedal.id}
                      status={membersStatus}
                    />
                  ) : detailTab === 'edit' ? (
                    <MemberEditor
                      key={selectedMedal.id}
                      members={members}
                      onRemove={(username) => { setNotice(null); setRemoveTarget(username); }}
                      onRetry={() => { setNotice(null); setMembersReload((value) => value + 1); }}
                      onSave={saveMember}
                      pendingAction={pendingAction}
                      status={membersStatus}
                    />
                  ) : (
                    <section aria-label="发放勋章" className="management-medal-issue">
                      <div className="management-medal-issue-modes" role="tablist" aria-label="导入方式">
                        <button aria-selected={issueMode === 'single'} className={issueMode === 'single' ? 'is-selected' : ''} onClick={() => { setIssueMode('single'); setNotice(null); }} role="tab" type="button">单独导入</button>
                        <button aria-selected={issueMode === 'batch'} className={issueMode === 'batch' ? 'is-selected' : ''} onClick={() => { setIssueMode('batch'); setNotice(null); }} role="tab" type="button">表格导入</button>
                      </div>
                      {issueMode === 'single' ? (
                        <SingleImportPanel
                          check={individualCheck}
                          importing={pendingAction === 'single-import'}
                          memberId={singleId}
                          onImport={importIndividual}
                          onMemberIdChange={(value) => { setSingleId(value); setIndividualCheck(null); setNotice(null); }}
                          onRoleChange={(value) => { setSingleRole(value); setIndividualCheck(null); setNotice(null); }}
                          role={singleRole}
                        />
                      ) : (
                        <BatchImportPanel
                          checking={pendingAction === 'batch-check'}
                          fileName={batchFileName}
                          importing={pendingAction === 'batch-import'}
                          inputRef={batchInputRef}
                          onFileChange={(file) => { void loadBatchFile(file); }}
                          onImport={() => { void importBatch(); }}
                          rows={batchRows}
                        />
                      )}
                    </section>
                  )}
                </>
              ) : (
                <div className="management-medal-empty">
                  <Medal size={24} /><strong>暂无勋章</strong>
                  <Button variant="primary" onClick={() => setEditorMode('create')} type="button"><Plus size={15} />新建勋章</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {notice ? <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice> : null}

      <DialogPresence>{deleteOpen && selectedMedal ? (
        <DialogLayer className="management-dialog-backdrop" onDismiss={pendingAction === 'medal-delete' ? undefined : () => setDeleteOpen(false)} role="presentation">
          <section aria-labelledby="delete-medal-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header><h2 id="delete-medal-title">删除勋章</h2></header>
            <p className="management-dialog-copy">确定删除“{selectedMedal.name}”？对应的 {members.length} 条成员记录将一并删除。</p>
            <footer>
              <Button disabled={pendingAction === 'medal-delete'} onClick={() => setDeleteOpen(false)} type="button">取消</Button>
              <Button variant="danger" disabled={pendingAction === 'medal-delete'} onClick={() => { void deleteSelectedMedal(); }} type="button"><Trash2 size={15} />{pendingAction === 'medal-delete' ? '删除中' : '删除'}</Button>
            </footer>
          </section>
        </DialogLayer>
      ) : null}</DialogPresence>

      <DialogPresence>{removeTarget && selectedMedal ? (
        <DialogLayer className="management-dialog-backdrop" onDismiss={pendingAction ? undefined : () => setRemoveTarget(null)} role="presentation">
          <section aria-labelledby="remove-medal-member-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header>
              <h2 id="remove-medal-member-title">移除成员</h2>
              <Button aria-label="关闭" icon disabled={Boolean(pendingAction)} onClick={() => setRemoveTarget(null)} type="button"><X size={16} /></Button>
            </header>
            <p className="management-dialog-copy">确定撤销 {removeTarget} 的“{selectedMedal.name}”勋章吗？</p>
            <footer>
              <Button disabled={Boolean(pendingAction)} onClick={() => setRemoveTarget(null)} type="button">取消</Button>
              <Button variant="danger" disabled={Boolean(pendingAction)} onClick={() => { void removeSelectedMember(); }} type="button"><Trash2 size={14} />{pendingAction === 'member-remove' ? '移除中' : '确认移除'}</Button>
            </footer>
          </section>
        </DialogLayer>
      ) : null}</DialogPresence>
    </>
  );
}

function ManagementNotice({ children, kind }: {
  children: string;
  kind: NonNullable<Notice>['kind'];
}) {
  return <div className={`management-notice management-notice-${kind}`}>{children}</div>;
}

function MedalThumbnail({ imagePath }: { imagePath: string }) {
  return <span className="management-medal-thumbnail"><img alt="" src={imagePath} /></span>;
}

function MemberList({
  members,
  onRetry,
  resetKey,
  status,
}: {
  members: MedalMember[];
  onRetry: () => void;
  resetKey: string;
  status: LoadState;
}) {
  const pagination = useListPagination(members, MEMBER_PAGE_SIZE, resetKey);
  return (
    <div className="management-medal-member-list" ref={pagination.anchorRef}>
    <div className="management-medal-table-scroll">
      <table className="management-medal-member-table">
        <thead><tr><th>会员 ID</th><th>活动职务</th><th>获得时间</th></tr></thead>
        <tbody>
          <MemberTableStatus colSpan={3} empty={members.length === 0} onRetry={onRetry} status={status} />
          {status === 'ready' ? pagination.pageItems.map((member) => (
            <tr key={member.username}>
              <td><MemberLink member={member} /></td>
              <td>{member.role}</td>
              <td>{formatDate(member.awardedAt)}</td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
    {status === 'ready' && <ListPagination ariaLabel="勋章成员分页" className="management-list-pagination" currentPage={pagination.currentPage} onPageChange={pagination.onPageChange} pageCount={pagination.pageCount} />}
    </div>
  );
}

const MEMBER_SEARCH_LIMIT = 8;

function MemberEditor({
  members,
  onRemove,
  onRetry,
  onSave,
  pendingAction,
  status,
}: {
  members: MedalMember[];
  onRemove: (username: string) => void;
  onRetry: () => void;
  onSave: (username: string, newUsername: string, role: string) => Promise<MedalMember | null>;
  pendingAction: string | null;
  status: LoadState;
}) {
  const [query, setQuery] = useState('');
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const selected = members.find((member) => member.username === selectedUsername) ?? null;
  const keyword = query.trim().toLocaleLowerCase();
  const matches = keyword
    ? members.filter((member) => member.username.toLocaleLowerCase().includes(keyword))
    : [];

  if (status !== 'ready') {
    return (
      <div className="management-medal-edit">
        <p className="management-medal-edit-status">
          {status === 'loading' ? '正在加载成员' : <>成员加载失败 <Button onClick={onRetry}><RefreshCw aria-hidden="true" size={15} />重新加载</Button></>}
        </p>
      </div>
    );
  }

  return (
    <div className="management-medal-edit">
      <label className="management-member-search">
        <Search aria-hidden="true" size={15} />
        <input
          aria-label="搜索成员"
          className="forum-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入会员 ID"
          type="search"
          value={query}
        />
      </label>
      {keyword ? (
        matches.length > 0 ? (
          <div className="management-member-search-results">
            {matches.slice(0, MEMBER_SEARCH_LIMIT).map((member) => (
              <button
                aria-pressed={member.username === selected?.username}
                className={member.username === selected?.username ? 'is-selected' : ''}
                key={member.username}
                onClick={() => setSelectedUsername(member.username)}
                type="button"
              >
                <strong>{member.username}</strong>
                {member.role ? <span>{member.role}</span> : null}
              </button>
            ))}
            {matches.length > MEMBER_SEARCH_LIMIT ? <p>另有 {matches.length - MEMBER_SEARCH_LIMIT} 名匹配成员</p> : null}
          </div>
        ) : <p className="management-medal-edit-status">无匹配成员</p>
      ) : null}
      {selected ? (
        <MemberEditForm
          key={`${selected.username}:${selected.role}`}
          member={selected}
          onRemove={() => onRemove(selected.username)}
          onSave={async (newUsername, role) => {
            const updated = await onSave(selected.username, newUsername, role);
            if (updated) {
              setSelectedUsername(updated.username);
              if (updated.username !== selected.username) setQuery(updated.username);
            }
          }}
          pendingAction={pendingAction}
        />
      ) : null}
    </div>
  );
}

function MemberEditForm({
  member,
  onRemove,
  onSave,
  pendingAction,
}: {
  member: MedalMember;
  onRemove: () => void;
  onSave: (newUsername: string, role: string) => Promise<void>;
  pendingAction: string | null;
}) {
  const [username, setUsername] = useState(member.username);
  const [role, setRole] = useState(member.role);
  const disabled = Boolean(pendingAction);
  const changed = username.trim() !== member.username || role.trim() !== member.role;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!changed || !username.trim() || disabled) return;
    void onSave(username.trim(), role.trim());
  }

  return (
    <form className="management-medal-edit-form" onSubmit={submit}>
      <header>
        <MemberLink member={member} />
        <span>{formatDate(member.awardedAt)}</span>
      </header>
      <label><span>会员 ID</span><input className="forum-input" disabled={disabled} maxLength={30} onChange={(event) => setUsername(event.target.value)} type="text" value={username} /></label>
      <label><span>活动职务</span><input className="forum-input" disabled={disabled} maxLength={50} onChange={(event) => setRole(event.target.value)} type="text" value={role} /></label>
      <footer>
        <Button variant="danger" disabled={disabled} onClick={onRemove} type="button"><Trash2 size={14} />移除</Button>
        <Button variant="primary" disabled={disabled || !changed || !username.trim()} type="submit"><BadgeCheck size={15} />{pendingAction === 'member-save' ? '保存中' : '保存'}</Button>
      </footer>
    </form>
  );
}

function MemberTableStatus({ colSpan, empty, onRetry, status }: {
  colSpan: number;
  empty: boolean;
  onRetry: () => void;
  status: LoadState;
}) {
  if (status === 'loading') {
    return <tr><td className="management-medal-table-empty" colSpan={colSpan}>正在加载成员</td></tr>;
  }
  if (status === 'error') {
    return <tr><td className="management-medal-table-empty" colSpan={colSpan}>成员加载失败 <Button onClick={onRetry}><RefreshCw aria-hidden="true" size={15} />重新加载</Button></td></tr>;
  }
  return empty ? <tr><td className="management-medal-table-empty" colSpan={colSpan}>暂无成员</td></tr> : null;
}

function MemberLink({ member }: { member: MedalMember }) {
  return <a href={getForumNavigationHref(member.href, window.location.href)}>{member.username}</a>;
}

function SingleImportPanel({
  check,
  importing,
  memberId,
  onImport,
  onMemberIdChange,
  onRoleChange,
  role,
}: {
  check: MedalMemberCheck | null;
  importing: boolean;
  memberId: string;
  onImport: (event: FormEvent<HTMLFormElement>) => void;
  onMemberIdChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  role: string;
}) {
  return (
    <div className="management-medal-single-import">
      <form onSubmit={onImport}>
        <label><span>会员 ID</span><input className="forum-input" onChange={(event) => onMemberIdChange(event.target.value)} placeholder="输入完整会员 ID" type="search" value={memberId} /></label>
        <label><span>职务（选填）</span><input className="forum-input" maxLength={50} onChange={(event) => onRoleChange(event.target.value)} placeholder="例如：队长" type="text" value={role} /></label>
        <Button variant="primary" disabled={!memberId.trim() || importing} type="submit"><UserPlus size={15} />{importing ? '导入中' : '确认导入'}</Button>
      </form>
      {check ? (
        <div className="management-medal-check-result" data-state={check.state.replace('_', '-')}>
          {check.state === 'available' ? <BadgeCheck size={18} /> : <CircleAlert size={18} />}
          <div>
            <a href={getForumNavigationHref(check.member?.href ?? getPublicProfilePath(check.username), window.location.href)}>{check.member?.username ?? check.username}</a>
            <span>{checkLabel(check)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BatchImportPanel({
  checking,
  fileName,
  importing,
  inputRef,
  onFileChange,
  onImport,
  rows,
}: {
  checking: boolean;
  fileName: string;
  importing: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (file: File) => void;
  onImport: () => void;
  rows: MedalMemberCheck[];
}) {
  const availableCount = rows.filter((row) => row.state === 'available').length;
  const alreadyCount = rows.filter((row) => row.state === 'already_owned').length;
  const missingCount = rows.filter((row) => row.state === 'not_found').length;
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => BATCH_STATE_ORDER[a.state] - BATCH_STATE_ORDER[b.state]),
    [rows],
  );
  return (
    <div className="management-medal-batch-import">
      <p className="management-medal-file-format"><FileSpreadsheet aria-hidden="true" size={15} />CSV / XLSX：第一列会员 ID，第二列职务（选填），每行一名会员，最多 200 名。</p>
      <div className="management-medal-file-row">
        <input
          accept=".csv,.xlsx"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileChange(file);
            event.target.value = '';
          }}
          ref={inputRef}
          type="file"
        />
        <Button disabled={checking || importing} onClick={() => inputRef.current?.click()} type="button"><Upload size={15} />{checking ? '读取中' : '选择表格'}</Button>
        {fileName ? <output><FileSpreadsheet size={15} />{fileName}</output> : null}
      </div>

      {!fileName ? (
        <div className="management-medal-table-scroll">
          <table className="management-medal-batch-table management-medal-example-table">
            <caption>示例表格</caption>
            <thead><tr><th>会员 ID</th><th>职务</th></tr></thead>
            <tbody>
              <tr><td>example_member_01</td><td>领队</td></tr>
              <tr><td>example_member_02</td><td>摄影</td></tr>
              <tr><td>example_member_03</td><td className="management-medal-example-empty">（留空）</td></tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="management-medal-table-scroll">
          <table className="management-medal-batch-table">
            <thead><tr><th>ID</th><th>职务</th></tr></thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.username}>
                  <td>
                    <div className="management-medal-batch-id">
                      <a href={getForumNavigationHref(row.member?.href ?? getPublicProfilePath(row.username), window.location.href)}>{row.username}</a>
                      <span data-state={row.state.replace('_', '-')}>{row.state === 'available' ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}{batchCheckLabel(row)}</span>
                    </div>
                  </td>
                  <td>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <footer className="management-medal-batch-footer">
          <div><span>未找到 {missingCount}</span><span>可导入 {availableCount}</span><span>已拥有 {alreadyCount}</span></div>
          <Button variant="primary" disabled={availableCount === 0 || importing} onClick={onImport} type="button"><UserPlus size={15} />{importing ? '导入中' : `导入 ${availableCount} 名成员`}</Button>
        </footer>
      ) : null}
    </div>
  );
}

const BATCH_STATE_ORDER: Record<MedalMemberCheck['state'], number> = {
  not_found: 0,
  available: 1,
  already_owned: 2,
};

function checkLabel(check: MedalMemberCheck) {
  if (check.state === 'available') return '可以导入';
  if (check.state === 'already_owned') return '已拥有该勋章';
  return '未找到该成员';
}

function batchCheckLabel(row: MedalMemberCheck) {
  if (row.state === 'available') return '可导入';
  if (row.state === 'already_owned') return '已拥有';
  return '未找到成员';
}

function formatMemberCount(count: number | null | undefined) {
  if (count === undefined) return '...';
  if (count === null) return '--';
  return `${count} 人`;
}

function pickDraft(medal: MedalDefinition): MedalDraft {
  return {
    description: medal.description,
    imageSource: medal.largeImagePath,
    name: medal.name,
    textureId: medal.textureId,
  };
}

async function medalImageFile(dataUrl: string) {
  const blob = await fetch(dataUrl).then((response) => response.blob());
  return new File([blob], 'medal.png', { type: blob.type || 'image/png' });
}

async function readCsvRows(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<unknown[]>(file, {
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
      skipEmptyLines: 'greedy',
    });
  });
}

function normalizeAssignmentRows(rows: unknown): MedalAssignmentInput[] {
  if (!isTableRows(rows)) {
    throw new Error('表格内容格式不正确。');
  }
  const populatedRows = rows.filter((row) => row.some((cell) => cellText(cell)));
  if (populatedRows.length === 0) throw new Error('表格中没有可导入的数据。');
  const first = populatedRows[0];
  const contentRows = isHeaderRow(first) ? populatedRows.slice(1) : populatedRows;
  if (contentRows.length === 0) throw new Error('表格中没有可导入的数据。');
  if (contentRows.length > 200) throw new Error('一次最多导入 200 名会员。');

  const seen = new Set<string>();
  return contentRows.map((row, index) => {
    const username = cellText(row[0]);
    const role = cellText(row[1]);
    if (!username) throw new Error(`第 ${index + 1} 行缺少 ID。`);
    if (seen.has(username)) throw new Error(`表格中存在重复 ID：${username}`);
    seen.add(username);
    return { role, username };
  });
}

function isTableRows(value: unknown): value is unknown[][] {
  return Array.isArray(value) && value.every((row: unknown) => Array.isArray(row));
}

function isHeaderRow(row: unknown[]) {
  const id = cellText(row[0]).toLocaleLowerCase().replace(/\s+/g, '');
  const role = cellText(row[1]).toLocaleLowerCase().replace(/\s+/g, '');
  return (id === 'id' || id === '会员id') && (role === '职务' || role === 'role' || role === '活动职务');
}

function cellText(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function formatDate(timestamp: number) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp * 1000));
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
