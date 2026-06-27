"use client";

import { ReactNode } from "react";
import { useState } from "react";
import {
  CreditCard,
  Bell,
  CalendarDays,
  Moon,
  Search,
  Sun
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { useLanguage } from "@/components/i18n/language-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { languages, LanguageCode } from "@/lib/i18n/translations";

export function AppShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState("");
  const runSearch = () => {
    if (globalSearch.trim()) {
      window.location.href = `/customers?search=${encodeURIComponent(globalSearch.trim())}`;
    }
  };

  return (
    <div className="app-root min-h-[100dvh] bg-surface-page text-ink-body">
      <Sidebar />
      <main className="app-main min-h-[100dvh] min-w-0 pb-10 md:ps-72">
        <header className="sticky top-0 z-10 border-b border-line bg-surface-header px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 shrink">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-muted">
                {t("app.platform")}
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-primary">
                {t("app.title")}
              </h1>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 lg:justify-end">
              <label className="hidden h-10 items-center gap-2 rounded-md border border-line bg-surface-muted px-3 text-sm text-ink-muted md:flex">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  className="w-52 bg-transparent text-ink-primary placeholder:text-ink-muted focus:outline-none"
                  dir="auto"
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runSearch();
                  }}
                  placeholder={t("action.search")}
                  value={globalSearch}
                />
              </label>
              <div className="flex max-w-full flex-wrap gap-1 rounded-md border border-line bg-surface-card p-1">
                {(Object.keys(languages) as LanguageCode[]).map((code) => (
                  <button
                    className={`focus-brand shrink-0 rounded px-2 py-1.5 text-xs font-semibold transition ${
                      language === code
                        ? "bg-brand-yellow text-brand-navy"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                    key={code}
                    onClick={() => setLanguage(code)}
                    title={languages[code].label}
                    type="button"
                  >
                    {languages[code].label}
                  </button>
                ))}
              </div>
              <button
                className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface-card px-3 text-sm font-semibold text-ink-primary transition hover:bg-surface-muted"
                onClick={toggleTheme}
                type="button"
              >
                {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                {isDark ? t("theme.whiteMode") : t("theme.darkMode")}
              </button>
              <button
                className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface-card px-3 text-sm font-semibold text-ink-primary transition hover:bg-surface-muted"
                onClick={() => alert(t("header.dateNotice"))}
                type="button"
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                {t("header.currentMonth")}
              </button>
              <button
                className="focus-brand inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-card text-ink-primary transition hover:bg-surface-muted"
                onClick={() => alert(t("header.noNotifications"))}
                type="button"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex h-10 items-center gap-2 rounded-md border border-line bg-surface-card px-3 text-sm font-semibold text-ink-primary">
                <span className="h-2 w-2 rounded-full bg-brand-yellow" />
                {t("header.admin")}
              </div>
              <div className="hidden items-center gap-2 rounded-md border border-line bg-surface-muted px-3 py-2 text-sm text-ink-muted xl:flex">
                <CreditCard className="h-4 w-4 shrink-0" />
                {t("header.stack")}
              </div>
            </div>
          </div>
        </header>
        <div className="page-content mx-auto min-w-0 max-w-7xl px-4 py-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
