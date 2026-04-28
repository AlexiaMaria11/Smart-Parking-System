import { InfoBadge } from "../common/InfoBadge";
import "./Dashboard.css";

export function ActivityFeed({ items }) {
  return (
    <div className="activity-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">Recent activity</p>
        <h3 className="panel-title">Latest reservations, entries and incidents</h3>
      </div>
      <div className="activity-list">
        {items.map((item) => (
          <div key={`${item.type}-${item.time}`} className="activity-item">
            <div>
              <p className="activity-type">{item.type}</p>
              <p className="activity-title">{item.title}</p>
            </div>
            <div className="activity-meta">
              <InfoBadge tone={item.status}>{item.status}</InfoBadge>
              <p className="activity-time">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
