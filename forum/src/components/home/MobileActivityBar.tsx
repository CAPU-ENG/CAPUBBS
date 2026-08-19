import { useState } from 'react';
import { CalendarDays, ChevronDown, Clock3, MapPin } from 'lucide-react';

const mobileActivities = [
  { date: '08.23', title: '周末轻骑', time: '08:30', place: '东门集合' },
  { date: '08.27', title: '夜骑安全训练', time: '19:00', place: '活动室门口' },
];

export function MobileActivityBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mobile-activity-wrap lg:hidden" aria-label="近期活动">
      <button
        className="mobile-activity-bar"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="mobile-activity-label"><CalendarDays size={15} />活动</span>
        <span className="mobile-activity-track">
          {mobileActivities.map((activity) => (
            <span key={activity.title}><strong>{activity.date}</strong> {activity.title}</span>
          ))}
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mobile-activity-panel">
          {mobileActivities.map((activity) => (
            <a href={`#activity-${activity.date}`} key={activity.title}>
              <div>
                <span>{activity.date}</span>
                <strong>{activity.title}</strong>
              </div>
              <p><Clock3 size={13} />{activity.time}<MapPin size={13} />{activity.place}</p>
            </a>
          ))}
          <a className="mobile-activity-all" href="#activity-calendar">查看完整活动日历</a>
        </div>
      )}
    </section>
  );
}
