"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Banknote,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Fingerprint,
  LayoutDashboard,
  Menu,
  Network,
  PackageCheck,
  Settings,
  Target,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/language-provider";

type SidebarItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

const items: SidebarItem[] = [
  { href: "/ceo-dashboard", labelKey: "nav.ceoDashboard", icon: LayoutDashboard },
  { href: "/admin/attendance", labelKey: "nav.zktecoAttendance", icon: Fingerprint },
  { href: "/management", labelKey: "nav.management", icon: BriefcaseBusiness },
  { href: "/sales", labelKey: "nav.salesCrm", icon: Network },
  { href: "/client-outreach", labelKey: "nav.clientOutreach", icon: Target },
  { href: "/finance", labelKey: "nav.finance", icon: Banknote },
  { href: "/commercial-documents", labelKey: "nav.commercialDocuments", icon: FileCheck2 },
  { href: "/hr", labelKey: "nav.hrAttendance", icon: Users },
  { href: "/operations", labelKey: "nav.operationsProjects", icon: BriefcaseBusiness },
  { href: "/service-packages", labelKey: "nav.servicePackages", icon: PackageCheck },
  { href: "/reports", labelKey: "nav.reportsKpis", icon: BarChart3 },
  { href: "/approvals-decisions", labelKey: "nav.approvalsDecisions", icon: ClipboardCheck },
  { href: "/document-control", labelKey: "nav.documentControl", icon: FileText },
  { href: "/settings", labelKey: "nav.settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="focus-brand fixed bottom-5 end-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow text-brand-navy shadow-yellow md:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside className="fixed inset-y-0 start-0 z-20 hidden w-64 border-e border-white/10 bg-brand-navy px-4 py-6 text-white shadow-lift md:block">
        <SidebarContent items={items} pathname={pathname} />
      </aside>
      {isOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-brand-navy/45 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <aside className="absolute inset-y-0 start-0 w-72 animate-drawer-in border-e border-white/10 bg-brand-navy px-4 py-6 text-white shadow-lift">
            <button
              className="focus-brand absolute end-4 top-4 rounded-md border border-white/15 p-2 text-white"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent items={items} pathname={pathname} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function LogoLockup() {
  return (
    <div className="px-2">
      <div className="text-3xl font-semibold leading-none tracking-[-0.06em] text-white" dir="ltr">
        BASE<span className="inline-block align-baseline tracking-normal text-brand-yellow">.</span>
        <span className="font-light tracking-[-0.04em]">AGY</span>
      </div>
    </div>
  );
}

function SidebarContent({
  items,
  pathname
}: {
  items: SidebarItem[];
  pathname: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col">
      <LogoLockup />
      <nav className="mt-10 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pe-1">
        {items.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "group relative flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/68 transition duration-200 hover:bg-white/8 hover:text-white",
                isActive && "bg-white/10 text-white"
              )}
              title={t(item.labelKey)}
            >
              <span
                className={cn(
                  "absolute start-0 h-7 w-1 rounded-e-full bg-transparent transition",
                  isActive && "bg-brand-yellow"
                )}
              />
              <Icon className="h-5 w-5 shrink-0" />
              <span>{t(item.labelKey)}</span>
              {isActive ? (
                <span className="ms-auto h-2 w-2 rounded-full bg-brand-yellow" />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t("sidebar.brandSystem")}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/75">{t("sidebar.brandDescription")}</p>
      </div>
    </div>
  );
}
