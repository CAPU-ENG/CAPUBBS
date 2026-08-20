export type MessageCategory = 'replies' | 'direct';

export type ForumMessage = {
  category: MessageCategory;
  context?: string;
  conversationId?: string;
  excerpt: string;
  group: string;
  href: string;
  id: string;
  sender: string;
  time: string;
  title: string;
  unread: boolean;
};

export type DirectChatMessage = {
  author: 'me' | 'them';
  date: string;
  id: string;
  text: string;
  time: string;
};

export type DirectConversation = {
  id: string;
  lastMessage: string;
  lastTime: string;
  messages: DirectChatMessage[];
  messagesLoaded: boolean;
  total: number;
  unread: number;
  user: string;
};

export type MessageSummary = {
  conversations: DirectConversation[];
  hasMoreReplies: boolean;
  messages: ForumMessage[];
  replyPage: number;
  unread: Record<MessageCategory | 'total', number>;
};
