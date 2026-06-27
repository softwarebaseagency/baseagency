import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function BrandInput({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink-primary">
      {label}
      <input
        className={cn(
          "focus-brand h-11 rounded-md border border-line bg-surface-card px-3 text-sm font-medium text-ink-primary placeholder:text-ink-muted",
          className
        )}
        dir="auto"
        {...props}
      />
    </label>
  );
}

export function BrandSelect({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink-primary">
      {label}
      <select
        className={cn(
          "focus-brand h-11 rounded-md border border-line bg-surface-card px-3 text-sm font-medium text-ink-primary",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function BrandTextarea({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink-primary">
      {label}
      <textarea
        className={cn(
          "focus-brand min-h-28 rounded-md border border-line bg-surface-card px-3 py-3 text-sm font-medium text-ink-primary placeholder:text-ink-muted",
          className
        )}
        dir="auto"
        {...props}
      />
    </label>
  );
}
