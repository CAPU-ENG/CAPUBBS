import type { UserTag } from '../../data/tags';
import type { CSSProperties } from 'react';

type TagSize = 'compact' | 'micro' | 'normal';

export function TagBadge({ selected = false, tag, size = 'normal' }: { selected?: boolean; tag: UserTag; size?: TagSize }) {
  const selectedTextColor = getTagContrastColor(tag.color);
  return (
    <span
      className={`user-tag user-tag-${size}${selected ? ' user-tag-selected' : ''}`}
      style={{ '--user-tag-color': tag.color, '--user-tag-selected-text': selectedTextColor } as CSSProperties}
      title={tag.name}
    >
      {tag.name}
    </span>
  );
}

export function TagList({ selectedTagIds = [], tags, size = 'normal' }: { selectedTagIds?: string[]; tags: UserTag[]; size?: TagSize }) {
  if (tags.length === 0) return null;
  return (
    <div className="user-tag-list" aria-label="会员标签">
      {tags.map((tag) => <TagBadge key={tag.id} selected={selectedTagIds.includes(tag.id)} size={size} tag={tag} />)}
    </div>
  );
}

export function DisplayedTagList({ overflowCount = 0, tags }: { overflowCount?: number; tags: UserTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="user-displayed-tag-list" aria-label="佩戴标签">
      {tags.map((tag) => <TagBadge key={tag.id} size="micro" tag={tag} />)}
      {overflowCount > 0 ? <span className="user-tag-overflow">+{overflowCount}</span> : null}
    </div>
  );
}

function getTagContrastColor(color: string) {
  const match = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (!match) return '#fff';
  const hex = match[1].length === 3
    ? match[1].split('').map((part) => part + part).join('')
    : match[1];
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = channels.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.48 ? '#101713' : '#fff';
}
