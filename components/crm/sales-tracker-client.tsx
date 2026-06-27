"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Handshake,
  KanbanSquare,
  Plus,
  RefreshCw,
  Target,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect, BrandTextarea } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import {
  ClosedDeal,
  ContactLog,
  Deal,
  Handover,
  Lead,
  Meeting,
  SalesDocument,
  SalesTrackerState,
  TargetClient,
  WeeklySalesReport,
  contactMethods,
  createDocumentCode,
  createId,
  createWeeklyReportFromState,
  crmStatuses,
  documentStatuses,
  emptyState,
  expectedRevenue,
  first30DayTargets,
  isOverdue,
  leadSources,
  lostReasons,
  meetingStatuses,
  paymentStatuses,
  pipelineStages,
  priorities,
  probabilityForStage,
  roleResponsibilities,
  serviceCategories,
  todayIso,
} from "@/lib/sales-tracker";
import { formatCurrency } from "@/lib/utils";

const storageKey = "base-agency-sales-tracker-v1";

function loadState(): SalesTrackerState {
  if (typeof window === "undefined") return emptyState();

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...emptyState(), ...JSON.parse(saved) } : emptyState();
  } catch {
    return emptyState();
  }
}

function saveState(state: SalesTrackerState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function numberValue(value: string | number) {
  return Number(value || 0);
}

function statusTone(status: string): "positive" | "warning" | "danger" | "default" | "info" {
  if (["Closed Won", "Approved", "Project Started", "Sent", "Completed", "Paid"].includes(status)) return "positive";
  if (["New Lead", "Contacted", "Waiting Client", "Follow-Up Later", "Scheduled", "Draft"].includes(status)) return "warning";
  if (["Closed Lost", "Not Qualified", "Rejected", "Expired", "Cancelled", "Pending"].includes(status)) return "danger";
  return "info";
}

function priorityTone(value: string): "positive" | "warning" | "danger" | "default" | "info" {
  if (value === "High") return "danger";
  if (value === "Medium") return "warning";
  if (value === "Low") return "info";
  return "default";
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function ActionButton({
  children,
  onClick,
  variant = "primary"
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={
        variant === "primary"
          ? "focus-brand inline-flex h-10 items-center gap-2 rounded-md bg-brand-yellow px-3 text-sm font-semibold text-brand-navy"
          : "focus-brand inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink-primary"
      }
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  warning
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  warning?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={warning ? "absolute inset-x-0 top-0 h-1 bg-red-500" : "absolute inset-x-0 top-0 h-1 bg-brand-yellow"} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
          <p className="ltr-num mt-3 text-2xl font-semibold text-ink-primary">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function defaultLead(): Omit<Lead, "id" | "leadCode" | "createdAt" | "updatedAt"> {
  return {
    dateAdded: todayIso(),
    clientName: "",
    contactPerson: "",
    phone: "",
    email: "",
    whatsapp: "",
    instagramWebsite: "",
    location: "",
    leadSource: leadSources[0],
    industry: "",
    serviceRequired: serviceCategories[0],
    estimatedValue: 0,
    priority: "Medium",
    status: "New Lead",
    nextFollowUp: todayIso(),
    responsiblePerson: "",
    notes: "",
    createdBy: "Sales / Client Relations"
  };
}

export function SalesTrackerClient() {
  const [state, setState] = useState<SalesTrackerState>(() => loadState());
  const [leadForm, setLeadForm] = useState(defaultLead());
  const [selectedLeadCode, setSelectedLeadCode] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    saveState(state);
  }, [state]);

  const leads = state.leads.filter((lead) => {
    if (!search) return true;
    const needle = search.toLowerCase();
    return [lead.leadCode, lead.clientName, lead.contactPerson, lead.phone, lead.serviceRequired, lead.status]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const selectedLead = state.leads.find((lead) => lead.leadCode === selectedLeadCode) || state.leads[0];
  const overdueLeads = state.leads.filter((lead) => !["Closed Won", "Closed Lost", "Not Qualified"].includes(lead.status) && isOverdue(lead.nextFollowUp));
  const todayFollowUps = state.leads.filter((lead) => lead.nextFollowUp === todayIso());
  const proposalsSent = state.proposals.filter((proposal) => proposal.status === "Sent");
  const quotationsSent = state.quotations.filter((quotation) => quotation.status === "Sent");
  const activeDeals = state.deals.filter((deal) => !["Closed Won", "Closed Lost"].includes(deal.pipelineStage));
  const closedRevenue = state.closedDeals.reduce((sum, deal) => sum + deal.finalValue, 0);
  const pipelineValue = activeDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const expectedPipelineRevenue = activeDeals.reduce((sum, deal) => sum + deal.expectedRevenue, 0);
  const conversionRate = state.leads.length ? Math.round((state.closedDeals.length / state.leads.length) * 100) : 0;

  const updateState = (next: SalesTrackerState, notice: string) => {
    setState(next);
    setMessage(notice);
  };

  const addLead = () => {
    if (!leadForm.clientName.trim() || !leadForm.status || !leadForm.responsiblePerson.trim()) {
      setMessage("Lead requires client name, status, and responsible person.");
      return;
    }

    const now = new Date().toISOString();
    const lead: Lead = {
      ...leadForm,
      id: createId("lead"),
      leadCode: createDocumentCode("LEAD", state.leads.length),
      estimatedValue: numberValue(leadForm.estimatedValue),
      createdAt: now,
      updatedAt: now
    };

    updateState({ ...state, leads: [lead, ...state.leads] }, `Created ${lead.leadCode}`);
    setSelectedLeadCode(lead.leadCode);
    setLeadForm(defaultLead());
  };

  const updateLeadStatus = (leadCode: string, status: string) => {
    const next = state.leads.map((lead) =>
      lead.leadCode === leadCode ? { ...lead, status: status as Lead["status"], updatedAt: new Date().toISOString() } : lead
    );
    updateState({ ...state, leads: next }, "Lead status updated.");
  };

  const createDealFromLead = (lead: Lead) => {
    const stage = pipelineStages.includes(lead.status) ? lead.status : "New Lead";
    const probability = probabilityForStage(stage);
    const deal: Deal = {
      id: createId("deal"),
      dealCode: createDocumentCode("DEAL", state.deals.length),
      leadCode: lead.leadCode,
      clientName: lead.clientName,
      serviceProject: lead.serviceRequired,
      pipelineStage: stage,
      dealValue: lead.estimatedValue,
      probability,
      expectedRevenue: expectedRevenue(lead.estimatedValue, probability),
      expectedClosingDate: lead.nextFollowUp || todayIso(),
      responsiblePerson: lead.responsiblePerson,
      status: stage,
      notes: lead.notes
    };
    updateState({ ...state, deals: [deal, ...state.deals] }, `Created ${deal.dealCode}`);
  };

  const moveDeal = (dealCode: string, stage: string) => {
    const probability = probabilityForStage(stage);
    let closedDeal: ClosedDeal | null = null;
    let lostDeal = null;
    const nextDeals = state.deals.map((deal) => {
      if (deal.dealCode !== dealCode) return deal;
      const updated = {
        ...deal,
        pipelineStage: stage,
        probability,
        expectedRevenue: expectedRevenue(deal.dealValue, probability),
        status: stage
      };

      if (stage === "Closed Won") {
        closedDeal = {
          id: createId("closed"),
          dealCode: deal.dealCode,
          clientName: deal.clientName,
          serviceProject: deal.serviceProject,
          finalValue: deal.dealValue,
          closingDate: todayIso(),
          paymentStatus: "Pending",
          projectStarted: "No",
          responsiblePerson: deal.responsiblePerson,
          notes: "Auto-created from Closed Won pipeline move."
        };
      }

      if (stage === "Closed Lost") {
        lostDeal = {
          id: createId("lost"),
          lostDealCode: createDocumentCode("LOST", state.lostDeals.length),
          clientName: deal.clientName,
          serviceProject: deal.serviceProject,
          estimatedValue: deal.dealValue,
          lostDate: todayIso(),
          reasonLost: "No Response",
          responsiblePerson: deal.responsiblePerson,
          futureFollowUp: "Yes",
          notes: "Auto-created from Closed Lost pipeline move."
        };
      }

      return updated;
    });

    const nextState = {
      ...state,
      deals: nextDeals,
      closedDeals: closedDeal ? [closedDeal, ...state.closedDeals] : state.closedDeals,
      lostDeals: lostDeal ? [lostDeal, ...state.lostDeals] : state.lostDeals
    };

    updateState(nextState, stage === "Closed Won" ? "Deal closed won. Create handover for Operations." : "Pipeline stage updated.");
  };

  const addContactLog = () => {
    if (!selectedLead) {
      setMessage("Create or select a lead first.");
      return;
    }

    const log: ContactLog = {
      id: createId("clog"),
      contactLogCode: createDocumentCode("CLOG", state.contactLogs.length),
      leadCode: selectedLead.leadCode,
      clientName: selectedLead.clientName,
      date: todayIso(),
      method: "WhatsApp",
      discussionSummary: "Client contacted and follow-up recorded.",
      nextAction: "Follow up with proposal or meeting confirmation.",
      nextFollowUp: selectedLead.nextFollowUp || todayIso(),
      responsiblePerson: selectedLead.responsiblePerson
    };

    updateState({ ...state, contactLogs: [log, ...state.contactLogs] }, `Recorded ${log.contactLogCode}`);
  };

  const addMeeting = () => {
    if (!selectedLead) {
      setMessage("Create or select a lead first.");
      return;
    }

    const meeting: Meeting = {
      id: createId("mtg"),
      meetingCode: createDocumentCode("MTG", state.meetings.length),
      leadCode: selectedLead.leadCode,
      clientName: selectedLead.clientName,
      meetingDate: selectedLead.nextFollowUp || todayIso(),
      time: "10:00",
      location: selectedLead.location || "Client office",
      meetingPurpose: selectedLead.serviceRequired,
      meetingStatus: "Scheduled",
      responsiblePerson: selectedLead.responsiblePerson,
      followUpRequired: "Yes",
      notes: "Meeting created from selected lead."
    };

    updateState({ ...state, meetings: [meeting, ...state.meetings] }, `Scheduled ${meeting.meetingCode}`);
  };

  const addSalesDocument = (type: "proposal" | "quotation") => {
    if (!selectedLead) {
      setMessage("Create or select a lead first.");
      return;
    }

    const document: SalesDocument = {
      id: createId(type),
      code: createDocumentCode(type === "proposal" ? "PRO" : "QTN", type === "proposal" ? state.proposals.length : state.quotations.length),
      leadCode: selectedLead.leadCode,
      clientName: selectedLead.clientName,
      projectService: selectedLead.serviceRequired,
      value: selectedLead.estimatedValue,
      dateSent: todayIso(),
      validUntil: todayIso(),
      status: "Draft",
      followUpDate: todayIso(),
      convertedToInvoice: type === "quotation" ? "No" : undefined,
      attachmentUrl: "",
      notes: "Created from selected lead."
    };

    if (type === "proposal") {
      updateState({ ...state, proposals: [document, ...state.proposals] }, `Created ${document.code}`);
    } else {
      updateState({ ...state, quotations: [document, ...state.quotations] }, `Created ${document.code}`);
    }
  };

  const addHandover = (deal?: ClosedDeal) => {
    const source = deal || state.closedDeals[0];
    if (!source) {
      setMessage("Close a won deal first.");
      return;
    }

    const handover: Handover = {
      id: createId("handover"),
      handoverCode: createDocumentCode("HND", state.handovers.length),
      clientName: source.clientName,
      projectService: source.serviceProject,
      approvedValue: source.finalValue,
      paymentStatus: source.paymentStatus,
      handoverDate: todayIso(),
      approvedScope: source.serviceProject,
      clientRequirements: source.notes,
      filesMaterialsReceived: ["Logo", "Brand files", "Content"],
      operationsResponsiblePerson: "Operations",
      salesResponsiblePerson: source.responsiblePerson,
      salesSignature: source.responsiblePerson,
      operationsSignature: "",
      date: todayIso()
    };

    updateState({ ...state, handovers: [handover, ...state.handovers] }, `Created ${handover.handoverCode}`);
  };

  const generateWeeklyReport = () => {
    const report = createWeeklyReportFromState(state, "Management");
    updateState({ ...state, weeklyReports: [report, ...state.weeklyReports] }, "Weekly report generated from CRM data.");
  };

  const targetProgress = [
    ["Target Clients Listed", state.targetClients.filter((item) => item.companyClientName).length, first30DayTargets.targetClientsListed],
    ["Clients Contacted", new Set(state.contactLogs.map((log) => log.leadCode)).size, first30DayTargets.clientsContacted],
    ["Follow-Ups Completed", state.contactLogs.length, first30DayTargets.followUpsCompleted],
    ["Meetings Scheduled", state.meetings.length, first30DayTargets.meetingsScheduled],
    ["Meetings Completed", state.meetings.filter((meeting) => meeting.meetingStatus === "Completed").length, first30DayTargets.meetingsCompleted],
    ["Proposals Sent", proposalsSent.length, first30DayTargets.proposalsSent],
    ["Quotations Sent", quotationsSent.length, first30DayTargets.quotationsSent],
    ["Deals Closed", state.closedDeals.length, first30DayTargets.dealsClosedMax],
    ["Active Projects Started", state.closedDeals.filter((deal) => deal.projectStarted === "Yes").length, first30DayTargets.activeProjectsStartedMax]
  ];

  const dashboard = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Leads" value={state.leads.length} icon={Users} />
        <MetricCard label="New Leads This Month" value={state.leads.filter((lead) => lead.dateAdded.slice(0, 7) === todayIso().slice(0, 7)).length} icon={Plus} />
        <MetricCard label="Active Opportunities" value={activeDeals.length} icon={KanbanSquare} />
        <MetricCard label="Overdue Follow-Ups" value={overdueLeads.length} icon={AlertTriangle} warning={overdueLeads.length > 0} />
        <MetricCard label="Proposals Sent" value={proposalsSent.length} icon={FileText} />
        <MetricCard label="Quotations Sent" value={quotationsSent.length} icon={ClipboardList} />
        <MetricCard label="Meetings Scheduled" value={state.meetings.filter((meeting) => meeting.meetingStatus === "Scheduled").length} icon={CalendarDays} />
        <MetricCard label="Conversion Rate" value={`${conversionRate}%`} icon={BarChart3} />
        <MetricCard label="Total Pipeline Value" value={formatCurrency(pipelineValue)} icon={Target} />
        <MetricCard label="Expected Revenue" value={formatCurrency(expectedPipelineRevenue)} icon={RefreshCw} />
        <MetricCard label="Closed Revenue" value={formatCurrency(closedRevenue)} icon={CheckCircle2} />
        <MetricCard label="Deals Won / Lost" value={`${state.closedDeals.length} / ${state.lostDeals.length}`} icon={Handshake} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>Leads by Status</CardTitle>
          <div className="mt-4 space-y-2">
            {crmStatuses.map((status) => {
              const count = state.leads.filter((lead) => lead.status === status).length;
              return count ? (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span>{status}</span>
                  <Badge tone={statusTone(status)}>{count}</Badge>
                </div>
              ) : null;
            })}
          </div>
        </Card>
        <Card>
          <CardTitle>Today and Upcoming Follow-Ups</CardTitle>
          <div className="mt-4 space-y-2 text-sm text-ink-muted">
            {todayFollowUps.slice(0, 6).map((lead) => (
              <div key={lead.id} className="flex justify-between gap-3">
                <span>{lead.clientName}</span>
                <span>{lead.responsiblePerson}</span>
              </div>
            ))}
            {!todayFollowUps.length ? <p>No follow-ups due today.</p> : null}
          </div>
        </Card>
        <Card>
          <CardTitle>First 30-Day Targets</CardTitle>
          <div className="mt-4 space-y-3">
            {targetProgress.map(([label, current, target]) => (
              <div key={label} className="text-sm">
                <div className="flex justify-between gap-3">
                  <span>{label}</span>
                  <span className="ltr-num">{current}/{target}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full bg-brand-yellow" style={{ width: `${Math.min(100, (Number(current) / Number(target)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const leadsTab = (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Add Lead</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">Lead codes auto-generate as BA-LEAD-2026-001.</p>
          </div>
          <ActionButton onClick={addLead}><Plus className="h-4 w-4" /> Add Lead</ActionButton>
        </div>
        <div className="mt-4">
          <FieldGrid>
            <BrandInput label="Client / Company Name" value={leadForm.clientName} onChange={(event) => setLeadForm({ ...leadForm, clientName: event.target.value })} />
            <BrandInput label="Contact Person" value={leadForm.contactPerson} onChange={(event) => setLeadForm({ ...leadForm, contactPerson: event.target.value })} />
            <BrandInput label="Phone" value={leadForm.phone} onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })} />
            <BrandInput label="Email" type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} />
            <BrandInput label="WhatsApp" value={leadForm.whatsapp} onChange={(event) => setLeadForm({ ...leadForm, whatsapp: event.target.value })} />
            <BrandInput label="Instagram / Website" value={leadForm.instagramWebsite} onChange={(event) => setLeadForm({ ...leadForm, instagramWebsite: event.target.value })} />
            <BrandInput label="Location" value={leadForm.location} onChange={(event) => setLeadForm({ ...leadForm, location: event.target.value })} />
            <BrandSelect label="Lead Source" value={leadForm.leadSource} onChange={(event) => setLeadForm({ ...leadForm, leadSource: event.target.value })}>
              {leadSources.map((source) => <option key={source}>{source}</option>)}
            </BrandSelect>
            <BrandInput label="Industry" value={leadForm.industry} onChange={(event) => setLeadForm({ ...leadForm, industry: event.target.value })} />
            <BrandSelect label="Service Required" value={leadForm.serviceRequired} onChange={(event) => setLeadForm({ ...leadForm, serviceRequired: event.target.value })}>
              {serviceCategories.map((service) => <option key={service}>{service}</option>)}
            </BrandSelect>
            <BrandInput label="Estimated Value" type="number" value={leadForm.estimatedValue} onChange={(event) => setLeadForm({ ...leadForm, estimatedValue: numberValue(event.target.value) })} />
            <BrandSelect label="Priority" value={leadForm.priority} onChange={(event) => setLeadForm({ ...leadForm, priority: event.target.value as Lead["priority"] })}>
              {priorities.map((item) => <option key={item}>{item}</option>)}
            </BrandSelect>
            <BrandSelect label="Status" value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value as Lead["status"] })}>
              {crmStatuses.map((status) => <option key={status}>{status}</option>)}
            </BrandSelect>
            <BrandInput label="Next Follow-Up" type="date" value={leadForm.nextFollowUp} onChange={(event) => setLeadForm({ ...leadForm, nextFollowUp: event.target.value })} />
            <BrandInput label="Responsible Person" value={leadForm.responsiblePerson} onChange={(event) => setLeadForm({ ...leadForm, responsiblePerson: event.target.value })} />
          </FieldGrid>
          <div className="mt-3">
            <BrandTextarea label="Notes" value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} />
          </div>
        </div>
      </Card>
      <DataTable
        title="Master CRM Tracker"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search leads, client, phone, service, status"
        headers={["Lead Code", "Date Added", "Client", "Contact", "Phone", "Source", "Service", "Value", "Priority", "Status", "Next Follow-Up", "Responsible"]}
        rows={leads.map((lead) => [
          lead.leadCode,
          lead.dateAdded,
          lead.clientName,
          lead.contactPerson || "-",
          lead.phone || "-",
          lead.leadSource,
          lead.serviceRequired,
          formatCurrency(lead.estimatedValue),
          <Badge key={`${lead.id}-priority`} tone={priorityTone(lead.priority)}>{lead.priority}</Badge>,
          <BrandSelect key={`${lead.id}-status`} label="Status" value={lead.status} onChange={(event) => updateLeadStatus(lead.leadCode, event.target.value)}>
            {crmStatuses.map((status) => <option key={status}>{status}</option>)}
          </BrandSelect>,
          <Badge key={`${lead.id}-follow`} tone={isOverdue(lead.nextFollowUp) ? "danger" : "info"}>{lead.nextFollowUp || "-"}</Badge>,
          lead.responsiblePerson
        ])}
        rowActions={(index) => {
          const lead = leads[index];
          return (
            <div className="flex justify-end gap-2">
              <ActionButton variant="secondary" onClick={() => setSelectedLeadCode(lead.leadCode)}>Select</ActionButton>
              <ActionButton variant="secondary" onClick={() => createDealFromLead(lead)}>Deal</ActionButton>
            </div>
          );
        }}
        emptyMessage="No leads yet"
      />
    </div>
  );

  const pipelineTab = (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        {pipelineStages.map((stage) => (
          <Card key={stage} className="min-h-64">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{stage}</CardTitle>
              <Badge tone={statusTone(stage)}>{probabilityForStage(stage)}%</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {state.deals.filter((deal) => deal.pipelineStage === stage).map((deal) => (
                <div key={deal.id} className="rounded-md border border-line bg-surface-muted p-3">
                  <p className="text-sm font-semibold text-ink-primary">{deal.clientName}</p>
                  <p className="mt-1 text-xs text-ink-muted">{deal.dealCode} · {formatCurrency(deal.dealValue)}</p>
                  <p className="mt-1 text-xs text-ink-muted">Expected: {formatCurrency(deal.expectedRevenue)}</p>
                  <BrandSelect label="Move stage" value={deal.pipelineStage} onChange={(event) => moveDeal(deal.dealCode, event.target.value)}>
                    {pipelineStages.map((item) => <option key={item}>{item}</option>)}
                  </BrandSelect>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <DataTable
        title="Sales Pipeline Tracker"
        headers={["Deal Code", "Lead Code", "Client", "Service / Project", "Stage", "Value", "Probability", "Expected Revenue", "Closing Date", "Responsible"]}
        rows={state.deals.map((deal) => [
          deal.dealCode,
          deal.leadCode,
          deal.clientName,
          deal.serviceProject,
          <Badge key={`${deal.id}-stage`} tone={statusTone(deal.pipelineStage)}>{deal.pipelineStage}</Badge>,
          formatCurrency(deal.dealValue),
          `${deal.probability}%`,
          formatCurrency(deal.expectedRevenue),
          deal.expectedClosingDate,
          deal.responsiblePerson
        ])}
        emptyMessage="No deals yet"
      />
    </div>
  );

  const activityTab = (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <BrandSelect label="Selected Lead" value={selectedLead?.leadCode || ""} onChange={(event) => setSelectedLeadCode(event.target.value)}>
            {state.leads.map((lead) => <option key={lead.id} value={lead.leadCode}>{lead.leadCode} · {lead.clientName}</option>)}
          </BrandSelect>
          <ActionButton onClick={addContactLog}><Plus className="h-4 w-4" /> Contact Log</ActionButton>
          <ActionButton onClick={addMeeting}><Plus className="h-4 w-4" /> Meeting</ActionButton>
          <ActionButton onClick={() => addSalesDocument("proposal")}><Plus className="h-4 w-4" /> Proposal</ActionButton>
          <ActionButton onClick={() => addSalesDocument("quotation")}><Plus className="h-4 w-4" /> Quotation</ActionButton>
        </div>
      </Card>
      <DataTable
        title="Client Contact Log"
        headers={["Code", "Lead", "Client", "Date", "Method", "Discussion", "Next Action", "Next Follow-Up", "Responsible"]}
        rows={state.contactLogs.map((log) => [log.contactLogCode, log.leadCode, log.clientName, log.date, log.method, log.discussionSummary, log.nextAction, log.nextFollowUp, log.responsiblePerson])}
      />
      <DataTable
        title="Meeting Tracker"
        headers={["Code", "Lead", "Client", "Date", "Time", "Location", "Purpose", "Status", "Follow-Up", "Responsible"]}
        rows={state.meetings.map((meeting) => [meeting.meetingCode, meeting.leadCode, meeting.clientName, meeting.meetingDate, meeting.time, meeting.location, meeting.meetingPurpose, meeting.meetingStatus, meeting.followUpRequired, meeting.responsiblePerson])}
      />
    </div>
  );

  const documentsTab = (
    <div className="space-y-4">
      <DataTable
        title="Proposal Tracker"
        headers={["Code", "Lead", "Client", "Project / Service", "Value", "Date Sent", "Valid Until", "Status", "Follow-Up", "Attachment"]}
        rows={state.proposals.map((item) => [item.code, item.leadCode, item.clientName, item.projectService, formatCurrency(item.value), item.dateSent, item.validUntil, item.status, item.followUpDate, item.attachmentUrl || "-"])}
        emptyMessage="No proposals yet"
      />
      <DataTable
        title="Quotation Tracker"
        headers={["Code", "Lead", "Client", "Service / Item", "Amount", "Date Sent", "Valid Until", "Status", "Invoice", "Attachment"]}
        rows={state.quotations.map((item) => [item.code, item.leadCode, item.clientName, item.projectService, formatCurrency(item.value), item.dateSent, item.validUntil, item.status, item.convertedToInvoice || "No", item.attachmentUrl || "-"])}
        emptyMessage="No quotations yet"
      />
    </div>
  );

  const registersTab = (
    <div className="space-y-4">
      <DataTable
        title="Closed Deal Register"
        headers={["Deal Code", "Client", "Service / Project", "Final Value", "Closing Date", "Payment", "Project Started", "Responsible"]}
        rows={state.closedDeals.map((deal) => [deal.dealCode, deal.clientName, deal.serviceProject, formatCurrency(deal.finalValue), deal.closingDate, deal.paymentStatus, deal.projectStarted, deal.responsiblePerson])}
        rowActions={(index) => <ActionButton variant="secondary" onClick={() => addHandover(state.closedDeals[index])}>Handover</ActionButton>}
      />
      <DataTable
        title="Lost Deal Register"
        headers={["Lost Code", "Client", "Service / Project", "Estimated Value", "Lost Date", "Reason", "Responsible", "Future Follow-Up"]}
        rows={state.lostDeals.map((deal) => [deal.lostDealCode, deal.clientName, deal.serviceProject, formatCurrency(deal.estimatedValue), deal.lostDate, deal.reasonLost, deal.responsiblePerson, deal.futureFollowUp])}
      />
      <DataTable
        title="Sales Handover to Operations"
        headers={["Handover Code", "Client", "Project / Service", "Approved Value", "Payment", "Handover Date", "Operations", "Sales"]}
        rows={state.handovers.map((handover) => [handover.handoverCode, handover.clientName, handover.projectService, formatCurrency(handover.approvedValue), handover.paymentStatus, handover.handoverDate, handover.operationsResponsiblePerson, handover.salesResponsiblePerson])}
      />
    </div>
  );

  const reportsTab = (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Weekly Sales Report</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">Generate from CRM data, then edit notes before management review.</p>
          </div>
          <ActionButton onClick={generateWeeklyReport}><FileText className="h-4 w-4" /> Generate Weekly Report</ActionButton>
        </div>
      </Card>
      <DataTable
        title="Weekly Sales Reports"
        headers={["Week", "Prepared By", "New Leads", "Contacted", "Meetings", "Proposals", "Quotations", "Won", "Lost", "Expected", "Closed"]}
        rows={state.weeklyReports.map((report) => [
          `${report.weekFrom} - ${report.weekTo}`,
          report.preparedBy,
          report.newLeadsAdded,
          report.clientsContacted,
          `${report.meetingsScheduled}/${report.meetingsCompleted}`,
          report.proposalsSent,
          report.quotationsSent,
          report.dealsClosedWon,
          report.dealsClosedLost,
          formatCurrency(report.totalExpectedPipelineValue),
          formatCurrency(report.totalClosedValue)
        ])}
      />
      <DataTable
        title="Target Client List"
        headers={["No.", "Company", "Industry", "Location", "Contact", "Phone", "Service Opportunity", "Priority", "Notes"]}
        rows={state.targetClients.map((client) => [client.no, client.companyClientName || "-", client.industry, client.location || "-", client.contactPerson || "-", client.phone || "-", client.serviceOpportunity, client.priority, client.notes])}
      />
    </div>
  );

  const rulesTab = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle>Follow-Up and Control Rules</CardTitle>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-muted">
          <li>Every new lead must be contacted within 24 hours.</li>
          <li>Every contacted client must receive a next follow-up date.</li>
          <li>No lead should remain without status or responsible person.</li>
          <li>Proposal and quotation follow-up must be done within 2 working days.</li>
          <li>Lost deals must include the reason lost.</li>
          <li>Closed deals must be sent to Finance and Operations.</li>
          <li>Confidential client information must be protected.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>Roles and Responsibilities</CardTitle>
        <div className="mt-4 space-y-3">
          {roleResponsibilities.map((item) => (
            <div key={item.role} className="rounded-md border border-line bg-surface-muted p-3">
              <p className="font-semibold text-ink-primary">{item.role}</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{item.responsibilities}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BA-SALES-TRACKER-2026 · Internal / Sales Confidential"
        title="CRM & Sales Pipeline Tracker"
        description="Excellence is our promise. Quality is never optional."
      />
      {message ? (
        <Card>
          <div className="flex items-start gap-3 text-ink-primary">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
            <p className="text-sm font-semibold">{message}</p>
          </div>
        </Card>
      ) : null}
      <BrandTabs
        tabs={[
          { id: "dashboard", label: "Dashboard", content: dashboard },
          { id: "leads", label: "Leads", content: leadsTab },
          { id: "pipeline", label: "Pipeline", content: pipelineTab },
          { id: "activity", label: "Follow-Ups", content: activityTab },
          { id: "documents", label: "Proposals & Quotations", content: documentsTab },
          { id: "registers", label: "Closed / Lost / Handover", content: registersTab },
          { id: "reports", label: "Reports & Targets", content: reportsTab },
          { id: "rules", label: "Rules & Roles", content: rulesTab }
        ]}
      />
    </div>
  );
}
