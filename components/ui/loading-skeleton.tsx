import { Card } from "@/components/ui/card";

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <div className="relative h-4 w-28 overflow-hidden rounded bg-surface-muted">
            <div className="absolute inset-y-0 -start-full w-full animate-shimmer bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent" />
          </div>
          <div className="relative mt-4 h-8 w-36 overflow-hidden rounded bg-surface-muted">
            <div className="absolute inset-y-0 -start-full w-full animate-shimmer bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent" />
          </div>
        </Card>
      ))}
    </div>
  );
}
