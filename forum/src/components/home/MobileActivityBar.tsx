import { useState } from 'react';
import { Bike, CalendarDays, ChevronDown, ChevronRight, Pin } from 'lucide-react';
import { ActivityCalendar, ActivitySignupList } from './HomeAside';
import { pinnedThreads } from './homeData';

type ExpandedPanel = 'pinned' | 'signup' | 'calendar' | null;

export function MobileActivityBar() {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);

  function togglePanel(panel: Exclude<ExpandedPanel, null>) {
    setExpandedPanel((current) => current === panel ? null : panel);
  }

  return (
    <section className="mobile-overview-wrap lg:hidden" aria-label="首页置顶、活动报名与活动日历">
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
