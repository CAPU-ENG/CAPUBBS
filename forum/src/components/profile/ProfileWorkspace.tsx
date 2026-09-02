import {
  Bookmark,
  CalendarCheck2,
  ExternalLink,
  FileText,
  Filter,
  Link2,
  MessageSquareText,
  PenLine,
  Quote,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Pagination } from '../layout/Pagination';
import {
  profileTabs,
  type ProfileRecord,
  type ProfileRecordMap,
  type ProfileTab,
} from '../../data/profile';
import {
  buildSignatureFloorHref,
  buildSignatureFloorMarker,
  parseSignatureFloorLink,
  type SignatureFloorReference,
} from '../../utils/signatureFloorLink';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { stripForumBasePath } from '../../utils/forumBasePath';
import {
  getRichTextEditorStorageValue,
  RichTextEditor,
  type RichTextEditorValue,
} from '../editor/RichTextEditor';

type ProfileWorkspaceProps = {
  allowedTabs: ProfileTab[];
  asideLink?: { href: string; label: string };
  initialRecords: ProfileRecordMap;
  lazyTabs?: ProfileTab[];
  onDeleteDraft?: (recordId: string) => Promise<void>;
  onLoadTab?: (tab: ProfileTab) => Promise<ProfileRecord[]>;
  ownerLabel: string;
  onSaveSignatures?: (records: ProfileRecord[]) => Promise<void>;
  readOnly?: boolean;
};

type WorkspaceNotice = { message: string; tone: 'error' | 'success' } | null;

const tabIcons: Record<ProfileTab, ReactNode> = {
  activities: <CalendarCheck2 size={15} />,
  bookmarks: <Bookmark size={15} />,
  drafts: <PenLine size={15} />,
  posts: <FileText size={15} />,
  replies: <MessageSquareText size={15} />,
  signatures: <Quote size={15} />,
};

const PAGE_SIZE = 15;

