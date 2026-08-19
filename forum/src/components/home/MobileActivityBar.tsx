import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Clock3, MapPin, Pin } from 'lucide-react';
import { activities, pinnedThreads } from './homeData';

type ExpandedPanel = 'pinned' | 'activities' | null;

export function MobileActivityBar() {
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);

  function togglePanel(panel: Exclude<ExpandedPanel, null>) {
    setExpandedPanel((current) => current === panel ? null : panel);
  }

  return (
    <section className="mobile-overview-wrap lg:hidden" aria-label="首页置顶与活动">
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
          className={expandedPanel === 'activities' ? 'mobile-overview-tab-active' : ''}
          type="button"
          aria-expanded={expandedPanel === 'activities'}
          aria-controls="mobile-activities-panel"
          onClick={() => togglePanel('activities')}
        >
          <span><CalendarDays size={15} />活动</span>
          <ChevronDown size={15} className={expandedPanel === 'activities' ? 'rotate-180' : ''} />
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

      {expandedPanel === 'activities' && (
        <div className="mobile-overview-panel" id="mobile-activities-panel">
          <div className="mobile-activity-list">
            {activities.map((activity) => (
              <a href={`#activity-${activity.date}`} key={activity.title}>
                <div>
                  <span>{activity.date.slice(5).replace('-', '.')}</span>
                  <strong>{activity.title}</strong>
                </div>
                <p><Clock3 size={13} />{activity.time}<MapPin size={13} />{activity.place}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
