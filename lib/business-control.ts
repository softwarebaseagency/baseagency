export const paymentMethods = ["Cash", "Bank Transfer", "Card Payment", "Online Payment", "Cheque", "Other"] as const;

export const expenseCategories = [
  "Office Rent",
  "Salaries",
  "Utilities",
  "Internet",
  "Office Supplies",
  "Transportation",
  "Marketing",
  "Software / Subscriptions",
  "Equipment",
  "Maintenance",
  "Project Cost",
  "Supplier Payment",
  "Government / Legal Fees",
  "Petty Cash",
  "Other"
] as const;

export const invoiceStatuses = ["Unpaid", "Partially Paid", "Paid", "Overdue", "Cancelled"] as const;
export const paymentRequestStatuses = ["Pending", "Approved", "Rejected", "Paid"] as const;

export const employeeStatuses = [
  "Active",
  "On Probation",
  "Confirmed",
  "On Leave",
  "Suspended",
  "Resigned",
  "Terminated",
  "Archived"
] as const;

export const employmentTypes = ["Full-Time", "Part-Time", "Temporary", "Intern"] as const;

export const attendanceStatuses = [
  "Present",
  "Late",
  "Absent",
  "Annual Leave",
  "Sick Leave",
  "Emergency Leave",
  "Unpaid Leave",
  "Official Assignment",
  "Remote Work Approved",
  "Public Holiday",
  "Off Day"
] as const;

export const leaveStatuses = ["Requested", "Approved", "Rejected", "Cancelled", "Completed", "Recorded"] as const;

export const projectStatuses = [
  "Not Started",
  "In Progress",
  "Waiting Client",
  "Waiting Internal Approval",
  "Delayed",
  "Quality Check",
  "Ready for Delivery",
  "Delivered",
  "Completed",
  "Closed",
  "Cancelled"
] as const;

export const taskStatuses = ["Open", "In Progress", "Waiting Client", "Waiting Approval", "Completed", "Delayed", "Cancelled", "Closed"] as const;
export const priorities = ["High", "Medium", "Low"] as const;
export const issueTypes = ["Client Delay", "Internal Delay", "Technical", "Quality", "Finance", "Other"] as const;
export const impactLevels = ["Low", "Medium", "High", "Critical"] as const;

export const packageCategories = [
  "Social Media Management",
  "Printing & Branding",
  "Website & IT Services",
  "Events & Production",
  "Interior Design & Fit-Out",
  "CCTV, Security & Access Control",
  "Combined Monthly Retainer Packages"
] as const;

export const rolePermissions = [
  { role: "CEO / Founder", access: "Full access, major approvals, pricing, HR decisions, high-risk operations." },
  { role: "Management", access: "Dashboards, reports, approvals, performance review." },
  { role: "Sales / Client Relations", access: "CRM, leads, proposals, quotations, follow-ups, package selection." },
  { role: "Finance", access: "Invoices, receipts, income, expenses, payment requests, salary records, finance reports." },
  { role: "HR / Office Admin", access: "Employee files, attendance, leave, probation, HR reports, confidential HR records." },
  { role: "Operations Manager / Project Manager", access: "Projects, tasks, work orders, quality checks, delivery, project closure." },
  { role: "Employee / Team Member", access: "Assigned tasks, own attendance/leave, own task updates." }
];

export const servicePackagesSeed = [
  {
    packageCode: "BA-PKG-2026-001",
    category: "Social Media Management",
    packageName: "Growth Social Media Retainer",
    recommendedFor: "Clinics, restaurants, retail, gyms",
    keyIncludes: "Content calendar, designs, captions, posting, monthly report",
    startingPrice: 650,
    highPrice: 1800,
    currency: "USD",
    billingType: "Monthly",
    pricingMethod: "Retainer range",
    requiresQuotation: "Yes",
    requiresSiteSurvey: "No",
    requiresFinanceApproval: "No",
    requiresOperationsReview: "Yes",
    status: "Active",
    notes: "100% monthly payment in advance or approved monthly billing cycle."
  },
  {
    packageCode: "BA-PKG-2026-002",
    category: "Website & IT Services",
    packageName: "Corporate Website Package",
    recommendedFor: "Corporate offices, schools, medical centers",
    keyIncludes: "UI design, responsive development, basic SEO, launch support",
    startingPrice: 1200,
    highPrice: 4500,
    currency: "USD",
    billingType: "Project",
    pricingMethod: "Scope-based range",
    requiresQuotation: "Yes",
    requiresSiteSurvey: "No",
    requiresFinanceApproval: "Yes",
    requiresOperationsReview: "Yes",
    status: "Active",
    notes: "50% advance, 30% after design approval, 20% before launch."
  },
  {
    packageCode: "BA-PKG-2026-003",
    category: "CCTV, Security & Access Control",
    packageName: "CCTV Installation Starter",
    recommendedFor: "Retail, offices, schools, construction sites",
    keyIncludes: "Site review, equipment list, installation, testing, handover",
    startingPrice: 900,
    highPrice: 6500,
    currency: "USD",
    billingType: "Project",
    pricingMethod: "Site survey and BOQ",
    requiresQuotation: "Yes",
    requiresSiteSurvey: "Yes",
    requiresFinanceApproval: "Yes",
    requiresOperationsReview: "Yes",
    status: "Active",
    notes: "70% advance for equipment, remaining balance before final handover."
  }
];

