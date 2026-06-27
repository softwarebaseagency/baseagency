export type ModuleSection = {
  id: string;
  title: string;
  kind: "overview" | "dashboard" | "reference" | "register" | "report" | "workflow";
  description: string;
  codePrefix?: string;
  fields?: string[];
  options?: string[];
  rules?: string[];
};

export type DocumentModule = {
  id: string;
  title: string;
  documentCode: string;
  route: string;
  purpose: string;
  sections: ModuleSection[];
};

const salesSections: ModuleSection[] = [
  { id: "overview", title: "Overview / Purpose", kind: "overview", description: "Record, manage, follow up, and convert leads into paying clients for BASE AGENCY." },
  { id: "objectives", title: "Sales Objectives", kind: "reference", description: "Sales goals and operating objectives for client acquisition and pipeline discipline.", rules: ["Record all potential clients", "Track every opportunity", "Avoid lost clients from weak follow-up", "Prepare weekly sales reports"] },
  { id: "status-definitions", title: "CRM Status Definitions", kind: "reference", description: "Seeded CRM status options used by lead and pipeline forms.", options: ["New Lead", "Contacted", "Interested", "Meeting Scheduled", "Meeting Completed", "Proposal Required", "Proposal Sent", "Quotation Sent", "Waiting Client", "Negotiation", "Approved", "Invoice Required", "Project Started", "Closed Won", "Closed Lost", "Follow-Up Later", "Not Qualified"] },
  { id: "lead-sources", title: "Lead Sources", kind: "reference", description: "Seeded lead source dropdown options.", options: ["Website", "Instagram", "Facebook", "LinkedIn", "TikTok", "WhatsApp", "Phone call", "Referral", "Walk-in", "Existing client", "Event / Exhibition", "Sales visit", "Google search", "Personal network", "Other"] },
  { id: "service-categories", title: "Service Categories", kind: "reference", description: "Official BASE AGENCY service categories for CRM and proposals.", options: ["Events Management & Production", "Marketing, Advertising & Brand Communications", "Print Production & Promotional Solutions", "Architecture, Interior Design & Fit-Out", "IT, Software Development & Cybersecurity", "Robotics, Automation & Intelligent Systems", "Networking, Telecommunications & Infrastructure", "Audio Visual, Broadcasting & Media Systems", "Security, Surveillance & Access Control Systems", "Artificial Intelligence, Data Analytics & Digital Transformation"] },
  { id: "leads", title: "Master CRM Tracker", kind: "register", description: "Daily lead management register.", codePrefix: "LEAD", fields: ["Date Added", "Client / Company Name", "Contact Person", "Phone", "Email", "WhatsApp", "Instagram / Website", "Location", "Lead Source", "Industry", "Service Required", "Estimated Value", "Priority", "Status", "Next Follow-Up", "Responsible Person", "Notes"] },
  { id: "pipeline", title: "Sales Pipeline Tracker", kind: "register", description: "Deal stage, probability, value, and expected revenue tracker.", codePrefix: "DEAL", fields: ["Lead Code", "Client Name", "Service / Project", "Pipeline Stage", "Deal Value", "Probability %", "Expected Revenue", "Expected Closing Date", "Responsible Person", "Status", "Notes"] },
  { id: "probability", title: "Pipeline Stages & Probability", kind: "reference", description: "Default probabilities for expected revenue calculations.", options: ["New Lead: 10%", "Contacted: 20%", "Interested: 30%", "Meeting Scheduled: 40%", "Meeting Completed: 45%", "Proposal Sent: 50%", "Quotation Sent: 60%", "Negotiation: 70%", "Approved: 90%", "Closed Won: 100%", "Closed Lost: 0%"] },
  { id: "contact-log", title: "Client Contact Log", kind: "register", description: "Client communication timeline and next action log.", codePrefix: "CLOG", fields: ["Lead Code", "Client Name", "Date", "Method", "Discussion Summary", "Next Action", "Next Follow-Up", "Responsible Person"] },
  { id: "meetings", title: "Meeting Tracker", kind: "register", description: "Scheduled/completed/cancelled meeting tracker.", codePrefix: "MTG", fields: ["Lead Code", "Client Name", "Meeting Date", "Time", "Location", "Meeting Purpose", "Meeting Status", "Responsible Person", "Follow-Up Required", "Notes"] },
  { id: "proposals", title: "Proposal Tracker", kind: "register", description: "Proposal document and follow-up tracker.", codePrefix: "PRO", fields: ["Lead Code", "Client Name", "Project / Service", "Proposal Value", "Date Sent", "Valid Until", "Status", "Follow-Up Date", "Attachment/File URL", "Notes"] },
  { id: "quotations", title: "Quotation Tracker", kind: "register", description: "Quotation document and invoice conversion tracker.", codePrefix: "QTN", fields: ["Lead Code", "Client Name", "Service / Item", "Amount", "Date Sent", "Valid Until", "Status", "Converted to Invoice", "Attachment/File URL", "Notes"] },
  { id: "closed-deals", title: "Closed Deal Register", kind: "register", description: "Closed won deals and finance/operations readiness.", codePrefix: "DEAL", fields: ["Client Name", "Service / Project", "Final Value", "Closing Date", "Payment Status", "Project Started", "Responsible Person", "Notes"] },
  { id: "lost-deals", title: "Lost Deal Register", kind: "register", description: "Closed lost register with required reason lost.", codePrefix: "LOST", fields: ["Client Name", "Service / Project", "Estimated Value", "Lost Date", "Reason Lost", "Responsible Person", "Future Follow-Up", "Notes"] },
  { id: "daily-activity", title: "Daily Sales Activity", kind: "register", description: "Daily activity tracker for sales discipline.", fields: ["Date", "Salesperson", "Calls Made", "WhatsApp Messages", "Emails Sent", "Meetings Scheduled", "Proposals Sent", "Quotations Sent", "Follow-Ups Completed", "Notes"] },
  { id: "weekly-report", title: "Weekly Sales Report", kind: "report", description: "Weekly report generator for sales management review.", fields: ["Week From", "Week To", "Prepared By", "New Leads Added", "Clients Contacted", "Meetings Scheduled", "Meetings Completed", "Proposals Sent", "Quotations Sent", "Deals Approved", "Deals Closed Won", "Deals Closed Lost", "Total Expected Pipeline Value", "Total Closed Value", "Weekly Sales Summary", "Main Problems", "Next Week Sales Plan"] },
  { id: "targets", title: "First 30-Day Sales Targets", kind: "dashboard", description: "Target progress for first-month sales activity." },
  { id: "target-clients", title: "Target Client List", kind: "register", description: "Target account list for priority outreach.", fields: ["No.", "Company / Client Name", "Industry", "Location", "Contact Person", "Phone", "Instagram / Website", "Service Opportunity", "Priority", "Notes"] },
  { id: "priority", title: "Lead Priority System", kind: "reference", description: "High/Medium/Low priority definition and validation.", rules: ["High: budget, urgent need, decision-maker, clear service requirement", "Medium: interested but needs time or review", "Low: not ready or unclear budget"] },
  { id: "follow-up-rules", title: "Follow-Up Rules", kind: "reference", description: "Follow-up warning and control rules.", rules: ["New leads must be contacted within 24 hours", "Contacted clients must have next follow-up date", "Proposal/quotation follow-up within 2 working days", "Important communication must be logged"] },
  { id: "handover", title: "Sales Handover", kind: "workflow", description: "Sales-to-Operations handover form and approval workflow.", codePrefix: "HND", fields: ["Client Name", "Project / Service", "Approved Value", "Payment Status", "Handover Date", "Approved Scope", "Client Requirements", "Files / Materials Received", "Operations Responsible Person", "Sales Responsible Person", "Sales Signature", "Operations Signature"] },
  { id: "dashboard", title: "Sales Dashboard", kind: "dashboard", description: "Sales KPI cards, status summaries, source summaries, and overdue follow-ups." },
  { id: "reporting-routine", title: "Reporting Routine", kind: "reference", description: "Daily, weekly, and monthly CRM reporting rhythm.", rules: ["Daily CRM update", "Weekly sales report", "Monthly performance review"] },
  { id: "responsibilities", title: "Responsibilities", kind: "reference", description: "CEO, Sales, Finance, Operations, and Management responsibilities." },
  { id: "actions", title: "Sales Action Tracker", kind: "register", description: "Sales action items, overdue follow-ups, and accountability tracker.", codePrefix: "SALES-ACT", fields: ["Lead Code", "Client Name", "Action", "Responsible Person", "Due Date", "Priority", "Status", "Notes"] },
  { id: "control-rules", title: "Control Rules", kind: "reference", description: "Sales tracker governance and confidentiality controls." }
];

