export function ReportCard({ report }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{report.title}</p>
      <p className="mt-4 font-display text-3xl font-semibold">{report.value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{report.description}</p>
    </div>
  );
}
