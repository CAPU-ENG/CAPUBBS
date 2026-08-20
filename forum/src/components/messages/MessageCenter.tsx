import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMessageCenter } from '../../hooks/useMessageCenter';
import type { MessageCategory } from '../../types/messages';
import { DirectMessageDialog } from './DirectMessageDialog';
import { MessageDialog } from './MessageDialog';

export function MessageCenter({
  initialUnreadCount,
  onBeforeOpen,
  onUnreadChange,
}: {
  initialUnreadCount: number;
  onBeforeOpen: () => void;
  onUnreadChange: (count: number) => void;
}) {
  const messageCenter = useMessageCenter(onUnreadChange);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const anyDialogOpen = messagesOpen || activeConversationId !== null;
  const unreadCount = messageCenter.status === 'idle'
    ? initialUnreadCount
    : messageCenter.data.unread.total;

  useEffect(() => {
    if (!anyDialogOpen) return;

    document.body.classList.add('message-layer-open');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMessagesOpen(false);
        setActiveConversationId(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('message-layer-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [anyDialogOpen]);

  function toggleMessages() {
    onBeforeOpen();
    setActiveConversationId(null);
    setMessagesOpen((open) => {
      if (!open) void messageCenter.load();
      return !open;
    });
  }

  function openConversation(conversationId: string) {
    messageCenter.markConversationRead(conversationId);
    setMessagesOpen(false);
    setActiveConversationId(conversationId);
  }

  async function markCategoryRead(category: MessageCategory) {
    await messageCenter.markCategoryRead(category);
  }

  return (
    <>
      <button
        className={`icon-button message-trigger ${messagesOpen ? 'icon-button-active' : ''}`}
        type="button"
        aria-label={unreadCount > 0 ? `消息通知，${unreadCount} 条未读` : '消息通知'}
        aria-expanded={messagesOpen}
        aria-haspopup="dialog"
        onClick={toggleMessages}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="message-trigger-count" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {messagesOpen && (
        <MessageDialog
          data={messageCenter.data}
          error={messageCenter.error}
          isLoading={messageCenter.status === 'loading'}
          isLoadingMore={messageCenter.isLoadingMore}
          onClose={() => setMessagesOpen(false)}
          onLoadMore={messageCenter.loadMoreReplies}
          onMarkCategoryRead={markCategoryRead}
          onMarkMessageRead={messageCenter.markMessageRead}
          onOpenConversation={openConversation}
          onRetry={messageCenter.load}
        />
      )}

      {activeConversationId && (
        <DirectMessageDialog
          activeConversationId={activeConversationId}
          conversations={messageCenter.data.conversations}
          onClose={() => setActiveConversationId(null)}
          onLoadConversation={messageCenter.loadConversation}
          onSelectConversation={openConversation}
          onSendMessage={messageCenter.sendDirectMessage}
        />
      )}
    </>
  );
}