const financeSections: ModuleSection[] = [
  { id: "overview", title: "Overview / Purpose", kind: "overview", description: "Control income, expenses, invoices, receipts, payments, petty cash, salaries, cash flow, and reports." },
  { id: "objectives", title: "Finance Objectives", kind: "reference", description: "Financial control goals for income recording, expense control, profitability, and cash visibility." },
  { id: "dashboard", title: "Finance Dashboard", kind: "dashboard", description: "Monthly income, expenses, profit/loss, cash balance, pending payments, salaries, rent, petty cash, invoices, and receipts." },
  { id: "income", title: "Income Register", kind: "register", description: "Income records and payment source tracking.", codePrefix: "INC", fields: ["Income Code", "Date", "Client", "Project / Service", "Amount", "Payment Method", "Reference", "Notes"] },
  { id: "expenses", title: "Expense Register", kind: "register", description: "Expense records by category and payment method.", codePrefix: "EXPEN", fields: ["Expense Code", "Date", "Category", "Title", "Amount", "Payment Method", "Paid By", "Attachment", "Notes"] },
  { id: "invoices", title: "Invoice Register", kind: "register", description: "Client invoice register and remaining amount calculation.", codePrefix: "INV", fields: ["Invoice No", "Client", "Project / Service", "Invoice Date", "Due Date", "Amount", "Paid Amount", "Remaining Amount", "Status"] },
  { id: "receipts", title: "Receipt Register", kind: "register", description: "Client receipt issuance and payment confirmation.", codePrefix: "RCT", fields: ["Receipt No", "Invoice No", "Client", "Amount", "Payment Method", "Received Date", "Received By", "Notes"] },
  { id: "payment-requests", title: "Payment Request Register", kind: "register", description: "Payment request approval workflow.", codePrefix: "FIN-PRF", fields: ["Request No", "Requester", "Purpose", "Amount", "Status", "Approved By", "Paid At", "Notes"] },
  { id: "petty-cash", title: "Petty Cash Register", kind: "register", description: "Petty cash inflow/outflow and balance.", codePrefix: "PC", fields: ["Petty Cash Code", "Date", "Type", "Amount", "Purpose", "Balance", "Responsible Person", "Notes"] },
  { id: "salary", title: "Salary Register", kind: "register", description: "Confidential salary register and net salary calculation.", fields: ["Employee Code", "Employee Name", "Basic Salary", "Allowance", "Deduction", "Net Salary", "Month", "Status"] },
  { id: "supplier-payments", title: "Supplier Payment Register", kind: "register", description: "Supplier payments linked to projects and expenses.", codePrefix: "SUP-PAY", fields: ["Supplier Payment Code", "Supplier", "Project", "Amount", "Payment Method", "Status", "Date", "Notes"] },
  { id: "fixed-costs", title: "Fixed Monthly Costs", kind: "register", description: "Recurring fixed monthly cost tracker.", fields: ["Cost Name", "Category", "Amount", "Day of Month", "Status", "Notes"] },
  { id: "profit-loss", title: "Profit & Loss Summary", kind: "report", description: "Income minus expenses by month and category.", codePrefix: "PL", fields: ["Period", "Total Income", "Total Expenses", "Net Profit / Loss", "Prepared By", "Notes"] },
  { id: "cash-flow", title: "Cash Flow Summary", kind: "report", description: "Cash inflow and outflow summary by date range.", codePrefix: "CF", fields: ["Period", "Cash In", "Cash Out", "Cash Balance", "Prepared By", "Notes"] },
  { id: "monthly-report", title: "Monthly Finance Report", kind: "report", description: "Monthly finance report with prepared/reviewed/approved workflow." },
  { id: "actions", title: "Finance Action Tracker", kind: "register", description: "Finance action items and accountability.", codePrefix: "FIN-ACT", fields: ["Action Code", "Date", "Action", "Responsible Person", "Due Date", "Status", "Notes"] },
  { id: "control-rules", title: "Finance Control Rules", kind: "reference", description: "Required finance controls and confidentiality rules.", rules: ["Every income and expense must be recorded", "Payment requests must be approved before payment", "Salary records are confidential", "Monthly finance report must be prepared"] }
];

