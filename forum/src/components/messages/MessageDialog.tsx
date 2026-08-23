import {
  CheckCheck,
  LoaderCircle,
  Mail,
  MessageCircleReply,
  MessageSquareText,
  RotateCw,
  X,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ForumMessage, MessageCategory, MessageSummary } from '../../types/messages';
import { getPublicProfilePath, USER_CENTER_PATH } from '../../utils/userRoutes';

const MESSAGE_TABS: Array<{ icon: ReactNode; key: MessageCategory; label: string }> = [
  { icon: <MessageCircleReply size={16} />, key: 'replies', label: '回复' },
  { icon: <Mail size={16} />, key: 'direct', label: '私信' },
];

export function MessageDialog({
  data,
  error,
  isLoading,
  isLoadingMore,
  onClose,
  onLoadMore,
  onMarkCategoryRead,
  onMarkMessageRead,
  onOpenConversation,
  onRetry,
}: {
  data: MessageSummary;
  error: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  onClose: () => void;
  onLoadMore: () => Promise<void>;
  onMarkCategoryRead: (category: MessageCategory) => Promise<void>;
  onMarkMessageRead: (messageId: string) => void;
  onOpenConversation: (conversationId: string) => void;
  onRetry: () => Promise<void>;
}) {
  const [activeCategory, setActiveCategory] = useState<MessageCategory>('replies');
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const activeMessages = data.messages.filter((message) => message.category === activeCategory);
  const groupedMessages = useMemo(() => groupMessages(activeMessages), [activeMessages]);
  const activeUnread = data.unread[activeCategory];

  async function markCategoryRead() {
    setIsMarkingRead(true);
    try {
      await onMarkCategoryRead(activeCategory);
    } catch {
      // The hook exposes the request error in the dialog footer.
    } finally {
      setIsMarkingRead(false);
    }
  }

  return createPortal(
    <div className="message-overlay" onMouseDown={onClose}>
      <section
        aria-label="消息"
        aria-modal="true"
        className="message-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="message-dialog-header">
          <div>
            <p>回复和私信</p>
            <h2>消息</h2>
          </div>
          <button className="message-close-button" type="button" aria-label="关闭消息" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <nav aria-label="消息分类" className="message-tabs">
          {MESSAGE_TABS.map((tab) => (
            <button
              className={`message-tab ${activeCategory === tab.key ? 'message-tab-active' : ''}`}
              key={tab.key}
              type="button"
              aria-pressed={activeCategory === tab.key}
              onClick={() => setActiveCategory(tab.key)}
            >
              <span>{tab.icon}<span className="message-tab-label">{tab.label}</span></span>
              {data.unread[tab.key] > 0 && <strong>{data.unread[tab.key]}</strong>}
            </button>
          ))}
        </nav>

        <div className="message-dialog-main">
          <div className="message-list">
            {isLoading ? (
              <MessageState icon={<LoaderCircle className="animate-spin" size={21} />} text="正在加载消息" />
            ) : error && data.messages.length === 0 ? (
              <MessageState
                icon={<RotateCw size={20} />}
                text={error}
                actionLabel="重新加载"
                onAction={() => void onRetry()}
                tone="error"
              />
            ) : groupedMessages.length > 0 ? (
              groupedMessages.map((group) => (
                <section className="message-group" key={group.label}>
                  <h3>{group.label}</h3>
                  <div>
                    {group.items.map((message) => (
                      <MessageCard
                        key={message.id}
                        message={message}
                        onMarkMessageRead={onMarkMessageRead}
                        onOpenConversation={onOpenConversation}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <MessageState icon={<MessageSquareText size={21} />} text="暂无消息" />
            )}

            {activeCategory === 'replies' && data.hasMoreReplies && !isLoading && (
              <button
                className="message-load-more"
                type="button"
                disabled={isLoadingMore}
                onClick={() => void onLoadMore()}
              >
                {isLoadingMore && <LoaderCircle className="animate-spin" size={15} />}
                {isLoadingMore ? '加载中' : '下一页'}
              </button>
            )}
          </div>

          <footer className="message-dialog-footer">
            {error && data.messages.length > 0 && <p role="status">{error}</p>}
            <button
              type="button"
              disabled={isLoading || isMarkingRead || activeUnread === 0}
              onClick={() => void markCategoryRead()}
            >
              {isMarkingRead ? <LoaderCircle className="animate-spin" size={15} /> : <CheckCheck size={15} />}
              全部已读
            </button>
          </footer>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function MessageCard({
  message,
  onMarkMessageRead,
  onOpenConversation,
}: {
  message: ForumMessage;
  onMarkMessageRead: (messageId: string) => void;
  onOpenConversation: (conversationId: string) => void;
}) {
  const isDirect = message.category === 'direct';
  const tagGrant = message.systemEvent?.kind === 'tag-granted' ? message.systemEvent : null;
  const markRead = () => onMarkMessageRead(message.id);

  return (
    <article className={`message-card ${message.unread ? 'message-card-unread' : ''}`}>
      <span className="message-card-dot" />
      <div>
        <header>
          {tagGrant ? (
            <strong className="message-card-tag-grant">
              <a href={getPublicProfilePath(message.sender)} onClick={markRead}>{message.sender}</a>
              {' 为你添加了“'}{tagGrant.tagName}{'”标签，可前往'}
              <a href={USER_CENTER_PATH} onClick={markRead}>个人中心</a>
              查看。
            </strong>
          ) : (
            <strong>{isDirect ? message.title : `${message.sender} ${message.title}`}</strong>
          )}
          <time>{message.time}</time>
        </header>
        {message.context && (
          <a href={message.href} onClick={() => onMarkMessageRead(message.id)}>{message.context}</a>
        )}
        {isDirect && <p>{message.excerpt}</p>}
        <div className="message-card-actions">
          {isDirect ? (
            <button
              type="button"
              onClick={() => message.conversationId && onOpenConversation(message.conversationId)}
            >
              打开对话
            </button>
          ) : (
            <a href={message.href} onClick={markRead}>打开</a>
          )}
        </div>
      </div>
    </article>
  );
}

function MessageState({
  actionLabel,
  icon,
  onAction,
  text,
  tone = 'default',
}: {
  actionLabel?: string;
  icon: ReactNode;
  onAction?: () => void;
  text: string;
  tone?: 'default' | 'error';
}) {
  return (
    <div
      className={tone === 'error'
        ? 'message-state message-state-error'
        : 'message-state message-state-default'}
      role="status"
    >
      {icon}<span>{text}</span>
      {actionLabel && <button type="button" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

function groupMessages(messages: ForumMessage[]) {
  return messages.reduce<Array<{ items: ForumMessage[]; label: string }>>((groups, message) => {
    const existing = groups.find((group) => group.label === message.group);
    if (existing) existing.items.push(message);
    else groups.push({ items: [message], label: message.group });
    return groups;
  }, []);
}
