import {
  Bookmark,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  MessageSquareText,
  PenLine,
  Quote,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  profileTabs,
  type ProfileRecord,
  type ProfileRecordMap,
  type ProfileTab,
} from '../../data/profileDemo';
import {
  getRichTextEditorStorageValue,
  RichTextEditor,
  type RichTextEditorValue,
} from '../editor/RichTextEditor';

type ProfileWorkspaceProps = {
  allowedTabs: ProfileTab[];
  asideLink?: { href: string; label: string };
  initialRecords: ProfileRecordMap;
  ownerLabel: string;
  readOnly?: boolean;
};

const tabIcons: Record<ProfileTab, ReactNode> = {
  activities: <CalendarCheck2 size={15} />,
  bookmarks: <Bookmark size={15} />,
  drafts: <PenLine size={15} />,
  posts: <FileText size={15} />,
  replies: <MessageSquareText size={15} />,
  signatures: <Quote size={15} />,
};

const PAGE_SIZE = 3;

export function ProfileWorkspace({
  allowedTabs,
  asideLink,
  initialRecords,
  ownerLabel,
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
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (!requested || requested === activeTab) return;
    if (!allowedTabs.includes(requested as ProfileTab)) updateTabInUrl(activeTab);
  }, [activeTab, allowedTabs]);

  useEffect(() => {
    setPage(1);
    setEditingRecordId(null);
    setNotice('');
  }, [activeTab, keyword, startDate, endDate]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 2600);
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

  function saveSignature(record: ProfileRecord, value: RichTextEditorValue) {
    const storedValue = getRichTextEditorStorageValue(value);
    setRecords((current) => ({
      ...current,
      signatures: current.signatures.map((candidate) => candidate.id === record.id
        ? { ...candidate, contentMode: storedValue.mode, excerpt: storedValue.content }
        : candidate),
    }));
    setEditingRecordId(null);
    setNotice('签名档修改成功');
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

      {notice ? createPortal(<div className="profile-toast" role="status">{notice}</div>, document.body) : null}

      <div className="profile-content-layout">
        <div className="profile-record-panel">
          {visibleRecords.length ? (
            <div className="profile-record-list">
              {visibleRecords.map((record) => (
                <ProfileRecordRow
                  activeTab={activeTab}
                  editing={editingRecordId === record.id}
                  key={record.id}
                  readOnly={readOnly}
                  record={record}
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
            <a className="profile-aside-link" href={asideLink.href}>
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
          placeholder="搜索标题、版块或正文"
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
  editing,
  onEdit,
  onSaveSignature,
  readOnly,
  record,
}: {
  activeTab: ProfileTab;
  editing: boolean;
  onEdit: () => void;
  onSaveSignature: (value: RichTextEditorValue) => void;
  readOnly: boolean;
  record: ProfileRecord;
}) {
  const [signatureValue, setSignatureValue] = useState<RichTextEditorValue>({
    content: record.excerpt,
    mode: record.contentMode ?? 'rich',
  });

  useEffect(() => {
    setSignatureValue({ content: record.excerpt, mode: record.contentMode ?? 'rich' });
  }, [record.contentMode, record.excerpt]);

  return (
    <article className="profile-record">
      <div className="profile-record-line">
        <h3><a href={record.href}>{record.title}</a></h3>
        <time dateTime={record.date}>{formatDate(record.date)}</time>
        {!readOnly && activeTab === 'signatures' ? (
          <div className="profile-record-actions">
            <button type="button" onClick={editing ? () => onSaveSignature(signatureValue) : onEdit}>
              {editing ? '保存' : '编辑'}
            </button>
          </div>
        ) : null}
      </div>
      {editing && activeTab === 'signatures' ? (
        <div className="profile-signature-editor">
          <RichTextEditor
            ariaLabel={`${record.title}内容`}
            placeholder="写下签名档……"
            value={signatureValue}
            onChange={setSignatureValue}
          />
        </div>
      ) : activeTab === 'signatures' ? <p className="profile-signature-content">{toPlainText(record.excerpt, record.contentMode)}</p> : null}
    </article>
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
    <nav className="profile-pagination" aria-label="个人内容分页">
      <button disabled={currentPage === 1} type="button" onClick={() => onPageChange(currentPage - 1)}><ChevronLeft size={15} />上一页</button>
      <button disabled={currentPage === pageCount} type="button" onClick={() => onPageChange(currentPage + 1)}>下一页<ChevronRight size={15} /></button>
    </nav>
  );
}

function getRequestedTab(allowedTabs: ProfileTab[]) {
  const requested = new URLSearchParams(window.location.search).get('tab') as ProfileTab | null;
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