const hrSections: ModuleSection[] = [
  { id: "overview", title: "Overview / Purpose", kind: "overview", description: "Manage employees, files, contracts, attendance, leave, overtime, probation, evaluations, assets, IT access, and exits." },
  { id: "objectives", title: "HR Objectives", kind: "reference", description: "HR control objectives for compliant employee files and attendance governance." },
  { id: "dashboard", title: "HR Dashboard", kind: "dashboard", description: "Employee, attendance, file, leave, probation, evaluation, warning, and training indicators." },
  { id: "employees", title: "Employee Register", kind: "register", description: "Employee master register.", codePrefix: "EMP", fields: ["Employee Code", "Name", "Role", "Department", "Employment Type", "Status", "Start Date", "Annual Leave Entitlement", "File Completion"] },
  { id: "file-checklist", title: "Employee File Checklist", kind: "register", description: "Required HR document checklist.", fields: ["Employee Code", "CV", "ID", "Contract", "Job Description", "Photo", "Bank Info", "Emergency Contact", "Completion %"] },
  { id: "agreements", title: "Employment Agreement Register", kind: "register", description: "Employment agreement document register.", codePrefix: "HR-AGR", fields: ["Agreement Code", "Employee Code", "Employee Name", "Start Date", "End Date", "Status", "Attachment"] },
  { id: "job-descriptions", title: "Job Description Register", kind: "register", description: "Job description records.", codePrefix: "HR-JD", fields: ["JD Code", "Employee Code", "Role", "Department", "Issue Date", "Signed", "Attachment"] },
  { id: "attendance", title: "Attendance Register", kind: "register", description: "Daily attendance and ZKTeco-ready records.", fields: ["Employee Code", "Employee Name", "Date", "Status", "Check In", "Check Out", "Source", "Notes"] },
  { id: "fingerprint", title: "Fingerprint Registration Register", kind: "register", description: "ZKTeco/fingerprint enrollment tracker.", codePrefix: "HR-FP", fields: ["Fingerprint Code", "Employee Code", "Enroll Number", "Device", "Registered Date", "Status"] },
  { id: "lateness", title: "Lateness Register", kind: "register", description: "Late arrivals and calculated minutes.", codePrefix: "HR-LATE", fields: ["Lateness Code", "Employee Code", "Date", "Expected Time", "Actual Time", "Late Minutes", "Reason"] },
  { id: "absence", title: "Absence Register", kind: "register", description: "Absence records.", codePrefix: "HR-ABS", fields: ["Absence Code", "Employee Code", "Date", "Reason", "Approved", "Notes"] },
  { id: "leave", title: "Leave Register", kind: "register", description: "Leave request and approval tracker.", codePrefix: "HR-LEAVE", fields: ["Leave Code", "Employee Code", "Leave Type", "From", "To", "Days", "Status", "Approved By"] },
  { id: "leave-balance", title: "Annual Leave Balance", kind: "register", description: "21 working days entitlement, used and remaining balance.", fields: ["Employee Code", "Year", "Entitlement Days", "Used Days", "Remaining Days"] },
  { id: "overtime", title: "Overtime Register", kind: "register", description: "Approved overtime records.", codePrefix: "HR-OT", fields: ["Overtime Code", "Employee Code", "Date", "Hours", "Approved By", "Status"] },
  { id: "probation", title: "Probation Review Register", kind: "register", description: "90-day probation review tracker.", codePrefix: "HR-PROB", fields: ["Probation Code", "Employee Code", "Start Date", "Review Due", "Status", "Reviewer", "Notes"] },
  { id: "evaluations", title: "Employee Evaluation Register", kind: "register", description: "Employee evaluation records.", codePrefix: "HR-EVAL", fields: ["Evaluation Code", "Employee Code", "Period", "Score", "Reviewer", "Status", "Notes"] },
  { id: "training", title: "Training Register", kind: "register", description: "Training record tracker.", codePrefix: "HR-TRN", fields: ["Training Code", "Employee Code", "Training", "Date", "Provider", "Status"] },
  { id: "disciplinary", title: "Warning & Disciplinary Register", kind: "register", description: "Warnings and disciplinary records.", fields: ["Employee Code", "Date", "Type", "Reason", "Action Taken", "Attachment"] },
  { id: "assets", title: "Asset Handover Register", kind: "register", description: "Employee asset handover records.", fields: ["Employee Code", "Asset", "Serial", "Handover Date", "Return Date", "Status"] },
  { id: "it-access", title: "IT Access Register", kind: "register", description: "System and account access records.", fields: ["Employee Code", "System", "Access Level", "Granted Date", "Revoked Date", "Status"] },
  { id: "exit", title: "Resignation & Termination Register", kind: "register", description: "Exit records.", fields: ["Employee Code", "Type", "Notice Date", "Last Working Day", "Reason", "Status"] },
  { id: "clearance", title: "Exit Clearance Register", kind: "register", description: "Exit clearance checklist.", fields: ["Employee Code", "Assets Returned", "IT Access Revoked", "Finance Cleared", "HR Cleared", "Status"] },
  { id: "monthly-report", title: "Monthly HR Report", kind: "report", description: "Monthly HR report with prepared/reviewed/approved workflow." },
  { id: "actions", title: "HR Action Tracker", kind: "register", description: "HR action item tracker.", codePrefix: "HR-ACT", fields: ["Action Code", "Date", "Action", "Responsible Person", "Due Date", "Status", "Notes"] },
  { id: "control-rules", title: "HR Control Rules", kind: "reference", description: "HR confidentiality and compliance controls.", rules: ["Every employee must have an employee code", "Attendance must be recorded daily", "Leave must be approved", "Probation must be reviewed within 90 days", "HR records are confidential"] }
];

