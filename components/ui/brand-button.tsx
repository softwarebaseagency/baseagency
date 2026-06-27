import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border-brand-navy bg-brand-navy text-white shadow-soft hover:-translate-y-0.5 hover:border-brand-yellow hover:shadow-[0_0_0_1px_#ffcd05,0_12px_28px_rgba(255,205,5,0.18)] dark:border-brand-yellow/20 dark:bg-brand-navy dark:text-white dark:hover:border-brand-yellow dark:hover:shadow-[0_0_0_1px_#ffcd05,0_12px_28px_rgba(255,205,5,0.22)]",
  secondary:
    "border-line bg-surface-card text-ink-primary hover:-translate-y-0.5 hover:bg-surface-muted dark:border-line dark:bg-surface-card dark:text-ink-primary dark:hover:bg-white/5",
  accent:
    "border-brand-yellow bg-brand-yellow text-brand-navy shadow-yellow hover:-translate-y-0.5 hover:brightness-105 dark:text-brand-navy",
  ghost:
    "border-transparent bg-transparent text-ink-primary hover:-translate-y-0.5 hover:border-line hover:bg-surface-muted dark:text-ink-primary dark:hover:bg-white/5",
  danger:
    "border-rose-600 bg-rose-600 text-white shadow-soft hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_0_0_1px_rgba(244,63,94,0.35)] dark:border-rose-500 dark:bg-rose-500 dark:hover:border-rose-300"
};

export function BrandButton({
  children,
  className,
  variant = "primary",
  type = "button",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={cn(
        "focus-brand inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        className
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
