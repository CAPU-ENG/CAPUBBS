import { Bookmark, CalendarCheck2, FileText, MessageSquareText, PenLine, Quote, type LucideIcon } from 'lucide-react';
import type { ProfileTab } from '../../data/profile';

const icons: Record<ProfileTab, LucideIcon> = {
  activities: CalendarCheck2,
  bookmarks: Bookmark,
  drafts: PenLine,
  posts: FileText,
  replies: MessageSquareText,
  signatures: Quote,
};

export function ProfileTabIcon({ tab, size = 15 }: { tab: ProfileTab; size?: number }) {
  const Icon = icons[tab];
  return <Icon aria-hidden="true" size={size} />;
}