const operationsSections: ModuleSection[] = [
  { id: "overview", title: "Overview / Purpose", kind: "overview", description: "Manage projects, tasks, work orders, issues, quality checks, approvals, delivery, and closure." },
  { id: "objectives", title: "Operations Objectives", kind: "reference", description: "Delivery control, accountability, timelines, quality, and client approval objectives." },
  { id: "dashboard", title: "Operations Dashboard", kind: "dashboard", description: "Active projects, delayed projects/tasks, quality checks, approvals, deliveries, and issues." },
  { id: "statuses", title: "Project Status Definitions", kind: "reference", description: "Project status options.", options: ["Not Started", "In Progress", "Waiting Client", "Waiting Internal Approval", "Delayed", "Quality Check", "Ready for Delivery", "Delivered", "Completed", "Closed", "Cancelled"] },
  { id: "projects", title: "Project Register", kind: "register", description: "Project master register.", codePrefix: "PRJ", fields: ["Project Code", "Client", "Project / Service", "Status", "Priority", "Project Manager", "Responsible Division", "Deadline", "Approved Value", "Payment Status", "Progress"] },
  { id: "divisions", title: "Service Division Options", kind: "reference", description: "Operations division options used by project and task records.", options: ["Events", "Marketing", "Printing", "Fit-Out", "IT / Software", "Security / CCTV", "AV / Media", "Operations"] },
  { id: "kickoff", title: "Project Kickoff Register", kind: "register", description: "Kickoff records after handover.", codePrefix: "OPS-KO", fields: ["Kickoff Code", "Project Code", "Kickoff Date", "Scope Confirmed", "Payment Status", "Project Manager", "Notes"] },
  { id: "tasks", title: "Task Assignment Register", kind: "register", description: "Task assignment and deadline tracking.", codePrefix: "TASK", fields: ["Task Code", "Project Code", "Title", "Status", "Priority", "Responsible Person", "Deadline"] },
  { id: "work-orders", title: "Work Order Register", kind: "register", description: "Work orders for execution teams.", codePrefix: "WO", fields: ["Work Order No", "Project Code", "Division", "Work Description", "Assigned To", "Due Date", "Status"] },
  { id: "timeline", title: "Project Timeline Tracker", kind: "register", description: "Project timeline milestones.", codePrefix: "TL", fields: ["Timeline Code", "Project Code", "Milestone", "Start Date", "End Date", "Status"] },
  { id: "daily-tasks", title: "Daily Task Tracker", kind: "register", description: "Daily task updates.", fields: ["Date", "Employee", "Project Code", "Task", "Status", "Notes"] },
  { id: "weekly-report", title: "Weekly Operations Report", kind: "report", description: "Weekly operations report with project/task/issue status." },
  { id: "issues", title: "Issue & Delay Register", kind: "register", description: "Issues and delays requiring early reporting.", codePrefix: "ISS", fields: ["Issue Code", "Project Code", "Issue Type", "Impact Level", "Description", "Status", "Responsible Person", "Due Date"] },
  { id: "quality", title: "Quality Check Register", kind: "register", description: "Quality checks before delivery.", fields: ["Project Code", "Check Date", "Checked By", "Result", "Notes", "Approved"] },
  { id: "client-approval", title: "Client Approval Register", kind: "register", description: "Client approval records.", fields: ["Project Code", "Approval Date", "Approved By", "Status", "Attachment", "Notes"] },
  { id: "delivery", title: "Delivery Handover Register", kind: "register", description: "Delivery handover records.", fields: ["Project Code", "Delivery Date", "Delivered By", "Received By", "Status", "Notes"] },
  { id: "closure", title: "Project Closure Register", kind: "register", description: "Project closure and archive readiness.", fields: ["Project Code", "Closure Date", "Closed By", "Client Approval", "Finance Cleared", "Status"] },
  { id: "resources", title: "Resource & Responsibility Tracker", kind: "register", description: "Resource and responsibility assignment.", fields: ["Project Code", "Resource", "Responsible Person", "Role", "Start Date", "End Date"] },
  { id: "workload", title: "Division Workload Tracker", kind: "register", description: "Workload by division and responsible employee.", fields: ["Division", "Period", "Active Projects", "Active Tasks", "Delayed Tasks", "Capacity Status", "Owner", "Notes"] },
  { id: "actions", title: "Operations Action Tracker", kind: "register", description: "Operations action item tracker.", codePrefix: "OPS-ACT", fields: ["Action Code", "Project Code", "Action", "Responsible Person", "Due Date", "Status"] },
  { id: "control-rules", title: "Operations Control Rules", kind: "reference", description: "Operations governance and delivery controls.", rules: ["Every project must have project code and manager", "Every task must have responsible person and deadline", "Delays must be recorded", "Quality check before delivery", "Client approval before closure"] }
];

const packagesSections: ModuleSection[] = [
  { id: "overview", title: "Overview / Purpose", kind: "overview", description: "Controlled pricing reference for proposals, quotations, client outreach, and sales conversion." },
  { id: "scope", title: "Scope", kind: "reference", description: "Applies to Sales, Finance, Operations, and Management pricing decisions." },
  { id: "pricing-note", title: "Pricing Control Note", kind: "reference", description: "Prices are recommended ranges; final quotation requires scope, costs, and approval." },
  { id: "overview-packages", title: "Priority Service Package Overview", kind: "dashboard", description: "Package catalog summary by category and approval requirement." },
  { id: "categories", title: "Package Categories", kind: "register", description: "Managed service package categories and status.", codePrefix: "PKG-CAT", fields: ["Name", "Description", "Status"] },
  { id: "social", title: "Social Media Management", kind: "register", description: "Social media package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Quotation", "Notes"] },
  { id: "printing", title: "Printing & Branding", kind: "register", description: "Printing and branding package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Quotation", "Notes"] },
  { id: "website-it", title: "Website & IT Services", kind: "register", description: "Website, IT, and software package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Operations Review", "Notes"] },
  { id: "events", title: "Events & Production", kind: "register", description: "Events and production package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Site Survey", "Notes"] },
  { id: "fitout", title: "Interior Design & Fit-Out", kind: "register", description: "Interior and fit-out package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Site Survey", "Notes"] },
  { id: "security", title: "CCTV / Security / Access Control", kind: "register", description: "CCTV/security/access control package catalog.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Requires Site Survey", "Notes"] },
  { id: "retainers", title: "Combined Monthly Retainer Packages", kind: "register", description: "Monthly retainer packages across services.", codePrefix: "PKG", fields: ["Package Code", "Package / Service Name", "Recommended For", "Key Includes", "Starting Price", "High Price", "Billing Type", "Payment Terms", "Notes"] },
  { id: "addons", title: "Add-ons", kind: "register", description: "Package add-ons and optional service components.", fields: ["Package Code", "Add-on Name", "Starting Price", "High Price", "Requires Approval", "Notes"] },
  { id: "approvals", title: "Package Approvals", kind: "register", description: "Pricing, discount, special term, and package approval requests.", codePrefix: "PKG-APR", fields: ["Package Code", "Request Title", "Requested By", "Discount Range", "Amount / Value", "Status", "Approved By", "Decision Date", "Notes"] },
  { id: "price-change-logs", title: "Price Change Logs", kind: "register", description: "Audit trail for package price changes.", fields: ["Package Code", "Old Price", "New Price", "Changed By", "Reason"] },
  { id: "price-control", title: "Price Control Rules", kind: "reference", description: "Pricing control rules.", rules: ["Final prices must be confirmed through official quotation", "Consider requirements, scope, supplier costs, taxes, urgency, and approval", "No employee may promise final price or special terms without approval"] },
  { id: "discount", title: "Discount Rules", kind: "reference", description: "Discount approval rules.", rules: ["Up to 5%: Sales Manager or Management if margin is safe", "5%-10%: Finance and Management review", "Above 10%: CEO approval", "No discount if project becomes unprofitable"] },
  { id: "payment", title: "Payment Terms", kind: "reference", description: "Default payment terms by service type.", options: ["Social Media: 100% monthly in advance", "Branding: 50% advance / 50% before delivery", "Printing: 100% advance or minimum 70%", "Website: 50% / 30% / 20%", "Events: 70% advance / 30% before event", "Fit-Out: stage-based payments", "CCTV: 70% equipment advance / balance before handover"] },
  { id: "sales-usage", title: "Sales Usage Rules", kind: "workflow", description: "Sales can select packages in proposals/quotations; Finance reviews margin; Operations reviews feasibility; Management approves high-value terms." }
];

