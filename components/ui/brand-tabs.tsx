"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type BrandTab = {
  id: string;
  label: string;
  content?: React.ReactNode;
};

export function BrandTabs({
  tabs,
  defaultValue
}: {
  tabs: BrandTab[];
  defaultValue?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === active);

  return (
    <div className="min-w-0 max-w-full">
      <div className="inline-flex max-w-full gap-1 overflow-x-auto overscroll-x-contain rounded-lg border border-line bg-surface-card p-1 shadow-soft">
        {tabs.map((tab) => {
          const isActive = tab.id === active;

          return (
            <button
              key={tab.id}
              className={cn(
                "focus-brand relative min-h-10 whitespace-nowrap rounded-md px-4 text-sm font-semibold text-ink-muted transition",
                isActive && "bg-surface-muted text-ink-primary"
              )}
              data-brand-tab=""
              onClick={() => setActive(tab.id)}
              role="tab"
              type="button"
            >
              {isActive ? (
                <span className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-brand-yellow" />
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab?.content ? (
        <div className="mt-4 animate-fade-up">{activeTab.content}</div>
      ) : null}
    </div>
  );
}
