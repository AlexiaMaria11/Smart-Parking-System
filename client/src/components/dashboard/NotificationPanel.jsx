export function NotificationPanel({ notifications }) {
  return (
    <div className="glass-panel p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Important notifications</p>
      <div className="mt-5 space-y-4">
        {notifications.map((item) => (
          <div key={item.title} className="rounded-3xl bg-white/70 p-4">
            <h4 className="font-semibold">{item.title}</h4>
            <p className="mt-2 text-sm text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