const ceoSections: ModuleSection[] = [
  { id: "overview", title: "CEO Dashboard", kind: "dashboard", description: "Central executive view across Sales, Finance, HR, Operations, Client Experience, Quality, Risk, Approvals, and Documents." },
  { id: "company-kpis", title: "Company KPI Snapshot", kind: "register", description: "Weekly or monthly KPI snapshot reviewed by management.", codePrefix: "KPI", fields: ["Period", "Prepared By", "Sales Revenue", "Pipeline Value", "Cash Balance", "Pending Payments", "Active Employees", "Attendance Issues", "Active Projects", "Delayed Projects", "Open Risks", "Pending Approvals", "Overall Status", "Notes"] },
  { id: "sales-dashboard", title: "Sales Dashboard", kind: "dashboard", description: "Leads, contacted clients, meetings, proposals, quotations, won/lost deals, and pipeline value." },
  { id: "finance-dashboard", title: "Finance Dashboard", kind: "dashboard", description: "Income, expenses, profit/loss, cash flow, invoices, receipts, salary cost, and pending payments." },
  { id: "hr-dashboard", title: "HR Dashboard", kind: "dashboard", description: "Employee count, attendance, leave, lateness, absence, probation, evaluations, warnings, and file completion." },
  { id: "operations-dashboard", title: "Operations Dashboard", kind: "dashboard", description: "Active projects, completed projects, delayed projects, tasks, quality checks, client approvals, and delivery status." },
  { id: "client-experience", title: "Client Experience Dashboard", kind: "register", description: "Feedback, complaints, satisfaction, open client risks, and resolution actions.", codePrefix: "CX", fields: ["Client Name", "Date", "Feedback Type", "Satisfaction Level", "Complaint / Request", "Responsible Person", "Resolution Action", "Due Date", "Status", "Notes"] },
  { id: "quality-risk", title: "Quality & Risk Dashboard", kind: "register", description: "Quality issues, risks, corrective actions, rework, critical delays, and management escalation.", codePrefix: "RISK", fields: ["Risk / Issue Title", "Department", "Impact Level", "Owner", "Date Identified", "Due Date", "Corrective Action", "Status", "Escalated To", "Notes"] },
  { id: "weekly-meeting", title: "Weekly Management Meeting", kind: "register", description: "Weekly management meeting summary and action outcomes.", codePrefix: "WMM", fields: ["Meeting Date", "Chairperson", "Attendees", "Sales Review", "Finance Review", "HR Review", "Operations Review", "Risks", "Decisions", "Next Actions", "Prepared By"] },
  { id: "monthly-report", title: "Monthly Management Report", kind: "report", description: "Monthly executive report with departmental KPIs, problems, decisions, risks, and next-month plan.", codePrefix: "MMR", fields: ["Month", "Prepared By", "Reviewed By", "Approved By", "Executive Summary", "Sales Summary", "Finance Summary", "HR Summary", "Operations Summary", "Risk Summary", "Next Month Plan"] },
  { id: "decisions-approvals", title: "Decision & Approval Register", kind: "register", description: "Management decisions, approval requests, CEO approvals, and rejected items.", codePrefix: "APR", fields: ["Request Title", "Department", "Requested By", "Amount / Value", "Priority", "Decision Needed", "Status", "Approved By", "Decision Date", "Notes"] },
  { id: "management-actions", title: "Management Action Tracker", kind: "register", description: "Cross-department management actions and follow-up deadlines.", codePrefix: "MGMT-ACT", fields: ["Action Title", "Department", "Responsible Person", "Assigned Date", "Due Date", "Priority", "Status", "Progress", "Notes"] }
];

