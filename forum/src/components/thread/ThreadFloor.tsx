import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type ClipboardEventHandler,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Pencil,
  Quote,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import type { NestedReply, ThreadAuthor, ThreadFloorData } from '../../data/threadDemo';
import { getDisplayedTags, getTagsForUser } from '../../data/tags';
import { writeClipboardText } from '../../utils/clipboard';
import { getPublicProfilePath } from '../../utils/userRoutes';
import {
  ForumMarkup,
  type ForumMarkupImageChangeHandler,
  type ForumMarkupImage,
  type ForumMarkupImageOpenHandler,
} from './ForumMarkup';
import { ThreadImageLightbox } from './ThreadImageLightbox';
import { ThreadPostContent } from './ThreadPostContent';
import { DisplayedTagList, TagList } from '../tags/TagBadge';
import { ProfileMedalGallery } from '../medals/ProfileMedalGallery';

type DeleteDialogTarget =
  | { kind: 'floor' }
  | { kind: 'nested'; reply: NestedReply };

type PreviewImageState = {
  imageIndex: number;
  images: ForumMarkupImage[];
  onImageChange?: ForumMarkupImageChangeHandler;
};

function AuthorCard({ author, id }: { author: ThreadAuthor; id: string }) {
  const tags = author.tags ?? getTagsForUser(author.name);
  const [tagsOverflow, setTagsOverflow] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const nameLineRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLElement>(null);
  const tagMeasureRef = useRef<HTMLDivElement>(null);
  const tagSignature = tags.map((tag) => `${tag.id}:${tag.name}`).join('|');

  useLayoutEffect(() => {
    if (tags.length === 0) {
      setTagsOverflow(false);
      return;
    }

    const measureTags = () => {
      const card = cardRef.current;
      const nameLine = nameLineRef.current;
      const name = nameRef.current;
      const fullTagList = tagMeasureRef.current;
      if (!card || !nameLine || !name || !fullTagList || card.offsetWidth === 0) return;

      const nameWidth = name.getBoundingClientRect().width;
      const fullTagWidth = fullTagList.getBoundingClientRect().width;
      const columnGap = Number.parseFloat(getComputedStyle(nameLine).columnGap) || 0;
      const availableWidth = nameLine.clientWidth - nameWidth - columnGap;
      const nextOverflow = fullTagWidth > availableWidth + 1;
      setTagsOverflow((current) => current === nextOverflow ? current : nextOverflow);
    };

    measureTags();
    const observer = new ResizeObserver(measureTags);
    [cardRef.current, nameLineRef.current, tagMeasureRef.current].forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tagSignature, tags.length]);

  return (
    <div id={id} ref={cardRef} className="author-hover-card" role="dialog" aria-label={`${author.name} 的用户摘要`}>
      <div className="author-card-head">
        <img src={author.avatar} alt="" />
        <div className="author-card-head-copy">
          <div ref={nameLineRef} className="author-card-name-line" data-tags-overflow={tagsOverflow ? 'true' : undefined}>
            <strong ref={nameRef}>{author.name}</strong>
            <div className="author-card-tag-slot">
              <TagList size="compact" tags={tags} />
            </div>
          </div>
          {(author.stars > 0 || author.role) && (
            <span className="author-card-status">
              {'★'.repeat(author.stars)}
              {author.stars > 0 && author.role ? ' · ' : ''}
              {author.role}
            </span>
          )}
        </div>
      </div>
      {tagsOverflow ? (
        <div className="author-card-tags-row">
          <TagList size="compact" tags={tags} />
        </div>
      ) : null}
      {author.medals?.length ? (
        <div className="author-card-medals">
          <ProfileMedalGallery medals={author.medals} profileName={author.name} variant="compact" />
        </div>
      ) : null}
      <div ref={tagMeasureRef} className="author-card-tag-width-measure" aria-hidden="true">
        <TagList size="compact" tags={tags} />
      </div>
      <dl>
        <div><dt>主题</dt><dd>{author.topics}</dd></div>
        <div><dt>回复</dt><dd>{author.replies}</dd></div>
        <div><dt>签到</dt><dd>{author.checkins}</dd></div>
      </dl>
      <p>最近在线：{author.lastSeen}</p>
      <a href={getPublicProfilePath(author.name)}>
        查看个人主页 <ExternalLink size={13} />
      </a>
    </div>
  );
}

