"use client";

import { useMemo, useState } from "react";
import { BrandButton } from "@/components/ui/brand-button";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useCrm } from "@/components/crm/crm-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export function ReportsClient() {
  const { data } = useCrm();
  const { t } = useLanguage();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("ALL");
  const [sectionId, setSectionId] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const filteredSales = useMemo(
    () =>
      data.sales.filter((sale) => {
        const matchesFrom = !fromDate || sale.createdAt >= fromDate;
        const matchesTo = !toDate || sale.createdAt <= toDate;
        const matchesCustomer = customerId === "ALL" || sale.customerId === customerId;
        const matchesSection = sectionId === "ALL" || sale.sectionId === sectionId;
        const matchesPayment = paymentStatus === "ALL" || sale.paymentStatus === paymentStatus;
        return matchesFrom && matchesTo && matchesCustomer && matchesSection && matchesPayment;
      }),
    [customerId, data.sales, fromDate, paymentStatus, sectionId, toDate]
  );

  const filteredExpenses = useMemo(
    () =>
      data.expenses.filter((expense) => {
        const matchesFrom = !fromDate || expense.date >= fromDate;
        const matchesTo = !toDate || expense.date <= toDate;
        const matchesCategory = category === "ALL" || expense.category === category;
        const matchesPayment = paymentStatus === "ALL" || expense.paymentStatus === paymentStatus;
        return matchesFrom && matchesTo && matchesCategory && matchesPayment;
      }),
    [category, data.expenses, fromDate, paymentStatus, toDate]
  );

  const revenue = filteredSales.reduce((sum, sale) => sum + sale.finalTotal, 0);
  const expenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = revenue - expenses;
  const unpaid = filteredSales.reduce((sum, sale) => sum + Math.max(sale.remainingAmount, 0), 0);

  const salesBySection = data.salesSections.map((section) => ({
    section: section.name,
    total: filteredSales.filter((sale) => sale.sectionId === section.id).reduce((sum, sale) => sum + sale.finalTotal, 0)
  }));

  const expensesByCategory = data.expenseCategories.map((item) => ({
    category: item,
    total: filteredExpenses.filter((expense) => expense.category === item).reduce((sum, expense) => sum + expense.amount, 0)
  }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("reports.eyebrow")} title={t("nav.reports")} description={t("reports.description")} />

      <Card>
        <CardTitle>{t("reports.filters")}</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BrandInput label={t("sales.fromDate")} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <BrandInput label={t("sales.toDate")} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <BrandSelect label={t("table.customer")} value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="ALL">{t("reports.allCustomers")}</option>
            {data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
          </BrandSelect>
          <BrandSelect label={t("table.section")} value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
            <option value="ALL">{t("sales.allSections")}</option>
            {data.salesSections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
          </BrandSelect>
          <BrandSelect label={t("form.category")} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="ALL">{t("expenses.allCategories")}</option>
            {data.expenseCategories.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
          <BrandSelect label={t("table.paymentStatus")} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
            <option value="ALL">{t("sales.allPaymentStatuses")}</option>
            {["PAID", "UNPAID", "PARTIAL", "OVERDUE"].map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
        </div>
        <div className="mt-4 flex gap-2">
          <BrandButton variant="secondary" onClick={() => { setFromDate(""); setToDate(""); setCustomerId("ALL"); setSectionId("ALL"); setCategory("ALL"); setPaymentStatus("ALL"); }}>{t("action.reset")}</BrandButton>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-ink-muted">{t("reports.revenue")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={revenue} /></p></Card>
        <Card><p className="text-sm text-ink-muted">{t("reports.expenses")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={expenses} /></p></Card>
        <Card><p className="text-sm text-ink-muted">{t("reports.profit")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={profit} /></p></Card>
        <Card><p className="text-sm text-ink-muted">{t("reports.unpaidBalances")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={unpaid} /></p></Card>
      </div>

      <BrandTabs
        tabs={[
          {
            id: "sales",
            label: t("dashboard.salesBySection"),
            content: <DataTable headers={[t("table.section"), t("table.total")]} rows={salesBySection.map((item) => [item.section, <CurrencyDisplay key={item.section} value={item.total} />])} title={t("dashboard.salesBySection")} />
          },
          {
            id: "expenses",
            label: t("reports.expensesByCategory"),
            content: <DataTable headers={[t("table.category"), t("table.total")]} rows={expensesByCategory.map((item) => [item.category, <CurrencyDisplay key={item.category} value={item.total} />])} title={t("reports.expensesByCategory")} />
          },
          {
            id: "profit",
            label: t("reports.profitSummary"),
            content: <DataTable headers={[t("reports.metric"), t("table.total")]} rows={[[t("reports.revenue"), <CurrencyDisplay key="revenue" value={revenue} />], [t("reports.expenses"), <CurrencyDisplay key="expenses" value={expenses} />], [t("dashboard.netProfit"), <CurrencyDisplay key="profit" value={profit} />], [t("reports.unpaidBalances"), <CurrencyDisplay key="unpaid" value={unpaid} />]]} title={t("reports.profitSummary")} />
          }
        ]}
      />
    </div>
  );
}
