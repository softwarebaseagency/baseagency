"use client";

import { ReactNode } from "react";
import { MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/components/i18n/language-provider";

export function DataTable({
  headers,
  rows,
  emptyMessage,
  title,
  searchValue,
  onSearch,
  onFilter,
  onReset,
  onExport,
  rowActions,
  searchPlaceholder,
  filterLabel,
  resetLabel,
  exportLabel,
  actionsLabel
}: {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
  title?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  rowActions?: (index: number) => ReactNode;
  searchPlaceholder?: string;
  filterLabel?: string;
  resetLabel?: string;
  exportLabel?: string;
  actionsLabel?: string;
}) {
  const { t } = useLanguage();
  const resolvedEmptyMessage = emptyMessage ?? t("table.noRecords");
  const resolvedTitle = title ?? t("table.records");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("table.search");
  const resolvedFilterLabel = filterLabel ?? t("table.filter");
  const resolvedResetLabel = resetLabel ?? t("table.reset");
  const resolvedExportLabel = exportLabel ?? t("table.export");
  const resolvedActionsLabel = actionsLabel ?? t("table.actions");

  const hasToolbar = onSearch || onFilter || onReset || onExport;
  const hasActions = Boolean(rowActions);

  return (
    <div
      className="min-w-0 max-w-full overflow-hidden rounded-lg border border-line bg-surface-card shadow-soft"
      data-brand-card=""
      data-scroll-reveal=""
    >
      <div className="flex flex-col gap-3 border-b border-line bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {resolvedTitle}
          </p>
        </div>
        {hasToolbar ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            {onSearch ? (
              <label className="flex h-10 items-center gap-2 rounded-md border border-line bg-surface-muted px-3 text-sm text-ink-muted">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  className="w-full bg-transparent text-ink-primary placeholder:text-ink-muted focus:outline-none"
                  dir="auto"
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder={resolvedSearchPlaceholder}
                  value={searchValue}
                />
              </label>
            ) : null}
            {onFilter ? (
              <button
                className="focus-brand inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface-card px-3 text-sm font-semibold text-ink-primary transition hover:-translate-y-0.5 hover:bg-surface-muted"
                onClick={onFilter}
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                {resolvedFilterLabel}
              </button>
            ) : null}
            {onReset ? (
              <button
                className="focus-brand inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface-card px-3 text-sm font-semibold text-ink-primary transition hover:-translate-y-0.5 hover:bg-surface-muted"
                onClick={onReset}
                type="button"
              >
                {resolvedResetLabel}
              </button>
            ) : null}
            {onExport ? (
              <button
                className="focus-brand inline-flex h-10 items-center justify-center rounded-md border border-brand-yellow bg-brand-yellow px-3 text-sm font-semibold text-brand-navy transition hover:-translate-y-0.5"
                onClick={onExport}
                type="button"
              >
                {resolvedExportLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[720px] text-start text-sm">
          <thead className="sticky top-0 bg-surface-muted text-xs uppercase tracking-[0.16em] text-ink-muted">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
              {hasActions ? (
                <th className="px-4 py-3 text-end font-semibold">{resolvedActionsLabel}</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length ? (
              rows.map((row, index) => (
                <tr
                  key={index}
                  className="text-ink-muted transition hover:bg-surface-muted/80"
                  data-scroll-reveal=""
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 align-middle">
                      {cell}
                    </td>
                  ))}
                  {hasActions ? (
                    <td className="px-4 py-3 text-end">
                      {rowActions?.(index) ?? (
                        <MoreHorizontal className="ms-auto h-4 w-4 text-ink-muted" />
                      )}
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10" colSpan={headers.length + (hasActions ? 1 : 0)}>
                  <EmptyState
                    description={t("empty.adjustFilters")}
                    title={resolvedEmptyMessage}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
