import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-line bg-surface-card p-5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
      data-brand-card=""
      data-scroll-reveal=""
    >
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold tracking-tight text-ink-primary">{children}</h2>;
}
