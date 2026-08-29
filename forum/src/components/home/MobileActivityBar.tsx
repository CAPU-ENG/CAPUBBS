import { useEffect, useRef, useState } from 'react';
import { Bike, CalendarDays, ChevronDown, ChevronRight, Pin } from 'lucide-react';
import type { HomeCalendarEvent, HomeSignupActivity, HomeThread } from '../../api/home';
import type { HomeDataStatus } from '../../hooks/useHomeData';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { ActivityCalendar, ActivitySignupList } from './HomeAside';

type ExpandedPanel = 'pinned' | 'signup' | 'calendar' | null;

type MobileActivityBarProps = {
  calendarError: string;
  calendarItems: HomeCalendarEvent[];
  calendarStatus: HomeDataStatus;
  pinnedItems: HomeThread[];
  readThreadIds: ReadonlySet<string>;
  signupItems: HomeSignupActivity[];
};

export function MobileActivityBar({
  calendarError,
  calendarItems,
  calendarStatus,
  pinnedItems,
  readThreadIds,
  signupItems,
}: MobileActivityBarProps) {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);
  const [hideOffset, setHideOffset] = useState(0);
  const overviewRef = useRef<HTMLElement | null>(null);
  const hasPinnedThreads = pinnedItems.length > 0;
  const hasUnreadPinnedThreads = pinnedItems.some((thread) => !readThreadIds.has(thread.id));
  const hasSignupActivities = signupItems.length > 0;
  const tabCount = Number(hasPinnedThreads) + Number(hasSignupActivities) + 1;

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 1023px)');
    let lastScrollY = Math.max(window.scrollY, 0);
    let currentOffset = 0;
    let frameId: number | null = null;

    function updateFromScroll() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (!mobileQuery.matches || currentScrollY === 0) {
        currentOffset = 0;
      } else if (delta > 0) {
        const barHeight = overviewRef.current?.offsetHeight ?? 46;
        currentOffset = Math.min(barHeight, currentOffset + delta);
        setExpandedPanel(null);
      } else if (delta < 0) {
        currentOffset = 0;
      }

      setHideOffset((previous) => previous === currentOffset ? previous : currentOffset);
      frameId = null;
    }

    function onScroll() {
      if (frameId === null) frameId = window.requestAnimationFrame(updateFromScroll);
    }

    function onViewportChange() {
      lastScrollY = Math.max(window.scrollY, 0);
      currentOffset = 0;
      setHideOffset(0);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    mobileQuery.addEventListener('change', onViewportChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      mobileQuery.removeEventListener('change', onViewportChange);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  function togglePanel(panel: Exclude<ExpandedPanel, null>) {
    setExpandedPanel((current) => current === panel ? null : panel);
  }

  return (
    <section
      className="mobile-overview-wrap lg:hidden"
      aria-label="首页活动速览"
      ref={overviewRef}
      style={{ transform: `translateY(-${hideOffset}px)` }}
    >
      <div className="mobile-overview-tabs" style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}>
        {hasPinnedThreads && (
          <button
            className={expandedPanel === 'pinned' ? 'mobile-overview-tab-active' : ''}
            type="button"
            aria-label={hasUnreadPinnedThreads ? '置顶，有新内容' : '置顶'}
            aria-expanded={expandedPanel === 'pinned'}
            aria-controls="mobile-pinned-panel"
            onClick={() => togglePanel('pinned')}
          >
            <span>
              <Pin size={15} />置顶
              {hasUnreadPinnedThreads && <strong className="mobile-overview-tab-new">新</strong>}
            </span>
            <ChevronDown size={15} className={expandedPanel === 'pinned' ? 'rotate-180' : ''} />
          </button>
        )}
        {hasSignupActivities && (
          <button
            className={expandedPanel === 'signup' ? 'mobile-overview-tab-active' : ''}
            type="button"
            aria-label={`报名，共 ${signupItems.length} 个项目`}
            aria-expanded={expandedPanel === 'signup'}
            aria-controls="mobile-signup-panel"
            onClick={() => togglePanel('signup')}
          >
            <span>
              <Bike size={15} />报名
              <strong className="mobile-overview-tab-count">{signupItems.length}</strong>
            </span>
            <ChevronDown size={15} className={expandedPanel === 'signup' ? 'rotate-180' : ''} />
          </button>
        )}
        <button
          className={expandedPanel === 'calendar' ? 'mobile-overview-tab-active' : ''}
          type="button"
          aria-expanded={expandedPanel === 'calendar'}
          aria-controls="mobile-calendar-panel"
          onClick={() => togglePanel('calendar')}
        >
          <span><CalendarDays size={15} />日历</span>
          <ChevronDown size={15} className={expandedPanel === 'calendar' ? 'rotate-180' : ''} />
        </button>
      </div>

      {hasPinnedThreads && expandedPanel === 'pinned' && (
        <div className="mobile-overview-panel" id="mobile-pinned-panel">
          <ul className="mobile-pinned-list">
            {pinnedItems.map((thread) => (
              <li key={thread.id}>
                <a href={getForumNavigationHref(thread.href, window.location.href)}>
                  {!readThreadIds.has(thread.id) && <span>新</span>}
                  <strong>{thread.title}</strong>
                  <ChevronRight size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSignupActivities && expandedPanel === 'signup' && (
        <div className="mobile-overview-panel" id="mobile-signup-panel">
          <ActivitySignupList className="mobile-signup-list" items={signupItems} />
        </div>
      )}

      {expandedPanel === 'calendar' && (
        <div className="mobile-overview-panel" id="mobile-calendar-panel">
          <ActivityCalendar
            compact
            error={calendarError}
            items={calendarItems}
            status={calendarStatus}
          />
        </div>
      )}
    </section>
  );
}
