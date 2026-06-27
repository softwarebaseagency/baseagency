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
import { Customer, CustomerStatus } from "@/lib/demo-data";
import { translateStatus } from "@/lib/i18n/format";

const blankCustomer: Omit<Customer, "id" | "createdAt"> = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  source: "Website",
  serviceInterest: "Website Development",
  status: "NEW",
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

export function CustomersClient() {
  const { data, addCustomer, updateCustomer, deleteCustomer } = useCrm();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(blankCustomer);
  const [error, setError] = useState("");

  const sources = useMemo(
    () => Array.from(new Set(data.customers.map((customer) => customer.source))).sort(),
    [data.customers]
  );

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.customers.filter((customer) => {
      const matchesSearch =
        !normalizedQuery ||
        [customer.fullName, customer.phone, customer.email].some((field) =>
          field.toLowerCase().includes(normalizedQuery)
        );
      const matchesStatus = status === "ALL" || customer.status === status;
      const matchesSource = source === "ALL" || customer.source === source;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [data.customers, query, source, status]);

  const startAdd = () => {
    setEditingId(null);
    setForm(blankCustomer);
    setError("");
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      fullName: customer.fullName,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      email: customer.email,
      address: customer.address,
      source: customer.source,
      serviceInterest: customer.serviceInterest,
      status: customer.status,
      notes: customer.notes
    });
    setError("");
  };

  const saveCustomer = () => {
    const duplicate = data.customers.find(
      (customer) =>
        customer.id !== editingId &&
        ((form.phone && customer.phone === form.phone) || (form.email && customer.email === form.email))
    );

    if (!form.fullName.trim()) {
      setError(t("customers.fullNameRequired"));
      return;
    }

    if (duplicate) {
      setError(t("customers.duplicateCustomer"));
      return;
    }

    if (editingId) {
      updateCustomer(editingId, form);
    } else {
      addCustomer(form);
    }

    setEditingId(null);
    setForm(blankCustomer);
    setError("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("customers.eyebrow")}
        title={t("nav.customers")}
        description={t("customers.description")}
        actions={<BrandButton variant="accent" onClick={startAdd}>{t("customers.addCustomer")}</BrandButton>}
      />

      {selectedCustomer ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{selectedCustomer.fullName}</CardTitle>
              <p className="mt-2 text-sm text-ink-muted">{selectedCustomer.notes}</p>
            </div>
            <BrandButton variant="secondary" onClick={() => setSelectedCustomer(null)}>{t("action.close")}</BrandButton>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-line p-4 text-sm text-ink-primary">{t("form.phone")}: {selectedCustomer.phone}</div>
            <div className="rounded-md border border-line p-4 text-sm text-ink-primary">{t("form.source")}: {selectedCustomer.source}</div>
            <div className="rounded-md border border-line p-4 text-sm text-ink-primary">{t("customers.interest")}: {selectedCustomer.serviceInterest}</div>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardTitle>{editingId ? t("customers.editCustomer") : t("customers.addCustomer")}</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <BrandInput label={t("form.fullName")} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <BrandInput label={t("form.phone")} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <BrandInput label={t("form.whatsapp")} value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
          <BrandInput label={t("form.email")} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <BrandInput label={t("form.address")} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <BrandInput label={t("form.source")} value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
          <BrandInput label={t("customers.serviceInterest")} value={form.serviceInterest} onChange={(event) => setForm({ ...form, serviceInterest: event.target.value })} />
          <BrandSelect label={t("form.status")} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CustomerStatus })}>
            {["NEW", "CONTACTED", "QUALIFIED", "CUSTOMER", "LOST"].map((item) => (
              <option key={item} value={item}>{translateStatus(t, item)}</option>
            ))}
          </BrandSelect>
          <BrandTextarea className="md:col-span-2" label={t("form.notes")} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}
        <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
          <BrandButton variant="secondary" onClick={() => { setEditingId(null); setForm(blankCustomer); setError(""); }}>
            {t("action.cancel")}
          </BrandButton>
          <BrandButton variant="accent" onClick={saveCustomer}>{t("customers.saveCustomer")}</BrandButton>
        </div>
      </Card>

      <Card>
        <CardTitle>{t("customers.filters")}</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BrandInput label={t("customers.search")} value={query} onChange={(event) => setQuery(event.target.value)} />
          <BrandSelect label={t("form.status")} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">{t("customers.allStatuses")}</option>
            {["NEW", "CONTACTED", "QUALIFIED", "CUSTOMER", "LOST"].map((item) => (
              <option key={item} value={item}>{translateStatus(t, item)}</option>
            ))}
          </BrandSelect>
          <BrandSelect label={t("form.source")} value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="ALL">{t("customers.allSources")}</option>
            {sources.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </BrandSelect>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <BrandButton variant="secondary" onClick={() => { setQuery(""); setStatus("ALL"); setSource("ALL"); }}>{t("action.reset")}</BrandButton>
          <BrandButton variant="primary" onClick={() => exportJson("base-agency-customers.json", filteredCustomers)}>{t("action.export")}</BrandButton>
        </div>
      </Card>

      <DataTable
        emptyMessage={t("customers.noCustomers")}
        headers={[t("form.fullName"), t("form.phone"), t("form.email"), t("form.source"), t("customers.serviceInterest"), t("form.status")]}
        rowActions={(index) => {
          const customer = filteredCustomers[index];
          return (
            <div className="flex justify-end gap-2">
              <button className="focus-brand rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-primary" onClick={() => setSelectedCustomer(customer)} type="button">
                {t("customers.details")}
              </button>
              <button className="focus-brand rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-primary" onClick={() => startEdit(customer)} type="button">
                {t("action.edit")}
              </button>
              <button className="focus-brand rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => confirm(t("customers.deleteConfirm")) && deleteCustomer(customer.id)} type="button">
                {t("action.delete")}
              </button>
            </div>
          );
        }}
        rows={filteredCustomers.map((customer) => [
          customer.fullName,
          customer.phone,
          customer.email,
          customer.source,
          customer.serviceInterest,
          <Badge key={customer.status} tone="info">{translateStatus(t, customer.status)}</Badge>
        ])}
        title={t("customers.list")}
      />
    </div>
  );
}
