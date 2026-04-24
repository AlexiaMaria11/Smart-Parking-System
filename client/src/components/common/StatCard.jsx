export function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{label}</p>
          <p className="mt-3 text-3xl font-display font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted">{trend}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush text-primary">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
