import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  History,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useSearchData, type SearchField, type SearchRequest, type SearchResult } from '../hooks/useSearchData';
import { getPublicProfilePath } from '../utils/userRoutes';
import { ALL_BOARDS } from '../data/boards';

type SearchRange = 'all' | 'custom' | 'year';

type SearchOptions = {
  author: string;
  boardId: number | null;
  endDate: string;
  field: SearchField;
  keyword: string;
  range: SearchRange;
  startDate: string;
};

const SEARCH_PAGE_SIZE = 15;
const SEARCH_HISTORY_KEY = 'capubbs-search-history:v1';
const THREAD_FLOORS_PER_PAGE = 12;

const boards = ALL_BOARDS;

export function SearchPage() {
  const initialOptions = useMemo(readOptionsFromLocation, []);
  const [draft, setDraft] = useState<SearchOptions>(initialOptions);
  const [applied, setApplied] = useState<SearchOptions>(initialOptions);
  const [requestKey, setRequestKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => readPageFromLocation());
  const [history, setHistory] = useState(readSearchHistory);
  const request = useMemo<SearchRequest>(() => ({
    author: applied.author,
    boardId: applied.boardId,
    endDate: resolveEndDate(applied),
    field: applied.field,
    keyword: applied.keyword,
    requestKey,
    startDate: resolveStartDate(applied),
  }), [applied, requestKey]);
  const { error, results, retry, status } = useSearchData(request);
  const pageCount = Math.max(1, Math.ceil(results.length / SEARCH_PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const visibleResults = results.slice((safePage - 1) * SEARCH_PAGE_SIZE, safePage * SEARCH_PAGE_SIZE);
  const hasSearch = Boolean(applied.keyword);

  function applySearch(options: SearchOptions) {
    const normalized = { ...options, author: options.author.trim(), keyword: options.keyword.trim() };
    setDraft(normalized);
    setApplied(normalized);
    setCurrentPage(1);
    setRequestKey((key) => key + 1);
    updateLocation(normalized, 1);

    if (normalized.keyword) setHistory(storeSearchHistory(normalized.keyword));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch(draft);
  }

  function changePage(page: number) {
    setCurrentPage(page);
    updateLocation(applied, page);
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }

  return (
    <div className="relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="search-page-shell">
        <header className="search-hero">
          <form className="search-form" onSubmit={handleSubmit} role="search">
            <label className="search-input-wrap">
              <Search aria-hidden="true" size={20} />
              <span className="sr-only">搜索关键词</span>
              <input
                autoComplete="off"
                autoFocus
                maxLength={80}
                onChange={(event) => setDraft((current) => ({ ...current, keyword: event.target.value }))}
                placeholder={draft.field === 'user' ? '输入用户名' : '输入标题或正文关键词'}
                value={draft.keyword}
              />
              {draft.keyword ? (
                <button
                  aria-label="清空关键词"
                  className="search-input-clear"
                  onClick={() => setDraft((current) => ({ ...current, keyword: '' }))}
                  type="button"
                >
                  <X size={15} />
                </button>
              ) : null}
            </label>
            <button className="search-submit" type="submit"><Search size={17} />搜索</button>
          </form>
        </header>

        <div className="search-mobile-filters">
          <details>
            <summary><SlidersHorizontal size={16} />筛选搜索范围</summary>
            <SearchFilters draft={draft} onChange={setDraft} />
          </details>
        </div>

        <div className="search-layout">
          <section className="search-results" aria-live="polite">
            <SearchResultHeader applied={applied} count={results.length} status={status} />

            {!hasSearch ? (
              <SearchStart field={applied.field} history={history} onSearch={(keyword) => applySearch({ ...draft, keyword })} />
            ) : status === 'loading' ? (
              <SearchLoading />
            ) : status === 'error' ? (
              <SearchError error={error} onRetry={retry} />
            ) : visibleResults.length === 0 ? (
              <SearchEmpty field={applied.field} keyword={applied.keyword} />
            ) : (
              <div className="search-result-list">
                {visibleResults.map((result) => (
                  <SearchResultRow
                    field={applied.field}
                    keyword={applied.keyword}
                    key={result.id}
                    result={result}
                  />
                ))}
              </div>
            )}

            {status === 'ready' && pageCount > 1 ? (
              <div className="search-pagination-wrap">
                <SearchPagination
                  currentPage={safePage}
                  onChange={changePage}
                  pageCount={pageCount}
                />
              </div>
            ) : null}
          </section>

          <aside className="search-filter-aside">
            <div className="search-filter-card">
              <div className="search-filter-title"><SlidersHorizontal size={16} /><h2>筛选</h2></div>
              <SearchFilters draft={draft} onChange={setDraft} />
              <button className="search-filter-apply" onClick={() => applySearch(draft)} type="button">
                {draft.field === 'user' ? '应用搜索位置' : '应用筛选'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SearchPagination({
  currentPage,
  onChange,
  pageCount,
}: {
  currentPage: number;
  onChange: (page: number) => void;
  pageCount: number;
}) {
  const pages = visiblePages(currentPage, pageCount);

  return (
    <nav className="thread-pagination" aria-label="搜索结果分页">
      <button
        aria-label="上一页"
        className="thread-page-button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <span className="contents" key={page}>
            {previous && page - previous > 1 ? <span className="thread-page-gap">…</span> : null}
            <button
              aria-current={page === currentPage ? 'page' : undefined}
              className="thread-page-number"
              onClick={() => onChange(page)}
              type="button"
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        aria-label="下一页"
        className="thread-page-button"
        disabled={currentPage === pageCount}
        onClick={() => onChange(currentPage + 1)}
        type="button"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}

function SearchFilters({
  draft,
  onChange,
}: {
  draft: SearchOptions;
  onChange: (next: SearchOptions) => void;
}) {
  const set = <Key extends keyof SearchOptions>(key: Key, value: SearchOptions[Key]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <div className="search-filter-groups">
      <FilterGroup label="搜索位置">
        <SegmentedOption checked={draft.field === 'title'} label="主题标题" onChange={() => set('field', 'title')} />
        <SegmentedOption checked={draft.field === 'body'} label="帖子正文" onChange={() => set('field', 'body')} />
        <SegmentedOption checked={draft.field === 'user'} label="用户" onChange={() => set('field', 'user')} />
      </FilterGroup>

      {draft.field !== 'user' ? (
        <>
          <FilterGroup label="版面">
            <select aria-label="选择版面" onChange={(event) => set('boardId', Number(event.target.value) || null)} value={draft.boardId ?? ''}>
              <option value="">全部版面</option>
              {boards.map((board) => <option key={board.id} value={board.id}>{board.label}</option>)}
            </select>
          </FilterGroup>

          <FilterGroup label="作者">
            <label className="search-filter-input">
              <UserRound size={14} />
              <span className="sr-only">作者用户名</span>
              <input
                maxLength={40}
                onChange={(event) => set('author', event.target.value)}
                placeholder="不限作者"
                value={draft.author}
              />
            </label>
          </FilterGroup>

          <FilterGroup label="时间">
            <div className="search-range-options">
              <SegmentedOption checked={draft.range === 'year'} label="一年内" onChange={() => set('range', 'year')} />
              <SegmentedOption checked={draft.range === 'all'} label="不限" onChange={() => set('range', 'all')} />
              <SegmentedOption checked={draft.range === 'custom'} label="自定义" onChange={() => set('range', 'custom')} />
            </div>
            {draft.range === 'custom' ? (
              <div className="search-date-grid">
                <label><span>从</span><input onChange={(event) => set('startDate', event.target.value)} type="date" value={draft.startDate} /></label>
                <label><span>至</span><input onChange={(event) => set('endDate', event.target.value)} type="date" value={draft.endDate} /></label>
              </div>
            ) : null}
          </FilterGroup>
        </>
      ) : null}
    </div>
  );
}

function FilterGroup({ children, label }: { children: ReactNode; label: string }) {
  return <fieldset className="search-filter-group"><legend>{label}</legend>{children}</fieldset>;
}

function SegmentedOption({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className={`search-segmented-option ${checked ? 'search-segmented-option-active' : ''}`}>
      <input checked={checked} onChange={onChange} type="radio" />
      <span>{label}</span>
    </label>
  );
}

function SearchResultHeader({
  applied,
  count,
  status,
}: {
  applied: SearchOptions;
  count: number;
  status: 'error' | 'idle' | 'loading' | 'ready';
}) {
  const board = boards.find((item) => item.id === applied.boardId)?.label;
  return (
    <header className="search-results-header">
      <div>
        <span className="eyebrow">RESULTS</span>
        <h2>{applied.keyword ? `“${applied.keyword}”` : '等待搜索'}</h2>
      </div>
      <div className="search-result-summary">
        {applied.field !== 'user' && board ? <span>{board}</span> : null}
        {applied.field !== 'user' && applied.author ? <span>{applied.author}</span> : null}
        <strong>{status === 'loading' ? '检索中' : status === 'ready' ? `${count} 条结果` : applied.keyword ? '—' : '输入关键词'}</strong>
      </div>
    </header>
  );
}

function SearchResultRow({
  field,
  keyword,
  result,
}: {
  field: SearchField;
  keyword: string;
  result: SearchResult;
}) {
  if (result.kind === 'user') {
    const href = getPublicProfilePath(result.username);
    return (
      <article className="search-result-row search-user-result-row">
        <a className="search-user-avatar" href={href}>
          <img alt={`${result.username}的头像`} src={result.avatar} />
        </a>
        <div className="search-result-body">
          <div className="search-result-meta">
            <span>{'★'.repeat(result.star) || '用户'}</span>
            {result.registeredAt ? <><span>·</span><time dateTime={result.registeredAt}>注册于 {formatUserDate(result.registeredAt)}</time></> : null}
          </div>
          <h3><a href={href}><HighlightedText keyword={keyword} text={result.username} /></a></h3>
          {result.intro ? <p className="search-user-intro">{result.intro}</p> : null}
          <div className="search-result-footer">
            <span>{result.postCount} 主题</span>
            <span>{result.replyCount} 回复</span>
          </div>
        </div>
      </article>
    );
  }

  const board = boards.find((item) => item.id === result.bid);
  const floorPage = Math.max(1, Math.ceil(result.pid / THREAD_FLOORS_PER_PAGE));
  const href = field === 'body' && result.pid > 1
    ? `/?bid=${result.bid}&tid=${result.tid}&p=${floorPage}#${result.pid}`
    : `/?bid=${result.bid}&tid=${result.tid}&p=1`;

  return (
    <article className="search-result-row">
      <div className="search-result-icon"><FileSearch size={18} /></div>
      <div className="search-result-body">
        <div className="search-result-meta">
          <a href={`/?bid=${result.bid}`}>{board?.label ?? `版面 ${result.bid}`}</a>
          <span>·</span>
          <a href={getPublicProfilePath(result.author)}>{result.author}</a>
          {field === 'body' ? <><span>·</span><em>{result.pid} 楼</em></> : null}
        </div>
        <h3><a href={href}><HighlightedText keyword={keyword} text={result.title} /></a></h3>
        <div className="search-result-footer">
          <span>{field === 'body' ? '正文命中' : '标题命中'}</span>
          <time dateTime={result.timestamp}>{formatSearchTime(result.timestamp)}</time>
        </div>
      </div>
    </article>
  );
}

function HighlightedText({ keyword, text }: { keyword: string; text: string }) {
  const terms = keyword.trim().split(/\s+/).filter(Boolean).sort((left, right) => right.length - left.length);
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');

  return <>{text.split(pattern).map((part, index) => (
    terms.some((term) => term.toLowerCase() === part.toLowerCase())
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>
  ))}</>;
}

function SearchStart({
  field,
  history,
  onSearch,
}: {
  field: SearchField;
  history: string[];
  onSearch: (keyword: string) => void;
}) {
  return (
    <section className="search-state-card search-start-card">
      <div className="search-state-icon"><History size={20} /></div>
      <h3>{history.length ? '继续最近的搜索' : '从一个关键词开始'}</h3>
      <p>{history.length ? '搜索记录只保存在当前浏览器。' : field === 'user' ? '输入用户名查找公开个人主页。' : '可以搜索路线、装备、活动，或某一段旧日讨论。'}</p>
      {history.length ? <div className="search-history-list">{history.map((term) => (
        <button key={term} onClick={() => onSearch(term)} type="button">{term}</button>
      ))}</div> : null}
    </section>
  );
}

function SearchLoading() {
  return (
    <section className="search-state-card">
      <LoaderCircle className="animate-spin" size={22} />
      <h3>正在检索论坛档案</h3>
      <p>较宽的时间范围可能需要多一点时间。</p>
    </section>
  );
}

function SearchError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section className="search-state-card search-error-card">
      <h3>这次搜索没有完成</h3>
      <p>{error}</p>
      <button onClick={onRetry} type="button"><RefreshCw size={14} />重新搜索</button>
    </section>
  );
}

function SearchEmpty({ field, keyword }: { field: SearchField; keyword: string }) {
  return (
    <section className="search-state-card">
      <div className="search-state-icon"><CalendarDays size={20} /></div>
      <h3>没有找到“{keyword}”</h3>
      <p>{field === 'user' ? '请检查用户名是否正确。' : '试试更短的关键词，或放宽版面和时间范围。'}</p>
    </section>
  );
}

function readOptionsFromLocation(): SearchOptions {
  const params = new URLSearchParams(window.location.search);
  const boardId = Number(params.get('board') ?? params.get('bid'));
  const startDate = normalizeDate(params.get('start') ?? params.get('starttime'));
  const endDate = normalizeDate(params.get('end') ?? params.get('endtime'));
  const rangeParam = params.get('range');

  return {
    author: params.get('author')?.trim() ?? '',
    boardId: boards.some((board) => board.id === boardId) ? boardId : null,
    endDate,
    field: params.get('field') === 'user' ? 'user' : params.get('field') === 'body' || params.get('type') === 'post' ? 'body' : 'title',
    keyword: (params.get('q') ?? params.get('keyword') ?? '').trim(),
    range: rangeParam === 'all' || rangeParam === 'custom' ? rangeParam : startDate || endDate ? 'custom' : 'year',
    startDate,
  };
}

function visiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  return Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]))
    .filter((page) => page > 0 && page <= pageCount)
    .sort((left, right) => left - right);
}

