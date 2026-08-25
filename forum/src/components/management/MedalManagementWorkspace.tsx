import {
  BadgeCheck,
  CircleAlert,
  FileSpreadsheet,
  Medal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react';
import { useMemo, useRef, useState, type CSSProperties, type FormEvent, type RefObject } from 'react';
import defaultMedalImage from '../../assets/activity/activity.avif';
import { MedalDesignerPanel } from './MedalDesignerPanel';
import { MEDAL_TEXTURES, type MedalDraft, type MedalTextureId } from './medalDesign';

type MedalMember = {
  acquiredAt: string;
  id: string;
  name: string;
  role: string;
};

type MedalRecord = MedalDraft & {
  id: string;
  members: MedalMember[];
};

type MemberDirectoryEntry = {
  id: string;
  name: string;
};

type CheckState = 'already-owned' | 'available' | 'not-found';
type IndividualCheck = {
  member?: MemberDirectoryEntry;
  state: CheckState;
};

const MEMBER_DIRECTORY: MemberDirectoryEntry[] = [
  { id: 'mira', name: 'Mira' },
  { id: 'northwind', name: '北风' },
  { id: 'qinghe', name: '清和' },
  { id: 'linxiang', name: '林巷' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'seabird', name: '海鸟' },
];

const INITIAL_MEDALS: MedalRecord[] = [
  {
    id: 'spring-hike-2026',
    imageSource: defaultMedalImage,
    members: [
      { acquiredAt: '2026-04-19', id: 'mira', name: 'Mira', role: '队长' },
      { acquiredAt: '2026-04-19', id: 'northwind', name: '北风', role: '参与者' },
      { acquiredAt: '2026-04-19', id: 'qinghe', name: '清和', role: '摄影' },
    ],
    name: '春季远足纪念',
    textureId: 'swirl',
  },
  {
    id: 'anniversary-2026',
    imageSource: defaultMedalImage,
    members: [
      { acquiredAt: '2026-05-28', id: 'linxiang', name: '林巷', role: '策划' },
      { acquiredAt: '2026-05-28', id: 'aurora', name: 'Aurora', role: '参与者' },
    ],
    name: '论坛周年活动',
    textureId: 'geometric',
  },
  {
    id: 'welcome-volunteer-2026',
    imageSource: defaultMedalImage,
    members: [
      { acquiredAt: '2026-08-18', id: 'seabird', name: '海鸟', role: '志愿者' },
    ],
    name: '迎新志愿服务',
    textureId: 'carbon',
  },
];

const BATCH_SOURCE_ROWS = [
  { id: 'linxiang', role: '队长' },
  { id: 'mira', role: '参与者' },
  { id: 'missing-member', role: '后勤' },
] as const;

export function MedalManagementWorkspace() {
  const [medals, setMedals] = useState<MedalRecord[]>(INITIAL_MEDALS);
  const [selectedId, setSelectedId] = useState(INITIAL_MEDALS[0].id);
  const [detailTab, setDetailTab] = useState<'issue' | 'members'>('members');
  const [issueMode, setIssueMode] = useState<'batch' | 'single'>('single');
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [singleId, setSingleId] = useState('');
  const [singleRole, setSingleRole] = useState('');
  const [individualCheck, setIndividualCheck] = useState<IndividualCheck | null>(null);
  const [notice, setNotice] = useState('');
  const [batchFileName, setBatchFileName] = useState('春季活动名单.xlsx');
  const batchInputRef = useRef<HTMLInputElement>(null);
  const selectedMedal = medals.find((medal) => medal.id === selectedId) ?? medals[0] ?? null;

  const batchRows = useMemo(() => BATCH_SOURCE_ROWS.map((row) => {
    const member = findDirectoryMember(row.id);
    const alreadyOwned = selectedMedal?.members.some((item) => sameId(item.id, row.id)) ?? false;
    return {
      ...row,
      member,
      state: !member ? 'not-found' : alreadyOwned ? 'already-owned' : 'available',
    } satisfies { id: string; member?: MemberDirectoryEntry; role: string; state: CheckState };
  }), [selectedMedal]);
  const availableBatchRows = batchRows.filter((row) => row.state === 'available' && row.member);
  const initialDraft = editorMode === 'edit' && selectedMedal
    ? pickDraft(selectedMedal)
    : { imageSource: defaultMedalImage, name: '', textureId: 'swirl' as MedalTextureId };

  function selectMedal(id: string) {
    setSelectedId(id);
    setEditorMode(null);
    setDetailTab('members');
    setIndividualCheck(null);
    setNotice('');
  }

  function saveMedal(draft: MedalDraft) {
    if (editorMode === 'create') {
      const created: MedalRecord = {
        ...draft,
        id: `medal-${Date.now()}`,
        members: [],
      };
      setMedals((current) => [...current, created]);
      setSelectedId(created.id);
    } else if (selectedMedal) {
      setMedals((current) => current.map((medal) => medal.id === selectedMedal.id
        ? { ...medal, ...draft }
        : medal));
    }
    setEditorMode(null);
    setDetailTab('members');
  }

  function deleteSelectedMedal() {
    if (!selectedMedal) return;
    const selectedIndex = medals.findIndex((medal) => medal.id === selectedMedal.id);
    const nextMedals = medals.filter((medal) => medal.id !== selectedMedal.id);
    setMedals(nextMedals);
    setSelectedId(nextMedals[Math.min(selectedIndex, nextMedals.length - 1)]?.id ?? '');
    setDeleteOpen(false);
    setEditorMode(null);
  }

  function checkIndividual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    const member = findDirectoryMember(singleId);
    if (!member) {
      setIndividualCheck({ state: 'not-found' });
      return;
    }
    const alreadyOwned = selectedMedal?.members.some((item) => sameId(item.id, member.id)) ?? false;
    setIndividualCheck({ member, state: alreadyOwned ? 'already-owned' : 'available' });
  }

  function importIndividual() {
    if (!selectedMedal || individualCheck?.state !== 'available' || !individualCheck.member || !singleRole.trim()) return;
    const member = individualCheck.member;
    setMedals((current) => current.map((medal) => medal.id === selectedMedal.id
      ? {
          ...medal,
          members: [...medal.members, {
            acquiredAt: '刚刚',
            id: member.id,
            name: member.name,
            role: singleRole.trim(),
          }],
        }
      : medal));
    setNotice(`已导入会员 ${member.id}`);
    setSingleId('');
    setSingleRole('');
    setIndividualCheck(null);
  }

  function importBatch() {
    if (!selectedMedal || availableBatchRows.length === 0) return;
    setMedals((current) => current.map((medal) => medal.id === selectedMedal.id
      ? {
          ...medal,
          members: [
            ...medal.members,
            ...availableBatchRows.map((row) => ({
              acquiredAt: '刚刚',
              id: row.member?.id ?? row.id,
              name: row.member?.name ?? row.id,
              role: row.role,
            })),
          ],
        }
      : medal));
    setNotice(`已导入 ${availableBatchRows.length} 名成员`);
  }

  return (
    <>
      <section className="management-card management-medal-workspace">
        <header className="management-card-heading">
          <h2>勋章管理</h2>
          <button className="management-primary-button" disabled={editorMode === 'create'} onClick={() => setEditorMode('create')} type="button">
            <Plus size={15} />新建勋章
          </button>
        </header>

        <div className="management-medal-workspace-body">
          <aside aria-label="勋章列表" className="management-medal-catalog">
            <header>
              <strong>勋章列表</strong>
              <span>{medals.length}</span>
            </header>
            <div className="management-medal-catalog-list">
              {medals.map((medal) => (
                <button
                  aria-pressed={selectedMedal?.id === medal.id}
                  className={selectedMedal?.id === medal.id ? 'is-selected' : ''}
                  key={medal.id}
                  onClick={() => selectMedal(medal.id)}
                  type="button"
                >
                  <MedalThumbnail medal={medal} />
                  <span>
                    <strong>{medal.name}</strong>
                    <small>{medal.members.length} 名成员</small>
                  </span>
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
                onSave={saveMedal}
              />
            ) : selectedMedal ? (
              <>
                <header className="management-medal-detail-heading">
                  <div className="management-medal-detail-identity">
                    <MedalThumbnail medal={selectedMedal} />
                    <div>
                      <h3>{selectedMedal.name}</h3>
                      <span>{selectedMedal.members.length} 名成员</span>
                    </div>
                  </div>
                  <div className="management-medal-detail-actions">
                    <button aria-label="编辑勋章" onClick={() => setEditorMode('edit')} title="编辑勋章" type="button"><Pencil size={16} /></button>
                    <button aria-label="删除勋章" className="is-danger" onClick={() => setDeleteOpen(true)} title="删除勋章" type="button"><Trash2 size={16} /></button>
                  </div>
                </header>

                <nav aria-label="勋章详情" className="management-medal-detail-tabs">
                  <button className={detailTab === 'members' ? 'is-selected' : ''} onClick={() => setDetailTab('members')} type="button">
                    <Users size={15} />成员名单
                  </button>
                  <button className={detailTab === 'issue' ? 'is-selected' : ''} onClick={() => { setDetailTab('issue'); setNotice(''); }} type="button">
                    <UserPlus size={15} />发放勋章
                  </button>
                </nav>

                {detailTab === 'members' ? (
                  <MemberList members={selectedMedal.members} />
                ) : (
                  <section aria-label="发放勋章" className="management-medal-issue">
                    <div className="management-medal-issue-modes" role="tablist" aria-label="导入方式">
                      <button aria-selected={issueMode === 'single'} className={issueMode === 'single' ? 'is-selected' : ''} onClick={() => { setIssueMode('single'); setNotice(''); }} role="tab" type="button">单独导入</button>
                      <button aria-selected={issueMode === 'batch'} className={issueMode === 'batch' ? 'is-selected' : ''} onClick={() => { setIssueMode('batch'); setNotice(''); }} role="tab" type="button">表格导入</button>
                    </div>
                    {issueMode === 'single' ? (
                      <SingleImportPanel
                        check={individualCheck}
                        memberId={singleId}
                        notice={notice}
                        onCheck={checkIndividual}
                        onImport={importIndividual}
                        onMemberIdChange={(value) => { setSingleId(value); setIndividualCheck(null); setNotice(''); }}
                        onRoleChange={(value) => { setSingleRole(value); setNotice(''); }}
                        role={singleRole}
                      />
                    ) : (
                      <BatchImportPanel
                        fileName={batchFileName}
                        inputRef={batchInputRef}
                        notice={notice}
                        onFileChange={(fileName) => { setBatchFileName(fileName); setNotice(''); }}
                        onImport={importBatch}
                        rows={batchRows}
                      />
                    )}
                  </section>
                )}
              </>
            ) : (
              <div className="management-medal-empty">
                <Medal size={24} />
                <strong>暂无勋章</strong>
                <button className="management-primary-button" onClick={() => setEditorMode('create')} type="button"><Plus size={15} />新建勋章</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {deleteOpen && selectedMedal ? (
        <div className="management-dialog-backdrop" role="presentation">
          <section aria-labelledby="delete-medal-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header><h2 id="delete-medal-title">删除勋章</h2></header>
            <p className="management-dialog-copy">确定删除“{selectedMedal.name}”？对应的 {selectedMedal.members.length} 条成员记录将一并删除。</p>
            <footer>
              <button className="management-secondary-button" onClick={() => setDeleteOpen(false)} type="button">取消</button>
              <button className="management-danger-button" onClick={deleteSelectedMedal} type="button"><Trash2 size={15} />删除</button>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

function MedalThumbnail({ medal }: { medal: Pick<MedalRecord, 'imageSource' | 'textureId'> }) {
  const texture = MEDAL_TEXTURES.find((item) => item.id === medal.textureId) ?? MEDAL_TEXTURES[0];
  return (
    <span className="management-medal-thumbnail">
      <img alt="" src={medal.imageSource} />
      <i aria-hidden="true" style={{ backgroundImage: `url(${texture.src})` } as CSSProperties} />
    </span>
  );
}

function MemberList({ members }: { members: MedalMember[] }) {
  return (
    <div className="management-medal-table-scroll">
      <table className="management-medal-member-table">
        <thead><tr><th>会员 ID</th><th>活动职务</th><th>获得时间</th></tr></thead>
        <tbody>
          {members.length > 0 ? members.map((member) => (
            <tr key={member.id}>
              <td><strong>{member.id}</strong><span>{member.name}</span></td>
              <td>{member.role}</td>
              <td>{member.acquiredAt}</td>
            </tr>
          )) : (
            <tr><td className="management-medal-table-empty" colSpan={3}>暂无成员</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SingleImportPanel({ check, memberId, notice, onCheck, onImport, onMemberIdChange, onRoleChange, role }: {
  check: IndividualCheck | null;
  memberId: string;
  notice: string;
  onCheck: (event: FormEvent<HTMLFormElement>) => void;
  onImport: () => void;
  onMemberIdChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  role: string;
}) {
  return (
    <div className="management-medal-single-import">
      <form onSubmit={onCheck}>
        <label><span>会员 ID</span><input onChange={(event) => onMemberIdChange(event.target.value)} placeholder="输入完整会员 ID" type="search" value={memberId} /></label>
        <label><span>职务</span><input maxLength={30} onChange={(event) => onRoleChange(event.target.value)} placeholder="例如：队长" type="text" value={role} /></label>
        <button className="management-secondary-button" disabled={!memberId.trim()} type="submit"><Search size={15} />检查成员</button>
      </form>
      {check ? (
        <div className="management-medal-check-result" data-state={check.state}>
          {check.state === 'available' ? <BadgeCheck size={18} /> : <CircleAlert size={18} />}
          <div>
            <strong>{check.member?.id ?? memberId}</strong>
            <span>{checkLabel(check)}</span>
          </div>
          <button className="management-primary-button" disabled={check.state !== 'available' || !role.trim()} onClick={onImport} type="button"><UserPlus size={15} />确认导入</button>
        </div>
      ) : null}
      {notice ? <p className="management-medal-import-notice"><BadgeCheck size={15} />{notice}</p> : null}
    </div>
  );
}

function BatchImportPanel({ fileName, inputRef, notice, onFileChange, onImport, rows }: {
  fileName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  notice: string;
  onFileChange: (fileName: string) => void;
  onImport: () => void;
  rows: Array<{ id: string; member?: MemberDirectoryEntry; role: string; state: CheckState }>;
}) {
  const availableCount = rows.filter((row) => row.state === 'available').length;
  const alreadyCount = rows.filter((row) => row.state === 'already-owned').length;
  const missingCount = rows.filter((row) => row.state === 'not-found').length;
  return (
    <div className="management-medal-batch-import">
      <div className="management-medal-file-row">
        <input
          accept=".csv,.xls,.xlsx"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileChange(file.name);
            event.target.value = '';
          }}
          ref={inputRef}
          type="file"
        />
        <button className="management-secondary-button" onClick={() => inputRef.current?.click()} type="button"><Upload size={15} />选择表格</button>
        <output><FileSpreadsheet size={15} />{fileName}</output>
      </div>

      <div className="management-medal-table-scroll">
        <table className="management-medal-batch-table">
          <thead><tr><th>ID</th><th>职务</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.id}-${row.role}`}>
                <td>
                  <strong>{row.id}</strong>
                  <span data-state={row.state}>{row.state === 'available' ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}{batchCheckLabel(row)}</span>
                </td>
                <td>{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="management-medal-batch-footer">
        <div><span>可导入 {availableCount}</span><span>已拥有 {alreadyCount}</span><span>未找到 {missingCount}</span></div>
        <button className="management-primary-button" disabled={availableCount === 0} onClick={onImport} type="button"><UserPlus size={15} />导入 {availableCount} 名成员</button>
      </footer>
      {notice ? <p className="management-medal-import-notice"><BadgeCheck size={15} />{notice}</p> : null}
    </div>
  );
}

function checkLabel(check: IndividualCheck) {
  if (check.state === 'available') return `${check.member?.name ?? ''} · 可以导入`;
  if (check.state === 'already-owned') return `${check.member?.name ?? ''} · 已拥有该勋章`;
  return '未找到该成员';
}

function batchCheckLabel(row: { member?: MemberDirectoryEntry; state: CheckState }) {
  if (row.state === 'available') return `${row.member?.name ?? ''} · 可导入`;
  if (row.state === 'already-owned') return `${row.member?.name ?? ''} · 已拥有`;
  return '未找到成员';
}

function findDirectoryMember(id: string) {
  return MEMBER_DIRECTORY.find((member) => sameId(member.id, id));
}

function sameId(left: string, right: string) {
  return left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase();
}

function pickDraft(medal: MedalRecord): MedalDraft {
  return { imageSource: medal.imageSource, name: medal.name, textureId: medal.textureId };
}
