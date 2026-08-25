import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchPublicUserMedals } from '../../api/medals';
import type { UserMedal } from '../../data/medals';
import { MedalBadge } from './MedalBadge';

const MEDAL_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
});

export function ProfileMedalGallery({
  medals,
  profileName,
  variant = 'profile',
}: {
  medals: UserMedal[];
  profileName?: string;
  variant?: 'compact' | 'profile';
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadedMedals, setLoadedMedals] = useState<UserMedal[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const lightboxOpen = activeIndex !== null;
  const selectedMedal = activeIndex === null ? null : medals[activeIndex] ?? null;
  const activeMedal = selectedMedal
    ? loadedMedals.find((medal) => medal.id === selectedMedal.id) ?? selectedMedal
    : null;

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= medals.length) setActiveIndex(null);
  }, [activeIndex, medals.length]);

  useEffect(() => {
    if (!activeMedal || activeMedal.largeImagePath || !profileName?.trim()) return;
    const controller = new AbortController();
    void fetchPublicUserMedals(profileName, controller.signal).then(setLoadedMedals).catch(() => undefined);
    return () => controller.abort();
  }, [activeMedal, profileName]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'Tab') {
        const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
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
  }, [lightboxOpen, medals.length]);

  function move(offset: number) {
    setActiveIndex((current) => {
      if (current === null || medals.length < 2) return current;
      return (current + offset + medals.length) % medals.length;
    });
  }

  if (medals.length === 0) return null;

  const compact = variant === 'compact';

  return (
    <>
      <div
        aria-label={compact ? '展示勋章' : '勋章'}
        className={compact ? 'user-medal-list' : 'profile-identity-medals'}
        role="group"
      >
        {medals.map((medal, index) => (
          <button
            aria-label={`查看“${medal.name}”勋章`}
            className={compact ? 'user-medal-list-button' : 'profile-identity-medal-button'}
            key={medal.id}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <MedalBadge medal={medal} />
          </button>
        ))}
      </div>

      {activeMedal ? createPortal(
        <div
          className="profile-medal-lightbox-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
          role="presentation"
        >
          <section
            aria-labelledby="profile-medal-lightbox-title"
            aria-modal="true"
            className="profile-medal-lightbox"
            ref={dialogRef}
            role="dialog"
          >
            <button
              aria-label="关闭勋章展示"
              className="profile-medal-lightbox-close"
              onClick={() => setActiveIndex(null)}
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

            <div className="profile-medal-lightbox-stage">
              <div aria-live="polite" className="profile-medal-lightbox-copy">
                <span>{(activeIndex ?? 0) + 1} / {medals.length}</span>
                <h2 id="profile-medal-lightbox-title">{activeMedal.name}</h2>
                <dl>
                  {activeMedal.role ? <div><dt>职务</dt><dd>{activeMedal.role}</dd></div> : null}
                  <div><dt>获取日期</dt><dd>{formatAwardedAt(activeMedal.awardedAt)}</dd></div>
                </dl>
              </div>
              <div className="profile-medal-lightbox-medal">
                <MedalBadge key={activeMedal.id} medal={activeMedal} size="large" />
              </div>
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
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function formatAwardedAt(timestamp: number) {
  const date = new Date(timestamp * 1000);
  return timestamp > 0 && !Number.isNaN(date.getTime()) ? MEDAL_DATE_FORMATTER.format(date) : '未记录';
}
