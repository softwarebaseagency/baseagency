import { cn } from "@/lib/utils";

const tones = {
  default: "bg-surface-muted text-ink-primary ring-line",
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  warning: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  danger: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
  info: "bg-brand-50 text-brand-navy ring-brand-100 dark:bg-brand-surface dark:text-white dark:ring-white/10",
  accent: "bg-brand-yellow text-brand-navy ring-brand-yellow"
};

export function Badge({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
