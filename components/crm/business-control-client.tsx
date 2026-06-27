"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Banknote, BriefcaseBusiness, Building2, CheckCircle2, FileText, PackageCheck, Plus, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandTabs } from "@/components/ui/brand-tabs";
import { Card, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { BrandInput, BrandSelect } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";
import {
  AttendanceRecord,
  BusinessControlState,
  EmployeeRecord,
  FinanceExpense,
  FinanceInvoice,
  OperationsProject,
  OperationsTask,
  attendanceStatuses,
  calculateFinanceSummary,
  calculateHrSummary,
  calculateOperationsSummary,
  createCode,
  createId,
  emptyBusinessControlState,
  employeeStatuses,
  employmentTypes,
  expenseCategories,
  invoiceStatuses,
  packageCategories,
  paymentMethods,
  priorities,
  projectStatuses,
  rolePermissions,
  taskStatuses,
  todayIso
} from "@/lib/business-control";

const storageKey = "base-agency-business-control-v1";
const salesStorageKey = "base-agency-sales-tracker-v1";

function loadState(): BusinessControlState {
  if (typeof window === "undefined") return emptyBusinessControlState();

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...emptyBusinessControlState(), ...JSON.parse(saved) } : emptyBusinessControlState();
  } catch {
    return emptyBusinessControlState();
  }
}

