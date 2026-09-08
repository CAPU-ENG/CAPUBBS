import type {
  DirectChatMessage,
  DirectConversation,
  ForumMessage,
  ForumSystemEvent,
  MessageSummary,
} from '../types/messages';
import { USER_CENTER_PATH } from '../utils/userRoutes';

const MESSAGE_API_URL = import.meta.env.VITE_API_URL?.trim() || '/api/api.php';
const SYSTEM_PAGE_SIZE = 10;

type ApiEnvelope = {
  code: number;
  data?: unknown;
  message?: string;
};

type ApiRow = Record<string, unknown>;

export class MessageApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageApiError';
  }
}

export async function fetchUnreadMessageCounts(signal?: AbortSignal) {
  return (await requestMessages({ type: 'count' }, signal)).unread;
}

export async function fetchMessageSummary(signal?: AbortSignal): Promise<MessageSummary> {
  const [privateData, systemData] = await Promise.all([
    requestMessages({ type: 'private' }, signal),
    requestMessages({ p: 1, type: 'system' }, signal),
  ]);
  const conversations = privateData.rows.map(mapConversation).filter(isConversation);
  return {
    conversations,
    hasMoreReplies: systemData.rows.length >= SYSTEM_PAGE_SIZE,
    messages: [...systemData.rows.map(mapSystemMessage), ...conversations.map(mapConversationMessage)],
    replyPage: 1,
    unread: systemData.unread,
  };
}

export async function fetchMoreReplyMessages(page: number, signal?: AbortSignal) {
  const normalizedPage = Math.max(1, Math.floor(page));
  const data = await requestMessages({ p: normalizedPage, type: 'system' }, signal);
  return {
    hasMore: data.rows.length >= SYSTEM_PAGE_SIZE,
    messages: data.rows.map(mapSystemMessage),
    page: normalizedPage,
    unread: data.unread,
  };
}

export async function markMessagesRead(target: { messageId: string } | { category: string }) {
  const params: Record<string, string | number> = 'messageId' in target
    ? { message_id: target.messageId.replace(/^system-/, '') }
    : { category: target.category };
  return (await requestMessages({ type: 'read', ...params }, undefined, true)).unread;
}

export async function fetchDirectConversation(conversationId: string, signal?: AbortSignal) {
  const user = getConversationUser(conversationId);
  if (!user) throw new MessageApiError('请选择私信对象。');
  const data = await requestMessages({ to: user, type: 'chat' }, signal);
  const messages = data.rows.map((row, index) => mapChatMessage(row, conversationId, index));
  return { conversation: buildLoadedConversation(user, messages), unread: data.unread };
}

export async function sendDirectMessage(conversationId: string, text: string) {
  const user = getConversationUser(conversationId);
  const normalizedText = text.trim();
  if (!user) throw new MessageApiError('请选择私信对象。');
  if (!normalizedText) throw new MessageApiError('私信内容不能为空。');

  await requestData({ ask: 'sendmsg', text: normalizedText, to: user });
  return fetchDirectConversation(conversationId);
}

export function isMessageAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function mapConversation(row: ApiRow): DirectConversation | null {
  const user = stringValue(row.username);
  if (!user) return null;

  return {
    id: encodeURIComponent(user),
    lastMessage: decodeHtml(stringValue(row.text)),
    lastTime: formatTimestamp(row.time).dateTime,
    messages: [],
    messagesLoaded: false,
    total: toNumber(row.totalnum),
    unread: toNumber(row.number),
    user,
  };
}

function isConversation(value: DirectConversation | null): value is DirectConversation {
  return value !== null;
}

function mapConversationMessage(conversation: DirectConversation): ForumMessage {
  return {
    category: 'direct',
    conversationId: conversation.id,
    excerpt: conversation.lastMessage || '打开对话查看私信记录',
    group: conversation.lastTime ? '私信' : '更早',
    href: `#message-${conversation.id}`,
    id: `direct-${conversation.id}`,
    sender: conversation.user,
    time: conversation.lastTime,
    title: conversation.user,
    unread: conversation.unread > 0,
  };
}

function mapSystemMessage(row: ApiRow): ForumMessage {
  const sender = stringValue(row.username) || '系统';
  const type = stringValue(row.type);
  const subject = decodeHtml(stringValue(row.title));
  const grantEvent = parseGrantEvent(subject);
  const formattedTime = formatTimestamp(row.time);

  return {
    category: 'replies',
    context: grantEvent ? undefined : subject,
    excerpt: getSystemMessageExcerpt(type, sender, subject),
    group: formattedTime.date || '更早',
    href: grantEvent ? USER_CENTER_PATH : normalizeThreadHref(stringValue(row.url)),
    id: `system-${stringValue(row.id)}`,
    sender,
    systemEvent: grantEvent ?? undefined,
    time: formattedTime.time,
    title: grantEvent
      ? grantEvent.kind === 'tag-granted' ? '为你添加了标签' : '为你发放了勋章'
      : getSystemMessageAction(type),
    unread: stringValue(row.hasread) === '0',
  };
}

