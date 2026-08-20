import { LoaderCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import defaultAvatar from '../../assets/avatar/default-avatar.avif';
import type { DirectChatMessage, DirectConversation } from '../../types/messages';

export function DirectMessageDialog({
  activeConversationId,
  conversations,
  onClose,
  onLoadConversation,
  onSelectConversation,
  onSendMessage,
}: {
  activeConversationId: string;
  conversations: DirectConversation[];
  onClose: () => void;
  onLoadConversation: (conversationId: string) => Promise<void>;
  onSelectConversation: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
    ?? conversations[0];

  useEffect(() => {
    if (!activeConversation || activeConversation.messagesLoaded) return;
    let stale = false;
    setLoadError('');
    setLoadingConversationId(activeConversation.id);
    void onLoadConversation(activeConversation.id)
      .catch((error: unknown) => {
        if (!stale) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!stale) setLoadingConversationId(null);
      });
    return () => { stale = true; };
  }, [activeConversation?.id, activeConversation?.messagesLoaded, onLoadConversation]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (timeline) timeline.scrollTop = timeline.scrollHeight;
  }, [activeConversation?.id, activeConversation?.messages.length]);

  if (!activeConversation) return null;

  async function sendDraft() {
    const text = draft.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setSendError('');
    try {
      await onSendMessage(activeConversation.id, text);
      setDraft('');
    } catch (error) {
      setSendError(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }

  return createPortal(
    <div className="message-overlay" onMouseDown={onClose}>
      <section
        aria-label={`私信：${activeConversation.user}`}
        aria-modal="true"
        className="direct-message-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="message-dialog-header direct-message-header">
          <div>
            <h2>私信：{activeConversation.user}</h2>
            <p>选择对象后查看消息记录</p>
          </div>
          <button className="message-close-button" type="button" aria-label="关闭私信" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <aside className="direct-conversation-list">
          {conversations.map((conversation) => (
            <button
              className={conversation.id === activeConversation.id ? 'direct-conversation-active' : ''}
              key={conversation.id}
              type="button"
              aria-pressed={conversation.id === activeConversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <img src={defaultAvatar} alt="" />
              <span>
                <span><strong>{conversation.user}</strong><time>{conversation.lastTime}</time></span>
                <span className="direct-conversation-preview">
                  <span>{conversation.lastMessage || '还没有历史私信'}</span>
                  {conversation.unread > 0 && <em>{conversation.unread}</em>}
                </span>
              </span>
            </button>
          ))}
        </aside>

        <div className="direct-message-main">
          <div className="direct-message-timeline" ref={timelineRef}>
            {loadingConversationId === activeConversation.id ? (
              <MessageTimelineState icon={<LoaderCircle className="animate-spin" size={21} />} text="正在读取私信记录" />
            ) : loadError ? (
              <MessageTimelineState text={loadError} tone="error" />
            ) : activeConversation.messages.length > 0 ? (
              <MessageTimeline conversation={activeConversation} messages={activeConversation.messages} />
            ) : (
              <MessageTimelineState text="还没有历史私信" />
            )}
          </div>

          <div className="direct-message-compose">
            <textarea
              maxLength={500}
              placeholder="输入私信内容"
              value={draft}
              disabled={isSending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void sendDraft();
              }}
            />
            {sendError && <p role="status">{sendError}</p>}
            <div>
              <span>Ctrl / ⌘ + Enter 发送</span>
              <button type="button" disabled={!draft.trim() || isSending} onClick={() => void sendDraft()}>
                {isSending ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}
                {isSending ? '发送中' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function MessageTimeline({
  conversation,
  messages,
}: {
  conversation: DirectConversation;
  messages: DirectChatMessage[];
}) {
  let lastDate = '';

  return (
    <div className="direct-message-bubbles">
      {messages.map((message) => {
        const showDate = message.date !== lastDate;
        lastDate = message.date;
        return (
          <div className={`direct-message-entry direct-message-entry-${message.author}`} key={message.id}>
            {showDate && <div className="direct-message-date">{message.date}</div>}
            <span>{message.author === 'me' ? '你' : conversation.user}</span>
            <p>{message.text}</p>
            <time>{message.time}</time>
          </div>
        );
      })}
    </div>
  );
}

function MessageTimelineState({
  icon,
  text,
  tone = 'default',
}: {
  icon?: React.ReactNode;
  text: string;
  tone?: 'default' | 'error';
}) {
  return <div className={`direct-message-state direct-message-state-${tone}`}>{icon}<span>{text}</span></div>;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : '私信请求失败，请稍后重试。';
}
