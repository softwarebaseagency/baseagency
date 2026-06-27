"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { BrandButton } from "@/components/ui/brand-button";
import { useLanguage } from "@/components/i18n/language-provider";

export function BrandDrawer({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className="animate-drawer-in rounded-lg border border-line bg-surface-card p-5 shadow-lift"
      data-brand-card=""
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-primary">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
        <button
          className="focus-brand rounded-md border border-line p-2 text-ink-primary"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </aside>
  );
}

export function BrandModal({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  const { t } = useLanguage();
  return (
    <div
      className="rounded-lg border border-line bg-surface-card p-5 shadow-lift"
      data-brand-card=""
    >
      <h2 className="text-lg font-semibold text-ink-primary">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <BrandButton variant="secondary">{t("action.cancel")}</BrandButton>
        <BrandButton variant="accent">{t("action.confirm")}</BrandButton>
      </div>
    </div>
  );
}
