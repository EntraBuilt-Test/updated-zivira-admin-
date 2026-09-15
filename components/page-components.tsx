export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 mb-6 border-b border-border-subtle">
      <div className="flex flex-col space-y-1">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">Platform</span>
            <span className="text-text-muted text-body-sm font-body-sm">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">{eyebrow}</span>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">{title}</h1>
        </div>
        <p className="font-body-sm text-body-sm text-text-secondary flex items-center gap-2">{description}</p>
      </div>
      {action && (
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
export function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <article className="card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-trend">{trend}</p>
    </article>
  );
}
export function StatusBadge({ status }: { status: string }) {
  const warning = ["PILOT", "SETUP", "DRAFT", "PENDING"].includes(status);
  return <span className={warning ? "badge badge-warning" : "badge"}>{status}</span>;
}
