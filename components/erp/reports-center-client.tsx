"use client";

import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect, BrandTextarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";

const reports = [
  ["CEO KPI Snapshot", "CEO Dashboard", "Sales, Finance, HR, Operations, risk, approvals, cash, attendance, and project indicators."],
  ["Weekly Management Meeting", "Management", "Sales review, finance review, HR review, operations review, risks, decisions, and next actions."],
  ["Monthly Management Report", "Management", "Executive summary, departmental summaries, risks, decisions, and next-month plan."],
  ["Weekly Sales Report", "Sales / CRM", "Date range, prepared by, reviewed by, approved by, pipeline, proposals, quotations, closed won/lost."],
  ["Monthly Outreach Report", "Client List & Outreach", "Target clients, contact activity, meetings, proposals, quotations, conversion, and next-month plan."],
  ["Monthly Finance Report", "Finance", "Income, expenses, invoices, receipts, petty cash, salary cost, supplier payments, P&L, cash flow."],
  ["Monthly HR Report", "HR", "Employees, attendance, leave, lateness, absence, overtime, evaluations, warnings, file completion."],
  ["Weekly Operations Report", "Operations", "Projects, tasks, work orders, timelines, issues, quality checks, approvals, delivery."],
  ["Monthly Operations Report", "Operations", "Monthly delivery performance, delayed projects, workload, closures, client approvals."],
  ["Decision Report", "Approvals & Decisions", "Approval queue, decision register, CEO approvals, rejected requests, and implementation follow-up."],
  ["Document Control Report", "Document Control", "Controlled documents, revision history, storage map, review calendar, owners, and approval status."],
  ["Management Summary Report", "All Modules", "Executive summary across all company operating system modules, reminders, and audit logs."]
];

export function ReportsCenterClient() {
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [preparedBy, setPreparedBy] = useState("Management");
  const [reviewedBy, setReviewedBy] = useState("Management");
  const [approvedBy, setApprovedBy] = useState("CEO / Founder");
  const [notes, setNotes] = useState("");
  const [problems, setProblems] = useState("");
  const [correctiveActions, setCorrectiveActions] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const modules = ["All Modules", ...Array.from(new Set(reports.map((report) => report[1])))];
  const filteredReports = useMemo(
    () => reports.filter((report) => moduleFilter === "All Modules" || report[1] === moduleFilter),
    [moduleFilter]
  );

  const exportCsv = () => {
    const csv = [
      ["Report", "Module", "Scope", "From", "To", "Prepared By", "Reviewed By", "Approved By", "Notes", "Problems", "Corrective Actions", "Next Plan"],
      ...filteredReports.map((report) => [...report, fromDate, toDate, preparedBy, reviewedBy, approvedBy, notes, problems, correctiveActions, nextPlan])
    ].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "base-agency-reports-center.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BASE AGENCY Company Operating System"
        title="Reports & KPIs"
        description="Generate, print, and export management reports across CEO, Management, Sales, Outreach, Finance, HR, Operations, Service Packages, Approvals, and Document Control."
      />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Report Controls</CardTitle>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Every report supports date range, module filter, prepared by, reviewed by, approved by, notes, problems, corrective actions, next plan, print view, and export workflow.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary" onClick={exportCsv} type="button">
              <Download className="h-4 w-4" /> Export Excel
            </button>
            <button className="focus-brand inline-flex h-10 items-center gap-2 rounded-md bg-brand-yellow px-3 text-sm font-semibold text-brand-navy" onClick={() => window.print()} type="button">
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <BrandSelect label="Department / Module" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
            {modules.map((module) => <option key={module} value={module}>{module}</option>)}
          </BrandSelect>
          <BrandInput label="From Date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <BrandInput label="To Date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <BrandInput label="Prepared By" value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} />
          <BrandInput label="Reviewed By" value={reviewedBy} onChange={(event) => setReviewedBy(event.target.value)} />
          <BrandInput label="Approved By" value={approvedBy} onChange={(event) => setApprovedBy(event.target.value)} />
          <BrandTextarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <BrandTextarea label="Problems" value={problems} onChange={(event) => setProblems(event.target.value)} />
          <BrandTextarea label="Corrective Actions" value={correctiveActions} onChange={(event) => setCorrectiveActions(event.target.value)} />
          <BrandTextarea label="Next Plan" value={nextPlan} onChange={(event) => setNextPlan(event.target.value)} />
        </div>
      </Card>
      <DataTable
        title="Report Generator"
        headers={["Report", "Module", "Scope", "Prepared By", "Reviewed By", "Approved By", "Date Range"]}
        rows={filteredReports.map((report) => [...report, preparedBy, reviewedBy, approvedBy, `${fromDate || "Start"} to ${toDate || "Today"}`])}
      />
    </div>
  );
}
