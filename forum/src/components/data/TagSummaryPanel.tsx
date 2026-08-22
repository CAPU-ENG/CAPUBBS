import { ArrowDownAZ, Clock3, LoaderCircle, Search, Tags } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import defaultAvatar from '../../assets/bg/bicycle.svg';
import { fetchPublicProfile } from '../../api/profile';
import { readTagDefinitions, readUserTagAssignments, type TagDefinition } from '../../data/tags';
import { TagBadge } from '../tags/TagBadge';
import { getPublicProfilePath } from '../../utils/userRoutes';

type FilterState = 'exclude' | 'include' | 'neutral';
type SortOrder = 'acquiredAt' | 'id';

type TagSummaryMember = {
  acquiredAt: string;
  avatar: string;
  href: string;
  username: string;
};

const MEMBER_ID_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

export function TagSummaryPanel() {
  const [definitions] = useState<TagDefinition[]>(readTagDefinitions);
  const [assignments] = useState(readUserTagAssignments);
  const [filters, setFilters] = useState<Record<string, FilterState>>({});
  const [members, setMembers] = useState<TagSummaryMember[]>([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('acquiredAt');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarCache = useRef(new Map<string, string>());
  const avatarRequestId = useRef(0);

  const sortedMembers = useMemo(
    () => [...members].sort((left, right) => sortOrder === 'id'
      ? MEMBER_ID_COLLATOR.compare(left.username, right.username)
      : compareDates(right.acquiredAt, left.acquiredAt) || MEMBER_ID_COLLATOR.compare(left.username, right.username)),
    [members, sortOrder],
  );

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

  function runQuery() {
    const includedIds = definitions.filter((tag) => filters[tag.id] === 'include').map((tag) => tag.id);
    const excludedIds = definitions.filter((tag) => filters[tag.id] === 'exclude').map((tag) => tag.id);
    const nextMembers = Object.entries(assignments)
      .map(([username, tagValues]) => createMember(username, tagValues, definitions, includedIds, excludedIds))
      .filter((member): member is TagSummaryMember => member !== null);

    setMembers(nextMembers);
    setHasQueried(true);
    setSortOrder('acquiredAt');
    loadAvatars(nextMembers);
  }

  function loadAvatars(nextMembers: TagSummaryMember[]) {
    const requestId = ++avatarRequestId.current;
    const missingMembers = nextMembers.filter((member) => !avatarCache.current.has(member.username));
    if (missingMembers.length === 0) {
      setAvatarLoading(false);
      return;
    }

    setAvatarLoading(true);
    void Promise.all(missingMembers.map(async (member) => {
      try {
        const result = await fetchPublicProfile(member.username);
        const avatar = result.profile.avatarSrc || defaultAvatar;
        avatarCache.current.set(member.username, avatar);
        return [member.username, avatar] as const;
      } catch {
        return [member.username, defaultAvatar] as const;
      }
    })).then((avatars) => {
      if (requestId !== avatarRequestId.current) return;
      const avatarMap = new Map(avatars);
      setMembers((current) => current.map((member) => ({
        ...member,
        avatar: avatarMap.get(member.username) ?? avatarCache.current.get(member.username) ?? member.avatar,
      })));
      setAvatarLoading(false);
    });
  }

  return (
    <section className="data-display-card tag-summary-card">
      <header className="data-display-card-header tag-summary-card-header">
        <span className="data-display-card-icon"><Tags size={17} /></span>
        <h1>标签汇总</h1>
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
                key={tag.id}
                onClick={() => cycleFilter(tag.id)}
                type="button"
              >
                <TagBadge selected={state === 'include'} tag={tag} />
              </button>
            );
          })}
        </div>
        <button className="tag-summary-query-button" onClick={runQuery} type="button"><Search size={15} />开始查询</button>
      </div>
      {hasQueried && (
        <>
          <div className="tag-summary-sort-bar">
            <button aria-pressed={sortOrder === 'acquiredAt'} className={sortOrder === 'acquiredAt' ? 'tag-summary-sort-active' : ''} onClick={() => setSortOrder('acquiredAt')} type="button"><Clock3 size={14} />获取时间</button>
            <button aria-pressed={sortOrder === 'id'} className={sortOrder === 'id' ? 'tag-summary-sort-active' : ''} onClick={() => setSortOrder('id')} type="button"><ArrowDownAZ size={14} />ID</button>
            {avatarLoading && <LoaderCircle aria-label="正在加载头像" className="tag-summary-avatar-loading animate-spin" size={15} />}
          </div>
          <div className="tag-summary-member-grid">
            {sortedMembers.map((member) => (
              <article className="tag-summary-member-card" key={member.username}>
                <a className="tag-summary-member-avatar" href={member.href}>
                  <img alt={`${member.username}的头像`} src={member.avatar} />
                </a>
                <div>
                  <a className="tag-summary-member-id" href={member.href}>{member.username}</a>
                  <time dateTime={member.acquiredAt}>{formatDate(member.acquiredAt)}</time>
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

function createMember(
  username: string,
  tagValues: Record<string, string>,
  definitions: TagDefinition[],
  includedIds: string[],
  excludedIds: string[],
) {
  if (includedIds.some((id) => !tagValues[id]) || excludedIds.some((id) => tagValues[id])) return null;

  const relevantIds = includedIds.length > 0
    ? includedIds
    : definitions.map((tag) => tag.id).filter((id) => Boolean(tagValues[id]) && !excludedIds.includes(id));
  if (relevantIds.length === 0) return null;

  return {
    acquiredAt: getLatestDate(relevantIds.map((id) => tagValues[id])),
    avatar: defaultAvatar,
    href: getPublicProfilePath(username),
    username,
  } satisfies TagSummaryMember;
}

function getLatestDate(values: string[]) {
  return values.reduce((latest, value) => compareDates(value, latest) > 0 ? value : latest, '');
}

function compareDates(left: string, right: string) {
  const difference = Date.parse(left) - Date.parse(right);
  if (Number.isFinite(difference)) return difference;
  return left.localeCompare(right);
}

function formatDate(value: string) {
  if (!value) return '未记录日期';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未记录日期';
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
