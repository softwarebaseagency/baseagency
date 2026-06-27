import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  footer,
  accent = "line"
}: {
  label: string;
  value: number;
  footer?: ReactNode;
  accent?: "line" | "dot";
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-yellow" />
      {accent === "dot" ? (
        <div className="absolute end-5 top-5 h-3 w-3 rounded-full bg-brand-yellow" />
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </p>
      <p className="ltr-num mt-4 text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
        {formatCurrency(value)}
      </p>
      {footer ? <div className="mt-4 text-sm text-ink-muted">{footer}</div> : null}
    </Card>
  );
}