function AuthorProfile({ author }: { author: ThreadAuthor }) {
  const tags = author.tags ?? getTagsForUser(author.name);
  const displayedTags = getDisplayedTags(tags);
  const profileHref = getPublicProfilePath(author.name);

  return (
    <aside className="thread-author-profile" aria-label={`${author.name} 的资料`}>
      <a aria-label={`查看${author.name}的个人主页`} className="thread-author-profile-avatar" href={profileHref}>
        <img src={author.avatar} alt="" />
      </a>
      <div className="thread-author-profile-identity">
        <a href={profileHref}>{author.name}</a>
      </div>
      {(author.stars > 0 || author.role) && (
        <div className="thread-author-profile-status">
          {author.stars > 0 && (
            <span aria-label={`${author.stars} 星`}>{'★'.repeat(author.stars)}</span>
          )}
          {author.role && <strong>{author.role}</strong>}
        </div>
      )}
      <DisplayedTagList tags={displayedTags} />
      <ProfileMedalGallery medals={author.medals ?? []} profileName={author.name} variant="compact" />
      <dl className="thread-author-profile-stats">
        <div><dt>主题</dt><dd>{author.topics}</dd></div>
        <div><dt>回复</dt><dd>{author.replies}</dd></div>
        <div><dt>签到</dt><dd>{author.checkins}</dd></div>
      </dl>
      <p className="thread-author-profile-last-seen">
        <span>最近在线</span>
        <strong>{author.lastSeen}</strong>
      </p>
    </aside>
  );
}

function formatFloorTime(value: string) {
  return value.replace(
    /^(\d{4})年(\d{2})月(\d{2})日\s+(\d{2})时(\d{2})分(\d{2})秒$/,
    '$1-$2-$3 $4:$5:$6',
  );
}

function copyAsPlainText(event: ClipboardEvent<HTMLElement>) {
  const selectedText = window.getSelection()?.toString();
  if (!selectedText) return;

  event.preventDefault();
  event.clipboardData.setData('text/plain', selectedText);
}

export function ThreadFloorPresentation({
  articleAfterContent,
  author,
  avatarRail,
  className = '',
  content,
  decorationImageSrc,
  editedAt,
  floor,
  floorIndex,
  id,
  inlineAvatar = false,
  mainAfterContent,
  onCopy,
  publishedAt,
  showAuthorProfile,
}: {
  articleAfterContent?: ReactNode;
  author: ThreadAuthor;
  avatarRail: ReactNode;
  className?: string;
  content: ReactNode;
  decorationImageSrc?: string;
  editedAt?: string;
  floor: number;
  floorIndex: ReactNode;
  id?: string;
  inlineAvatar?: boolean;
  mainAfterContent?: ReactNode;
  onCopy?: ClipboardEventHandler<HTMLElement>;
  publishedAt: string;
  showAuthorProfile: boolean;
}) {
  const authorTags = author.tags ?? getTagsForUser(author.name);
  const displayedTags = getDisplayedTags(authorTags);

  return (
    <article
      className={`thread-floor${showAuthorProfile ? ' thread-floor-with-author-profile' : ''}${className ? ` ${className}` : ''}`}
      data-floor={floor}
      id={id}
      onCopy={onCopy}
    >
      {decorationImageSrc && (
        <span aria-hidden="true" className="thread-floor-decoration">
          <img alt="" src={decorationImageSrc} />
        </span>
      )}
      {showAuthorProfile
        ? <AuthorProfile author={author} />
        : !inlineAvatar && avatarRail}

      <div className="thread-floor-main">
        <header className="thread-floor-header">
          {!showAuthorProfile && inlineAvatar && avatarRail}
          <div className="thread-floor-author">
            <a href={getPublicProfilePath(author.name)}>{author.name}</a>
            <DisplayedTagList tags={displayedTags} />
          </div>
          <div className="thread-floor-time">
            <time>{formatFloorTime(publishedAt)}</time>
            {editedAt && (
              <>
                <span>·</span>
                <time>编辑于 {formatFloorTime(editedAt)}</time>
              </>
            )}
          </div>
          {floorIndex}
        </header>

        {showAuthorProfile
          ? <div className="thread-floor-content">{content}</div>
          : content}
        {mainAfterContent}
      </div>

      {articleAfterContent}
    </article>
  );
}

