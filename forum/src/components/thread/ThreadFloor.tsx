import { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Flag,
  Link2,
  MoreHorizontal,
  Pencil,
  Quote,
  Reply,
  Trash2,
} from 'lucide-react';
import type { ThreadAuthor, ThreadFloorData } from '../../data/threadDemo';

function AuthorCard({ author }: { author: ThreadAuthor }) {
  return (
    <div className="author-hover-card" role="dialog" aria-label={`${author.name} 的用户摘要`}>
      <div className="author-card-head">
        <img src={author.avatar} alt="" />
        <div>
          <strong>{author.name}</strong>
          <span>{'★'.repeat(author.stars)} · {author.role}</span>
        </div>
      </div>
      <dl>
        <div><dt>主题</dt><dd>{author.topics}</dd></div>
        <div><dt>回复</dt><dd>{author.replies}</dd></div>
        <div><dt>签到</dt><dd>{author.checkins}</dd></div>
      </dl>
      <p>最近在线：{author.lastSeen}</p>
      <a href={`#author-${encodeURIComponent(author.name)}`}>
        查看个人主页 <ExternalLink size={13} />
      </a>
    </div>
  );
}

function FloorMenu({ floor, onClose }: { floor: ThreadFloorData; onClose: () => void }) {
  async function copyFloorLink() {
    const link = `${window.location.origin}${window.location.pathname}${window.location.search}#floor-${floor.floor}`;
    await navigator.clipboard?.writeText(link);
    onClose();
  }

  return (
    <div className="floor-more-menu" role="menu">
      <button onClick={copyFloorLink} role="menuitem" type="button"><Link2 size={15} />复制楼层链接</button>
      {floor.isOwn ? (
        <>
          <button onClick={onClose} role="menuitem" type="button"><Pencil size={15} />编辑楼层</button>
          <button className="floor-menu-danger" onClick={onClose} role="menuitem" type="button"><Trash2 size={15} />删除楼层</button>
        </>
      ) : (
        <button onClick={onClose} role="menuitem" type="button"><Flag size={15} />举报</button>
      )}
    </div>
  );
}

export function ThreadFloor({
  floor,
  isMainPost,
  onQuote,
  onReply,
}: {
  floor: ThreadFloorData;
  isMainPost: boolean;
  onQuote: (floor: ThreadFloorData) => void;
  onReply: (floor: ThreadFloorData, targetName?: string) => void;
}) {
  const [authorCardOpen, setAuthorCardOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const authorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
      if (authorRef.current && !authorRef.current.contains(event.target as Node)) setAuthorCardOpen(false);
    }
    document.addEventListener('pointerdown', closeMenu);
    return () => document.removeEventListener('pointerdown', closeMenu);
  }, []);

  return (
    <article className="thread-floor" id={`floor-${floor.floor}`} data-floor={floor.floor}>
      <div className={`thread-avatar-rail ${authorCardOpen ? 'author-card-click-open' : ''}`} ref={authorRef}>
        <button
          aria-expanded={authorCardOpen}
          aria-label={`查看 ${floor.author.name} 的资料`}
          className="thread-avatar-button"
          onClick={() => setAuthorCardOpen((open) => !open)}
          type="button"
        >
          <img src={floor.author.avatar} alt="" />
        </button>
        <AuthorCard author={floor.author} />
      </div>

      <div className="thread-floor-main">
        <header className="thread-floor-header">
          <div className="thread-floor-author">
            <a href={`#author-${encodeURIComponent(floor.author.name)}`}>{floor.author.name}</a>
            <span>{floor.author.role}</span>
            {isMainPost && <em>楼主</em>}
          </div>
          <div className="thread-floor-time">
            <time>发布于 {floor.publishedAt}</time>
            {floor.editedAt && <time>最后编辑于 {floor.editedAt}</time>}
            <a href={`#floor-${floor.floor}`}>#{floor.floor}</a>
          </div>
        </header>

        <div className="thread-floor-body">
          {floor.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        {floor.nestedReplies && floor.nestedReplies.length > 0 && (
          <section className="nested-replies" aria-label={`${floor.floor} 楼的楼中楼回复`}>
            {floor.nestedReplies.map((reply) => (
              <article key={reply.id}>
                <img src={reply.author.avatar} alt="" />
                <div>
                  <div className="nested-reply-meta">
                    <strong>{reply.author.name}</strong>
                    <time>{reply.publishedAt}</time>
                  </div>
                  <p>{reply.content}</p>
                </div>
                <button onClick={() => onReply(floor, reply.author.name)} type="button">回复</button>
              </article>
            ))}
          </section>
        )}

        {floor.signature && (
          <footer className="thread-signature">
            <span>签名档</span>
            <p>{floor.signature}</p>
          </footer>
        )}

        <div className="thread-floor-actions">
          <button onClick={() => onQuote(floor)} type="button"><Quote size={15} />引用</button>
          <button onClick={() => onReply(floor)} type="button"><Reply size={15} />回复</button>
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`${floor.floor} 楼更多操作`}
              className="thread-more-button"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && <FloorMenu floor={floor} onClose={() => setMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </article>
  );
}
