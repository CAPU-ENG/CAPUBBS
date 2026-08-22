import type { UserTag } from '../../data/tags';
import type { CSSProperties } from 'react';

export function TagBadge({ tag, size = 'normal' }: { tag: UserTag; size?: 'compact' | 'normal' }) {
  return (
    <span
      className={`user-tag user-tag-${size}`}
      style={{ '--user-tag-color': tag.color } as CSSProperties}
    >
      {tag.name}
    </span>
  );
}

export function TagList({ tags, size = 'normal' }: { tags: UserTag[]; size?: 'compact' | 'normal' }) {
  if (tags.length === 0) return null;
  return (
    <div className="user-tag-list" aria-label="会员标签">
      {tags.map((tag) => <TagBadge key={tag.id} size={size} tag={tag} />)}
    </div>
  );
}