const managementSections: ModuleSection[] = [
  { id: "purpose", title: "Purpose", kind: "overview", description: "Defines how Base Agency operates through official systems, records, routines, approvals, reports, and controls." },
  { id: "principle", title: "Company Operating Principle", kind: "reference", description: "Base Agency must not operate randomly, verbally, or without control.", rules: ["Every department works through official trackers", "Every task has an owner and deadline", "Every approval is documented", "Every report is reviewed by management"] },
  { id: "core-systems", title: "Core Company Systems", kind: "reference", description: "Management, Sales, Finance, HR, Operations, Client Experience, Quality, Reporting, Approvals, Document Control, Risk, IT/Data, and Brand systems." },
  { id: "structure", title: "Management Structure", kind: "reference", description: "CEO, COO / Operations Leadership, department responsible persons, and accountable employees." },
  { id: "daily-routine", title: "Daily Company Routine", kind: "workflow", description: "Morning readiness, working-day execution, and end-of-day tracker updates.", rules: ["Attendance check", "Review meetings and urgent follow-ups", "Assign daily tasks", "Update trackers before end of day", "Prepare next-day priorities"] },
  { id: "weekly-routine", title: "Weekly Company Routine", kind: "workflow", description: "Weekly management review covering Sales, Finance, HR, Operations, risks, approvals, and action items." },
  { id: "monthly-routine", title: "Monthly Company Routine", kind: "workflow", description: "Monthly management reporting, KPI review, finance close, HR review, operations review, and improvement plan." },
  { id: "sales-system", title: "Sales Operating System", kind: "reference", description: "Sales must manage targets, CRM updates, follow-ups, meetings, proposals, quotations, won/lost deals, and handover." },
  { id: "finance-system", title: "Finance Operating System", kind: "reference", description: "Finance must control income, expenses, invoices, receipts, payment requests, petty cash, salaries, suppliers, P&L, and cash flow." },
  { id: "hr-system", title: "HR Operating System", kind: "reference", description: "HR must control employee files, attendance, leave, overtime, probation, evaluation, warnings, assets, IT access, and exits." },
  { id: "operations-system", title: "Operations Operating System", kind: "reference", description: "Operations must control projects, kickoff, tasks, timelines, issues, quality, approvals, delivery, closure, and workload." },
  { id: "client-experience", title: "Client Experience", kind: "register", description: "Client feedback, complaints, requests, satisfaction and corrective actions.", codePrefix: "CX", fields: ["Client Name", "Date", "Channel", "Issue / Feedback", "Impact Level", "Responsible Person", "Action Required", "Due Date", "Status", "Notes"] },
  { id: "quality-control", title: "Quality Control", kind: "register", description: "Quality checks, rework, defects, corrective actions, and responsible owners.", codePrefix: "QC", fields: ["Check Title", "Department", "Project / Area", "Checked By", "Check Date", "Result", "Corrective Action", "Due Date", "Status", "Notes"] },
  { id: "kpi-reporting", title: "KPI & Reporting", kind: "report", description: "KPI reporting rules and report cadence across all modules." },
  { id: "document-control", title: "Document Control", kind: "workflow", description: "Official documents are controlled by code, version, owner, classification, approval, and storage location." },
  { id: "approvals-decisions", title: "Approvals & Decisions", kind: "workflow", description: "Major approvals and decisions must be recorded, reviewed, and auditable." },
  { id: "risk-compliance", title: "Risk & Compliance", kind: "register", description: "Risk, compliance, delay, financial exposure, client risk, and corrective action register.", codePrefix: "RISK", fields: ["Risk Title", "Department", "Risk Type", "Impact Level", "Owner", "Identified Date", "Due Date", "Status", "Corrective Action", "Notes"] },
  { id: "it-data-access", title: "IT, Data, Backup & Access Control", kind: "register", description: "System access, backups, data controls, and IT/security tasks.", codePrefix: "IT", fields: ["Control Title", "System / Area", "Owner", "Access Level", "Backup Frequency", "Last Review Date", "Next Review Date", "Status", "Notes"] },
  { id: "brand-communication", title: "Brand, Marketing & Communication", kind: "reference", description: "Brand, marketing, communication, portfolio, and client-facing materials must stay controlled and approved." },
  { id: "actions", title: "Management Action Tracker", kind: "register", description: "Official management action list.", codePrefix: "MGMT-ACT", fields: ["Action Title", "Department", "Responsible Person", "Assigned Date", "Due Date", "Priority", "Status", "Progress", "Notes"] }
];

const outreachSections: ModuleSection[] = [
  { id: "dashboard", title: "Outreach Dashboard", kind: "dashboard", description: "Erbil target clients, outreach activity, follow-ups, meetings, proposals, quotations, and conversion results." },
  { id: "categories", title: "Target Client Categories in Erbil", kind: "register", description: "Priority categories and opportunities for Erbil outreach.", codePrefix: "OUT-CAT", fields: ["Name", "Main Opportunity", "Target Count", "Priority", "Status"], options: ["Clinics & Medical Centers", "Restaurants & Cafes", "Real Estate & Construction", "Beauty Clinics & Salons", "Hotels & Hospitality", "Schools & Institutes", "Retail Stores", "Gyms & Fitness Centers", "Corporate Offices", "Car Showrooms", "Event Halls", "Pharmacies"] },
  { id: "priority-packages", title: "Priority Service Packages for Outreach", kind: "reference", description: "Primary services to offer during outreach.", options: ["Social Media Management", "Printing & Branding", "Website & IT Services", "Events & Production", "Interior Design & Fit-Out", "CCTV, Security & Access Control"] },
  { id: "target-clients", title: "Target Client List", kind: "register", description: "Master Erbil target client database.", codePrefix: "TCL", fields: ["Company / Client Name", "Industry", "Location", "Phone", "Instagram / Website", "Service Opportunity", "Priority", "Status", "Next Follow-Up", "Contact Person", "Notes"] },
  { id: "outreach-plan", title: "Outreach Plan", kind: "workflow", description: "First 100 target client plan and daily/weekly/30-day activity targets.", rules: ["Add 100 target clients in first week", "Contact at least 10 clients daily", "Record every important communication in CRM", "Schedule meetings for interested clients"] },
  { id: "contact-attempts", title: "Contact Attempts", kind: "register", description: "Phone, WhatsApp, email, Instagram, LinkedIn, visit, referral, and meeting invitation attempts.", codePrefix: "CTA", fields: ["Client Code", "Client Name", "Attempt Date", "Method", "Contact Person", "Result", "Next Action", "Next Follow-Up", "Responsible Person", "Notes"] },
  { id: "follow-ups", title: "Follow-Up Tracker", kind: "register", description: "Open outreach follow-ups and next actions.", codePrefix: "FU", fields: ["Client Code", "Client Name", "Last Contact Date", "Method", "Discussion Summary", "Next Action", "Next Follow-Up Date", "Status", "Responsible Person"] },
  { id: "meeting-conversion", title: "Meeting Conversion Tracker", kind: "register", description: "Meeting requests, scheduled meetings, completed meetings, and next steps.", codePrefix: "OCM", fields: ["Client Code", "Client Name", "Meeting Date", "Meeting Status", "Meeting Purpose", "Decision Maker", "Proposal Required", "Next Step", "Responsible Person", "Notes"] },
  { id: "proposal-conversion", title: "Proposal/Quotation Conversion", kind: "register", description: "Proposal and quotation conversion tracking.", codePrefix: "OCV", fields: ["Client Code", "Client Name", "Service / Package", "Proposal Status", "Quotation Status", "Estimated Value", "Decision Status", "Expected Close Date", "Reason Lost", "Notes"] },
  { id: "industry-priority", title: "Industry Priority List", kind: "reference", description: "Industry distribution targets for first 100 outreach clients." },
  { id: "scripts-notes", title: "Sales Scripts / Outreach Notes", kind: "reference", description: "Phone call, WhatsApp, follow-up, meeting request, proposal follow-up, and email introduction scripts." },
  { id: "monthly-report", title: "Monthly Outreach Report", kind: "report", description: "Monthly outreach report and conversion results.", codePrefix: "OUT-RPT", fields: ["Month", "Prepared By", "New Clients Added", "Clients Contacted", "Calls Made", "WhatsApp Messages Sent", "Emails Sent", "Meetings Scheduled", "Meetings Completed", "Proposals Sent", "Quotations Sent", "Deals Closed", "Summary", "Next Month Plan"] }
];

