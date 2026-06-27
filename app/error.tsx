"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-rose-200 bg-surface-card p-6 shadow-soft dark:border-rose-900">
      <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">Something went wrong</h2>
      <p className="mt-2 text-sm text-ink-muted">{error.message}</p>
      <button
        className="focus-brand mt-4 rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
