import type { SafeForumHtml } from '../../utils/forumMarkup';

type ForumMarkupVariant = 'floor' | 'nested' | 'signature';

export function ForumMarkup({
  className = '',
  html,
  variant,
}: {
  className?: string;
  html: SafeForumHtml;
  variant: ForumMarkupVariant;
}) {
  if (!html) return null;

  return (
    <div
      className={`forum-markup forum-markup-${variant} ${className}`.trim()}
      data-forum-markup={variant}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
