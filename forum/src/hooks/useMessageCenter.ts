import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchDirectConversation,
  fetchMessageSummary,
  fetchMoreReplyMessages,
  isMessageAbortError,
  markMessagesRead,
  sendDirectMessage as sendDirectMessageRequest,
} from '../api/messages';
import type {
  DirectConversation,
  ForumMessage,
  MessageCategory,
  MessageSummary,
} from '../types/messages';

const EMPTY_SUMMARY: MessageSummary = {
  conversations: [],
  hasMoreReplies: false,
  messages: [],
  replyPage: 1,
  unread: { direct: 0, replies: 0, total: 0 },
};

type MessageCenterStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useMessageCenter(onUnreadChange: (count: number) => void) {
  const [data, setData] = useState<MessageSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [status, setStatus] = useState<MessageCenterStatus>('idle');
  const activeController = useRef<AbortController | null>(null);
  const loadingPromise = useRef<Promise<void> | null>(null);
  const onUnreadChangeRef = useRef(onUnreadChange);

  useEffect(() => {
    onUnreadChangeRef.current = onUnreadChange;
  }, [onUnreadChange]);

  useEffect(() => () => activeController.current?.abort(), []);

  const commit = useCallback((update: (current: MessageSummary) => MessageSummary) => {
    setData(update);
  }, []);

  useEffect(() => {
    if (data !== EMPTY_SUMMARY) onUnreadChangeRef.current(data.unread.total);
  }, [data]);

  const load = useCallback(async () => {
    if (loadingPromise.current) return loadingPromise.current;

    const controller = new AbortController();
    activeController.current?.abort();
    activeController.current = controller;
    setError('');
    setStatus((current) => current === 'ready' ? 'ready' : 'loading');

    const request = fetchMessageSummary(controller.signal)
      .then((summary) => {
        commit((current) => preserveLoadedConversations(summary, current.conversations));
        setStatus('ready');
      })
      .catch((requestError: unknown) => {
        if (isMessageAbortError(requestError)) return;
        setError(getErrorMessage(requestError));
        setStatus('error');
      })
      .finally(() => {
        if (activeController.current === controller) activeController.current = null;
        loadingPromise.current = null;
      });

    loadingPromise.current = request;
    return request;
  }, [commit]);

  const loadMoreReplies = useCallback(async () => {
    if (isLoadingMore || !data.hasMoreReplies) return;
    setIsLoadingMore(true);
    setError('');

    try {
      const incoming = await fetchMoreReplyMessages(data.replyPage + 1);
      commit((current) => {
        const existingIds = new Set(current.messages.map((message) => message.id));
        return {
          ...current,
          hasMoreReplies: incoming.hasMore,
          messages: [
            ...current.messages,
            ...incoming.messages.filter((message) => !existingIds.has(message.id)),
          ],
          replyPage: incoming.page,
          unread: incoming.unread,
        };
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingMore(false);
    }
  }, [commit, data.hasMoreReplies, data.replyPage, isLoadingMore]);

  const loadConversation = useCallback(async (conversationId: string) => {
    const result = await fetchDirectConversation(conversationId);
    commit((current) => ({ ...mergeConversation(current, result.conversation), unread: result.unread }));
  }, [commit]);

  const sendDirectMessage = useCallback(async (conversationId: string, text: string) => {
    const result = await sendDirectMessageRequest(conversationId, text);
    commit((current) => ({ ...mergeConversation(current, result.conversation), unread: result.unread }));
  }, [commit]);

  const markMessageRead = useCallback(async (messageId: string) => {
    try {
      const unread = await markMessagesRead({ messageId });
      commit((current) => ({
        ...current,
        unread,
        messages: current.messages.map((message) => message.id === messageId ? { ...message, unread: false } : message),
      }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, [commit]);

  const markCategoryRead = useCallback(async (category: MessageCategory) => {
    setError('');
    try {
      const unread = await markMessagesRead({ category });
      commit((current) => ({
        ...current,
        unread,
        conversations: category === 'direct'
          ? current.conversations.map((conversation) => ({ ...conversation, unread: 0 }))
          : current.conversations,
        messages: current.messages.map((message) => message.category === category ? { ...message, unread: false } : message),
      }));
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, [commit]);

  return {
    data,
    error,
    isLoadingMore,
    load,
    loadConversation,
    markCategoryRead,
    markMessageRead,
    sendDirectMessage,
    status,
    loadMoreReplies,
  };
}

function preserveLoadedConversations(summary: MessageSummary, existing: DirectConversation[]) {
  const conversations = summary.conversations.map((conversation) => {
    const loaded = existing.find((item) => item.id === conversation.id && item.messagesLoaded);
    return loaded ? { ...conversation, messages: loaded.messages, messagesLoaded: true } : conversation;
  });

  return { ...summary, conversations };
}

function mergeConversation(data: MessageSummary, conversation: DirectConversation): MessageSummary {
  const exists = data.conversations.some((item) => item.id === conversation.id);
  const conversations = exists
    ? data.conversations.map((item) => item.id === conversation.id ? { ...item, ...conversation } : item)
    : [conversation, ...data.conversations];
  const directMessage = conversationToMessage(conversation);
  const hasMessage = data.messages.some((message) => message.id === directMessage.id);
  const messages = hasMessage
    ? data.messages.map((message) => message.id === directMessage.id ? directMessage : message)
    : [directMessage, ...data.messages];

  return { ...data, conversations, messages };
}

function conversationToMessage(conversation: DirectConversation): ForumMessage {
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

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : '消息请求失败，请稍后重试。';
}
