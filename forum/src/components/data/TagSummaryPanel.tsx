import { ArrowDownAZ, CircleHelp, Clock3, Search, Tags } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchTagDefinitions,
  fetchTagSummary,
  TagsApiError,
  type TagMember,
} from '../../api/tags';
import type { TagDefinition } from '../../data/tags';
import { TagBadge } from '../tags/TagBadge';

type FilterState = 'exclude' | 'include' | 'neutral';
type SortOrder = 'acquiredAt' | 'id';
type LoadStatus = 'error' | 'loading' | 'ready';

type TagSummaryMember = TagMember;

const MEMBER_ID_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

export function TagSummaryPanel() {
  const [definitions, setDefinitions] = useState<TagDefinition[]>([]);
  const [definitionsStatus, setDefinitionsStatus] = useState<LoadStatus>('loading');
  const [filters, setFilters] = useState<Record<string, FilterState>>({});
  const [members, setMembers] = useState<TagSummaryMember[]>([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [queryStatus, setQueryStatus] = useState<LoadStatus>('ready');
  const [queryError, setQueryError] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('acquiredAt');

  const sortedMembers = useMemo(
    () => [...members].sort((left, right) => sortOrder === 'id'
      ? MEMBER_ID_COLLATOR.compare(left.username, right.username)
      : right.addedAt - left.addedAt || MEMBER_ID_COLLATOR.compare(left.username, right.username)),
    [members, sortOrder],
  );

  useEffect(() => {
    const controller = new AbortController();
    setDefinitionsStatus('loading');
    void fetchTagDefinitions(controller.signal).then(
      (items) => {
        setDefinitions(items);
        setDefinitionsStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setDefinitionsStatus('error');
      },
    );
    return () => controller.abort();
  }, []);

  function cycleFilter(tagId: string) {
    setFilters((current) => {
      const state = current[tagId] ?? 'neutral';
      const nextState: FilterState = state === 'neutral' ? 'include' : state === 'include' ? 'exclude' : 'neutral';
      if (nextState === 'neutral') {
        const next = { ...current };
        delete next[tagId];
        return next;
      }
      return { ...current, [tagId]: nextState };
    });
  }

  async function runQuery() {
    if (queryStatus === 'loading' || definitionsStatus !== 'ready') return;
    const includedIds = definitions.filter((tag) => filters[tag.id] === 'include').map((tag) => tag.id);
    const excludedIds = definitions.filter((tag) => filters[tag.id] === 'exclude').map((tag) => tag.id);
    setQueryStatus('loading');
    setQueryError('');
    try {
      setMembers(await fetchTagSummary(includedIds, excludedIds));
      setHasQueried(true);
      setSortOrder('acquiredAt');
      setQueryStatus('ready');
    } catch (error) {
      if (isAbortError(error)) return;
      setQueryStatus('error');
      setQueryError(errorMessage(error, '标签汇总查询失败，请稍后重试'));
    }
  }

  return (
    <section className="data-display-card tag-summary-card">
      <header className="data-display-card-header tag-summary-card-header">
        <span className="data-display-card-icon"><Tags size={17} /></span>
        <h1>标签汇总</h1>
        <span className="tag-summary-help">
          <button aria-describedby="tag-summary-help-tooltip" aria-label="标签筛选说明" type="button"><CircleHelp size={15} /></button>
          <span className="tag-summary-help-tooltip" id="tag-summary-help-tooltip" role="tooltip">
            <span>点击一次：筛选该标签</span>
            <span>点击两次：排除该标签</span>
            <span>点击三次：恢复默认</span>
            <span>支持组合筛选查询</span>
          </span>
        </span>
        {hasQueried && <span className="data-display-card-count">{members.length} 位会员</span>}
      </header>
      <div className="tag-summary-filter-area">
        <div className="tag-summary-filter-list">
          {definitions.map((tag) => {
            const state = filters[tag.id] ?? 'neutral';
            return (
              <button
                aria-label={`${tag.name}${state === 'include' ? '已选中' : state === 'exclude' ? '已排除' : '未筛选'}`}
                className="tag-summary-filter"
                data-filter-state={state}
                disabled={definitionsStatus !== 'ready'}
                key={tag.id}
                onClick={() => cycleFilter(tag.id)}
                type="button"
              >
                <TagBadge selected={state === 'include'} tag={tag} />
              </button>
            );
          })}
          {definitions.length === 0 && <span className="tag-summary-empty">{definitionsStatus === 'loading' ? '正在加载标签' : definitionsStatus === 'error' ? '标签加载失败' : '暂无标签'}</span>}
        </div>
        <button className="tag-summary-query-button" disabled={definitionsStatus !== 'ready' || queryStatus === 'loading'} onClick={runQuery} type="button"><Search size={15} />{queryStatus === 'loading' ? '查询中' : '开始查询'}</button>
      </div>
      {queryStatus === 'error' && <p className="tag-summary-empty">{queryError}</p>}
      {hasQueried && queryStatus !== 'error' && (
        <>
          <div className="tag-summary-sort-bar">
            <button aria-pressed={sortOrder === 'acquiredAt'} className={sortOrder === 'acquiredAt' ? 'tag-summary-sort-active' : ''} onClick={() => setSortOrder('acquiredAt')} type="button"><Clock3 size={14} />获取时间</button>
            <button aria-pressed={sortOrder === 'id'} className={sortOrder === 'id' ? 'tag-summary-sort-active' : ''} onClick={() => setSortOrder('id')} type="button"><ArrowDownAZ size={14} />ID</button>
          </div>
          <div className="tag-summary-member-grid">
            {sortedMembers.map((member) => (
              <article className="tag-summary-member-card" key={member.username}>
                <a className="tag-summary-member-avatar" href={member.href}>
                  <img alt={`${member.username}的头像`} src={member.avatar} />
                </a>
                <div>
                  <a className="tag-summary-member-id" href={member.href}>{member.username}</a>
                  <time dateTime={toIsoDate(member.addedAt)}>{formatDate(member.addedAt)}</time>
                </div>
              </article>
            ))}
            {sortedMembers.length === 0 && <p className="tag-summary-empty">没有符合条件的会员</p>}
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(value: number) {
  if (!value) return '未记录日期';
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return '未记录日期';
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function toIsoDate(value: number) {
  return value > 0 ? new Date(value * 1000).toISOString() : '';
}

function errorMessage(error: unknown, fallback: string) {
  const message = error instanceof TagsApiError ? error.message : error instanceof Error ? error.message : fallback;
  return message.replace(/[。.]$/, '');
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