export type FinanceInvoice = {
  id: string;
  invoiceNo: string;
  clientName: string;
  projectService: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
  paymentMethod: string;
  sourceDealCode?: string;
};

export type FinanceExpense = {
  id: string;
  expenseCode: string;
  category: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
};

export type EmployeeRecord = {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  department: string;
  employmentType: string;
  status: string;
  startDate: string;
  annualLeaveEntitlement: number;
  leaveUsed: number;
  leaveRemaining: number;
  fileCompletion: number;
};

export type AttendanceRecord = {
  id: string;
  attendanceCode: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  status: string;
  lateMinutes: number;
  overtimeHours: number;
  source: string;
};

export type OperationsProject = {
  id: string;
  projectCode: string;
  clientName: string;
  projectService: string;
  status: string;
  priority: string;
  projectManager: string;
  responsibleDivision: string;
  deadline: string;
  approvedValue: number;
  paymentStatus: string;
  progress: number;
  sourceDealCode?: string;
};

export type OperationsTask = {
  id: string;
  taskCode: string;
  projectCode: string;
  title: string;
  status: string;
  priority: string;
  responsiblePerson: string;
  deadline: string;
};

export type ServicePackage = typeof servicePackagesSeed[number] & { id: string };

export type BusinessControlState = {
  invoices: FinanceInvoice[];
  expenses: FinanceExpense[];
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
  projects: OperationsProject[];
  tasks: OperationsTask[];
  packages: ServicePackage[];
  notifications: Array<{ id: string; title: string; message: string; status: string; dueAt: string }>;
  auditLogs: Array<{ id: string; action: string; entity: string; createdAt: string }>;
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCode(prefix: string, existingCount: number, year = 2026) {
  return `BA-${prefix}-${year}-${String(existingCount + 1).padStart(3, "0")}`;
}

export function emptyBusinessControlState(): BusinessControlState {
  return {
    invoices: [],
    expenses: [],
    employees: [],
    attendance: [],
    projects: [],
    tasks: [],
    packages: servicePackagesSeed.map((item, index) => ({ ...item, id: createId(`pkg-${index}`) })),
    notifications: [],
    auditLogs: []
  };
}

export function calculateFinanceSummary(state: BusinessControlState) {
  const income = state.invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const expenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingClientPayments = state.invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const salaryCost = state.expenses.filter((expense) => expense.category === "Salaries").reduce((sum, expense) => sum + expense.amount, 0);
  const officeRent = state.expenses.filter((expense) => expense.category === "Office Rent").reduce((sum, expense) => sum + expense.amount, 0);
  const pettyCash = state.expenses.filter((expense) => expense.category === "Petty Cash").reduce((sum, expense) => sum - expense.amount, 0);

  return {
    income,
    expenses,
    netProfit: income - expenses,
    cashBalance: income - expenses,
    pendingClientPayments,
    salaryCost,
    officeRent,
    pettyCash,
    invoicesIssued: state.invoices.length,
    receiptsIssued: state.invoices.filter((invoice) => invoice.paidAmount > 0).length
  };
}

export function calculateHrSummary(state: BusinessControlState) {
  return {
    totalEmployees: state.employees.length,
    activeEmployees: state.employees.filter((employee) => ["Active", "Confirmed", "On Probation"].includes(employee.status)).length,
    probation: state.employees.filter((employee) => employee.status === "On Probation").length,
    onLeave: state.employees.filter((employee) => employee.status === "On Leave").length,
    lateThisMonth: state.attendance.filter((record) => record.status === "Late" && record.date.slice(0, 7) === todayIso().slice(0, 7)).length,
    absencesThisMonth: state.attendance.filter((record) => record.status === "Absent" && record.date.slice(0, 7) === todayIso().slice(0, 7)).length,
    overtimeHours: state.attendance.reduce((sum, record) => sum + record.overtimeHours, 0),
    incompleteFiles: state.employees.filter((employee) => employee.fileCompletion < 100).length
  };
}

export function calculateOperationsSummary(state: BusinessControlState) {
  return {
    activeProjects: state.projects.filter((project) => !["Completed", "Closed", "Cancelled"].includes(project.status)).length,
    notStarted: state.projects.filter((project) => project.status === "Not Started").length,
    inProgress: state.projects.filter((project) => project.status === "In Progress").length,
    delayedProjects: state.projects.filter((project) => project.status === "Delayed" || (project.deadline < todayIso() && !["Completed", "Closed"].includes(project.status))).length,
    completedProjects: state.projects.filter((project) => project.status === "Completed").length,
    activeTasks: state.tasks.filter((task) => !["Completed", "Closed", "Cancelled"].includes(task.status)).length,
    completedTasks: state.tasks.filter((task) => task.status === "Completed").length,
    delayedTasks: state.tasks.filter((task) => task.status === "Delayed" || (task.deadline < todayIso() && !["Completed", "Closed"].includes(task.status))).length
  };
}
