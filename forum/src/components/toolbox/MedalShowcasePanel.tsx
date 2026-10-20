import { Award, ChevronLeft, CircleHelp, ChevronRight, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  fetchGalleryMedalHolders,
  fetchGalleryMedals,
  type GalleryMedal,
  type GalleryMedalHolder,
} from '../../api/medals';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { Button } from '../Button';
import { ErrorState } from '../ErrorState';
import { DialogLayer, DialogPresence } from '../layout/DialogPresence';
import { LoadingSpinner } from '../layout/LoadingSpinner';
import { MedalBadge } from '../medals/MedalBadge';
import { requestMedalMotionPermission } from '../medals/useMedalTilt';

type HolderState = { error: string; holders: GalleryMedalHolder[] | null };

const holderRequests = new Map<string, Promise<GalleryMedalHolder[]>>();

// Keep in sync with the .medal-showcase-waterfall breakpoints in toolbox.css.
const WATERFALL_COLUMN_QUERIES: Array<[string, number]> = [
  ['(max-width: 640px)', 2],
  ['(max-width: 860px)', 3],
];
const WATERFALL_MAX_COLUMNS = 4;
const HOLDER_PAGE_SIZE = 60;

export function MedalShowcasePanel() {
  const [medals, setMedals] = useState<GalleryMedal[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const noticeId = useId();
  const columnCount = useWaterfallColumnCount();

  useEffect(() => {
    const controller = new AbortController();
    setLoadError('');
    setMedals(null);
    holderRequests.clear();
    void fetchGalleryMedals(controller.signal).then((items) => {
      if (!controller.signal.aborted) setMedals(items);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : '勋章加载失败。');
    });
    return () => controller.abort();
  }, [reload]);

  return (
    <section className="forum-card toolbox-workspace medal-showcase-workspace" aria-labelledby="medal-showcase-title">
      <header className="toolbox-workspace-header">
        <span className="toolbox-workspace-icon"><Award size={17} /></span>
        <div className="statistics-title">
          <h1 id="medal-showcase-title">勋章展示</h1>
          <span className="statistics-data-notice">
            <button aria-describedby={noticeId} aria-label="统计说明" className="statistics-data-notice-trigger" type="button">
              <CircleHelp aria-hidden="true" size={15} />
            </button>
            <span className="statistics-data-notice-tooltip" id={noticeId} role="tooltip">
              <span>被用户主动隐藏的勋章不会计入统计</span>
            </span>
          </span>
        </div>
        <Button aria-label="刷新勋章" className="medal-showcase-refresh" icon onClick={() => setReload((value) => value + 1)} type="button">
          <RefreshCw size={16} />
        </Button>
      </header>
      {loadError ? (
        <ErrorState className="medal-showcase-state" message={loadError} onRetry={() => setReload((value) => value + 1)} />
      ) : !medals ? (
        <p className="medal-showcase-state" role="status"><LoadingSpinner size={18} />正在加载勋章</p>
      ) : medals.length === 0 ? (
        <p className="medal-showcase-state">暂无勋章</p>
      ) : (
        <div className="medal-showcase-waterfall">
          {distributeColumns(medals, columnCount).map((column, columnIndex) => (
            <div className="medal-showcase-column" key={columnIndex}>
              {column.map(({ index, item: medal }) => (
                <button
                  aria-label={`查看“${medal.name}”勋章`}
                  className="medal-showcase-card"
                  key={medal.id}
                  onClick={() => {
                    requestMedalMotionPermission();
                    setActiveIndex(index);
                  }}
                  onFocus={() => { void loadHolders(medal.id).catch(() => undefined); }}
                  onPointerEnter={() => { void loadHolders(medal.id).catch(() => undefined); }}
                  type="button"
                >
                  <span className="medal-showcase-card-image">
                    <img alt="" decoding="async" draggable={false} loading="lazy" src={medal.largeImagePath} />
                  </span>
                  <span className="medal-showcase-card-copy">
                    <strong>{medal.name}</strong>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      {medals ? (
        <MedalShowcaseLightbox activeIndex={activeIndex} medals={medals} onChange={setActiveIndex} />
      ) : null}
    </section>
  );
}

function MedalShowcaseLightbox({
  activeIndex,
  medals,
  onChange,
}: {
  activeIndex: number | null;
  medals: GalleryMedal[];
  onChange: (update: number | null | ((current: number | null) => number | null)) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const medal = activeIndex === null ? null : medals[activeIndex] ?? null;
  const open = medal !== null;
  const holderState = useMedalHolders(medal?.id ?? null);
  const [holderLimit, setHolderLimit] = useState(HOLDER_PAGE_SIZE);

  useEffect(() => {
    setHolderLimit(HOLDER_PAGE_SIZE);
  }, [medal?.id]);

  function move(offset: number) {
    onChange((current) => {
      if (current === null || medals.length < 2) return current;
      return (current + offset + medals.length) % medals.length;
    });
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onChange(null);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]') ?? []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, medals.length]);

  return (
    <DialogPresence>{medal ? createPortal(
      <DialogLayer
        className="profile-medal-lightbox-backdrop medal-showcase-lightbox-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onChange(null);
        }}
        role="presentation"
      >
        <section
          aria-labelledby="medal-showcase-lightbox-title"
          aria-modal="true"
          className="profile-medal-lightbox medal-showcase-lightbox"
          ref={dialogRef}
          role="dialog"
        >
          <button
            aria-label="关闭勋章展示"
            className="profile-medal-lightbox-close"
            onClick={() => onChange(null)}
            ref={closeButtonRef}
            type="button"
          >
            <X size={22} />
          </button>

          <button
            aria-label="上一枚勋章"
            className="profile-medal-lightbox-nav profile-medal-lightbox-prev"
            disabled={medals.length < 2}
            onClick={() => move(-1)}
            type="button"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="medal-showcase-lightbox-body">
            <div className="medal-showcase-lightbox-hero">
              <div className="profile-medal-lightbox-stage">
                <div aria-live="polite" className="profile-medal-lightbox-copy">
                  <span>{(activeIndex ?? 0) + 1} / {medals.length}</span>
                  <h2 id="medal-showcase-lightbox-title">{medal.name}</h2>
                  <dl>
                    {medal.description ? <div><dt>描述</dt><dd className="profile-medal-lightbox-description">{medal.description}</dd></div> : null}
                    <div><dt>持有人数</dt><dd>{holderState.holders ? holderState.holders.length : medal.holderCount}</dd></div>
                  </dl>
                </div>
                <div className="profile-medal-lightbox-medal">
                  <MedalBadge key={medal.id} medal={medal} size="large" />
                </div>
              </div>
            </div>

            <section aria-label="持有者" className="medal-showcase-holders">
              {holderState.error ? (
                <p className="medal-showcase-holders-state" role="alert">{holderState.error}</p>
              ) : !holderState.holders ? (
                <p className="medal-showcase-holders-state" role="status"><LoadingSpinner size={16} />正在加载持有者</p>
              ) : holderState.holders.length === 0 ? (
                <p className="medal-showcase-holders-state">暂无持有者</p>
              ) : (
                <>
                  <ul>
                    {holderState.holders.slice(0, holderLimit).map((holder) => {
                      const href = getForumNavigationHref(holder.href, window.location.href);
                      return (
                        <li key={holder.username}>
                          <a href={href} title={holder.role ? `${holder.username}（${holder.role}）` : holder.username}>
                            <img alt="" decoding="async" loading="lazy" src={holder.avatar} />
                            <span className="medal-showcase-holder-name">{holder.username}</span>
                            {holder.role ? <span className="medal-showcase-holder-role">{holder.role}</span> : null}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  {holderState.holders.length > holderLimit ? (
                    <button
                      className="medal-showcase-holders-more"
                      onClick={() => setHolderLimit((limit) => limit + HOLDER_PAGE_SIZE)}
                      type="button"
                    >
                      加载更多
                    </button>
                  ) : null}
                </>
              )}
            </section>
          </div>

          <button
            aria-label="下一枚勋章"
            className="profile-medal-lightbox-nav profile-medal-lightbox-next"
            disabled={medals.length < 2}
            onClick={() => move(1)}
            type="button"
          >
            <ChevronRight size={28} />
          </button>
        </section>
      </DialogLayer>,
      document.body,
    ) : null}</DialogPresence>
  );
}

function useMedalHolders(medalId: string | null): HolderState {
  const [state, setState] = useState<HolderState & { medalId: string | null }>({ error: '', holders: null, medalId: null });

  useEffect(() => {
    if (!medalId) return;
    let active = true;
    setState({ error: '', holders: null, medalId });
    void loadHolders(medalId).then((holders) => {
      if (active) setState({ error: '', holders, medalId });
    }).catch((error: unknown) => {
      if (active) setState({ error: error instanceof Error ? error.message : '持有者加载失败。', holders: null, medalId });
    });
    return () => { active = false; };
  }, [medalId]);

  return state.medalId === medalId ? state : { error: '', holders: null };
}

function loadHolders(medalId: string) {
  const pending = holderRequests.get(medalId);
  if (pending) return pending;
  const request = fetchGalleryMedalHolders(medalId).catch((error: unknown) => {
    holderRequests.delete(medalId);
    throw error;
  });
  holderRequests.set(medalId, request);
  return request;
}

function useWaterfallColumnCount() {
  const [count, setCount] = useState(readWaterfallColumnCount);

  useEffect(() => {
    const queries = WATERFALL_COLUMN_QUERIES.map(([query]) => window.matchMedia?.(query)).filter(isMediaQueryList);
    const sync = () => setCount(readWaterfallColumnCount());
    sync();
    queries.forEach((query) => query.addEventListener('change', sync));
    return () => queries.forEach((query) => query.removeEventListener('change', sync));
  }, []);

  return count;
}

function readWaterfallColumnCount() {
  const match = WATERFALL_COLUMN_QUERIES.find(([query]) => window.matchMedia?.(query).matches);
  return match ? match[1] : WATERFALL_MAX_COLUMNS;
}

function isMediaQueryList(value: MediaQueryList | undefined): value is MediaQueryList {
  return value !== undefined;
}

// Deal items left to right so the waterfall reads row by row.
function distributeColumns<T>(items: T[], count: number) {
  const columns = Array.from({ length: Math.max(1, count) }, () => [] as Array<{ index: number; item: T }>);
  items.forEach((item, index) => columns[index % columns.length].push({ index, item }));
  return columns;
}
