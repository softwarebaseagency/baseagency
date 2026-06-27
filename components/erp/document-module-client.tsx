"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus, Printer, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect, BrandTextarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { DocumentModule, ModuleSection } from "@/lib/document-modules";

type ModuleRecord = {
  id: string;
  code?: string;
  sectionId: string;
  values: Record<string, string>;
  createdAt: string;
};

type DashboardMetric = {
  label: string;
  value: number;
  tone: "green" | "yellow" | "red";
};

function storageKey(moduleId: string) {
  return `base-agency-doc-module-${moduleId}-v1`;
}

function createCode(prefix: string, count: number) {
  return `BA-${prefix}-2026-${String(count + 1).padStart(3, "0")}`;
}

function toneFor(value: string): "positive" | "warning" | "danger" | "default" | "info" {
  const lower = value.toLowerCase();
  if (/(approved|paid|completed|closed won|active|sent|delivered|yes)/.test(lower)) return "positive";
  if (/(pending|draft|waiting|open|new|scheduled|in progress)/.test(lower)) return "warning";
  if (/(lost|rejected|overdue|delayed|cancelled|expired|no|absent)/.test(lower)) return "danger";
  return "info";
}

function isStatusField(field: string) {
  return /(status|priority|approved|converted|required|payment)/i.test(field);
}

function toCsv(headers: string[], rows: string[][]) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function FieldBadge({ value }: { value: string }) {
  return <Badge tone={toneFor(value)}>{value || "-"}</Badge>;
}

