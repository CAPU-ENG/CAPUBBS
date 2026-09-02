import type { FloorDecorationPaths } from './floorDecoration';
import type { UserMedal } from './medals';
import type { UserTag } from './tags';

export type ProfileTab = 'posts' | 'replies' | 'activities' | 'bookmarks' | 'drafts' | 'signatures';

export type ProfileDetailKey = 'hobby' | 'qq' | 'email' | 'location';

export type ProfileDetail = {
  key: ProfileDetailKey;
  label: string;
  value: string;
};

export type ProfileStat = {
  label: string;
  value: string | number;
};

export type ProfileRecord = {
  author?: string;
  board: string;
  contentMode?: 'html' | 'markdown' | 'rich';
  date: string;
  draftHref?: string;
  excerpt: string;
  href: string;
  id: string;
  metrics?: Array<{ label: string; value: number }>;
  status?: string;
  title: string;
};

export type ProfileRecordMap = Record<ProfileTab, ProfileRecord[]>;

export type ProfileViewData = {
  avatarSrc: string;
  counts: Partial<Record<ProfileTab, number>>;
  details: ProfileDetail[];
  emailVerified: boolean;
  emailVisible: boolean;
  floorDecoration?: FloorDecorationPaths;
  id: string;
  intro: string;
  recordHasMore: Partial<Record<ProfileTab, boolean>>;
  medals?: UserMedal[];
  rating: number;
  starPostReplyCount: number;
  records: ProfileRecordMap;
  slug: string;
  stats: ProfileStat[];
  tags?: UserTag[];
};

export const profileTabs: Array<{ key: ProfileTab; label: string }> = [
  { key: 'posts', label: '发帖' },
  { key: 'replies', label: '回复' },
  { key: 'activities', label: '报名' },
  { key: 'bookmarks', label: '收藏' },
  { key: 'drafts', label: '草稿箱' },
  { key: 'signatures', label: '签名档' },
];
