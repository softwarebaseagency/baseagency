import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="brand-surface rounded-lg border border-dashed border-line bg-surface-card p-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-brand-yellow shadow-yellow" />
      <h3 className="text-lg font-semibold text-ink-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