function SectionDashboard({ module, records }: { module: DocumentModule; records: ModuleRecord[] }) {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [metricsStatus, setMetricsStatus] = useState("Loading database metrics...");
  const registerSections = module.sections.filter((section) => section.kind === "register");
  const totalRecords = records.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((record) => record.createdAt.slice(0, 10) === today).length;

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      try {
        const response = await fetch("/api/erp/dashboard");
        if (!response.ok) throw new Error("Dashboard metrics unavailable");
        const data = await response.json();
        if (!cancelled) {
          setMetrics(data.metrics || []);
          setMetricsStatus("Database metrics active");
        }
      } catch {
        if (!cancelled) setMetricsStatus("Database metrics unavailable; showing module counts");
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.length ? (
        <Card className="md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Live KPI Metrics</CardTitle>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{metricsStatus}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.slice(0, 12).map((metric) => (
              <div key={metric.label} className="rounded-md border border-line bg-surface-muted p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{metric.label}</p>
                  <Badge tone={metric.tone === "green" ? "positive" : metric.tone === "red" ? "danger" : "warning"}>{metric.tone}</Badge>
                </div>
                <p className="mt-3 text-2xl font-semibold text-ink-primary">{metric.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Total Records</p>
        <p className="mt-3 text-3xl font-semibold text-ink-primary">{totalRecords}</p>
      </Card>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Records Today</p>
        <p className="mt-3 text-3xl font-semibold text-ink-primary">{todayRecords}</p>
      </Card>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Register Sections</p>
        <p className="mt-3 text-3xl font-semibold text-ink-primary">{registerSections.length}</p>
      </Card>
      {registerSections.slice(0, 9).map((section) => (
        <Card key={section.id}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-primary">{section.title}</p>
              <p className="mt-1 text-xs text-ink-muted">{records.filter((record) => record.sectionId === section.id).length} record(s)</p>
            </div>
            <Badge tone="accent">{section.codePrefix || "REG"}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SectionContent({
  module,
  section,
  records,
  addRecord,
  updateRecord,
  deleteRecord,
  databaseStatus
}: {
  module: DocumentModule;
  section: ModuleSection;
  records: ModuleRecord[];
  addRecord: (section: ModuleSection, values: Record<string, string>) => Promise<void>;
  updateRecord: (section: ModuleSection, id: string, values: Record<string, string>) => Promise<void>;
  deleteRecord: (section: ModuleSection, id: string) => Promise<void>;
  databaseStatus: string;
}) {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState("");
  const [detailRecord, setDetailRecord] = useState<ModuleRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const sectionRecords = records.filter((record) => record.sectionId === section.id);
  const fields = section.fields || [];
  const statusFields = fields.filter(isStatusField);
  const statusOptions = Array.from(new Set(sectionRecords.flatMap((record) => statusFields.map((field) => record.values[field]).filter(Boolean))));
  const filteredRecords = sectionRecords.filter((record) =>
    (JSON.stringify(record.values).toLowerCase().includes(search.toLowerCase()) ||
      String(record.code || "").toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || statusFields.some((field) => record.values[field] === statusFilter))
  );
  const headers = section.codePrefix ? ["Code", ...fields, "Created At"] : [...fields, "Created At"];
  const exportRows = filteredRecords.map((record) => [
    ...(section.codePrefix ? [record.code || ""] : []),
    ...fields.map((field) => record.values[field] || ""),
    new Date(record.createdAt).toLocaleString()
  ]);
  const requiredField = fields.find((field) => !/code|notes|summary|description|attachment|signature/i.test(field));

  const workflowFor = (record: ModuleRecord) => {
    const joinedValues = Object.values(record.values).join(" ").toLowerCase();
    if (module.id === "outreach" && section.id === "target-clients" && /(interested|meeting|proposal|quotation|approved|converted)/.test(joinedValues)) {
      return { action: "outreach-to-lead", label: "Convert Lead" };
    }
    if (module.id === "sales" && ["proposals", "quotations"].includes(section.id) && /(approved|quotation sent|proposal sent|under review)/.test(joinedValues)) {
      return { action: "sales-to-finance-invoice", label: "Create Invoice" };
    }
    if (module.id === "sales" && (section.id === "closed-deals" || /(closed won|approved)/.test(joinedValues))) {
      return { action: "sales-to-operations-project", label: "Create Project" };
    }
    return null;
  };

  const runWorkflow = async (record: ModuleRecord, action: string) => {
    setActionStatus("Running workflow...");
    try {
      const response = await fetch("/api/erp/workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          moduleId: module.id,
          sectionId: section.id,
          recordId: record.id,
          values: record.values
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Workflow failed");
      setActionStatus("Workflow completed and linked records were created.");
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Workflow failed");
    }
  };

  if (section.kind === "dashboard") {
    return (
      <div className="space-y-4">
        <Card>
          <CardTitle>{section.title}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{section.description}</p>
        </Card>
        <SectionDashboard module={module} records={records} />
      </div>
    );
  }

  if (section.kind === "overview" || section.kind === "reference" || section.kind === "workflow") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>{section.title}</CardTitle>
          <p className="mt-3 text-sm leading-6 text-ink-muted">{section.description}</p>
          <div className="mt-4 rounded-md border border-line bg-surface-muted p-3 text-sm text-ink-muted">
            <p className="font-semibold text-ink-primary">{module.documentCode}</p>
            <p>{module.purpose}</p>
          </div>
        </Card>
        {section.options?.length ? (
          <Card>
            <CardTitle>Seeded Options</CardTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {section.options.map((option) => <FieldBadge key={option} value={option} />)}
            </div>
          </Card>
        ) : null}
        {section.rules?.length ? (
          <Card>
            <CardTitle>Rules</CardTitle>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-muted">
              {section.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </Card>
        ) : null}
        {fields.length ? (
          <Card className="lg:col-span-2">
            <CardTitle>Form Fields</CardTitle>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => <div key={field} className="rounded-md border border-line bg-surface-muted p-3 text-sm text-ink-primary">{field}</div>)}
            </div>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>{section.title}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{section.description}</p>
              {section.codePrefix ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Auto code: BA-{section.codePrefix}-2026-001</p> : null}
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{databaseStatus}</p>
              {actionStatus ? <p className="mt-2 text-sm font-semibold text-ink-primary">{actionStatus}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" onClick={() => downloadCsv(`${module.id}-${section.id}.csv`, headers, exportRows)} type="button">
                <Download className="h-4 w-4" /> Export
              </button>
              <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" onClick={() => window.print()} type="button">
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
          {statusOptions.length ? (
            <div className="max-w-xs">
              <BrandSelect label="Status / Priority Filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses and priorities</option>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </BrandSelect>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fields.slice(0, 9).map((field) => (
              field.toLowerCase().includes("notes") || field.toLowerCase().includes("summary") || field.toLowerCase().includes("description") ? (
                <BrandTextarea key={field} label={field} value={values[field] || ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
              ) : (
                <BrandInput key={field} label={field} value={values[field] || ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
              )
            ))}
          </div>
          {fields.length > 9 ? (
            <details className="rounded-md border border-line bg-surface-muted p-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink-primary">More fields</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fields.slice(9).map((field) => <BrandInput key={field} label={field} value={values[field] || ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} />)}
              </div>
            </details>
          ) : null}
          <button
            className="focus-brand inline-flex h-10 w-fit items-center gap-2 rounded-md bg-brand-yellow px-3 text-sm font-semibold text-brand-navy"
            onClick={async () => {
              if (requiredField && !values[requiredField]?.trim()) {
                setActionStatus(`${requiredField} is required.`);
                return;
              }
              if (editingId) await updateRecord(section, editingId, values);
              else await addRecord(section, values);
              setValues({});
              setEditingId("");
              setActionStatus(editingId ? "Record updated." : "Record added.");
            }}
            type="button"
          >
            <Plus className="h-4 w-4" /> {editingId ? "Save Changes" : "Add Record"}
          </button>
          {editingId ? (
            <button
              className="focus-brand inline-flex h-10 w-fit items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary"
              onClick={() => {
                setValues({});
                setEditingId("");
              }}
              type="button"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </Card>
      <DataTable
        title={section.title}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search records"
        headers={headers}
        rows={filteredRecords.map((record) => [
          ...(section.codePrefix ? [record.code || "-"] : []),
          ...fields.map((field) => isStatusField(field) ? <FieldBadge key={`${record.id}-${field}`} value={record.values[field] || "-"} /> : record.values[field] || "-"),
          new Date(record.createdAt).toLocaleString()
        ])}
        rowActions={(index) => {
          const record = filteredRecords[index];
          const workflow = workflowFor(record);
          return (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="focus-brand rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink-primary"
                onClick={() => setDetailRecord(record)}
                type="button"
              >
                Details
              </button>
              {workflow ? (
                <button
                  className="focus-brand rounded-md border border-brand-yellow bg-brand-yellow px-3 py-2 text-xs font-semibold text-brand-navy"
                  onClick={() => runWorkflow(record, workflow.action)}
                  type="button"
                >
                  {workflow.label}
                </button>
              ) : null}
              <button
                className="focus-brand rounded-md border border-line px-3 py-2 text-xs font-semibold text-ink-primary"
                onClick={() => {
                  setValues(record.values);
                  setEditingId(record.id);
                }}
                type="button"
              >
                Edit
              </button>
              <button
                className="focus-brand rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                onClick={() => deleteRecord(section, record.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          );
        }}
        emptyMessage={`No ${section.title.toLowerCase()} records yet`}
      />
      {detailRecord ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Record Details</CardTitle>
              <p className="mt-1 text-sm text-ink-muted">{detailRecord.code || detailRecord.id}</p>
            </div>
            <button className="focus-brand rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink-primary" onClick={() => setDetailRecord(null)} type="button">
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <div key={field} className="rounded-md border border-line bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{field}</p>
                <p className="mt-2 text-sm font-semibold text-ink-primary">{detailRecord.values[field] || "-"}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-line p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Audit Timeline</p>
            <p className="mt-2 text-sm text-ink-muted">Created at {new Date(detailRecord.createdAt).toLocaleString()}. Create, update, archive, and workflow actions are written to the audit log when the database is available.</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export function DocumentModuleClient({ module }: { module: DocumentModule }) {
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState("Checking database-backed CRUD...");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(module.id));
      setRecords(saved ? JSON.parse(saved) : []);
    } catch {
      setRecords([]);
    }
  }, [module.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDatabaseRecords() {
      const registerSections = module.sections.filter((section) => section.kind === "register" || section.kind === "report" || section.kind === "workflow");

      try {
        const responses = await Promise.all(
          registerSections.map(async (section) => {
            const response = await fetch(`/api/document-modules/${module.id}/${section.id}`);
            if (!response.ok) {
              const data = await response.json().catch(() => null);
              throw new Error(data?.message || "Database request failed");
            }
            const data = await response.json();
            return data.databaseBacked ? data.records || [] : null;
          })
        );
        const databaseRecords = responses.flatMap((items) => items || []);

        if (!cancelled && databaseRecords.length) {
          setRecords(databaseRecords);
          setDatabaseStatus("Database-backed CRUD active");
        } else if (!cancelled) {
          setDatabaseStatus("Database-backed CRUD ready; no database records yet");
        }
      } catch {
        if (!cancelled) setDatabaseStatus("Database unavailable; using local fallback");
      }
    }

    loadDatabaseRecords();

    return () => {
      cancelled = true;
    };
  }, [module]);

  useEffect(() => {
    window.localStorage.setItem(storageKey(module.id), JSON.stringify(records));
  }, [module.id, records]);

  const addRecord = useCallback(async (section: ModuleSection, values: Record<string, string>) => {
    const count = records.filter((record) => record.sectionId === section.id).length;
    const fallbackRecord: ModuleRecord = {
      id: `${section.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code: section.codePrefix ? createCode(section.codePrefix, count) : undefined,
      sectionId: section.id,
      values,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/document-modules/${module.id}/${section.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ values })
      });
      const data = await response.json();

      if (response.ok && data.record) {
        setRecords([data.record, ...records.filter((record) => record.id !== data.record.id)]);
        setDatabaseStatus("Database-backed CRUD active");
        return;
      }

      throw new Error(data.message || "Database save failed");
    } catch {
      setDatabaseStatus("Database unavailable; saved to local fallback");
      setRecords([fallbackRecord, ...records]);
    }
  }, [module.id, records]);

  const updateRecord = useCallback(async (section: ModuleSection, id: string, values: Record<string, string>) => {
    try {
      const response = await fetch(`/api/document-modules/${module.id}/${section.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, values })
      });
      const data = await response.json();

      if (response.ok && data.record) {
        setRecords(records.map((record) => (record.id === id ? data.record : record)));
        setDatabaseStatus("Database-backed CRUD active");
        return;
      }

      throw new Error(data.message || "Database update failed");
    } catch {
      setDatabaseStatus("Database unavailable; updated local fallback");
      setRecords(records.map((record) => (record.id === id ? { ...record, values } : record)));
    }
  }, [module.id, records]);

  const deleteRecord = useCallback(async (section: ModuleSection, id: string) => {
    try {
      const response = await fetch(`/api/document-modules/${module.id}/${section.id}?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setRecords(records.filter((record) => record.id !== id));
        setDatabaseStatus("Database-backed CRUD active");
        return;
      }

      throw new Error("Database delete failed");
    } catch {
      setDatabaseStatus("Database unavailable; deleted local fallback record only");
      setRecords(records.filter((record) => record.id !== id));
    }
  }, [module.id, records]);

  const tabs = useMemo(() => module.sections.map((section) => ({
    id: section.id,
    label: section.title,
    content: (
      <SectionContent
        module={module}
        section={section}
        records={records}
        addRecord={addRecord}
        updateRecord={updateRecord}
        deleteRecord={deleteRecord}
        databaseStatus={databaseStatus}
      />
    )
  })), [module, records, databaseStatus, addRecord, updateRecord, deleteRecord]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${module.documentCode} - Internal / Confidential`}
        title={module.title}
        description={module.purpose}
      />
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Document Structure</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">Every section from the source document is represented as a child tab below.</p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-md border border-line bg-surface-muted px-3 text-sm text-ink-muted">
            <Search className="h-4 w-4" />
            <span>{module.sections.length} section tabs</span>
          </label>
        </div>
      </Card>
      <BrandTabs tabs={tabs} />
    </div>
  );
}
