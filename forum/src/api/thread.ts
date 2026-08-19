import defaultAvatar from '../assets/avatar/default-avatar.avif';
import type { NestedReply, ThreadAuthor, ThreadFloorData } from '../data/threadDemo';

const THREAD_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const PUBLIC_ASSET_ORIGIN = 'https://chexie.net';

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export type ThreadDetail = {
  authorName: string;
  authorOnly: boolean;
  bid: number;
  board: string;
  boardHref: string;
  bookmarked: boolean;
  canReply: boolean;
  currentPage: number;
  floors: ThreadFloorData[];
  id: string;
  locked: boolean;
  pageCount: number;
  replies: number;
  tid: number;
  title: string;
  totalFloors: number;
  viewer: ThreadAuthor | null;
  viewerSignatures: string[];
  views: number;
};

export class ThreadApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThreadApiError';
  }
}

export async function fetchThreadDetail({
  authorOnly,
  bid,
  page,
  signal,
  tid,
}: {
  authorOnly: boolean;
  bid: number;
  page: number;
  signal?: AbortSignal;
  tid: number;
}) {
  const body = new URLSearchParams({
    ask: 'thread_detail',
    authorOnly: authorOnly ? '1' : '0',
    bid: String(bid),
    page: String(page),
    render: 'both',
    tid: String(tid),
  });

  let response: Response;
  try {
    response = await fetch(THREAD_API_URL, {
      body,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ThreadApiError('暂时无法连接论坛服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new ThreadApiError('论坛服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new ThreadApiError(payload.message?.trim() || '帖子加载失败，请稍后重试。');
  }

  return mapThreadDetail(payload.data, { authorOnly, bid, page, tid });
}

function mapThreadDetail(
  value: unknown,
  request: { authorOnly: boolean; bid: number; page: number; tid: number },
): ThreadDetail {
  const data = asRow(value);
  const board = asRow(data.board);
  const thread = asRow(data.thread);
  const floorsPage = asRow(data.floorsPage);
  const viewerState = asRow(data.viewerState);
  const mainPost = asRow(data.mainPost);

  const title = plainText(thread.title);
  const boardTitle = plainText(board.title) || plainText(board.name);
  if (!title || Object.keys(mainPost).length === 0) {
    throw new ThreadApiError('帖子数据不完整，暂时无法展示。');
  }

  const viewerRow = nullableRow(data.viewer);
  const viewerName = viewerRow ? plainText(viewerRow.username) : '';
  const currentPage = positiveInteger(floorsPage.page, request.page);
  const replyFloors = asRows(floorsPage.items)
    .filter((floor) => positiveInteger(floor.pid, 0) !== 1)
    .map((floor) => mapFloor(floor, viewerName));
  const floors = currentPage === 1
    ? [mapFloor(mainPost, viewerName), ...replyFloors]
    : replyFloors;

  return {
    authorName: plainText(thread.author),
    authorOnly: Boolean(floorsPage.authorOnly ?? request.authorOnly),
    bid: positiveInteger(thread.bid, request.bid),
    board: boardTitle || `版块 ${request.bid}`,
    boardHref: `/?bid=${positiveInteger(thread.bid, request.bid)}`,
    bookmarked: Boolean(viewerState.bookmarked),
    canReply: Boolean(viewerState.canReply),
    currentPage,
    floors,
    id: plainText(thread.id) || `${request.bid}-${request.tid}`,
    locked: Boolean(thread.locked),
    pageCount: positiveInteger(floorsPage.pages, 1),
    replies: nonNegativeInteger(thread.replies),
    tid: positiveInteger(thread.tid, request.tid),
    title,
    totalFloors: positiveInteger(floorsPage.total, floors.length),
    viewer: viewerRow ? mapAuthor(viewerRow, viewerName) : null,
    viewerSignatures: viewerRow ? mapViewerSignatures(viewerRow.signatures) : [],
    views: nonNegativeInteger(thread.views),
  };
}

function mapFloor(row: ApiRow, viewerName: string): ThreadFloorData {
  const bid = positiveInteger(row.bid, 0);
  const tid = positiveInteger(row.tid, 0);
  const floor = positiveInteger(row.pid, 1);
  const profile = nullableRow(row.authorProfile);
  const authorName = plainText(row.author) || '匿名用户';
  const contentHtml = sanitizeForumHtml(stringValue(row.contentHtml));
  const signatureHtml = sanitizeForumHtml(stringValue(row.signatureHtml));
  const rawText = stringValue(row.rawText);
  const quoteText = plainTextFromHtml(rawText || contentHtml);
  const canEdit = Boolean(row.canEdit);
  const canDelete = Boolean(row.canDelete);

  return {
    author: mapAuthor(profile ?? { username: authorName, avatar: row.authorAvatar, star: row.authorStar }, authorName),
    canDelete,
    canEdit,
    contentHtml,
    editedAt: timestampChanged(row.createdAt, row.updatedAt) ? stringValue(row.updatedAt) : undefined,
    floor,
    id: `${bid}-${tid}-${floor}`,
    isOwn: Boolean(viewerName && authorName === viewerName),
    nestedReplies: asRows(row.nestedReplies).map(mapNestedReply),
    paragraphs: [quoteText || '此楼层暂无可显示的正文。'],
    publishedAt: stringValue(row.createdAt),
    quoteText,
    signature: plainTextFromHtml(signatureHtml),
    signatureHtml,
  };
}

function mapNestedReply(row: ApiRow): NestedReply {
  const authorName = plainText(row.author) || '匿名用户';
  const contentHtml = sanitizeForumHtml(stringValue(row.contentHtml));

  return {
    author: mapAuthor({ username: authorName, avatar: row.authorAvatar }, authorName),
    content: plainTextFromHtml(contentHtml || stringValue(row.content)),
    contentHtml,
    id: String(row.id ?? `${authorName}-${row.createdAt ?? ''}`),
    publishedAt: stringValue(row.createdAt),
  };
}

function mapAuthor(row: ApiRow, fallbackName: string): ThreadAuthor {
  const stats = asRow(row.stats);
  return {
    avatar: normalizeAssetUrl(row.avatar ?? row.icon) || defaultAvatar,
    checkins: nonNegativeInteger(stats.checkins),
    lastSeen: plainText(row.lastSeenAt) || '时间未知',
    name: plainText(row.username) || fallbackName || '匿名用户',
    replies: nonNegativeInteger(stats.replies),
    role: '',
    stars: nonNegativeInteger(row.star),
    topics: nonNegativeInteger(stats.posts),
  };
}

function mapViewerSignatures(value: unknown) {
  const signatures = asRow(value);
  return ['1', '2', '3'].map((key) => plainTextFromHtml(sanitizeForumHtml(stringValue(signatures[key]))));
}

function sanitizeForumHtml(value: string) {
  if (!value.trim()) return '';

  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');
  const blockedTags = new Set(['BUTTON', 'EMBED', 'FORM', 'IFRAME', 'INPUT', 'META', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG']);
  const allowedTags = new Set([
    'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'LI', 'OL',
    'P', 'PRE', 'S', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY',
    'TD', 'TH', 'THEAD', 'TR', 'U', 'UL',
  ]);
  const elements = Array.from(document.body.querySelectorAll('*'));

  elements.forEach((element) => {
    if (blockedTags.has(element.tagName)) {
      element.remove();
      return;
    }
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const allowed = name === 'class'
        || name === 'title'
        || (element.tagName === 'A' && ['href', 'target'].includes(name))
        || (element.tagName === 'IMG' && ['alt', 'height', 'src', 'width'].includes(name))
        || (['TD', 'TH'].includes(element.tagName) && ['colspan', 'rowspan'].includes(name));
      if (!allowed) element.removeAttribute(attribute.name);
    });

    if (element instanceof HTMLAnchorElement) {
      const href = safeLinkUrl(element.getAttribute('href') ?? '');
      if (href) element.setAttribute('href', href);
      else element.removeAttribute('href');
      element.setAttribute('rel', 'noopener noreferrer');
    }
    if (element instanceof HTMLImageElement) {
      const src = normalizeAssetUrl(element.getAttribute('src'));
      if (src) element.setAttribute('src', src);
      else element.remove();
    }
  });

  return document.body.innerHTML;
}

function normalizeAssetUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  const path = value.trim();
  if (!path) return '';
  if (/^data:image\/(?:avif|gif|jpeg|png|webp);/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('//')) return `https:${path}`;
  if (path.startsWith('/')) return `${PUBLIC_ASSET_ORIGIN}${path}`;
  if (/^\d+$/.test(path)) return `${PUBLIC_ASSET_ORIGIN}/bbsimg/i/${path}.gif`;
  return `${PUBLIC_ASSET_ORIGIN}/${path.replace(/^\.?\//, '')}`;
}

function safeLinkUrl(value: string) {
  const href = value.trim();
  if (!href) return '';
  if (/^(?:https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) return href;
  return '';
}

function plainTextFromHtml(value: string) {
  if (!value.trim()) return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function plainText(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return plainTextFromHtml(String(value));
}

function timestampChanged(createdAt: unknown, updatedAt: unknown) {
  const created = stringValue(createdAt);
  const updated = stringValue(updatedAt);
  return Boolean(updated && updated !== created);
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function nonNegativeInteger(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function positiveInteger(value: unknown, fallback: number) {
  const number = nonNegativeInteger(value);
  return number > 0 ? number : fallback;
}

function asRow(value: unknown): ApiRow {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRow : {};
}

function nullableRow(value: unknown) {
  const row = asRow(value);
  return Object.keys(row).length > 0 ? row : null;
}

function asRows(value: unknown) {
  return Array.isArray(value) ? value.map(asRow).filter((row) => Object.keys(row).length > 0) : [];
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