export function ThreadFloorActions({
  canDelete,
  canEdit,
  canQuote,
  canReply,
  decorative = false,
  deleting = false,
  editHref = '',
  onDelete,
  onQuote,
  onReply,
}: {
  canDelete: boolean;
  canEdit: boolean;
  canQuote: boolean;
  canReply: boolean;
  decorative?: boolean;
  deleting?: boolean;
  editHref?: string;
  onDelete?: (trigger: HTMLButtonElement) => void;
  onQuote?: () => void;
  onReply?: () => void;
}) {
  const tabIndex = decorative ? -1 : undefined;

  return (
    <div
      aria-hidden={decorative || undefined}
      className={`thread-floor-actions${decorative ? ' thread-floor-actions-decorative' : ''}`}
    >
      {canQuote && (
        <button onClick={onQuote} tabIndex={tabIndex} type="button">
          <Quote size={15} />
          引用
        </button>
      )}
      {canReply && (
        <button onClick={onReply} tabIndex={tabIndex} type="button">
          <Reply size={15} />
          回复
        </button>
      )}
      {canEdit && (decorative ? (
        <button tabIndex={-1} type="button">
          <Pencil size={15} />
          编辑
        </button>
      ) : (
        <a href={editHref}>
          <Pencil size={15} />
          编辑
        </a>
      ))}
      {canDelete && (
        <button
          aria-busy={deleting || undefined}
          className="floor-action-danger"
          disabled={!decorative && deleting}
          onClick={decorative ? undefined : (event) => onDelete?.(event.currentTarget)}
          tabIndex={tabIndex}
          type="button"
        >
          <Trash2 size={15} />
          {deleting ? '删除中' : '删除'}
        </button>
      )}
    </div>
  );
}

