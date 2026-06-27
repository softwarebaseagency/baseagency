"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useCrm } from "@/components/crm/crm-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { translateStatus } from "@/lib/i18n/format";
import { formatDate } from "@/lib/utils";

export function DashboardClient() {
  const { data } = useCrm();
  const { t } = useLanguage();
  const [attendanceSummary, setAttendanceSummary] = useState<{
    todayCheckIns: number;
    latestSyncTime: string | null;
    deviceStatus: string;
  } | null>(null);
  const customerName = (id: string) => data.customers.find((customer) => customer.id === id)?.fullName ?? t("label.unknown");
  const sectionName = (id: string) => data.salesSections.find((section) => section.id === id)?.name ?? t("label.unknown");

  const stats = useMemo(() => {
    const monthlyRevenue = data.sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
    const monthlyExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const unpaidBalances = data.sales.reduce((sum, sale) => sum + Math.max(sale.remainingAmount, 0), 0);
    return {
      monthlyRevenue,
      monthlyExpenses,
      netProfit: monthlyRevenue - monthlyExpenses,
      unpaidBalances
    };
  }, [data.expenses, data.sales]);

  const salesBySection = data.salesSections.map((section) => ({
    section: section.name,
    total: data.sales.filter((sale) => sale.sectionId === section.id).reduce((sum, sale) => sum + sale.finalTotal, 0)
  }));
  const maxSection = Math.max(...salesBySection.map((item) => item.total), 1);

  useEffect(() => {
    fetch("/api/zkteco/attendance")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setAttendanceSummary(payload?.summary ?? null))
      .catch(() => setAttendanceSummary(null));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t("dashboard.monthlyRevenue")} value={stats.monthlyRevenue} footer={<Badge tone="positive">{t("dashboard.thisMonth")}</Badge>} />
        <MetricCard label={t("dashboard.monthlyExpenses")} value={stats.monthlyExpenses} footer={<Badge tone="warning">{t("dashboard.thisMonth")}</Badge>} />
        <MetricCard label={t("dashboard.netProfit")} value={stats.netProfit} footer={<Badge tone={stats.netProfit >= 0 ? "positive" : "danger"}>{t("dashboard.calculated")}</Badge>} />
        <MetricCard label={t("dashboard.unpaidBalances")} value={stats.unpaidBalances} footer={<Badge tone="danger">{t("dashboard.open")}</Badge>} />
      </div>

      {attendanceSummary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("dashboard.attendanceToday")}</p>
            <p className="ltr-num mt-2 text-2xl font-semibold text-ink-primary">{attendanceSummary.todayCheckIns}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("dashboard.latestAttendanceSync")}</p>
            <p className="mt-2 text-sm font-semibold text-ink-primary">
              {attendanceSummary.latestSyncTime ? formatDate(attendanceSummary.latestSyncTime) : "-"}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("dashboard.attendanceDevice")}</p>
            <div className="mt-2">
              <Badge tone={attendanceSummary.deviceStatus === "ONLINE" ? "positive" : "warning"}>
                {attendanceSummary.deviceStatus.replace(/_/g, " ").toLowerCase()}
              </Badge>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardTitle>{t("dashboard.recentSales")}</CardTitle>
            <Badge tone="info">{t("dashboard.live")}</Badge>
          </div>
          <DataTable
            headers={[t("table.customer"), t("table.section"), t("table.service"), t("table.status"), t("table.total"), t("table.paid")]}
            rows={data.sales.slice(0, 5).map((sale) => [
              customerName(sale.customerId),
              sectionName(sale.sectionId),
              sale.serviceTitle,
              <Badge key={sale.status}>{translateStatus(t, sale.status)}</Badge>,
              <CurrencyDisplay key={`${sale.id}-total`} value={sale.finalTotal} />,
              <CurrencyDisplay key={`${sale.id}-paid`} value={sale.paidAmount} />
            ])}
            title={t("dashboard.recentSales")}
          />
        </Card>
        <Card>
          <CardTitle>{t("dashboard.salesBySection")}</CardTitle>
          <div className="mt-5 space-y-4">
            {salesBySection.map((item) => (
              <div key={item.section}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-ink-primary">{item.section}</span>
                  <span className="text-ink-muted"><CurrencyDisplay value={item.total} /></span>
                </div>
                <div className="h-2 rounded-full bg-surface-muted">
                  <div className="h-2 rounded-full bg-brand-yellow" style={{ width: `${(item.total / maxSection) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle>{t("dashboard.recentExpenses")}</CardTitle>
          <Badge tone="warning">{t("dashboard.review")}</Badge>
        </div>
        <DataTable
          headers={[t("table.title"), t("table.category"), t("table.amount"), t("table.date"), t("table.paymentStatus")]}
          rows={data.expenses.slice(0, 5).map((expense) => [
            expense.title,
            expense.category,
            <CurrencyDisplay key={`${expense.id}-amount`} value={expense.amount} />,
            formatDate(expense.date),
            <Badge key={expense.paymentStatus} tone={expense.paymentStatus === "PAID" ? "positive" : "warning"}>{translateStatus(t, expense.paymentStatus)}</Badge>
          ])}
          title={t("dashboard.recentExpenses")}
        />
      </Card>
    </div>
  );
}
