import type { FloorDecorationPaths } from './floorDecoration';
import type { UserMedal } from './medals';
import type { UserTag } from './tags';
import type { SafeForumHtml } from '../utils/forumMarkup';

export type ThreadAuthor = {
  name: string;
  role: string;
  stars: number;
  topics: number;
  replies: number;
  checkins: number;
  lastSeen: string;
  avatar: string;
  floorDecoration?: FloorDecorationPaths;
  medals?: UserMedal[];
  tags?: UserTag[];
};

export type NestedReply = {
  id: string;
  author: ThreadAuthor;
  canDelete?: boolean;
  publishedAt: string;
  content: string;
  contentHtml?: SafeForumHtml;
  target?: string;
};

export type ThreadAttachment = {
  id: string;
  name: string;
  size: number;
  downloadHref?: string;
  downloadCount?: number;
  exists?: boolean;
  price?: number;
  auth?: number;
};

// Real answers to 个人可见 signup questions, returned only to the signup's owner
// and the activity leader. The post text itself keeps the masked value.
export type ThreadPrivateAnswer = {
  label: string;
  optionId: string;
  value: string;
};

export type ThreadFloorData = {
  id: string;
  fid: number;
  floor: number;
  author: ThreadAuthor;
  publishedAt: string;
  editedAt?: string;
  paragraphs: string[];
  signature?: string;
  signatureIndex?: number;
  contentHtml?: string;
  quoteText?: string;
  signatureHtml?: string;
  attachments?: ThreadAttachment[];
  nestedReplies?: NestedReply[];
  isOwn?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  privateAnswers?: ThreadPrivateAnswer[];
};
