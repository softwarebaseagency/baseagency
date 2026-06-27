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
import { Expense, ExpenseType, PaymentStatus } from "@/lib/demo-data";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { translateStatus, translateTemplate, translateType } from "@/lib/i18n/format";
import { formatDate } from "@/lib/utils";

const blankExpense: Omit<Expense, "id"> = {
  title: "",
  category: "Operations",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  type: "DAILY",
  paymentStatus: "UNPAID",
  paidBy: "",
  notes: "",
  attachment: ""
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

export function ExpensesClient() {
  const { data, addExpense, updateExpense, deleteExpense } = useCrm();
  const { t } = useLanguage();
  const [form, setForm] = useState(blankExpense);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredExpenses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.expenses.filter((expense) => {
      const matchesSearch = !normalized || `${expense.title} ${expense.category}`.toLowerCase().includes(normalized);
      const matchesType = type === "ALL" || expense.type === type;
      const matchesCategory = category === "ALL" || expense.category === category;
      const matchesPayment = paymentStatus === "ALL" || expense.paymentStatus === paymentStatus;
      const matchesFrom = !fromDate || expense.date >= fromDate;
      const matchesTo = !toDate || expense.date <= toDate;
      return matchesSearch && matchesType && matchesCategory && matchesPayment && matchesFrom && matchesTo;
    });
  }, [category, data.expenses, fromDate, paymentStatus, query, toDate, type]);

  const saveExpense = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      updateExpense(editingId, form);
    } else {
      addExpense(form);
    }
    setEditingId(null);
    setForm(blankExpense);
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      type: expense.type,
      paymentStatus: expense.paymentStatus,
      paidBy: expense.paidBy,
      notes: expense.notes,
      attachment: expense.attachment
    });
  };

  const setQuickType = (nextType: ExpenseType) => {
    setForm({ ...form, type: nextType });
    setType(nextType);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("expenses.eyebrow")}
        title={t("nav.expenses")}
        description={t("expenses.description")}
        actions={<BrandButton variant="accent" onClick={() => { setEditingId(null); setForm(blankExpense); }}>{t("expenses.addExpense")}</BrandButton>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["DAILY", "expenses.dailyExpenses"],
          ["MONTHLY_RECURRING", "expenses.monthlyRecurring"],
          ["ONE_TIME", "expenses.oneTimeExpenses"]
        ].map(([value, label]) => (
          <Card key={value}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{t(label)}</p>
            <p className="mt-2 text-2xl font-semibold text-ink-primary">
              {data.expenses.filter((expense) => expense.type === value).length}
            </p>
            <BrandButton className="mt-4" variant="secondary" onClick={() => setQuickType(value as ExpenseType)}>
              {translateTemplate(t, "expenses.addType", { type: t(label) })}
            </BrandButton>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>{editingId ? t("expenses.editExpense") : t("expenses.addExpense")}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <BrandInput label={t("table.title")} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <BrandSelect label={t("expenses.expenseType")} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ExpenseType })}>
            {["DAILY", "MONTHLY_RECURRING", "ONE_TIME"].map((item) => (
              <option key={item} value={item}>{translateType(t, item)}</option>
            ))}
          </BrandSelect>
          <BrandSelect label={t("form.category")} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {data.expenseCategories.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
          <BrandInput label={t("form.amount")} type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
          <BrandInput label={t("form.date")} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <BrandSelect label={t("table.paymentStatus")} value={form.paymentStatus} onChange={(event) => setForm({ ...form, paymentStatus: event.target.value as PaymentStatus })}>
            {["PAID", "UNPAID", "PARTIAL", "OVERDUE"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("expenses.paidBy")} value={form.paidBy} onChange={(event) => setForm({ ...form, paidBy: event.target.value })} />
          <BrandInput label={t("expenses.attachment")} value={form.attachment} onChange={(event) => setForm({ ...form, attachment: event.target.value })} />
          <BrandTextarea className="md:col-span-2" label={t("form.notes")} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-5 flex justify-between gap-2 border-t border-line pt-4">
          <BrandButton variant="secondary" onClick={() => { setEditingId(null); setForm(blankExpense); }}>{t("action.cancel")}</BrandButton>
          <BrandButton variant="accent" onClick={saveExpense}>{t("expenses.saveExpense")}</BrandButton>
        </div>
      </Card>

      <Card>
        <CardTitle>{t("expenses.filters")}</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BrandInput label={t("expenses.search")} value={query} onChange={(event) => setQuery(event.target.value)} />
          <BrandSelect label={t("table.type")} value={type} onChange={(event) => setType(event.target.value)}>
            <option value="ALL">{t("expenses.allTypes")}</option>
            {["DAILY", "MONTHLY_RECURRING", "ONE_TIME"].map((item) => (
              <option key={item} value={item}>{translateType(t, item)}</option>
            ))}
          </BrandSelect>
          <BrandSelect label={t("form.category")} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="ALL">{t("expenses.allCategories")}</option>
            {data.expenseCategories.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
          <BrandSelect label={t("table.paymentStatus")} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
            <option value="ALL">{t("sales.allPaymentStatuses")}</option>
            {["PAID", "UNPAID", "PARTIAL", "OVERDUE"].map((item) => <option key={item} value={item}>{translateStatus(t, item)}</option>)}
          </BrandSelect>
          <BrandInput label={t("sales.fromDate")} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <BrandInput label={t("sales.toDate")} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <BrandButton variant="secondary" onClick={() => { setQuery(""); setType("ALL"); setCategory("ALL"); setPaymentStatus("ALL"); setFromDate(""); setToDate(""); }}>{t("action.reset")}</BrandButton>
          <BrandButton onClick={() => exportJson("base-agency-expenses.json", filteredExpenses)}>{t("action.export")}</BrandButton>
        </div>
      </Card>

      <DataTable
        emptyMessage={t("expenses.noExpenses")}
        headers={[t("table.title"), t("table.type"), t("table.category"), t("table.amount"), t("table.date"), t("table.status"), t("expenses.paidBy")]}
        rowActions={(index) => {
          const expense = filteredExpenses[index];
          return (
            <div className="flex justify-end gap-2">
              <button className="focus-brand rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-primary" onClick={() => startEdit(expense)} type="button">{t("action.edit")}</button>
              <button className="focus-brand rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => confirm(t("expenses.deleteConfirm")) && deleteExpense(expense.id)} type="button">{t("action.delete")}</button>
            </div>
          );
        }}
        rows={filteredExpenses.map((expense) => [
          expense.title,
          translateType(t, expense.type),
          expense.category,
          <CurrencyDisplay key={`${expense.id}-amount`} value={expense.amount} />,
          formatDate(expense.date),
          <Badge key={expense.paymentStatus} tone={expense.paymentStatus === "PAID" ? "positive" : expense.paymentStatus === "UNPAID" ? "danger" : "warning"}>{translateStatus(t, expense.paymentStatus)}</Badge>,
          expense.paidBy || "-"
        ])}
        title={t("expenses.records")}
      />
    </div>
  );
}
