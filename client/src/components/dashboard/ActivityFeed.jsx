import { InfoBadge } from "../common/InfoBadge";

export function ActivityFeed({ items }) {
  return (
    <div className="glass-panel p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Recent activity</p>
        <h3 className="mt-2 font-display text-2xl font-semibold">Latest reservations, entries and incidents</h3>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.type}-${item.time}`} className="flex items-start justify-between gap-4 rounded-3xl bg-white/70 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">{item.type}</p>
              <p className="mt-1 font-medium text-ink">{item.title}</p>
            </div>
            <div className="text-right">
              <InfoBadge tone={item.status}>{item.status}</InfoBadge>
              <p className="mt-2 text-xs text-muted">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