export function ThreadFloor({
  canQuote,
  canReply,
  decorationImageSrc,
  editHref,
  floor,
  isActivityThread,
  isMainPost,
  inlineAvatar,
  showAuthorProfile,
  hideSignature,
  onDeleteFloor,
  onDeleteNestedReply,
  onQuote,
  onSubmitNestedReply,
  viewer,
}: {
  canQuote: boolean;
  canReply: boolean;
  decorationImageSrc?: string;
  editHref: string;
  floor: ThreadFloorData;
  isActivityThread: boolean;
  isMainPost: boolean;
  inlineAvatar: boolean;
  showAuthorProfile: boolean;
  hideSignature: boolean;
  onDeleteFloor: (floor: ThreadFloorData) => Promise<void>;
  onDeleteNestedReply: (floor: ThreadFloorData, reply: NestedReply) => Promise<void>;
  onQuote: (floor: ThreadFloorData) => void;
  onSubmitNestedReply: (floor: ThreadFloorData, targetName: string | null, content: string) => Promise<number>;
  viewer: ThreadAuthor | null;
}) {
  const [copyNoticeOpen, setCopyNoticeOpen] = useState(false);
  const [deleteDialogTarget, setDeleteDialogTarget] = useState<DeleteDialogTarget | null>(null);
  const [deletedNestedReplyIds, setDeletedNestedReplyIds] = useState<string[]>([]);
  const [floorDeleteError, setFloorDeleteError] = useState('');
  const [floorDeletePending, setFloorDeletePending] = useState(false);
  const [localNestedReplies, setLocalNestedReplies] = useState<NestedReply[]>([]);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [nestedReplyDeleteError, setNestedReplyDeleteError] = useState('');
  const [nestedReplyDeletingId, setNestedReplyDeletingId] = useState<string | null>(null);
  const [nestedReplyError, setNestedReplyError] = useState('');
  const [nestedReplyPending, setNestedReplyPending] = useState(false);
  const [nestedReplyTarget, setNestedReplyTarget] = useState<string | null | undefined>(undefined);
  const [preview, setPreview] = useState<PreviewImageState | null>(null);
  const [authorCardOpen, setAuthorCardOpen] = useState(false);
  const avatarRailRef = useRef<HTMLDivElement | null>(null);
  const copyNoticeTimerRef = useRef<number | null>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const nestedReplyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const previewTriggerRef = useRef<HTMLElement | null>(null);
  const nestedReplies = useMemo(
    () => [...(floor.nestedReplies ?? []), ...localNestedReplies]
      .filter((reply) => !deletedNestedReplyIds.includes(reply.id)),
    [deletedNestedReplyIds, floor.nestedReplies, localNestedReplies],
  );
  const isActivitySignupCanceled = isActivityThread
    && !isMainPost
    && /<\s*(?:s|strike)\b/i.test(floor.contentHtml ?? '');
  const bodyClassName = `thread-floor-body${isActivitySignupCanceled ? ' capubbs-activity-signup-canceled' : ''}`;
  useEffect(() => {
    return () => {
      if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!authorCardOpen) return;

    function closeAuthorCardOnOutsidePointer(event: PointerEvent) {
      const avatarRail = avatarRailRef.current;
      if (avatarRail?.contains(event.target as Node)) return;
      setAuthorCardOpen(false);
    }

    document.addEventListener('pointerdown', closeAuthorCardOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeAuthorCardOnOutsidePointer);
  }, [authorCardOpen]);

  async function copyFloorLink() {
    const link = `${window.location.origin}${window.location.pathname}${window.location.search}#${floor.floor}`;
    const copied = await writeClipboardText(link);
    if (!copied) return;

    setCopyNoticeOpen(true);
    if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    copyNoticeTimerRef.current = window.setTimeout(() => setCopyNoticeOpen(false), 1800);
  }

  const openImagePreview: ForumMarkupImageOpenHandler = (images, imageIndex, trigger, onImageChange) => {
    previewTriggerRef.current = trigger;
    setPreview({ imageIndex, images, onImageChange });
  };

  function closeImagePreview(imageIndex: number) {
    preview?.onImageChange?.(imageIndex);
    setPreview(null);
    window.requestAnimationFrame(() => previewTriggerRef.current?.focus());
  }

  function openNestedReplyComposer(targetName: string | null = null) {
    setNestedReplyTarget(targetName);
    setNestedReplyContent('');
    setNestedReplyDeleteError('');
    setNestedReplyError('');
    window.requestAnimationFrame(() => nestedReplyInputRef.current?.focus());
  }

  function closeNestedReplyComposer() {
    setNestedReplyTarget(undefined);
    setNestedReplyContent('');
    setNestedReplyError('');
  }

  async function submitNestedReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = nestedReplyContent.trim();
    if (!content || !viewer || nestedReplyPending) return;

    setNestedReplyPending(true);
    setNestedReplyError('');
    try {
      const savedReplyId = await onSubmitNestedReply(floor, nestedReplyTarget ?? null, content);
      setLocalNestedReplies((current) => [
        ...current,
        {
          author: viewer,
          canDelete: true,
          content,
          id: savedReplyId > 0 ? String(savedReplyId) : `local-${floor.id}-${Date.now()}`,
          publishedAt: formatLocalTimestamp(new Date()),
          target: nestedReplyTarget ?? undefined,
        },
      ]);
      closeNestedReplyComposer();
    } catch (error) {
      setNestedReplyError(error instanceof Error ? error.message : '楼中楼回复发布失败，请稍后重试。');
    } finally {
      setNestedReplyPending(false);
    }
  }

  async function removeNestedReply(reply: NestedReply) {
    setNestedReplyDeletingId(reply.id);
    setNestedReplyDeleteError('');
    try {
      await onDeleteNestedReply(floor, reply);
      setDeletedNestedReplyIds((current) => [...current, reply.id]);
      setLocalNestedReplies((current) => current.filter((item) => item.id !== reply.id));
      setDeleteDialogTarget(null);
    } catch (error) {
      setNestedReplyDeleteError(error instanceof Error ? error.message : '楼中楼删除失败，请稍后重试。');
    } finally {
      setNestedReplyDeletingId(null);
    }
  }

  async function removeFloor() {
    if (floorDeletePending) return;

    setFloorDeletePending(true);
    setFloorDeleteError('');
    try {
      await onDeleteFloor(floor);
    } catch (error) {
      setFloorDeleteError(error instanceof Error ? error.message : '楼层删除失败，请稍后重试。');
      setFloorDeletePending(false);
    }
  }

  function closeDeleteDialog() {
    setDeleteDialogTarget(null);
    setFloorDeleteError('');
    setNestedReplyDeleteError('');
    window.requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  }

  function confirmDelete() {
    if (!deleteDialogTarget) return;
    const target = deleteDialogTarget;
    setDeleteDialogTarget(null);
    if (target.kind === 'floor') void removeFloor();
    else void removeNestedReply(target.reply);
  }

  const avatarRail = (
    <div
      className={`thread-avatar-rail${authorCardOpen ? ' thread-avatar-rail-open' : ''}`}
      ref={avatarRailRef}
    >
      <button
        aria-controls={`author-card-${floor.floor}`}
        aria-expanded={authorCardOpen}
        aria-label={`查看${floor.author.name}的资料卡`}
        className="thread-avatar-button"
        onClick={() => setAuthorCardOpen((current) => !current)}
        type="button"
      >
        <img src={floor.author.avatar} alt="" />
      </button>
      <AuthorCard author={floor.author} id={`author-card-${floor.floor}`} />
    </div>
  );
  const postContent = (
    <ThreadPostContent
      bodyFallback={(
        <div className={bodyClassName}>
          {floor.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
      bodyClassName={bodyClassName}
      bodyHtml={floor.contentHtml}
      floor={floor.floor}
      isActivitySignupCanceled={isActivitySignupCanceled}
      onImageOpen={openImagePreview}
      signatureHtml={hideSignature ? undefined : floor.signatureHtml}
      signatureText={hideSignature ? undefined : floor.signature}
    />
  );

  const floorIndex = (
    <button
      aria-label={`复制第 ${floor.floor} 楼链接`}
      className="thread-floor-index"
      onClick={copyFloorLink}
      title="复制楼层链接"
      type="button"
    >
      #{floor.floor}
    </button>
  );
  const mainAfterContent = (
    <>
      <ThreadFloorActions
        canDelete={(!isActivityThread || isMainPost) && (floor.canDelete ?? floor.isOwn ?? false)}
        canEdit={(!isActivityThread || isMainPost) && Boolean(floor.isOwn)}
        canQuote={canQuote}
        canReply={canReply}
        deleting={floorDeletePending}
        editHref={editHref}
        onDelete={(trigger) => {
          deleteTriggerRef.current = trigger;
          setFloorDeleteError('');
          setDeleteDialogTarget({ kind: 'floor' });
        }}
        onQuote={() => onQuote(floor)}
        onReply={() => openNestedReplyComposer()}
      />

      {floorDeleteError && (
        <p className="thread-floor-delete-error" role="alert">{floorDeleteError}</p>
      )}

      {nestedReplies.length > 0 && (
        <section
          className="nested-replies"
          aria-label={`${floor.floor} 楼的楼中楼回复`}
        >
          {nestedReplies.map((reply) => (
            <article key={reply.id}>
              <img src={reply.author.avatar} alt="" />
              <div>
                <a className="nested-reply-author" href={getPublicProfilePath(reply.author.name)}>
                  {reply.author.name}
                </a>
                {reply.target && (
                  <span className="nested-reply-target">
                    {' '}回复{' '}
                    <a href={getPublicProfilePath(reply.target)}>{reply.target}</a>
                  </span>
                )}
                {reply.contentHtml ? (
                  <ForumMarkup
                    className="nested-reply-content"
                    html={reply.contentHtml}
                    onImageOpen={openImagePreview}
                    variant="nested"
                  />
                ) : (
                  <p>{reply.content}</p>
                )}
                <footer className="nested-reply-footer">
                  <time>{formatFloorTime(reply.publishedAt)}</time>
                  {canReply && (
                    <button
                      onClick={() => openNestedReplyComposer(reply.author.name)}
                      type="button"
                    >
                      回复
                    </button>
                  )}
                  {reply.canDelete && (
                    <button
                      className="nested-reply-delete"
                      disabled={nestedReplyDeletingId === reply.id}
                      onClick={(event) => {
                        deleteTriggerRef.current = event.currentTarget;
                        setNestedReplyDeleteError('');
                        setDeleteDialogTarget({ kind: 'nested', reply });
                      }}
                      type="button"
                    >
                      <Trash2 size={12} />
                      {nestedReplyDeletingId === reply.id ? '删除中' : '删除'}
                    </button>
                  )}
                </footer>
              </div>
            </article>
          ))}
        </section>
      )}
      {nestedReplyDeleteError && (
        <p className="nested-reply-delete-error" role="alert">{nestedReplyDeleteError}</p>
      )}
      {nestedReplyTarget !== undefined && canReply && (
        <form className="nested-reply-composer" onSubmit={submitNestedReply}>
          <textarea
            aria-label={nestedReplyTarget ? `回复 @${nestedReplyTarget}` : `回复第 ${floor.floor} 楼`}
            maxLength={500}
            onChange={(event) => {
              setNestedReplyContent(event.target.value);
              setNestedReplyError('');
            }}
            placeholder={nestedReplyTarget ? `回复 @${nestedReplyTarget}` : '写一条楼中楼回复'}
            ref={nestedReplyInputRef}
            rows={2}
            value={nestedReplyContent}
          />
          <div className="nested-reply-composer-actions">
            <button
              aria-label="取消楼中楼回复"
              className="nested-reply-cancel"
              disabled={nestedReplyPending}
              onClick={closeNestedReplyComposer}
              type="button"
            >
              <X size={15} />
            </button>
            <button
              className="nested-reply-submit"
              disabled={!nestedReplyContent.trim() || nestedReplyPending}
              type="submit"
            >
              <Send size={14} />
              {nestedReplyPending ? '发送中' : '发送'}
            </button>
          </div>
          {nestedReplyError && <p className="nested-reply-error" role="alert">{nestedReplyError}</p>}
        </form>
      )}
    </>
  );
  const articleAfterContent = (
    <>
      {copyNoticeOpen && (
        <div aria-live="polite" className="copy-floor-toast" role="status">
          <Check aria-hidden="true" size={15} />
          已复制楼层链接
        </div>
      )}
      {preview && (
        <ThreadImageLightbox
          images={preview.images}
          initialImageIndex={preview.imageIndex}
          onImageChange={preview.onImageChange}
          onClose={closeImagePreview}
        />
      )}
      {deleteDialogTarget && (
        <DeleteReplyDialog
          floor={floor}
          isMainPost={isMainPost}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
          target={deleteDialogTarget}
        />
      )}
    </>
  );

  return (
    <ThreadFloorPresentation
      articleAfterContent={articleAfterContent}
      author={floor.author}
      avatarRail={avatarRail}
      content={postContent}
      decorationImageSrc={decorationImageSrc}
      editedAt={floor.editedAt}
      floor={floor.floor}
      floorIndex={floorIndex}
      id={String(floor.floor)}
      inlineAvatar={inlineAvatar}
      mainAfterContent={mainAfterContent}
      onCopy={copyAsPlainText}
      publishedAt={floor.publishedAt}
      showAuthorProfile={showAuthorProfile}
    />
  );
}

function DeleteReplyDialog({
  floor,
  isMainPost,
  onCancel,
  onConfirm,
  target,
}: {
  floor: ThreadFloorData;
  isMainPost: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  target: DeleteDialogTarget;
}) {
  const nestedReply = target.kind === 'nested' ? target.reply : null;
  const title = nestedReply ? '删除楼中楼回复' : isMainPost ? '删除主楼' : '删除回复';
  const description = nestedReply
    ? ''
    : isMainPost
      ? '删除主楼后，下一楼将顺位成为主楼；如果没有其他回复，整个主题会被删除。'
      : '删除后，该楼内容将移入回收站，后续楼层编号会顺次调整。';
  const author = nestedReply?.author.name ?? floor.author.name;
  const location = nestedReply ? `#${floor.floor} · 楼中楼` : `#${floor.floor}`;
  const excerpt = getDeleteReplyExcerpt(nestedReply?.content || floor.quoteText || floor.paragraphs[0] || '');

  useEffect(() => {
    document.body.classList.add('thread-delete-dialog-open');
    return () => document.body.classList.remove('thread-delete-dialog-open');
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return (
    <div
      className="thread-delete-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onCancel();
      }}
      role="presentation"
    >
      <section
        aria-describedby={description ? 'thread-delete-dialog-description' : undefined}
        aria-labelledby="thread-delete-dialog-title"
        aria-modal="true"
        className="thread-delete-dialog"
        role="dialog"
      >
        <header>
          <span className="thread-delete-dialog-icon" aria-hidden="true"><AlertTriangle size={19} /></span>
          <div>
            <h2 id="thread-delete-dialog-title">{title}</h2>
          </div>
          <button aria-label="关闭删除确认" onClick={onCancel} type="button"><X size={18} /></button>
        </header>

        <div className="thread-delete-dialog-body">
          {description && <p id="thread-delete-dialog-description">{description}</p>}
          <div className="thread-delete-dialog-target">
            <span>{author} · {location}</span>
            <p>{excerpt || '此回复没有可预览的文字内容。'}</p>
          </div>
        </div>

        <footer>
          <button autoFocus className="thread-delete-dialog-cancel" onClick={onCancel} type="button">取消</button>
          <button className="thread-delete-dialog-confirm" onClick={onConfirm} type="button">
            <Trash2 size={15} />
            确认删除
          </button>
        </footer>
      </section>
    </div>
  );
}

function getDeleteReplyExcerpt(value: string) {
  const excerpt = value.replace(/\s+/g, ' ').trim();
  return excerpt.length > 100 ? `${excerpt.slice(0, 100).trimEnd()}…` : excerpt;
}

function formatLocalTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
