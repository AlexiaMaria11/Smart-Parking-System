export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