function parseGrantEvent(subject: string): ForumSystemEvent | null {
  const tagMatch = subject.match(/^为你添加了“(.+)”标签，可前往个人中心查看。$/u);
  const tagName = tagMatch?.[1]?.trim();
  if (tagName) return { kind: 'tag-granted', tagName };

  const medalMatch = subject.match(/^(?:为你发放了|你获得了)“(.+)”勋章，可前往个人中心查看。$/u);
  const medalName = medalMatch?.[1]?.trim();
  return medalName ? { kind: 'medal-granted', medalName } : null;
}

function mapChatMessage(row: ApiRow, conversationId: string, index: number): DirectChatMessage {
  const formattedTime = formatTimestamp(row.time);

  return {
    author: stringValue(row.type) === 'send' ? 'me' : 'them',
    date: formattedTime.date,
    id: `${conversationId}-${stringValue(row.time) || 'message'}-${index}`,
    text: decodeHtml(stringValue(row.text)),
    time: formattedTime.time,
  };
}

function buildLoadedConversation(user: string, messages: DirectChatMessage[]): DirectConversation {
  const lastMessage = messages[messages.length - 1];

  return {
    id: encodeURIComponent(user),
    lastMessage: lastMessage?.text ?? '',
    lastTime: [lastMessage?.date, lastMessage?.time].filter(Boolean).join(' '),
    messages,
    messagesLoaded: true,
    total: messages.length,
    unread: 0,
    user,
  };
}

function getSystemMessageAction(type: string) {
  switch (type) {
    case 'at':
    case 'reply':
      return '回复了你的帖子';
    case 'quote':
      return '引用了你的文章';
    case 'replylzl':
      return '评论了你的回复';
    case 'replylzlreply':
      return '评论了你的楼中楼';
    default:
      return '发来系统消息';
  }
}

function getSystemMessageExcerpt(type: string, sender: string, subject: string) {
  const context = subject ? `：${subject}` : '';
  switch (type) {
    case 'at':
    case 'reply':
      return `${sender} 回复了你的帖子${context}`;
    case 'quote':
      return `${sender} 在帖子中引用了你的文章${context}`;
    case 'replylzl':
      return `${sender} 评论了你在帖子中的回复${context}`;
    case 'replylzlreply':
      return `${sender} 评论了你的楼中楼${context}`;
    default:
      return subject || `${sender} 发来系统消息`;
  }
}

function normalizeThreadHref(value: string) {
  if (!value) return '#';

  try {
    const url = new URL(value.replace(/&amp;/gi, '&'), window.location.origin);
    const bid = toNumber(url.searchParams.get('bid'));
    const tid = toNumber(url.searchParams.get('tid'));
    if (!bid || !tid) return value;

    const params = new URLSearchParams({ bid: String(bid), tid: String(tid) });
    const page = toNumber(url.searchParams.get('p'));
    if (page > 1) params.set('p', String(page));
    const floor = toNumber(url.hash.replace(/^#/, ''));
    return `/?${params.toString()}${floor ? `#${floor}` : ''}`;
  } catch {
    return value;
  }
}

function formatTimestamp(value: unknown) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return { date: '', dateTime: '', time: '' };

  const date = new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
  const today = new Date();
  const dateLabel = date.getFullYear() === today.getFullYear()
    ? `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return { date: dateLabel, dateTime: `${dateLabel} ${time}`, time };
}

async function requestMessages(params: Record<string, string | number>, signal?: AbortSignal, keepalive = false) {
  const data = await requestData({ ask: 'msg', mode: 'forum', ...params }, signal, keepalive);
  if (!isRow(data) || !Array.isArray(data.rows) || !isRow(data.unread)) {
    throw new MessageApiError('消息服务返回了无法识别的数据。');
  }
  const counts = data.unread;
  if (!['direct', 'replies', 'total'].every((key) => typeof counts[key] === 'number'
    && Number.isInteger(counts[key]) && Number(counts[key]) >= 0)
    || Number(counts.total) !== Number(counts.replies) + Number(counts.direct)) {
    throw new MessageApiError('消息服务返回了无法识别的数据。');
  }
  const replies = toNumber(counts.replies);
  const direct = toNumber(counts.direct);
  return { rows: data.rows.filter(isRow), unread: { replies, direct, total: replies + direct } };
}

async function requestData(params: Record<string, string | number>, signal?: AbortSignal, keepalive = false) {
  let response: Response;
  try {
    response = await fetch(MESSAGE_API_URL, {
      body: new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)])),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      method: 'POST',
      keepalive,
      signal,
    });
  } catch (error) {
    if (isMessageAbortError(error)) throw error;
    throw new MessageApiError('暂时无法连接消息服务，请稍后重试。');
  }

  let payload: ApiEnvelope;
  try {
    payload = await response.json() as ApiEnvelope;
  } catch {
    throw new MessageApiError('消息服务返回了无法识别的数据。');
  }

  if (!response.ok || payload.code !== 0) {
    throw new MessageApiError(payload.message?.trim() || '消息请求失败，请稍后重试。');
  }

  return payload.data;
}

function getConversationUser(conversationId: string) {
  try {
    return decodeURIComponent(conversationId).trim();
  } catch {
    return conversationId.trim();
  }
}

function decodeHtml(value: string) {
  if (!value || typeof document === 'undefined') return value;
  const parser = new DOMParser();
  return parser.parseFromString(value, 'text/html').documentElement.textContent?.trim() ?? value;
}

function isRow(value: unknown): value is ApiRow {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}