const commercialSections: ModuleSection[] = [
  { id: "dashboard", title: "Commercial Documents Dashboard", kind: "dashboard", description: "Control quotations, purchase orders, supplier invoices, delivery notes, invoices, payments, receipts, versions, approvals, and archive readiness." },
  { id: "workflow", title: "Commercial Workflow Control", kind: "workflow", description: "Client workflow: Client -> Quotation -> Project -> Delivery Note -> Invoice -> Payment -> Receipt -> Archive. Supplier workflow: Purchase Order -> Supplier -> Supplier Invoice / Expense -> Payment -> Archive.", rules: ["No quotation should be sent unless approved", "No invoice should be marked paid unless payment and receipt exist", "No delivery should be closed unless delivery note is signed or confirmed", "No final approved document should be edited directly; create a new version instead"] },
  { id: "quotations", title: "Quotation Register", kind: "register", description: "Approved client quotation control with versioning and PDF/export readiness.", codePrefix: "QUO", fields: ["Lead Code", "Client / Supplier", "Project Code", "Owner", "Amount", "Status", "Approval Status", "Approved By", "Approved At", "Issue Date", "Due Date", "Attachment URL", "Version", "Locked", "Archive Status", "Notes"] },
  { id: "purchase-orders", title: "Purchase Order Register", kind: "register", description: "Supplier purchase order approvals and supplier workflow control.", codePrefix: "PO", fields: ["Related Document No", "Client / Supplier", "Project Code", "Owner", "Amount", "Status", "Approval Status", "Approved By", "Approved At", "Issue Date", "Due Date", "Attachment URL", "Version", "Locked", "Archive Status", "Notes"] },
  { id: "supplier-invoices", title: "Supplier Invoice Register", kind: "register", description: "Supplier invoice and expense matching against purchase orders.", codePrefix: "SUP-INV", fields: ["Related Document No", "Client / Supplier", "Project Code", "Owner", "Amount", "Status", "Approval Status", "Approved By", "Approved At", "Issue Date", "Due Date", "Attachment URL", "Version", "Locked", "Archive Status", "Notes"] },
  { id: "delivery-notes", title: "Delivery Note Register", kind: "register", description: "Delivery confirmation, signature, and closure control.", codePrefix: "DN", fields: ["Related Document No", "Client / Supplier", "Project Code", "Owner", "Amount", "Status", "Approval Status", "Approved By", "Approved At", "Issue Date", "Due Date", "Signed / Confirmed", "Attachment URL", "Version", "Locked", "Archive Status", "Notes"] },
  { id: "invoices", title: "Commercial Invoice Register", kind: "register", description: "Client invoice control linked to quotation, project, delivery, payment, and receipt.", codePrefix: "INV", fields: ["Related Document No", "Client / Supplier", "Project Code", "Owner", "Amount", "Status", "Approval Status", "Approved By", "Approved At", "Issue Date", "Due Date", "Attachment URL", "Version", "Locked", "Archive Status", "Notes"] },
  { id: "payments", title: "Payment Register", kind: "register", description: "Client and supplier payment records with invoice/PO references.", codePrefix: "PAY", fields: ["Related Document No", "Payment Type", "Client / Supplier", "Project Code", "Amount", "Payment Method", "Status", "Paid At", "Received / Paid By", "Attachment URL", "Notes"] },
  { id: "receipts", title: "Receipt Register", kind: "register", description: "Receipt issuance and payment confirmation for paid invoices.", codePrefix: "REC", fields: ["Related Document No", "Client / Supplier", "Project Code", "Amount", "Payment Method", "Status", "Received Date", "Received By", "Attachment URL", "Notes"] },
  { id: "suppliers", title: "Supplier Register", kind: "register", description: "Supplier master data for PO, supplier invoice, and payment workflows.", codePrefix: "SUP", fields: ["Supplier Name", "Category", "Contact Person", "Phone", "Email", "Address", "Payment Terms", "Status", "Notes"] },
  { id: "archive", title: "Final Archive Register", kind: "register", description: "Final archive for approved, paid, delivered, received, and locked document sets.", codePrefix: "ARC", fields: ["Document Chain", "Client / Supplier", "Project Code", "Quotation No", "Delivery Note No", "Invoice No", "Payment No", "Receipt No", "Archive Status", "Locked By", "Locked At", "Storage Location", "Notes"] },
  { id: "rules", title: "Commercial Control Rules", kind: "reference", description: "Commercial documents are controlled by reference number, owner, status, approval path, attachments, audit history, final archive, and versioning after approval.", rules: ["Reference numbers must be unique and searchable", "PDF and CSV exports must be available", "Every create, edit, approve, export, and archive action must be auditable", "Approved records are locked and future edits create a new version"] }
];

const approvalSections: ModuleSection[] = [
  { id: "dashboard", title: "Approvals Dashboard", kind: "dashboard", description: "Pending, approved, rejected, escalated, and overdue approvals across departments." },
  { id: "approval-register", title: "Approval Register", kind: "register", description: "Official register for finance, pricing, HR, operations, client, document, and management approvals.", codePrefix: "APR", fields: ["Approval Title", "Approval Type", "Department", "Requested By", "Request Date", "Amount / Value", "Priority", "Status", "Approved By", "Decision Date", "Attachment / Link", "Notes"] },
  { id: "decision-register", title: "Decision Register", kind: "register", description: "Management decision records and implementation follow-up.", codePrefix: "DEC", fields: ["Decision Title", "Decision Area", "Requested By", "Decision Owner", "Decision Date", "Decision", "Implementation Owner", "Due Date", "Status", "Notes"] },
  { id: "ceo-approvals", title: "CEO Approval Queue", kind: "register", description: "High-value client, major finance, strategic pricing, and policy approvals requiring CEO decision.", codePrefix: "CEO-APR", fields: ["Request Title", "Department", "Requested By", "Amount / Value", "Reason", "Urgency", "Status", "CEO Decision", "Decision Date", "Notes"] },
  { id: "approval-rules", title: "Approval Rules", kind: "reference", description: "Approval rules for discounts, major proposals, payment requests, documents, risks, and high-value decisions.", rules: ["Special pricing requires management approval", "Large discounts require CEO approval", "Payment requests require approval before payment", "Client approvals must be documented", "Document versions require approved owner"] },
  { id: "action-followup", title: "Decision Action Follow-Up", kind: "register", description: "Follow-up actions created from management decisions and approvals.", codePrefix: "DAF", fields: ["Decision / Approval Code", "Action Required", "Responsible Person", "Assigned Date", "Due Date", "Priority", "Status", "Progress", "Notes"] }
];