function readPageFromLocation() {
  const page = Number(new URLSearchParams(window.location.search).get('page'));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function updateLocation(options: SearchOptions, page: number) {
  window.history.replaceState(null, '', searchHref(options, page));
}

function searchHref(options: SearchOptions, page: number) {
  const params = new URLSearchParams();
  if (options.keyword) params.set('q', options.keyword);
  if (options.field !== 'title') params.set('field', options.field);
  if (options.field !== 'user' && options.boardId) params.set('board', String(options.boardId));
  if (options.field !== 'user' && options.author) params.set('author', options.author);
  if (options.field !== 'user' && options.range !== 'year') params.set('range', options.range);
  if (options.field !== 'user' && options.range === 'custom' && options.startDate) params.set('start', options.startDate);
  if (options.field !== 'user' && options.range === 'custom' && options.endDate) params.set('end', options.endDate);
  if (page > 1) params.set('page', String(page));
  return `/search${params.size ? `?${params.toString()}` : ''}`;
}

function resolveStartDate(options: SearchOptions) {
  if (options.range === 'all') return '2001-01-01';
  if (options.range === 'custom') return options.startDate || '2001-01-01';
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return localDate(date);
}

function resolveEndDate(options: SearchOptions) {
  return options.range === 'custom' && options.endDate ? options.endDate : localDate(new Date());
}

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function formatSearchTime(timestamp: string) {
  if (!timestamp) return '时间未知';
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'Asia/Shanghai' }).format(new Date(timestamp));
}

function formatUserDate(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'Asia/Shanghai' }).format(new Date(timestamp));
}

function readSearchHistory() {
  try {
    const value = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

function storeSearchHistory(keyword: string) {
  const next = [keyword, ...readSearchHistory().filter((item) => item !== keyword)].slice(0, 6);
  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Search remains available when browser storage is disabled.
  }
  return next;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
