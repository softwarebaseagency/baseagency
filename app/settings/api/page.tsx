"use client";

import { BrandButton } from "@/components/ui/brand-button";
import { BrandInput } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useLanguage } from "@/components/i18n/language-provider";
import { useState } from "react";

export default function ApiSettingsPage() {
  const { t } = useLanguage();
  const [source, setSource] = useState("website");
  const [message, setMessage] = useState("");
  const payload = JSON.stringify({ full_name: "Customer Name", phone: "+9647500000000", source }, null, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.apiIntegration")}
        title={t("settings.websiteCustomerImport")}
        description={t("settings.apiDescription")}
        actions={<BrandButton variant="accent" onClick={() => setMessage(t("settings.apiSettingsSaved"))}>{t("settings.saveApiSettings")}</BrandButton>}
      />
      {message ? <div className="rounded-lg border border-line bg-surface-card p-4 text-sm font-semibold text-ink-primary shadow-soft">{message}</div> : null}
      <div className="rounded-lg border border-line bg-surface-card p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <BrandInput label={t("settings.endpoint")} value="http://localhost:4040/api/customers/import" readOnly />
          <BrandInput label={t("settings.header")} value="x-api-key" readOnly />
          <BrandInput label={t("settings.environmentVariable")} value="BASE_AGENCY_API_KEY" readOnly />
          <BrandInput label={t("settings.allowedSource")} value={source} onChange={(event) => setSource(event.target.value)} />
        </div>
        <pre className="mt-4 overflow-auto rounded-md bg-brand-navy p-4 text-sm text-white">{payload}</pre>
        <BrandButton className="mt-4" onClick={() => navigator.clipboard.writeText(payload)}>{t("settings.copyExamplePayload")}</BrandButton>
      </div>
    </div>
  );
}