const documentControlSections: ModuleSection[] = [
  { id: "dashboard", title: "Document Control Dashboard", kind: "dashboard", description: "Official document codes, versions, owners, approvals, storage locations, revisions, and review status." },
  { id: "controlled-documents", title: "Controlled Document Register", kind: "register", description: "Master register for official Base Agency controlled documents.", codePrefix: "DOC", fields: ["Document Code", "Document Title", "Version", "Classification", "Owner", "Department", "Storage Location", "Approval Status", "Approved By", "Review Date", "Attachment Link", "Notes"] },
  { id: "revision-log", title: "Document Revision Log", kind: "register", description: "Version history and document change log.", codePrefix: "REV", fields: ["Document Code", "Old Version", "New Version", "Change Summary", "Changed By", "Change Date", "Approved By", "Status", "Notes"] },
  { id: "storage-map", title: "File Storage Map", kind: "register", description: "Folder/category map for official file storage locations.", codePrefix: "FSM", fields: ["Folder / Location", "Module", "Document Category", "Owner", "Access Level", "Retention Rule", "Backup Location", "Status", "Notes"] },
  { id: "review-calendar", title: "Document Review Calendar", kind: "register", description: "Scheduled reviews for controlled documents.", codePrefix: "DRC", fields: ["Document Code", "Document Title", "Owner", "Last Review Date", "Next Review Date", "Review Status", "Reviewer", "Action Required", "Notes"] },
  { id: "control-rules", title: "Document Control Rules", kind: "reference", description: "Documents are controlled by code, title, version, owner, classification, storage location, attachment, approval, and audit trail." }
];

const requirementsSections: ModuleSection[] = [
  { id: "overview", title: "System Requirements", kind: "overview", description: "Read-only developer reference for the Base Agency Company Operating System implementation." },
  { id: "module-map", title: "Required Module Map", kind: "reference", description: "Required modules: CEO Dashboard, Management, Sales/CRM, Client Outreach, Finance, HR, Operations, Service Packages, Reports, Approvals, Document Control, and Settings." },
  { id: "field-standards", title: "Field Standards", kind: "reference", description: "Common standards for code, dates, status, priority, responsible person, department, notes, attachments, and audit trail.", options: ["Code / ID", "Date Fields", "Status Fields", "Priority Fields", "Responsible Person", "Department / Division", "Notes / Remarks", "Attachment Field", "Audit Trail"] },
  { id: "access-levels", title: "User Access Levels", kind: "reference", description: "CEO, COO, Sales, Finance, HR, Operations, Marketing, and view-only user access levels." },
  { id: "deliverables", title: "Developer Deliverables", kind: "register", description: "Implementation deliverables requested by the development brief.", codePrefix: "DEV", fields: ["Deliverable", "Description", "Owner", "Priority", "Status", "Due Date", "Approved By", "Notes"] },
  { id: "developer-questions", title: "Developer Questions", kind: "register", description: "Questions and decisions to resolve before or during implementation.", codePrefix: "Q", fields: ["Question", "Area", "Asked By", "Answer / Decision", "Owner", "Status", "Decision Date", "Notes"] },
  { id: "implementation-phases", title: "Implementation Priority", kind: "reference", description: "Phase 1: core data entry. Phase 2: dashboards and reports. Phase 3: controls, approvals, action tracker, and document control." }
];

export const documentModules: Record<string, DocumentModule> = {
  ceo: {
    id: "ceo",
    title: "CEO Dashboard",
    documentCode: "BA-MANAGEMENT-DASHBOARD-2026",
    route: "/ceo-dashboard",
    purpose: "Company Operating System Dashboard",
    sections: ceoSections
  },
  management: {
    id: "management",
    title: "Management",
    documentCode: "BA-COMPANY-SYSTEM-2026",
    route: "/management",
    purpose: "Complete Company Operating System Manual",
    sections: managementSections
  },
  sales: {
    id: "sales",
    title: "Sales / CRM",
    documentCode: "BA-SALES-TRACKER-2026",
    route: "/sales",
    purpose: "CRM & Sales Pipeline Tracker",
    sections: salesSections
  },
  outreach: {
    id: "outreach",
    title: "Client List & Outreach",
    documentCode: "BA-CLIENT-LIST-2026",
    route: "/client-outreach",
    purpose: "Erbil Target Client List & Outreach Plan",
    sections: outreachSections
  },
  finance: {
    id: "finance",
    title: "Finance",
    documentCode: "BA-FIN-TRACKER-2026",
    route: "/finance",
    purpose: "Finance, Income & Expense Tracker",
    sections: financeSections
  },
  hr: {
    id: "hr",
    title: "HR",
    documentCode: "BA-HR-TRACKER-2026",
    route: "/hr",
    purpose: "HR, Attendance & Employee File Tracker",
    sections: hrSections
  },
  operations: {
    id: "operations",
    title: "Operations",
    documentCode: "BA-OPS-TRACKER-2026",
    route: "/operations",
    purpose: "Operations, Projects & Task Management Tracker",
    sections: operationsSections
  },
  packages: {
    id: "packages",
    title: "Service Packages",
    documentCode: "BA-SERVICE-PACKAGES-2026",
    route: "/service-packages",
    purpose: "Priority Service Packages & Price List",
    sections: packagesSections
  },
  commercial: {
    id: "commercial",
    title: "Commercial Documents",
    documentCode: "BA-COM-DOC-WF-2026",
    route: "/commercial-documents",
    purpose: "Commercial document workflow: quotation, PO, delivery, invoice, payment, receipt, and archive",
    sections: commercialSections
  },
  approvals: {
    id: "approvals",
    title: "Approvals & Decisions",
    documentCode: "BA-COMPANY-SYSTEM-2026",
    route: "/approvals-decisions",
    purpose: "Approval workflows, decision registers, and management action follow-up",
    sections: approvalSections
  },
  documents: {
    id: "documents",
    title: "Document Control",
    documentCode: "BA-SYSTEM-DEVELOPMENT-REQUIREMENTS-2026",
    route: "/document-control",
    purpose: "Controlled documents, versions, owners, approvals, storage locations, and review calendar",
    sections: documentControlSections
  },
  requirements: {
    id: "requirements",
    title: "System Requirements",
    documentCode: "BA-SYSTEM-DEVELOPMENT-REQUIREMENTS-2026",
    route: "/system-requirements",
    purpose: "Developer reference and implementation requirements",
    sections: requirementsSections
  }
};
