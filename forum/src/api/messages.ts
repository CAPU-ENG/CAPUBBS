import type {
  DirectChatMessage,
  DirectConversation,
  ForumMessage,
  MessageSummary,
} from '../types/messages';

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

export async function fetchMessageSummary(signal?: AbortSignal): Promise<MessageSummary> {
  const [privateRows, systemRows] = await Promise.all([
    requestRows({ ask: 'msg', shrink: 'no', type: 'private' }, signal),
    requestRows({ ask: 'msg', p: 1, type: 'system' }, signal),
  ]);
  const conversations = privateRows.map(mapConversation).filter(isConversation);
  const replyMessages = systemRows.map((row, index) => mapSystemMessage(row, index, 1));
  const directMessages = conversations.map(mapConversationMessage);

  return buildSummary(conversations, [...replyMessages, ...directMessages], 1, systemRows.length);
}

export async function fetchMoreReplyMessages(page: number, signal?: AbortSignal) {
  const normalizedPage = Math.max(1, Math.floor(page));
  const rows = await requestRows({ ask: 'msg', p: normalizedPage, type: 'system' }, signal);

  return {
    hasMore: rows.length >= SYSTEM_PAGE_SIZE,
    messages: rows.map((row, index) => mapSystemMessage(row, index, normalizedPage)),
    page: normalizedPage,
  };
}

export async function fetchDirectConversation(conversationId: string, signal?: AbortSignal) {
  const user = getConversationUser(conversationId);
  if (!user) throw new MessageApiError('请选择私信对象。');

  const rows = await requestRows({ ask: 'msg', shrink: 'no', to: user, type: 'chat' }, signal);
  const messages = rows.map((row, index) => mapChatMessage(row, conversationId, index));

  return buildLoadedConversation(user, messages);
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

function buildSummary(
  conversations: DirectConversation[],
  messages: ForumMessage[],
  replyPage: number,
  replyRowCount: number,
): MessageSummary {
  const replies = messages.filter((message) => message.category === 'replies' && message.unread).length;
  const direct = conversations.reduce((total, conversation) => total + conversation.unread, 0);

  return {
    conversations,
    hasMoreReplies: replyRowCount >= SYSTEM_PAGE_SIZE,
    messages,
    replyPage,
    unread: { direct, replies, total: direct + replies },
  };
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

function mapSystemMessage(row: ApiRow, index: number, page: number): ForumMessage {
  const sender = stringValue(row.username) || '系统';
  const type = stringValue(row.type);
  const subject = decodeHtml(stringValue(row.title));
  const formattedTime = formatTimestamp(row.time);

  return {
    category: 'replies',
    context: subject,
    excerpt: getSystemMessageExcerpt(type, sender, subject),
    group: formattedTime.date || '更早',
    href: normalizeThreadHref(stringValue(row.url)),
    id: `system-${type || 'message'}-${stringValue(row.time) || 'unknown'}-${page}-${index}`,
    sender,
    time: formattedTime.time,
    title: getSystemMessageAction(type),
    unread: stringValue(row.hasread) === '0',
  };
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
    return `/?${params.toString()}${floor ? `#floor-${floor}` : ''}`;
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

async function requestRows(params: Record<string, string | number>, signal?: AbortSignal) {
  const data = await requestData(params, signal);
  if (Array.isArray(data)) return data.filter(isRow);
  return isRow(data) ? [data] : [];
}

async function requestData(params: Record<string, string | number>, signal?: AbortSignal) {
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