export function ProfileWorkspace({
  allowedTabs,
  asideLink,
  initialRecords,
  lazyTabs = [],
  onDeleteDraft,
  onLoadTab,
  ownerLabel,
  onSaveSignatures,
  readOnly = false,
}: ProfileWorkspaceProps) {
  const initialTab = getRequestedTab(allowedTabs);
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [records, setRecords] = useState(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [notice, setNotice] = useState<WorkspaceNotice>(null);
  const [loadingTab, setLoadingTab] = useState<ProfileTab | null>(null);
  const [loadedTabs, setLoadedTabs] = useState<ProfileTab[]>([]);
  const [savingRecordId, setSavingRecordId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(initialRecords);
    setLoadedTabs([]);
  }, [initialRecords]);

  useEffect(() => {
    if (!onLoadTab || !lazyTabs.includes(activeTab) || loadedTabs.includes(activeTab)) return;
    let active = true;
    setLoadingTab(activeTab);
    void onLoadTab(activeTab).then(
      (loadedRecords) => {
        if (!active) return;
        setRecords((current) => ({ ...current, [activeTab]: loadedRecords }));
        setLoadedTabs((current) => current.includes(activeTab) ? current : [...current, activeTab]);
        setLoadingTab(null);
      },
      (error: unknown) => {
        if (!active) return;
        setNotice({
          message: error instanceof Error ? error.message : '内容加载失败，请稍后重试',
          tone: 'error',
        });
        setLoadedTabs((current) => current.includes(activeTab) ? current : [...current, activeTab]);
        setLoadingTab(null);
      },
    );
    return () => { active = false; };
  }, [activeTab, lazyTabs, loadedTabs, onLoadTab]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (!requested || requested === activeTab) return;
    if (!allowedTabs.includes(requested as ProfileTab)) updateTabInUrl(activeTab);
  }, [activeTab, allowedTabs]);

  useEffect(() => {
    setPage(1);
    setEditingRecordId(null);
    setNotice(null);
  }, [activeTab, keyword, startDate, endDate]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filteredRecords = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    return records[activeTab].filter((record) => {
      const matchesKeyword = !normalizedKeyword || [record.title, record.board, record.excerpt, record.author, record.status]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedKeyword));
      const matchesStart = !startDate || record.date >= startDate;
      const matchesEnd = !endDate || record.date <= endDate;
      return matchesKeyword && matchesStart && matchesEnd;
    });
  }, [activeTab, endDate, keyword, records, startDate]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeTabMeta = profileTabs.find((tab) => tab.key === activeTab)!;
  const filterCount = [keyword.trim(), startDate, endDate].filter(Boolean).length;

  function changeTab(tab: ProfileTab) {
    setActiveTab(tab);
    updateTabInUrl(tab);
  }

  function resetFilters() {
    setKeyword('');
    setStartDate('');
    setEndDate('');
  }

  async function saveSignature(record: ProfileRecord, value: RichTextEditorValue) {
    const storedValue = getRichTextEditorStorageValue(value);
    const nextSignatures = records.signatures.map((candidate) => candidate.id === record.id
      ? { ...candidate, contentMode: storedValue.mode, excerpt: storedValue.content }
      : candidate);

    try {
      setSavingRecordId(record.id);
      await onSaveSignatures?.(nextSignatures);
      setRecords((current) => ({ ...current, signatures: nextSignatures }));
      setEditingRecordId(null);
      setNotice({ message: '签名档修改成功', tone: 'success' });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : '签名档保存失败，请稍后重试',
        tone: 'error',
      });
    } finally {
      setSavingRecordId(null);
    }
  }

  async function deleteDraft(record: ProfileRecord) {
    if (!window.confirm(`确认删除草稿“${record.title}”？`)) return;

    try {
      setDeletingRecordId(record.id);
      await onDeleteDraft?.(record.id);
      setRecords((current) => ({
        ...current,
        drafts: current.drafts.filter((candidate) => candidate.id !== record.id),
      }));
      setNotice({ message: '草稿已删除', tone: 'success' });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : '草稿删除失败，请稍后重试',
        tone: 'error',
      });
    } finally {
      setDeletingRecordId(null);
    }
  }

  const filterPanel = (
    <ProfileFilterPanel
      endDate={endDate}
      keyword={keyword}
      matchedCount={filteredRecords.length}
      startDate={startDate}
      onEndDateChange={setEndDate}
      onKeywordChange={setKeyword}
      onReset={resetFilters}
      onStartDateChange={setStartDate}
    />
  );

  return (
    <section className="profile-workspace" aria-label={`${ownerLabel}的论坛内容`}>
      <nav className="profile-tabs" aria-label="个人内容分类">
        {profileTabs.filter((tab) => allowedTabs.includes(tab.key)).map((tab) => (
          <button
            aria-current={tab.key === activeTab ? 'page' : undefined}
            className="profile-tab"
            key={tab.key}
            onClick={() => changeTab(tab.key)}
            type="button"
          >
            {tabIcons[tab.key]}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeTab !== 'signatures' ? (
        <div className="profile-filter-toolbar">
          <button
            aria-expanded={filtersOpen}
            className="profile-filter-toggle"
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
          >
            <Filter size={15} />筛选{filterCount ? ` ${filterCount}` : ''}
          </button>
        </div>
      ) : null}

      {filtersOpen && activeTab !== 'signatures' ? <div className="profile-mobile-filter">{filterPanel}</div> : null}

      {notice ? createPortal(
        <div className={`profile-toast ${notice.tone === 'error' ? 'profile-toast-error' : ''}`} role="status">
          {notice.message}
        </div>,
        document.body,
      ) : null}

      <div className="profile-content-layout">
        <div className="profile-record-panel">
          {loadingTab === activeTab ? (
            <div className="profile-empty-state" role="status">
              <span><RotateCcw className="animate-spin" size={20} /></span>
              <h3>正在加载{activeTabMeta.label}</h3>
            </div>
          ) : visibleRecords.length ? (
            <div className="profile-record-list">
              {visibleRecords.map((record) => (
                <ProfileRecordRow
                  activeTab={activeTab}
                  deleting={deletingRecordId === record.id}
                  editing={editingRecordId === record.id}
                  key={record.id}
                  readOnly={readOnly}
                  record={record}
                  saving={savingRecordId === record.id}
                  onDeleteDraft={() => { void deleteDraft(record); }}
                  onEdit={() => setEditingRecordId(record.id)}
                  onSaveSignature={(value) => saveSignature(record, value)}
                />
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">
              <span>{tabIcons[activeTab]}</span>
              <h3>{keyword || startDate || endDate ? '没有符合条件的记录' : `暂无${activeTabMeta.label}`}</h3>
              <p>{keyword || startDate || endDate ? '可以调整关键词或日期范围后再试。' : '这里会显示对应的论坛活动。'}</p>
              {keyword || startDate || endDate ? <button type="button" onClick={resetFilters}>重置筛选</button> : null}
            </div>
          )}

          {pageCount > 1 ? (
            <ProfilePagination currentPage={safePage} pageCount={pageCount} onPageChange={setPage} />
          ) : null}
        </div>

        <aside className="profile-workspace-aside">
          {activeTab !== 'signatures' ? <div className="profile-desktop-filter">{filterPanel}</div> : null}
          {asideLink ? (
            <a className="profile-aside-link" href={getForumNavigationHref(asideLink.href, window.location.href)}>
              <span>{asideLink.label}</span><ExternalLink size={15} />
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function ProfileFilterPanel({
  endDate,
  keyword,
  matchedCount,
  onEndDateChange,
  onKeywordChange,
  onReset,
  onStartDateChange,
  startDate,
}: {
  endDate: string;
  keyword: string;
  matchedCount: number;
  onEndDateChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onReset: () => void;
  onStartDateChange: (value: string) => void;
  startDate: string;
}) {
  const invalidRange = Boolean(startDate && endDate && startDate > endDate);

  return (
    <section className="profile-filter-panel" aria-label="筛选个人内容">
      <div className="profile-filter-title">
        <div><Search size={16} /><strong>筛选</strong></div>
        <button type="button" onClick={onReset}><RotateCcw size={13} />重置</button>
      </div>
      <label>
        <span>关键词</span>
        <input
          placeholder="搜索标题"
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </label>
      <div className="profile-date-fields">
        <label><span>开始日期</span><input type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} /></label>
        <label><span>结束日期</span><input type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} /></label>
      </div>
      {invalidRange ? <p className="profile-filter-error">开始日期不能晚于结束日期。</p> : null}
      <p className="profile-filter-result">找到 <strong>{invalidRange ? 0 : matchedCount}</strong> 条记录</p>
    </section>
  );
}

function ProfileRecordRow({
  activeTab,
  deleting,
  editing,
  onDeleteDraft,
  onEdit,
  onSaveSignature,
  readOnly,
  record,
  saving,
}: {
  activeTab: ProfileTab;
  deleting: boolean;
  editing: boolean;
  onDeleteDraft: () => void;
  onEdit: () => void;
  onSaveSignature: (value: RichTextEditorValue) => void;
  readOnly: boolean;
  record: ProfileRecord;
  saving: boolean;
}) {
  const [floorLinkOpen, setFloorLinkOpen] = useState(false);
  const [signatureValue, setSignatureValue] = useState<RichTextEditorValue>({
    content: record.excerpt,
    mode: record.contentMode ?? 'rich',
  });

  useEffect(() => {
    setSignatureValue({ content: record.excerpt, mode: record.contentMode ?? 'rich' });
  }, [record.contentMode, record.excerpt]);

  const savedFloorReference = activeTab === 'signatures' ? parseSignatureFloorLink(record.excerpt) : null;
  const draftFloorReference = activeTab === 'signatures' ? parseSignatureFloorLink(signatureValue.content) : null;

  return (
    <article className="profile-record">
      <div className="profile-record-line">
        <h3>{activeTab === 'signatures' ? record.title : <a href={getForumNavigationHref(record.href, window.location.href)}>{record.title}</a>}</h3>
        {activeTab === 'activities' && record.status ? (
          <span className="profile-record-status" data-canceled={record.status === '已取消报名' ? 'true' : undefined}>
            {record.status}
          </span>
        ) : null}
        {activeTab !== 'signatures' ? <time dateTime={record.date}>{formatDate(record.date)}</time> : null}
        {!readOnly && activeTab === 'drafts' ? (
          <div className="profile-record-actions profile-draft-actions">
            <a
              aria-disabled={deleting || undefined}
              href={deleting ? undefined : getForumNavigationHref(record.draftHref ?? record.href, window.location.href)}
              onClick={(event) => { if (deleting) event.preventDefault(); }}
            >
              <RotateCcw size={13} />恢复草稿
            </a>
            <button
              className="profile-record-delete-button"
              disabled={deleting}
              onClick={onDeleteDraft}
              type="button"
            >
              <Trash2 size={13} />{deleting ? '删除中' : '删除草稿'}
            </button>
          </div>
        ) : null}
        {!readOnly && activeTab === 'signatures' ? (
          <div className="profile-record-actions">
            {editing ? (
              <button disabled={saving} type="button" onClick={() => setFloorLinkOpen(true)}><Link2 size={13} />链接到楼层</button>
            ) : null}
            <button disabled={saving} type="button" onClick={editing ? () => onSaveSignature(signatureValue) : onEdit}>
              {saving ? '保存中' : editing ? '保存' : '编辑'}
            </button>
          </div>
        ) : null}
      </div>
      {editing && activeTab === 'signatures' ? (
        <div className="profile-signature-editor rich-text-editor-field">
          <RichTextEditor
            ariaLabel={`${record.title}内容`}
            placeholder="写下签名档……"
            value={signatureValue}
            onChange={setSignatureValue}
          />
          {draftFloorReference ? (
            <div className="profile-signature-floor-draft">
              <Link2 size={14} />将保存为 {buildSignatureFloorMarker(draftFloorReference)}
            </div>
          ) : null}
        </div>
      ) : activeTab === 'signatures' ? (
        savedFloorReference ? (
          <a className="profile-signature-floor-link" href={buildSignatureFloorHref(savedFloorReference)}>
            <Link2 size={15} />
            <span>链接到楼层</span>
            <strong>bid={savedFloorReference.bid} · tid={savedFloorReference.tid} · pid={savedFloorReference.pid}</strong>
            <ExternalLink size={14} />
          </a>
        ) : <p className="profile-signature-content">{toPlainText(record.excerpt, record.contentMode)}</p>
      ) : null}

      {floorLinkOpen ? (
        <SignatureFloorLinkDialog
          initialValue={draftFloorReference ? buildSignatureFloorHref(draftFloorReference) : ''}
          onClose={() => setFloorLinkOpen(false)}
          onLink={(reference) => {
            setSignatureValue({ content: buildSignatureFloorMarker(reference), mode: 'rich' });
            setFloorLinkOpen(false);
          }}
        />
      ) : null}
    </article>
  );
}

function SignatureFloorLinkDialog({
  initialValue,
  onClose,
  onLink,
}: {
  initialValue: string;
  onClose: () => void;
  onLink: (reference: SignatureFloorReference) => void;
}) {
  const [link, setLink] = useState(initialValue);
  const [error, setError] = useState('');
  const parsedReference = parseSignatureFloorLink(link);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = parseSignatureFloorLink(link);
    if (!reference) {
      setError('无法解析楼层链接，请确认链接包含 bid、tid 和 pid（或 floor）。');
      return;
    }
    onLink(reference);
  }

  return createPortal(
    <div className="profile-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        aria-modal="true"
        className="profile-dialog profile-floor-link-dialog"
        role="dialog"
        aria-labelledby="signature-floor-link-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <header>
          <span><Link2 size={18} /></span>
          <h2 id="signature-floor-link-title">链接到楼层</h2>
          <button aria-label="关闭" type="button" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="profile-dialog-body">
          <p className="profile-dialog-copy">粘贴新论坛或旧论坛的楼层链接，系统会转换为签名档楼层标记。</p>
          <label className="profile-dialog-field">
            <span>楼层链接</span>
            <input
              autoFocus
              value={link}
              onChange={(event) => { setLink(event.target.value); setError(''); }}
              placeholder="例如 /bbs/content/?bid=4&tid=19989#pid41"
            />
          </label>
          {parsedReference ? (
            <div className="profile-floor-link-preview">
              <span>将转换为</span>
              <code>{buildSignatureFloorMarker(parsedReference)}</code>
            </div>
          ) : null}
          {error ? <p className="profile-dialog-error">{error}</p> : null}
        </div>
        <footer className="profile-dialog-footer">
          <button className="profile-dialog-cancel" type="button" onClick={onClose}>取消</button>
          <button className="profile-dialog-confirm" type="submit">转换并链接</button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}

function ProfilePagination({
  currentPage,
  onPageChange,
  pageCount,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageCount: number;
}) {
  return (
    <div className="profile-pagination forum-pagination-card">
      <Pagination
        ariaLabel="个人内容分页"
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageCount={pageCount}
        showPageJump
      />
    </div>
  );
}

function getRequestedTab(allowedTabs: ProfileTab[]) {
  const requested = new URLSearchParams(window.location.search).get('tab') as ProfileTab | null;
  const pathname = stripForumBasePath(window.location.pathname).replace(/\/+$/, '');
  if (!requested && (pathname === '/favorite' || pathname === '/favorite/index.php')) {
    return allowedTabs.includes('bookmarks') ? 'bookmarks' : allowedTabs[0] ?? 'posts';
  }
  return requested && allowedTabs.includes(requested) ? requested : allowedTabs[0] ?? 'posts';
}

function updateTabInUrl(tab: ProfileTab) {
  const url = new URL(window.location.href);
  if (tab === 'posts') url.searchParams.delete('tab');
  else url.searchParams.set('tab', tab);
  url.searchParams.delete('page');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '时间未知';
  const [year, month, day] = value.split('-');
  return `${year}.${month}.${day}`;
}

function toPlainText(value: string, mode: ProfileRecord['contentMode']) {
  if (mode === 'markdown') {
    return value.replace(/[#*_`>\[\]()~-]/g, ' ').replace(/\s+/g, ' ').trim() || '暂未设置签名档';
  }
  const documentValue = new DOMParser().parseFromString(value, 'text/html');
  return documentValue.body.textContent?.trim() || '暂未设置签名档';
}
