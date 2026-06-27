"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BrandButton } from "@/components/ui/brand-button";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect, BrandTextarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useCrm } from "@/components/crm/crm-provider";
import { useLanguage } from "@/components/i18n/language-provider";
import { Sale, SaleStatus, calculateSale } from "@/lib/demo-data";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { translateStatus } from "@/lib/i18n/format";
import { formatDate } from "@/lib/utils";

const blankSale = {
  customerId: "",
  sectionId: "website",
  serviceTitle: "",
  totalPrice: 0,
  discount: 0,
  extraFees: 0,
  paidAmount: 0,
  projectCost: 0,
  status: "LEAD" as SaleStatus,
  deadline: "",
  notes: ""
};

function exportJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SalesClient() {
  const { data, addSale, updateSale, deleteSale } = useCrm();
  const { t } = useLanguage();
  const [form, setForm] = useState(blankSale);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const customerNames = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer.fullName])),
    [data.customers]
  );
  const sectionNames = useMemo(
    () => new Map(data.salesSections.map((item) => [item.id, item.name])),
    [data.salesSections]
  );
  const customerName = (id: string) => customerNames.get(id) ?? t("label.unknownCustomer");
  const sectionName = (id: string) => sectionNames.get(id) ?? t("label.unknownSection");

  const totals = calculateSale({ ...form });

  const filteredSales = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.sales.filter((sale) => {
      const haystack = `${customerNames.get(sale.customerId) ?? ""} ${sale.serviceTitle}`.toLowerCase();
      const matchesSearch = !normalized || haystack.includes(normalized);
      const matchesSection = section === "ALL" || sale.sectionId === section;
      const matchesStatus = status === "ALL" || sale.status === status;
      const matchesPayment = paymentStatus === "ALL" || sale.paymentStatus === paymentStatus;
      const matchesFrom = !fromDate || sale.createdAt >= fromDate;
      const matchesTo = !toDate || sale.createdAt <= toDate;
      return matchesSearch && matchesSection && matchesStatus && matchesPayment && matchesFrom && matchesTo;
    });
  }, [customerNames, data.sales, fromDate, paymentStatus, query, section, status, toDate]);

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      customerId: sale.customerId,
      sectionId: sale.sectionId,
      serviceTitle: sale.serviceTitle,
      totalPrice: sale.totalPrice,
      discount: sale.discount,
      extraFees: sale.extraFees,
      paidAmount: sale.paidAmount,
      projectCost: sale.projectCost,
      status: sale.status,
      deadline: sale.deadline,
      notes: sale.notes
    });
  };

  const saveSale = () => {
    const payload = { ...form, customerId: form.customerId || data.customers[0]?.id || "" };
    if (!payload.customerId || !payload.serviceTitle.trim()) return;
    if (editingId) {
      updateSale(editingId, payload);
    } else {
      addSale(payload);
    }
    setEditingId(null);
    setForm(blankSale);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("sales.eyebrow")}
        title={t("nav.sales")}
        description={t("sales.description")}
        actions={<BrandButton variant="accent" onClick={() => { setEditingId(null); setForm(blankSale); }}>{t("sales.addSale")}</BrandButton>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-ink-muted">{t("sales.finalTotal")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={totals.finalTotal} /></p></Card>
        <Card><p className="text-sm text-ink-muted">{t("sales.remainingAmount")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={totals.remainingAmount} /></p></Card>
        <Card><p className="text-sm text-ink-muted">{t("sales.netProfit")}</p><p className="mt-2 text-2xl font-semibold text-ink-primary"><CurrencyDisplay value={totals.netProfit} /></p></Card>
      </div>

      <Card>
        <CardTitle>{editingId ? t("sales.editSale") : t("sales.addSale")}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <BrandSelect label={t("table.customer")} value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
            <option value="">{t("sales.selectCustomer")}</option>
            {data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
          </BrandSelect>
          <BrandSelect label={t("sales.section")} value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })}>
            {data.salesSections.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </BrandSelect>
          <BrandInput label={t("form.serviceTitle")} value={form.serviceTitle} onChange={(event) => setForm({ ...form, serviceTitle: event.target.value })} />
          <BrandSelect label={t("form.status")} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SaleStatus })}>
            {["LEAD", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("form.totalPrice")} type="number" value={form.totalPrice} onChange={(event) => setForm({ ...form, totalPrice: Number(event.target.value) })} />
          <BrandInput label={t("sales.extraFees")} type="number" value={form.extraFees} onChange={(event) => setForm({ ...form, extraFees: Number(event.target.value) })} />
          <BrandInput label={t("sales.discount")} type="number" value={form.discount} onChange={(event) => setForm({ ...form, discount: Number(event.target.value) })} />
          <BrandInput label={t("form.paidAmount")} type="number" value={form.paidAmount} onChange={(event) => setForm({ ...form, paidAmount: Number(event.target.value) })} />
          <BrandInput label={t("sales.projectCost")} type="number" value={form.projectCost} onChange={(event) => setForm({ ...form, projectCost: Number(event.target.value) })} />
          <BrandInput label={t("sales.deadline")} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
          <BrandTextarea className="md:col-span-2" label={t("form.notes")} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-5 flex justify-between gap-2 border-t border-line pt-4">
          <BrandButton variant="secondary" onClick={() => { setEditingId(null); setForm(blankSale); }}>{t("action.cancel")}</BrandButton>
          <BrandButton variant="accent" onClick={saveSale}>{t("sales.saveSale")}</BrandButton>
        </div>
      </Card>

      <Card>
        <CardTitle>{t("sales.filters")}</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BrandInput label={t("sales.searchCustomerService")} value={query} onChange={(event) => setQuery(event.target.value)} />
          <BrandSelect label={t("table.section")} value={section} onChange={(event) => setSection(event.target.value)}>
            <option value="ALL">{t("sales.allSections")}</option>
            {data.salesSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </BrandSelect>
          <BrandSelect label={t("sales.projectStatus")} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">{t("sales.allStatuses")}</option>
            {["LEAD", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandSelect label={t("table.paymentStatus")} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
            <option value="ALL">{t("sales.allPaymentStatuses")}</option>
            {["PAID", "UNPAID", "PARTIAL", "OVERDUE"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("sales.fromDate")} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <BrandInput label={t("sales.toDate")} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <BrandButton variant="secondary" onClick={() => { setQuery(""); setSection("ALL"); setStatus("ALL"); setPaymentStatus("ALL"); setFromDate(""); setToDate(""); }}>{t("action.reset")}</BrandButton>
          <BrandButton onClick={() => exportJson("base-agency-sales.json", filteredSales)}>{t("action.export")}</BrandButton>
        </div>
      </Card>

      <DataTable
        emptyMessage={t("sales.noSales")}
        headers={[t("table.customer"), t("table.section"), t("table.service"), t("table.status"), t("table.payment"), t("table.total"), t("table.paid"), t("table.remaining"), t("table.profit")]}
        rowActions={(index) => {
          const sale = filteredSales[index];
          return (
            <div className="flex justify-end gap-2">
              <button className="focus-brand rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-primary" onClick={() => startEdit(sale)} type="button">{t("action.edit")}</button>
              <button className="focus-brand rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => confirm(t("sales.deleteConfirm")) && deleteSale(sale.id)} type="button">{t("action.delete")}</button>
            </div>
          );
        }}
        rows={filteredSales.map((sale) => [
          customerName(sale.customerId),
          sectionName(sale.sectionId),
          sale.serviceTitle,
          <Badge key={sale.status}>{translateStatus(t, sale.status)}</Badge>,
          <Badge key={sale.paymentStatus} tone={sale.paymentStatus === "PAID" ? "positive" : sale.paymentStatus === "UNPAID" ? "danger" : "warning"}>{translateStatus(t, sale.paymentStatus)}</Badge>,
          <CurrencyDisplay key={`${sale.id}-total`} value={sale.finalTotal} />,
          <CurrencyDisplay key={`${sale.id}-paid`} value={sale.paidAmount} />,
          <CurrencyDisplay key={`${sale.id}-remaining`} value={sale.remainingAmount} />,
          <CurrencyDisplay key={`${sale.id}-profit`} value={sale.netProfit} />
        ])}
        title={t("sales.records")}
      />
    </div>
  );
}
