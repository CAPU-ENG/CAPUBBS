import { useEffect, useRef, useState } from 'react';
import { Bike, CalendarDays, ChevronDown, ChevronRight, Pin } from 'lucide-react';
import { ActivityCalendar, ActivitySignupList } from './HomeAside';
import { pinnedThreads } from './homeData';

type ExpandedPanel = 'pinned' | 'signup' | 'calendar' | null;

export function MobileActivityBar() {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);
  const [hideOffset, setHideOffset] = useState(0);
  const overviewRef = useRef<HTMLElement | null>(null);

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
      aria-label="首页置顶、活动报名与活动日历"
      ref={overviewRef}
      style={{ transform: `translateY(-${hideOffset}px)` }}
    >
      <div className="mobile-overview-tabs">
        <button
          className={expandedPanel === 'pinned' ? 'mobile-overview-tab-active' : ''}
          type="button"
          aria-expanded={expandedPanel === 'pinned'}
          aria-controls="mobile-pinned-panel"
          onClick={() => togglePanel('pinned')}
        >
          <span><Pin size={15} />置顶</span>
          <ChevronDown size={15} className={expandedPanel === 'pinned' ? 'rotate-180' : ''} />
        </button>
        <button
          className={expandedPanel === 'signup' ? 'mobile-overview-tab-active' : ''}
          type="button"
          aria-expanded={expandedPanel === 'signup'}
          aria-controls="mobile-signup-panel"
          onClick={() => togglePanel('signup')}
        >
          <span><Bike size={15} />报名</span>
          <ChevronDown size={15} className={expandedPanel === 'signup' ? 'rotate-180' : ''} />
        </button>
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

      {expandedPanel === 'pinned' && (
        <div className="mobile-overview-panel" id="mobile-pinned-panel">
          <ul className="mobile-pinned-list">
            {pinnedThreads.map((thread, index) => (
              <li key={thread}>
                <a href={`#pinned-${index}`}>
                  {index < 2 && <span>新</span>}
                  <strong>{thread}</strong>
                  <ChevronRight size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {expandedPanel === 'signup' && (
        <div className="mobile-overview-panel" id="mobile-signup-panel">
          <ActivitySignupList className="mobile-signup-list" />
        </div>
      )}

      {expandedPanel === 'calendar' && (
        <div className="mobile-overview-panel" id="mobile-calendar-panel">
          <ActivityCalendar compact />
        </div>
      )}
    </section>
  );
}
