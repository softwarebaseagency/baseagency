"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandButton } from "@/components/ui/brand-button";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useCrm } from "@/components/crm/crm-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { translateTemplate } from "@/lib/i18n/format";
import { LanguageCode, languages } from "@/lib/i18n/translations";

function copyText(value: string) {
  navigator.clipboard.writeText(value);
}

function exportJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsClient() {
  const {
    data,
    updateSettings,
    updateSalesSection,
    addExpenseCategory,
    deleteExpenseCategory,
    resetDemoData
  } = useCrm();
  const { language, setLanguage, t } = useLanguage();
  const [companyName, setCompanyName] = useState(data.settings.companyName);
  const [currency, setCurrency] = useState(data.settings.currency);
  const [dateFormat, setDateFormat] = useState(data.settings.dateFormat);
  const [timezone, setTimezone] = useState(data.settings.timezone);
  const [newCategory, setNewCategory] = useState("");
  const [notice, setNotice] = useState("");

  const saveGeneral = () => {
    updateSettings({ companyName, currency, dateFormat, timezone });
    setNotice(t("settings.generalSaved"));
  };

  const toggleLanguage = (code: LanguageCode) => {
    const enabled = data.settings.enabledLanguages.includes(code)
      ? data.settings.enabledLanguages.filter((item) => item !== code)
      : [...data.settings.enabledLanguages, code];
    updateSettings({ enabledLanguages: enabled });
  };

  const examplePayload = JSON.stringify(
    {
      full_name: "Customer Name",
      phone: "+9647500000000",
      email: "customer@example.com",
      source: "website",
      service_interest: "Website Development"
    },
    null,
    2
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
        actions={
          <>
            <Link className="focus-brand inline-flex min-h-10 items-center justify-center rounded-md border border-brand-yellow bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy shadow-yellow" href="/admin/attendance">
              ZKT Dashboard
            </Link>
            <Link className="focus-brand inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-surface-card px-4 py-2 text-sm font-semibold text-ink-primary" href="/admin/attendance/debug">
              ZKT Debug
            </Link>
          </>
        }
      />
      {notice ? <Card><p className="font-semibold text-ink-primary">{notice}</p></Card> : null}

      <BrandTabs
        tabs={[
          {
            id: "general",
            label: t("settings.general"),
            content: (
              <Card>
                <CardTitle>{t("settings.general")}</CardTitle>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <BrandInput label={t("settings.companyName")} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
                  <BrandInput label={t("settings.defaultCurrency")} value={currency} onChange={(event) => setCurrency(event.target.value)} />
                  <BrandInput label={t("settings.dateFormat")} value={dateFormat} onChange={(event) => setDateFormat(event.target.value)} />
                  <BrandInput label={t("settings.timezone")} value={timezone} onChange={(event) => setTimezone(event.target.value)} />
                </div>
                <div className="mt-5"><BrandButton variant="accent" onClick={saveGeneral}>{t("settings.saveGeneral")}</BrandButton></div>
              </Card>
            )
          },
          {
            id: "language",
            label: t("settings.language"),
            content: (
              <Card>
                <CardTitle>{t("settings.language")}</CardTitle>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(Object.keys(languages) as LanguageCode[]).map((code) => (
                    <div className="rounded-md border border-line p-4" key={code}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-primary">{languages[code].label}</p>
                          <p className="text-sm text-ink-muted">{t("settings.direction")}: {languages[code].direction.toUpperCase()}</p>
                        </div>
                        <BrandButton variant={language === code ? "accent" : "secondary"} onClick={() => setLanguage(code)}>
                          {t("action.use")}
                        </BrandButton>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-primary">
                        <input checked={data.settings.enabledLanguages.includes(code)} onChange={() => toggleLanguage(code)} type="checkbox" />
                        {t("settings.enabled")}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )
          },
          {
            id: "appearance",
            label: t("settings.appearance"),
            content: (
              <Card>
                <CardTitle>{t("settings.appearance")}</CardTitle>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["customCursor", t("settings.enableCustomCursor")],
                    ["animations", t("settings.enableAnimations")],
                    ["compactMode", t("settings.compactMode")]
                  ].map(([key, label]) => (
                    <label className="flex items-center justify-between rounded-md border border-line p-4 text-sm font-semibold text-ink-primary" key={key}>
                      {label}
                      <input
                        checked={Boolean(data.settings[key as "customCursor" | "animations" | "compactMode"])}
                        onChange={(event) => updateSettings({ [key]: event.target.checked })}
                        type="checkbox"
                      />
                    </label>
                  ))}
                  <BrandSelect label={t("settings.sidebarStyle")} value={data.settings.sidebarStyle} onChange={(event) => updateSettings({ sidebarStyle: event.target.value as "navy" | "light" })}>
                    <option value="navy">{t("settings.navy")}</option>
                    <option value="light">{t("settings.light")}</option>
                  </BrandSelect>
                </div>
              </Card>
            )
          },
          {
            id: "brand",
            label: t("settings.brand"),
            content: (
              <Card>
                <CardTitle>{t("settings.brand")}</CardTitle>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    [t("settings.navy"), "#0d2445"],
                    [t("settings.yellow"), "#ffcd05"],
                    [t("settings.lightNeutral"), "#fafafa"]
                  ].map(([name, color]) => (
                    <div className="rounded-md border border-line p-4" key={name}>
                      <div className="h-16 rounded-md border border-line" style={{ background: color }} />
                      <p className="mt-3 font-semibold text-ink-primary">{name}</p>
                      <p className="text-sm text-ink-muted">{color}</p>
                    </div>
                  ))}
                </div>
                <BrandButton className="mt-5" variant="secondary" onClick={() => setNotice(t("settings.brandDefaultsActive"))}>
                  {t("settings.resetBrand")}
                </BrandButton>
              </Card>
            )
          },
          {
            id: "sections",
            label: t("settings.salesSections"),
            content: (
              <DataTable
                headers={[t("settings.order"), t("table.section"), t("table.status")]}
                rowActions={(index) => {
                  const section = data.salesSections[index];
                  return (
                    <BrandButton
                      variant="secondary"
                      onClick={() => updateSalesSection(section.id, { isActive: !section.isActive })}
                    >
                      {section.isActive ? t("action.disable") : t("action.enable")}
                    </BrandButton>
                  );
                }}
                rows={data.salesSections.map((section) => [section.sortOrder, section.name, section.isActive ? t("status.enabled") : t("status.disabled")])}
                title={t("settings.salesSections")}
              />
            )
          },
          {
            id: "categories",
            label: t("settings.expenseCategories"),
            content: (
              <Card>
                <CardTitle>{t("settings.expenseCategories")}</CardTitle>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <BrandInput label={t("settings.newCategory")} value={newCategory} onChange={(event) => setNewCategory(event.target.value)} />
                  <div className="flex items-end">
                    <BrandButton variant="accent" onClick={() => { if (newCategory.trim()) { addExpenseCategory(newCategory.trim()); setNewCategory(""); } }}>{t("settings.addCategory")}</BrandButton>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.expenseCategories.map((category) => (
                    <button className="focus-brand rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink-primary" key={category} onClick={() => confirm(translateTemplate(t, "settings.deleteCategoryConfirm", { category })) && deleteExpenseCategory(category)} type="button">
                      {category} ×
                    </button>
                  ))}
                </div>
              </Card>
            )
          },
          {
            id: "api",
            label: t("settings.apiIntegration"),
            content: (
              <div className="space-y-4">
                <Card>
                  <CardTitle>ZKTeco Attendance</CardTitle>
                  <p className="mt-2 text-sm text-ink-muted">Open the real SpeedFace V5L dashboard or debug logs. The local bridge uses port 8081.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="focus-brand inline-flex min-h-10 items-center justify-center rounded-md border border-brand-yellow bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy shadow-yellow" href="/admin/attendance">
                      Open ZKT Dashboard
                    </Link>
                    <Link className="focus-brand inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-surface-card px-4 py-2 text-sm font-semibold text-ink-primary" href="/admin/attendance/debug">
                      Open ZKT Debug
                    </Link>
                  </div>
                </Card>
                <Card>
                  <CardTitle>{t("settings.customerImportApi")}</CardTitle>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <BrandInput label={t("settings.endpoint")} readOnly value="POST http://localhost:4040/api/customers/import" />
                    <BrandInput label={t("settings.requiredHeader")} readOnly value="x-api-key" />
                  </div>
                  <pre className="mt-4 overflow-auto rounded-md bg-brand-navy p-4 text-sm text-white">{examplePayload}</pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <BrandButton onClick={() => copyText(examplePayload)}>{t("settings.copyExamplePayload")}</BrandButton>
                    <BrandButton variant="secondary" onClick={() => setNotice(t("settings.apiKeyNote"))}>{t("settings.showApiKeyNote")}</BrandButton>
                  </div>
                </Card>
              </div>
            )
          },
          {
            id: "users",
            label: t("settings.usersPermissions"),
            content: (
              <DataTable
                headers={[t("settings.role"), t("nav.customers"), t("nav.sales"), t("nav.expenses"), t("nav.settings")]}
                rows={[
                  [t("header.admin"), t("settings.full"), t("settings.full"), t("settings.full"), t("settings.full")],
                  [t("settings.manager"), t("settings.full"), t("settings.full"), t("settings.viewEdit"), t("settings.view")],
                  [t("settings.accountant"), t("settings.view"), t("settings.view"), t("settings.full"), t("settings.none")]
                ]}
                title={t("settings.permissionsMatrix")}
              />
            )
          },
          {
            id: "backup",
            label: t("settings.backupExport"),
            content: (
              <Card>
                <CardTitle>{t("settings.backupExport")}</CardTitle>
                <p className="mt-2 text-sm text-ink-muted">{t("settings.backupNotice")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <BrandButton variant="accent" onClick={() => exportJson("base-agency-demo-data.json", data)}>{t("settings.exportDemoData")}</BrandButton>
                  <BrandButton onClick={() => exportJson("base-agency-reports.json", { sales: data.sales, expenses: data.expenses })}>{t("settings.exportReports")}</BrandButton>
                  <BrandButton variant="secondary" onClick={() => confirm(t("settings.resetDemoConfirm")) && resetDemoData()}>{t("settings.resetDemoData")}</BrandButton>
                </div>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