function saveState(state: BusinessControlState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function tone(status: string): "positive" | "warning" | "danger" | "default" | "info" {
  if (["Paid", "Approved", "Completed", "Closed", "Active", "Present", "Confirmed", "Delivered"].includes(status)) return "positive";
  if (["Pending", "Unpaid", "Open", "In Progress", "On Probation", "Requested", "Not Started"].includes(status)) return "warning";
  if (["Overdue", "Rejected", "Delayed", "Absent", "Suspended", "Terminated", "Cancelled"].includes(status)) return "danger";
  return "info";
}

function MetricCard({ label, value, icon: Icon, danger }: { label: string; value: React.ReactNode; icon: any; danger?: boolean }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={danger ? "absolute inset-x-0 top-0 h-1 bg-rose-500" : "absolute inset-x-0 top-0 h-1 bg-brand-yellow"} />
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

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="focus-brand inline-flex h-10 items-center gap-2 rounded-md bg-brand-yellow px-3 text-sm font-semibold text-brand-navy"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function BusinessControlClient() {
  const [state, setState] = useState<BusinessControlState>(() => loadState());
  const [message, setMessage] = useState("");
  const [invoiceForm, setInvoiceForm] = useState({ clientName: "", projectService: "", amount: 0, paidAmount: 0, dueDate: todayIso() });
  const [expenseForm, setExpenseForm] = useState({ title: "", category: "Office Rent", amount: 0, paymentMethod: "Cash" });
  const [employeeForm, setEmployeeForm] = useState({ name: "", role: "", department: "", employmentType: "Full-Time", status: "On Probation", startDate: todayIso() });
  const [projectForm, setProjectForm] = useState({ clientName: "", projectService: "", projectManager: "", responsibleDivision: "Operations", deadline: todayIso(), approvedValue: 0 });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const finance = useMemo(() => calculateFinanceSummary(state), [state]);
  const hr = useMemo(() => calculateHrSummary(state), [state]);
  const ops = useMemo(() => calculateOperationsSummary(state), [state]);

  const setNextState = (next: BusinessControlState, notice: string) => {
    setState(next);
    setMessage(notice);
  };

  const addAudit = (action: string, entity: string) => ({
    id: createId("audit"),
    action,
    entity,
    createdAt: new Date().toISOString()
  });

  const addInvoice = () => {
    if (!invoiceForm.clientName || !invoiceForm.projectService || !invoiceForm.amount) {
      setMessage("Invoice requires client, service, and amount.");
      return;
    }
    const paidAmount = Number(invoiceForm.paidAmount || 0);
    const amount = Number(invoiceForm.amount || 0);
    const invoice: FinanceInvoice = {
      id: createId("invoice"),
      invoiceNo: createCode("INV", state.invoices.length),
      clientName: invoiceForm.clientName,
      projectService: invoiceForm.projectService,
      amount,
      paidAmount,
      remainingAmount: Math.max(0, amount - paidAmount),
      status: paidAmount <= 0 ? "Unpaid" : paidAmount >= amount ? "Paid" : "Partially Paid",
      dueDate: invoiceForm.dueDate,
      paymentMethod: "Bank Transfer"
    };
    setNextState({ ...state, invoices: [invoice, ...state.invoices], auditLogs: [addAudit("Created invoice", invoice.invoiceNo), ...state.auditLogs] }, `Created ${invoice.invoiceNo}`);
  };

  const addExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) {
      setMessage("Expense requires title and amount.");
      return;
    }
    const expense: FinanceExpense = {
      id: createId("expense"),
      expenseCode: createCode("EXPEN", state.expenses.length),
      title: expenseForm.title,
      category: expenseForm.category,
      amount: Number(expenseForm.amount || 0),
      date: todayIso(),
      paymentMethod: expenseForm.paymentMethod,
      status: "Paid"
    };
    setNextState({ ...state, expenses: [expense, ...state.expenses], auditLogs: [addAudit("Recorded expense", expense.expenseCode), ...state.auditLogs] }, `Recorded ${expense.expenseCode}`);
  };

  const addEmployee = () => {
    if (!employeeForm.name || !employeeForm.role) {
      setMessage("Employee requires name and role.");
      return;
    }
    const employee: EmployeeRecord = {
      id: createId("employee"),
      employeeCode: createCode("EMP", state.employees.length),
      name: employeeForm.name,
      role: employeeForm.role,
      department: employeeForm.department || "General",
      employmentType: employeeForm.employmentType,
      status: employeeForm.status,
      startDate: employeeForm.startDate,
      annualLeaveEntitlement: 21,
      leaveUsed: 0,
      leaveRemaining: 21,
      fileCompletion: 40
    };
    setNextState({ ...state, employees: [employee, ...state.employees], auditLogs: [addAudit("Added employee", employee.employeeCode), ...state.auditLogs] }, `Added ${employee.employeeCode}`);
  };

  const addAttendance = (employee: EmployeeRecord, status = "Present") => {
    const attendance: AttendanceRecord = {
      id: createId("attendance"),
      attendanceCode: createCode("HR-ATT", state.attendance.length),
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: todayIso(),
      status,
      lateMinutes: status === "Late" ? 15 : 0,
      overtimeHours: 0,
      source: "Manual / ZKTeco-ready"
    };
    setNextState({ ...state, attendance: [attendance, ...state.attendance], auditLogs: [addAudit("Recorded attendance", attendance.attendanceCode), ...state.auditLogs] }, `Recorded attendance for ${employee.name}`);
  };

  const addProject = () => {
    if (!projectForm.clientName || !projectForm.projectService || !projectForm.projectManager) {
      setMessage("Project requires client, service, and project manager.");
      return;
    }
    const project: OperationsProject = {
      id: createId("project"),
      projectCode: createCode("PRJ", state.projects.length),
      clientName: projectForm.clientName,
      projectService: projectForm.projectService,
      status: "Not Started",
      priority: "Medium",
      projectManager: projectForm.projectManager,
      responsibleDivision: projectForm.responsibleDivision,
      deadline: projectForm.deadline,
      approvedValue: Number(projectForm.approvedValue || 0),
      paymentStatus: "Pending",
      progress: 0
    };
    setNextState({ ...state, projects: [project, ...state.projects], auditLogs: [addAudit("Created project", project.projectCode), ...state.auditLogs] }, `Created ${project.projectCode}`);
  };

  const addTask = (project: OperationsProject) => {
    const task: OperationsTask = {
      id: createId("task"),
      taskCode: createCode("TASK", state.tasks.length),
      projectCode: project.projectCode,
      title: `Kickoff ${project.projectService}`,
      status: "Open",
      priority: project.priority,
      responsiblePerson: project.projectManager,
      deadline: project.deadline
    };
    setNextState({ ...state, tasks: [task, ...state.tasks], auditLogs: [addAudit("Created task", task.taskCode), ...state.auditLogs] }, `Created ${task.taskCode}`);
  };

  const importClosedDealsFromSales = () => {
    try {
      const raw = window.localStorage.getItem(salesStorageKey);
      const sales = raw ? JSON.parse(raw) : null;
      const closedDeals = sales?.closedDeals || [];
      const importedCodes = new Set(state.invoices.map((invoice) => invoice.sourceDealCode).filter(Boolean));
      const newDeals = closedDeals.filter((deal: any) => !importedCodes.has(deal.dealCode));

      if (!newDeals.length) {
        setMessage("No new closed-won CRM deals found to import.");
        return;
      }

      const invoices = newDeals.map((deal: any, index: number): FinanceInvoice => ({
        id: createId("invoice"),
        invoiceNo: createCode("INV", state.invoices.length + index),
        clientName: deal.clientName,
        projectService: deal.serviceProject,
        amount: Number(deal.finalValue || 0),
        paidAmount: 0,
        remainingAmount: Number(deal.finalValue || 0),
        status: "Unpaid",
        dueDate: todayIso(),
        paymentMethod: "Bank Transfer",
        sourceDealCode: deal.dealCode
      }));

      const projects = newDeals.map((deal: any, index: number): OperationsProject => ({
        id: createId("project"),
        projectCode: createCode("PRJ", state.projects.length + index),
        clientName: deal.clientName,
        projectService: deal.serviceProject,
        status: "Not Started",
        priority: "High",
        projectManager: "Operations Manager",
        responsibleDivision: "Operations",
        deadline: todayIso(),
        approvedValue: Number(deal.finalValue || 0),
        paymentStatus: deal.paymentStatus || "Pending",
        progress: 0,
        sourceDealCode: deal.dealCode
      }));

      setNextState(
        {
          ...state,
          invoices: [...invoices, ...state.invoices],
          projects: [...projects, ...state.projects],
          notifications: [
            ...newDeals.map((deal: any) => ({
              id: createId("notification"),
              title: "Closed won deal imported",
              message: `${deal.clientName} needs Finance invoice and Operations kickoff.`,
              status: "PENDING",
              dueAt: todayIso()
            })),
            ...state.notifications
          ],
          auditLogs: [addAudit("Imported closed won CRM deals", `${newDeals.length} deal(s)`), ...state.auditLogs]
        },
        `Imported ${newDeals.length} closed-won deal(s) into Finance and Operations.`
      );
    } catch {
      setMessage("Could not import CRM deals from local Sales Tracker storage.");
    }
  };

  const dashboard = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly Income" value={formatCurrency(finance.income)} icon={Banknote} />
        <MetricCard label="Monthly Expenses" value={formatCurrency(finance.expenses)} icon={FileText} danger={finance.expenses > finance.income} />
        <MetricCard label="Net Profit / Loss" value={formatCurrency(finance.netProfit)} icon={Banknote} danger={finance.netProfit < 0} />
        <MetricCard label="Pending Client Payments" value={formatCurrency(finance.pendingClientPayments)} icon={AlertTriangle} danger={finance.pendingClientPayments > 0} />
        <MetricCard label="Total Employees" value={hr.totalEmployees} icon={Users} />
        <MetricCard label="Incomplete HR Files" value={hr.incompleteFiles} icon={ShieldCheck} danger={hr.incompleteFiles > 0} />
        <MetricCard label="Active Projects" value={ops.activeProjects} icon={BriefcaseBusiness} />
        <MetricCard label="Delayed Tasks" value={ops.delayedTasks} icon={AlertTriangle} danger={ops.delayedTasks > 0} />
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Cross-Module Workflow</CardTitle>
            <p className="mt-2 text-sm text-ink-muted">
              Import closed-won CRM deals to create Finance invoice requirements and Operations project kickoff drafts.
            </p>
          </div>
          <ActionButton onClick={importClosedDealsFromSales}><PackageCheck className="h-4 w-4" /> Import Closed Won Deals</ActionButton>
        </div>
      </Card>
    </div>
  );

  const financeTab = (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <BrandInput label="Client" value={invoiceForm.clientName} onChange={(event) => setInvoiceForm({ ...invoiceForm, clientName: event.target.value })} />
          <BrandInput label="Project / Service" value={invoiceForm.projectService} onChange={(event) => setInvoiceForm({ ...invoiceForm, projectService: event.target.value })} />
          <BrandInput label="Amount" type="number" value={invoiceForm.amount} onChange={(event) => setInvoiceForm({ ...invoiceForm, amount: Number(event.target.value) })} />
          <BrandInput label="Paid Amount" type="number" value={invoiceForm.paidAmount} onChange={(event) => setInvoiceForm({ ...invoiceForm, paidAmount: Number(event.target.value) })} />
          <BrandInput label="Due Date" type="date" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, dueDate: event.target.value })} />
        </div>
        <div className="mt-3"><ActionButton onClick={addInvoice}><Plus className="h-4 w-4" /> Create Invoice</ActionButton></div>
      </Card>
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <BrandInput label="Expense Title" value={expenseForm.title} onChange={(event) => setExpenseForm({ ...expenseForm, title: event.target.value })} />
          <BrandSelect label="Category" value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}>
            {expenseCategories.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
          <BrandInput label="Amount" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: Number(event.target.value) })} />
          <BrandSelect label="Payment Method" value={expenseForm.paymentMethod} onChange={(event) => setExpenseForm({ ...expenseForm, paymentMethod: event.target.value })}>
            {paymentMethods.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
        </div>
        <div className="mt-3"><ActionButton onClick={addExpense}><Plus className="h-4 w-4" /> Record Expense</ActionButton></div>
      </Card>
      <DataTable
        title="Invoice Register"
        headers={["Invoice No", "Client", "Project / Service", "Amount", "Paid", "Remaining", "Status", "Due Date", "Source Deal"]}
        rows={state.invoices.map((invoice) => [invoice.invoiceNo, invoice.clientName, invoice.projectService, formatCurrency(invoice.amount), formatCurrency(invoice.paidAmount), formatCurrency(invoice.remainingAmount), <Badge key={invoice.id} tone={tone(invoice.status)}>{invoice.status}</Badge>, invoice.dueDate, invoice.sourceDealCode || "-"])}
      />
      <DataTable
        title="Expense Register"
        headers={["Code", "Title", "Category", "Amount", "Date", "Payment", "Status"]}
        rows={state.expenses.map((expense) => [expense.expenseCode, expense.title, expense.category, formatCurrency(expense.amount), expense.date, expense.paymentMethod, expense.status])}
      />
    </div>
  );

  const hrTab = (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <BrandInput label="Employee Name" value={employeeForm.name} onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })} />
          <BrandInput label="Role" value={employeeForm.role} onChange={(event) => setEmployeeForm({ ...employeeForm, role: event.target.value })} />
          <BrandInput label="Department" value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })} />
          <BrandSelect label="Employment Type" value={employeeForm.employmentType} onChange={(event) => setEmployeeForm({ ...employeeForm, employmentType: event.target.value })}>
            {employmentTypes.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
          <BrandSelect label="Status" value={employeeForm.status} onChange={(event) => setEmployeeForm({ ...employeeForm, status: event.target.value })}>
            {employeeStatuses.map((item) => <option key={item}>{item}</option>)}
          </BrandSelect>
        </div>
        <div className="mt-3"><ActionButton onClick={addEmployee}><Plus className="h-4 w-4" /> Add Employee</ActionButton></div>
      </Card>
      <DataTable
        title="Employee Register"
        headers={["Code", "Name", "Role", "Department", "Type", "Status", "Leave", "File Completion"]}
        rows={state.employees.map((employee) => [employee.employeeCode, employee.name, employee.role, employee.department, employee.employmentType, <Badge key={employee.id} tone={tone(employee.status)}>{employee.status}</Badge>, `${employee.leaveRemaining}/${employee.annualLeaveEntitlement}`, `${employee.fileCompletion}%`])}
        rowActions={(index) => {
          const employee = state.employees[index];
          return <ActionButton onClick={() => addAttendance(employee)}><Plus className="h-4 w-4" /> Attendance</ActionButton>;
        }}
      />
      <DataTable
        title="Attendance Register"
        headers={["Code", "Employee", "Date", "Status", "Late Minutes", "Overtime", "Source"]}
        rows={state.attendance.map((record) => [record.attendanceCode, `${record.employeeCode} · ${record.employeeName}`, record.date, <Badge key={record.id} tone={tone(record.status)}>{record.status}</Badge>, record.lateMinutes, record.overtimeHours, record.source])}
      />
    </div>
  );

  const operationsTab = (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <BrandInput label="Client" value={projectForm.clientName} onChange={(event) => setProjectForm({ ...projectForm, clientName: event.target.value })} />
          <BrandInput label="Project / Service" value={projectForm.projectService} onChange={(event) => setProjectForm({ ...projectForm, projectService: event.target.value })} />
          <BrandInput label="Project Manager" value={projectForm.projectManager} onChange={(event) => setProjectForm({ ...projectForm, projectManager: event.target.value })} />
          <BrandInput label="Division" value={projectForm.responsibleDivision} onChange={(event) => setProjectForm({ ...projectForm, responsibleDivision: event.target.value })} />
          <BrandInput label="Deadline" type="date" value={projectForm.deadline} onChange={(event) => setProjectForm({ ...projectForm, deadline: event.target.value })} />
        </div>
        <div className="mt-3"><ActionButton onClick={addProject}><Plus className="h-4 w-4" /> Create Project</ActionButton></div>
      </Card>
      <DataTable
        title="Project Register"
        headers={["Project Code", "Client", "Service", "Status", "Priority", "Manager", "Division", "Deadline", "Value", "Progress"]}
        rows={state.projects.map((project) => [project.projectCode, project.clientName, project.projectService, <Badge key={project.id} tone={tone(project.status)}>{project.status}</Badge>, project.priority, project.projectManager, project.responsibleDivision, project.deadline, formatCurrency(project.approvedValue), `${project.progress}%`])}
        rowActions={(index) => <ActionButton onClick={() => addTask(state.projects[index])}><Plus className="h-4 w-4" /> Task</ActionButton>}
      />
      <DataTable
        title="Task Assignment Register"
        headers={["Task Code", "Project", "Title", "Status", "Priority", "Responsible", "Deadline"]}
        rows={state.tasks.map((task) => [task.taskCode, task.projectCode, task.title, <Badge key={task.id} tone={tone(task.status)}>{task.status}</Badge>, task.priority, task.responsiblePerson, task.deadline])}
      />
    </div>
  );

  const packagesTab = (
    <div className="space-y-4">
      <DataTable
        title="Service Packages & Price List"
        headers={["Code", "Category", "Package / Service", "Recommended For", "Includes", "Starting", "High", "Billing", "Quotation", "Survey", "Finance", "Operations", "Status"]}
        rows={state.packages.map((item) => [item.packageCode, item.category, item.packageName, item.recommendedFor, item.keyIncludes, formatCurrency(item.startingPrice), formatCurrency(item.highPrice), item.billingType, item.requiresQuotation, item.requiresSiteSurvey, item.requiresFinanceApproval, item.requiresOperationsReview, <Badge key={item.id} tone={tone(item.status)}>{item.status}</Badge>])}
      />
      <Card>
        <CardTitle>Price Control Rules</CardTitle>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-muted">
          <li>All prices are internal recommended starting prices or ranges.</li>
          <li>Final quotation must consider scope, supplier costs, location, urgency, taxes, delivery, and approval.</li>
          <li>Discount up to 5% may be approved by Sales Manager or Management if margin is safe.</li>
          <li>Discount between 5% and 10% requires Finance and Management review.</li>
          <li>Discount above 10% requires CEO approval.</li>
        </ul>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-4">
      <DataTable
        title="Notifications & Reminders"
        headers={["Title", "Message", "Status", "Due"]}
        rows={state.notifications.map((item) => [item.title, item.message, <Badge key={item.id} tone={tone(item.status)}>{item.status}</Badge>, item.dueAt])}
      />
      <DataTable
        title="Audit Logs"
        headers={["Action", "Entity", "Created At"]}
        rows={state.auditLogs.map((item) => [item.action, item.entity, new Date(item.createdAt).toLocaleString()])}
      />
      <Card>
        <CardTitle>Role-Based Access</CardTitle>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {rolePermissions.map((item) => (
            <div key={item.role} className="rounded-md border border-line bg-surface-muted p-3">
              <p className="font-semibold text-ink-primary">{item.role}</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{item.access}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BASE AGENCY Business Control System"
        title="Internal Business Management"
        description="Unified control for Sales, Finance, HR, Operations, Service Packages, reports, permissions, notifications, attachments, and audit logs."
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
          { id: "dashboard", label: "Shared Dashboard", content: dashboard },
          { id: "finance", label: "Finance", content: financeTab },
          { id: "hr", label: "HR & Attendance", content: hrTab },
          { id: "operations", label: "Operations", content: operationsTab },
          { id: "packages", label: "Service Packages", content: packagesTab },
          { id: "reports", label: "Reports / Roles / Audit", content: reportsTab }
        ]}
      />
    </div>
  );
}
