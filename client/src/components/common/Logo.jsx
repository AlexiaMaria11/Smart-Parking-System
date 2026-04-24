export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-soft">
        P
      </div>
      <div>
        <p className="font-display text-lg font-semibold leading-none">Park</p>
        <p className="text-sm text-muted">Smart System</p>
      </div>
    </div>
  );
}
