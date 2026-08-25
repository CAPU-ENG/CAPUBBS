import {
  BadgeCheck,
  CircleAlert,
  FileSpreadsheet,
  Medal,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserPlus,
  Users,
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
  updateMedalDefinition,
  type MedalAssignmentInput,
  type MedalDefinition,
  type MedalMember,
  type MedalMemberCheck,
} from '../../api/medals';
import { getPublicProfilePath } from '../../utils/userRoutes';
import { MedalDesignerPanel } from './MedalDesignerPanel';
import { type MedalDraft, type MedalTextureId } from './medalDesign';

type LoadState = 'error' | 'loading' | 'ready';
type Notice = { kind: 'error' | 'success'; text: string } | null;

export function MedalManagementWorkspace() {
  const [medals, setMedals] = useState<MedalDefinition[]>([]);
  const [members, setMembers] = useState<MedalMember[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [definitionsStatus, setDefinitionsStatus] = useState<LoadState>('loading');
  const [membersStatus, setMembersStatus] = useState<LoadState>('ready');
  const [detailTab, setDetailTab] = useState<'issue' | 'members'>('members');
  const [issueMode, setIssueMode] = useState<'batch' | 'single'>('single');
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
  const availableBatchRows = useMemo(
    () => batchRows.filter((row) => row.state === 'available'),
    [batchRows],
  );
  const initialDraft = editorMode === 'edit' && selectedMedal
    ? pickDraft(selectedMedal)
    : { imageSource: '', name: '', textureId: 'swirl' as MedalTextureId };

  useEffect(() => {
    const controller = new AbortController();
    setDefinitionsStatus('loading');
    void fetchMedalDefinitions(controller.signal).then(
      (items) => {
        setMedals(items);
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
  }, []);

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
        setMembersStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setMembersStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '勋章成员加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, [selectedMedalId]);

  function selectMedal(id: string) {
    setSelectedId(id);
    setEditorMode(null);
    setDetailTab('members');
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
        const created = await createMedalDefinition({ image, name: draft.name, textureId: draft.textureId });
        setMedals((current) => [created, ...current]);
        setSelectedId(created.id);
        setMembers([]);
        setNotice({ kind: 'success', text: '勋章已创建。' });
      } else if (selectedMedal) {
        const updated = await updateMedalDefinition(selectedMedal.id, {
          ...(image ? { image } : {}),
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
      setMembers(await fetchMedalMembers(selectedMedal.id));
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
      setMembers(await fetchMedalMembers(selectedMedal.id));
      setBatchRows([]);
      setBatchFileName('');
      setNotice({ kind: 'success', text: `已向 ${added} 名会员发放“${selectedMedal.name}”勋章` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '批量发放失败，请稍后重试。') });
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
      <section className="management-card management-medal-workspace">
        <header className="management-card-heading">
          <h2>勋章管理</h2>
          <button
            className="management-primary-button"
            disabled={Boolean(pendingAction) || editorMode === 'create'}
            onClick={() => { setEditorMode('create'); setNotice(null); }}
            type="button"
          >
            <Plus size={15} />新建勋章
          </button>
        </header>

        {loadMessage ? (
          <div className="management-medal-empty"><Medal size={24} /><strong>{loadMessage}</strong></div>
        ) : (
          <div className="management-medal-workspace-body">
            <aside aria-label="勋章列表" className="management-medal-catalog">
              <header><strong>勋章列表</strong><span>{medals.length}</span></header>
              <div className="management-medal-catalog-list">
                {medals.map((medal) => (
                  <button
                    aria-pressed={selectedMedal?.id === medal.id}
                    className={selectedMedal?.id === medal.id ? 'is-selected' : ''}
                    key={medal.id}
                    onClick={() => selectMedal(medal.id)}
                    type="button"
                  >
                    <MedalThumbnail imagePath={medal.smallImagePath} />
                    <span><strong>{medal.name}</strong></span>
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
                      <button aria-label="删除勋章" className="is-danger" disabled={Boolean(pendingAction)} onClick={() => setDeleteOpen(true)} title="删除勋章" type="button"><Trash2 size={16} /></button>
                    </div>
                  </header>

                  <nav aria-label="勋章详情" className="management-medal-detail-tabs">
                    <button className={detailTab === 'members' ? 'is-selected' : ''} onClick={() => setDetailTab('members')} type="button"><Users size={15} />成员名单</button>
                    <button className={detailTab === 'issue' ? 'is-selected' : ''} onClick={() => { setDetailTab('issue'); setNotice(null); }} type="button"><UserPlus size={15} />发放勋章</button>
                  </nav>

                  {detailTab === 'members' ? (
                    <MemberList members={members} status={membersStatus} />
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
                  <button className="management-primary-button" onClick={() => setEditorMode('create')} type="button"><Plus size={15} />新建勋章</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {notice ? <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice> : null}

      {deleteOpen && selectedMedal ? (
        <div className="management-dialog-backdrop" role="presentation">
          <section aria-labelledby="delete-medal-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header><h2 id="delete-medal-title">删除勋章</h2></header>
            <p className="management-dialog-copy">确定删除“{selectedMedal.name}”？对应的 {members.length} 条成员记录将一并删除。</p>
            <footer>
              <button className="management-secondary-button" disabled={pendingAction === 'medal-delete'} onClick={() => setDeleteOpen(false)} type="button">取消</button>
              <button className="management-danger-button" disabled={pendingAction === 'medal-delete'} onClick={() => { void deleteSelectedMedal(); }} type="button"><Trash2 size={15} />{pendingAction === 'medal-delete' ? '删除中' : '删除'}</button>
            </footer>
          </section>
        </div>
      ) : null}
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

function MemberList({ members, status }: { members: MedalMember[]; status: LoadState }) {
  return (
    <div className="management-medal-table-scroll">
      <table className="management-medal-member-table">
        <thead><tr><th>会员 ID</th><th>活动职务</th><th>获得时间</th></tr></thead>
        <tbody>
          {status === 'loading' ? (
            <tr><td className="management-medal-table-empty" colSpan={3}>正在加载成员</td></tr>
          ) : status === 'error' ? (
            <tr><td className="management-medal-table-empty" colSpan={3}>成员加载失败</td></tr>
          ) : members.length > 0 ? members.map((member) => (
            <tr key={member.username}>
              <td><a href={member.href}>{member.username}</a></td>
              <td>{member.role}</td>
              <td>{formatDate(member.awardedAt)}</td>
            </tr>
          )) : (
            <tr><td className="management-medal-table-empty" colSpan={3}>暂无成员</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
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
        <label><span>会员 ID</span><input onChange={(event) => onMemberIdChange(event.target.value)} placeholder="输入完整会员 ID" type="search" value={memberId} /></label>
        <label><span>职务（选填）</span><input maxLength={50} onChange={(event) => onRoleChange(event.target.value)} placeholder="例如：队长" type="text" value={role} /></label>
        <button className="management-primary-button" disabled={!memberId.trim() || importing} type="submit"><UserPlus size={15} />{importing ? '导入中' : '确认导入'}</button>
      </form>
      {check ? (
        <div className="management-medal-check-result" data-state={check.state.replace('_', '-')}>
          {check.state === 'available' ? <BadgeCheck size={18} /> : <CircleAlert size={18} />}
          <div>
            <a href={check.member?.href ?? getPublicProfilePath(check.username)}>{check.member?.username ?? check.username}</a>
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
  return (
    <div className="management-medal-batch-import">
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
        <button className="management-secondary-button" disabled={checking || importing} onClick={() => inputRef.current?.click()} type="button"><Upload size={15} />{checking ? '读取中' : '选择表格'}</button>
        {fileName ? <output><FileSpreadsheet size={15} />{fileName}</output> : null}
      </div>

      {rows.length > 0 ? (
        <div className="management-medal-table-scroll">
          <table className="management-medal-batch-table">
            <thead><tr><th>ID</th><th>职务</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.username}>
                  <td>
                    <div className="management-medal-batch-id">
                      <a href={row.member?.href ?? getPublicProfilePath(row.username)}>{row.username}</a>
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
          <div><span>可导入 {availableCount}</span><span>已拥有 {alreadyCount}</span><span>未找到 {missingCount}</span></div>
          <button className="management-primary-button" disabled={availableCount === 0 || importing} onClick={onImport} type="button"><UserPlus size={15} />{importing ? '导入中' : `导入 ${availableCount} 名成员`}</button>
        </footer>
      ) : null}
    </div>
  );
}

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

function pickDraft(medal: MedalDefinition): MedalDraft {
  return { imageSource: medal.largeImagePath, name: medal.name, textureId: medal.textureId };
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
