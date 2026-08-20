import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type FormEvent } from 'react';
import {
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
import { getPublicProfilePath } from '../../utils/userRoutes';
import { ForumMarkup, type ForumMarkupImage } from './ForumMarkup';
import { ThreadHtmlContent } from './ThreadHtmlContent';
import { ThreadImageLightbox } from './ThreadImageLightbox';

function AuthorCard({ author }: { author: ThreadAuthor }) {
  return (
    <div className="author-hover-card" role="dialog" aria-label={`${author.name} 的用户摘要`}>
      <div className="author-card-head">
        <img src={author.avatar} alt="" />
        <div>
          <strong>{author.name}</strong>
          {(author.stars > 0 || author.role) && (
            <span>
              {'★'.repeat(author.stars)}
              {author.stars > 0 && author.role ? ' · ' : ''}
              {author.role}
            </span>
          )}
        </div>
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

async function writeClipboardText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Clipboard permissions can be unavailable; fall back to the legacy copy command.
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
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

export function ThreadFloor({
  canReply,
  editHref,
  floor,
  isMainPost,
  onDeleteNestedReply,
  onQuote,
  onSubmitNestedReply,
  viewer,
}: {
  canReply: boolean;
  editHref: string;
  floor: ThreadFloorData;
  isMainPost: boolean;
  onDeleteNestedReply: (floor: ThreadFloorData, reply: NestedReply) => Promise<void>;
  onQuote: (floor: ThreadFloorData) => void;
  onSubmitNestedReply: (floor: ThreadFloorData, targetName: string | null, content: string) => Promise<number>;
  viewer: ThreadAuthor | null;
}) {
  const [copyNoticeOpen, setCopyNoticeOpen] = useState(false);
  const [deletedNestedReplyIds, setDeletedNestedReplyIds] = useState<string[]>([]);
  const [localNestedReplies, setLocalNestedReplies] = useState<NestedReply[]>([]);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [nestedReplyDeleteError, setNestedReplyDeleteError] = useState('');
  const [nestedReplyDeletingId, setNestedReplyDeletingId] = useState<string | null>(null);
  const [nestedReplyError, setNestedReplyError] = useState('');
  const [nestedReplyPending, setNestedReplyPending] = useState(false);
  const [nestedReplyTarget, setNestedReplyTarget] = useState<string | null | undefined>(undefined);
  const [previewImage, setPreviewImage] = useState<ForumMarkupImage | null>(null);
  const copyNoticeTimerRef = useRef<number | null>(null);
  const nestedReplyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const previewTriggerRef = useRef<HTMLImageElement | null>(null);
  const nestedReplies = useMemo(
    () => [...(floor.nestedReplies ?? []), ...localNestedReplies]
      .filter((reply) => !deletedNestedReplyIds.includes(reply.id)),
    [deletedNestedReplyIds, floor.nestedReplies, localNestedReplies],
  );

  useEffect(() => {
    return () => {
      if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    };
  }, []);

  async function copyFloorLink() {
    const link = `${window.location.origin}${window.location.pathname}${window.location.search}#${floor.floor}`;
    const copied = await writeClipboardText(link);
    if (!copied) return;

    setCopyNoticeOpen(true);
    if (copyNoticeTimerRef.current !== null) window.clearTimeout(copyNoticeTimerRef.current);
    copyNoticeTimerRef.current = window.setTimeout(() => setCopyNoticeOpen(false), 1800);
  }

  function openImagePreview(image: ForumMarkupImage, trigger: HTMLImageElement) {
    previewTriggerRef.current = trigger;
    setPreviewImage(image);
  }

  function closeImagePreview() {
    setPreviewImage(null);
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
    if (!window.confirm('确认删除这条楼中楼回复吗？')) return;

    setNestedReplyDeletingId(reply.id);
    setNestedReplyDeleteError('');
    try {
      await onDeleteNestedReply(floor, reply);
      setDeletedNestedReplyIds((current) => [...current, reply.id]);
      setLocalNestedReplies((current) => current.filter((item) => item.id !== reply.id));
    } catch (error) {
      setNestedReplyDeleteError(error instanceof Error ? error.message : '楼中楼删除失败，请稍后重试。');
    } finally {
      setNestedReplyDeletingId(null);
    }
  }

  return (
    <article
      className="thread-floor"
      id={`floor-${floor.floor}`}
      data-floor={floor.floor}
      onCopy={copyAsPlainText}
    >
      <div className="thread-avatar-rail">
        <div className="thread-avatar-button">
          <img src={floor.author.avatar} alt="" />
        </div>
        <AuthorCard author={floor.author} />
      </div>

      <div className="thread-floor-main">
        <header className="thread-floor-header">
          <div className="thread-floor-author">
            <a href={getPublicProfilePath(floor.author.name)}>
              {floor.author.name}
            </a>
            {isMainPost && <em>楼主</em>}
          </div>
          <div className="thread-floor-time">
            <time>{formatFloorTime(floor.publishedAt)}</time>
            {floor.editedAt && (
              <>
                <span>·</span>
                <time>编辑于 {formatFloorTime(floor.editedAt)}</time>
              </>
            )}
          </div>
          <button
            aria-label={`复制第 ${floor.floor} 楼链接`}
            className="thread-floor-index"
            onClick={copyFloorLink}
            title="复制楼层链接"
            type="button"
          >
            #{floor.floor}
          </button>
        </header>

        {floor.contentHtml ? (
          <ThreadHtmlContent
            className="thread-floor-body"
            floor={floor.floor}
            html={floor.contentHtml}
            onImageOpen={openImagePreview}
            variant="floor"
          />
        ) : (
          <div className="thread-floor-body">
            {floor.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        {floor.signatureHtml ? (
          <ThreadHtmlContent
            className="thread-signature"
            floor={floor.floor}
            html={floor.signatureHtml}
            onImageOpen={openImagePreview}
            variant="signature"
          />
        ) : floor.signature ? (
          <footer className="thread-signature">
            <p>{floor.signature}</p>
          </footer>
        ) : null}

        <div className="thread-floor-actions">
          {canReply && (
            <>
              <button onClick={() => onQuote(floor)} type="button">
                <Quote size={15} />
                引用
              </button>
              <button onClick={() => openNestedReplyComposer()} type="button">
                <Reply size={15} />
                回复
              </button>
            </>
          )}
          {(floor.canEdit ?? floor.isOwn) && (
              <a href={editHref}>
                <Pencil size={15} />
                编辑
              </a>
          )}
          {(floor.canDelete ?? floor.isOwn) && (
              <button className="floor-action-danger" type="button">
                <Trash2 size={15} />
                删除
              </button>
          )}
        </div>

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
                        onClick={() => void removeNestedReply(reply)}
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
      </div>

      {copyNoticeOpen && (
        <div aria-live="polite" className="copy-floor-toast" role="status">
          <Check aria-hidden="true" size={15} />
          已复制楼层链接
        </div>
      )}
      {previewImage && (
        <ThreadImageLightbox image={previewImage} onClose={closeImagePreview} />
      )}
    </article>
  );
}

function formatLocalTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
