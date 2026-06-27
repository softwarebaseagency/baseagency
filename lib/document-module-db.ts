import { randomUUID } from "node:crypto";
import { ModuleSection, documentModules } from "@/lib/document-modules";

type ValueKind = "text" | "number" | "int" | "date" | "bool";

type ColumnSpec = {
  field?: string;
  column: string;
  kind?: ValueKind;
  defaultValue?: string | number | boolean | (() => string | number | boolean | Date);
};

export type SectionTableMap = {
  table: string;
  codeColumn?: string;
  codePrefix?: string;
  orderColumn?: string;
  hasUpdatedAt?: boolean;
  columns: ColumnSpec[];
};

function today() {
  return new Date();
}

function now() {
  return new Date();
}

const text = (field: string, column: string, defaultValue = ""): ColumnSpec => ({ field, column, kind: "text", defaultValue });
const number = (field: string, column: string): ColumnSpec => ({ field, column, kind: "number", defaultValue: 0 });
const int = (field: string, column: string): ColumnSpec => ({ field, column, kind: "int", defaultValue: 0 });
const date = (field: string, column: string): ColumnSpec => ({ field, column, kind: "date", defaultValue: today });
const bool = (field: string, column: string): ColumnSpec => ({ field, column, kind: "bool", defaultValue: false });
const fixed = (column: string, defaultValue: string | number | boolean | (() => string | number | boolean | Date), kind: ValueKind = "text"): ColumnSpec => ({ column, defaultValue, kind });

const commercialDocumentColumns = (documentType: string): ColumnSpec[] => [
  fixed("document_type", documentType),
  text("Lead Code", "lead_code"),
  text("Related Document No", "related_document_no"),
  text("Client / Supplier", "client_supplier_name"),
  text("Project Code", "project_code"),
  text("Owner", "owner"),
  number("Amount", "amount"),
  text("Status", "status", "Draft"),
  text("Approval Status", "approval_status", "Pending Approval"),
  text("Approved By", "approved_by"),
  date("Approved At", "approved_at"),
  date("Issue Date", "issue_date"),
  date("Due Date", "due_date"),
  text("Signed / Confirmed", "signed_confirmed", "No"),
  text("Attachment URL", "attachment_url"),
  text("Version", "version", "1.0"),
  bool("Locked", "is_locked"),
  text("Archive Status", "archive_status", "Open"),
  text("Notes", "notes")
];

export const sectionTableMaps: Record<string, SectionTableMap> = {
  "sales:leads": {
    table: "crm_leads",
    codeColumn: "lead_code",
    codePrefix: "LEAD",
    hasUpdatedAt: true,
    columns: [
      date("Date Added", "date_added"),
      text("Client / Company Name", "client_name"),
      text("Contact Person", "contact_person"),
      text("Phone", "phone"),
      text("Email", "email"),
      text("WhatsApp", "whatsapp"),
      text("Instagram / Website", "instagram_website"),
      text("Location", "location"),
      text("Lead Source", "lead_source", "Other"),
      text("Industry", "industry"),
      text("Service Required", "service_required"),
      number("Estimated Value", "estimated_value"),
      text("Priority", "priority", "Medium"),
      text("Status", "status", "New Lead"),
      date("Next Follow-Up", "next_follow_up"),
      text("Responsible Person", "responsible_person"),
      text("Notes", "notes"),
      fixed("created_by", "Sales / Client Relations")
    ]
  },
  "sales:pipeline": {
    table: "crm_deals",
    codeColumn: "deal_code",
    codePrefix: "DEAL",
    hasUpdatedAt: true,
    columns: [
      text("Lead Code", "lead_code"),
      text("Client Name", "client_name"),
      text("Service / Project", "service_project"),
      text("Pipeline Stage", "pipeline_stage", "New Lead"),
      number("Deal Value", "deal_value"),
      int("Probability %", "probability"),
      number("Expected Revenue", "expected_revenue"),
      date("Expected Closing Date", "expected_closing_date"),
      text("Responsible Person", "responsible_person"),
      text("Status", "status", "New Lead"),
      text("Notes", "notes")
    ]
  },
  "sales:contact-log": {
    table: "crm_contact_logs",
    codeColumn: "contact_log_code",
    codePrefix: "CLOG",
    columns: [text("Lead Code", "lead_code"), text("Client Name", "client_name"), date("Date", "date"), text("Method", "method", "Other"), text("Discussion Summary", "discussion_summary"), text("Next Action", "next_action"), date("Next Follow-Up", "next_follow_up"), text("Responsible Person", "responsible_person")]
  },
  "sales:meetings": {
    table: "crm_meetings",
    codeColumn: "meeting_code",
    codePrefix: "MTG",
    hasUpdatedAt: true,
    columns: [text("Lead Code", "lead_code"), text("Client Name", "client_name"), date("Meeting Date", "meeting_date"), text("Time", "time"), text("Location", "location"), text("Meeting Purpose", "meeting_purpose"), text("Meeting Status", "meeting_status", "Scheduled"), text("Responsible Person", "responsible_person"), text("Follow-Up Required", "follow_up_required", "Yes"), text("Notes", "notes")]
  },
  "sales:proposals": {
    table: "crm_proposals",
    codeColumn: "proposal_code",
    codePrefix: "PRO",
    hasUpdatedAt: true,
    columns: [text("Lead Code", "lead_code"), text("Client Name", "client_name"), text("Project / Service", "project_service"), number("Proposal Value", "proposal_value"), date("Date Sent", "date_sent"), date("Valid Until", "valid_until"), text("Status", "status", "Draft"), date("Follow-Up Date", "follow_up_date"), text("Attachment/File URL", "attachment_url"), text("Notes", "notes")]
  },
  "sales:quotations": {
    table: "crm_quotations",
    codeColumn: "quotation_code",
    codePrefix: "QTN",
    hasUpdatedAt: true,
    columns: [text("Lead Code", "lead_code"), text("Client Name", "client_name"), text("Service / Item", "service_item"), number("Amount", "amount"), date("Date Sent", "date_sent"), date("Valid Until", "valid_until"), text("Status", "status", "Draft"), text("Converted to Invoice", "converted_to_invoice", "No"), text("Attachment/File URL", "attachment_url"), text("Notes", "notes")]
  },
  "sales:closed-deals": {
    table: "crm_closed_deals",
    codeColumn: "deal_code",
    codePrefix: "DEAL",
    hasUpdatedAt: true,
    columns: [text("Client Name", "client_name"), text("Service / Project", "service_project"), number("Final Value", "final_value"), date("Closing Date", "closing_date"), text("Payment Status", "payment_status", "Pending"), text("Project Started", "project_started", "No"), text("Responsible Person", "responsible_person"), text("Notes", "notes")]
  },
  "sales:lost-deals": {
    table: "crm_lost_deals",
    codeColumn: "lost_deal_code",
    codePrefix: "LOST",
    columns: [text("Client Name", "client_name"), text("Service / Project", "service_project"), number("Estimated Value", "estimated_value"), date("Lost Date", "lost_date"), text("Reason Lost", "reason_lost", "Other"), text("Responsible Person", "responsible_person"), text("Future Follow-Up", "future_follow_up", "Yes"), text("Notes", "notes")]
  },
  "sales:daily-activity": {
    table: "crm_daily_sales_activities",
    hasUpdatedAt: true,
    columns: [date("Date", "date"), text("Salesperson", "salesperson"), int("Calls Made", "calls_made"), int("WhatsApp Messages", "whatsapp_messages"), int("Emails Sent", "emails_sent"), int("Meetings Scheduled", "meetings_scheduled"), int("Proposals Sent", "proposals_sent"), int("Quotations Sent", "quotations_sent"), int("Follow-Ups Completed", "follow_ups_completed"), text("Notes", "notes")]
  },
  "sales:weekly-report": {
    table: "crm_weekly_sales_reports",
    hasUpdatedAt: true,
    columns: [date("Week From", "week_from"), date("Week To", "week_to"), text("Prepared By", "prepared_by"), int("New Leads Added", "new_leads_added"), int("Clients Contacted", "clients_contacted"), int("Meetings Scheduled", "meetings_scheduled"), int("Meetings Completed", "meetings_completed"), int("Proposals Sent", "proposals_sent"), int("Quotations Sent", "quotations_sent"), int("Deals Approved", "deals_approved"), int("Deals Closed Won", "deals_closed_won"), int("Deals Closed Lost", "deals_closed_lost"), number("Total Expected Pipeline Value", "total_expected_pipeline_value"), number("Total Closed Value", "total_closed_value"), text("Weekly Sales Summary", "weekly_sales_summary"), text("Main Problems", "main_problems"), text("Next Week Sales Plan", "next_week_sales_plan")]
  },
  "sales:target-clients": {
    table: "crm_target_clients",
    hasUpdatedAt: true,
    columns: [int("No.", "no"), text("Company / Client Name", "company_client_name"), text("Industry", "industry"), text("Location", "location"), text("Contact Person", "contact_person"), text("Phone", "phone"), text("Instagram / Website", "instagram_website"), text("Service Opportunity", "service_opportunity"), text("Priority", "priority", "Medium"), text("Notes", "notes")]
  },
  "sales:handover": {
    table: "crm_sales_handovers",
    codeColumn: "handover_code",
    codePrefix: "HND",
    hasUpdatedAt: true,
    columns: [text("Client Name", "client_name"), text("Project / Service", "project_service"), number("Approved Value", "approved_value"), text("Payment Status", "payment_status", "Pending"), date("Handover Date", "handover_date"), text("Approved Scope", "approved_scope"), text("Client Requirements", "client_requirements"), text("Operations Responsible Person", "operations_responsible_person"), text("Sales Responsible Person", "sales_responsible_person"), text("Sales Signature", "sales_signature"), text("Operations Signature", "operations_signature"), fixed("date", today, "date")]
  },
  "sales:actions": { table: "sales_actions", codeColumn: "action_code", codePrefix: "SALES-ACT", hasUpdatedAt: true, columns: [text("Lead Code", "lead_code"), text("Client Name", "client_name"), text("Action", "action"), text("Responsible Person", "responsible_person"), date("Due Date", "due_date"), text("Priority", "priority", "Medium"), text("Status", "status", "Open"), text("Notes", "notes")] },

  "ceo:company-kpis": { table: "executive_kpi_snapshots", codeColumn: "kpi_code", codePrefix: "KPI", hasUpdatedAt: true, columns: [text("Period", "period"), text("Prepared By", "prepared_by"), number("Sales Revenue", "sales_revenue"), number("Pipeline Value", "pipeline_value"), number("Cash Balance", "cash_balance"), number("Pending Payments", "pending_payments"), int("Active Employees", "active_employees"), int("Attendance Issues", "attendance_issues"), int("Active Projects", "active_projects"), int("Delayed Projects", "delayed_projects"), int("Open Risks", "open_risks"), int("Pending Approvals", "pending_approvals"), text("Overall Status", "overall_status", "Yellow"), text("Notes", "notes")] },
  "ceo:client-experience": { table: "client_experience_records", codeColumn: "client_experience_code", codePrefix: "CX", hasUpdatedAt: true, columns: [text("Client Name", "client_name"), date("Date", "date"), text("Feedback Type", "feedback_type"), text("Satisfaction Level", "satisfaction_level", "Medium"), text("Complaint / Request", "complaint_request"), text("Responsible Person", "responsible_person"), text("Resolution Action", "resolution_action"), date("Due Date", "due_date"), text("Status", "status", "Open"), text("Notes", "notes")] },
  "ceo:quality-risk": { table: "quality_risk_records", codeColumn: "risk_code", codePrefix: "RISK", hasUpdatedAt: true, columns: [text("Risk / Issue Title", "risk_issue_title"), text("Department", "department"), text("Impact Level", "impact_level", "Medium"), text("Owner", "owner"), date("Date Identified", "date_identified"), date("Due Date", "due_date"), text("Corrective Action", "corrective_action"), text("Status", "status", "Open"), text("Escalated To", "escalated_to"), text("Notes", "notes")] },
  "ceo:weekly-meeting": { table: "management_weekly_meetings", codeColumn: "meeting_code", codePrefix: "WMM", hasUpdatedAt: true, columns: [date("Meeting Date", "meeting_date"), text("Chairperson", "chairperson"), text("Attendees", "attendees"), text("Sales Review", "sales_review"), text("Finance Review", "finance_review"), text("HR Review", "hr_review"), text("Operations Review", "operations_review"), text("Risks", "risks"), text("Decisions", "decisions"), text("Next Actions", "next_actions"), text("Prepared By", "prepared_by")] },
  "ceo:monthly-report": { table: "management_monthly_reports", codeColumn: "report_code", codePrefix: "MMR", hasUpdatedAt: true, columns: [text("Month", "month"), text("Prepared By", "prepared_by"), text("Reviewed By", "reviewed_by"), text("Approved By", "approved_by"), text("Executive Summary", "executive_summary"), text("Sales Summary", "sales_summary"), text("Finance Summary", "finance_summary"), text("HR Summary", "hr_summary"), text("Operations Summary", "operations_summary"), text("Risk Summary", "risk_summary"), text("Next Month Plan", "next_month_plan")] },
  "ceo:decisions-approvals": { table: "approval_register", codeColumn: "approval_code", codePrefix: "APR", hasUpdatedAt: true, columns: [text("Request Title", "request_title"), text("Department", "department"), text("Requested By", "requested_by"), number("Amount / Value", "amount_value"), text("Priority", "priority", "Medium"), text("Decision Needed", "decision_needed"), text("Status", "status", "Pending"), text("Approved By", "approved_by"), date("Decision Date", "decision_date"), text("Notes", "notes")] },
  "ceo:management-actions": { table: "management_action_items", codeColumn: "action_code", codePrefix: "MGMT-ACT", hasUpdatedAt: true, columns: [text("Action Title", "action_title"), text("Department", "department"), text("Responsible Person", "responsible_person"), date("Assigned Date", "assigned_date"), date("Due Date", "due_date"), text("Priority", "priority", "Medium"), text("Status", "status", "Pending"), text("Progress", "progress"), text("Notes", "notes")] },

  "management:client-experience": { table: "client_experience_records", codeColumn: "client_experience_code", codePrefix: "CX", hasUpdatedAt: true, columns: [text("Client Name", "client_name"), date("Date", "date"), text("Channel", "channel"), text("Issue / Feedback", "issue_feedback"), text("Impact Level", "impact_level", "Medium"), text("Responsible Person", "responsible_person"), text("Action Required", "action_required"), date("Due Date", "due_date"), text("Status", "status", "Open"), text("Notes", "notes")] },
  "management:quality-control": { table: "quality_control_records", codeColumn: "quality_code", codePrefix: "QC", hasUpdatedAt: true, columns: [text("Check Title", "check_title"), text("Department", "department"), text("Project / Area", "project_area"), text("Checked By", "checked_by"), date("Check Date", "check_date"), text("Result", "result", "Pending"), text("Corrective Action", "corrective_action"), date("Due Date", "due_date"), text("Status", "status", "Open"), text("Notes", "notes")] },
  "management:risk-compliance": { table: "risk_compliance_records", codeColumn: "risk_code", codePrefix: "RISK", hasUpdatedAt: true, columns: [text("Risk Title", "risk_title"), text("Department", "department"), text("Risk Type", "risk_type"), text("Impact Level", "impact_level", "Medium"), text("Owner", "owner"), date("Identified Date", "identified_date"), date("Due Date", "due_date"), text("Status", "status", "Open"), text("Corrective Action", "corrective_action"), text("Notes", "notes")] },
  "management:it-data-access": { table: "it_access_controls", codeColumn: "control_code", codePrefix: "IT", hasUpdatedAt: true, columns: [text("Control Title", "control_title"), text("System / Area", "system_area"), text("Owner", "owner"), text("Access Level", "access_level"), text("Backup Frequency", "backup_frequency"), date("Last Review Date", "last_review_date"), date("Next Review Date", "next_review_date"), text("Status", "status", "Active"), text("Notes", "notes")] },
  "management:actions": { table: "management_action_items", codeColumn: "action_code", codePrefix: "MGMT-ACT", hasUpdatedAt: true, columns: [text("Action Title", "action_title"), text("Department", "department"), text("Responsible Person", "responsible_person"), date("Assigned Date", "assigned_date"), date("Due Date", "due_date"), text("Priority", "priority", "Medium"), text("Status", "status", "Pending"), text("Progress", "progress"), text("Notes", "notes")] },

  "outreach:categories": { table: "outreach_categories", codeColumn: "category_code", codePrefix: "OUT-CAT", hasUpdatedAt: true, columns: [text("Name", "name"), text("Main Opportunity", "main_opportunity"), int("Target Count", "target_count"), text("Priority", "priority", "Medium"), text("Status", "status", "Active")] },
  "outreach:target-clients": { table: "outreach_target_clients", codeColumn: "client_code", codePrefix: "TCL", hasUpdatedAt: true, columns: [text("Company / Client Name", "company_client_name"), text("Industry", "industry"), text("Location", "location", "Erbil"), text("Phone", "phone"), text("Instagram / Website", "instagram_website"), text("Service Opportunity", "service_opportunity"), text("Priority", "priority", "Medium"), text("Status", "status", "New"), date("Next Follow-Up", "next_follow_up"), text("Contact Person", "contact_person"), text("Notes", "notes")] },
  "outreach:contact-attempts": { table: "outreach_contact_attempts", codeColumn: "attempt_code", codePrefix: "CTA", columns: [text("Client Code", "client_code"), text("Client Name", "client_name"), date("Attempt Date", "attempt_date"), text("Method", "method", "Phone"), text("Contact Person", "contact_person"), text("Result", "result"), text("Next Action", "next_action"), date("Next Follow-Up", "next_follow_up"), text("Responsible Person", "responsible_person"), text("Notes", "notes")] },
  "outreach:follow-ups": { table: "outreach_followups", codeColumn: "followup_code", codePrefix: "FU", hasUpdatedAt: true, columns: [text("Client Code", "client_code"), text("Client Name", "client_name"), date("Last Contact Date", "last_contact_date"), text("Method", "method"), text("Discussion Summary", "discussion_summary"), text("Next Action", "next_action"), date("Next Follow-Up Date", "next_follow_up_date"), text("Status", "status", "Open"), text("Responsible Person", "responsible_person")] },
  "outreach:meeting-conversion": { table: "outreach_meeting_conversions", codeColumn: "meeting_code", codePrefix: "OCM", hasUpdatedAt: true, columns: [text("Client Code", "client_code"), text("Client Name", "client_name"), date("Meeting Date", "meeting_date"), text("Meeting Status", "meeting_status", "Scheduled"), text("Meeting Purpose", "meeting_purpose"), text("Decision Maker", "decision_maker"), text("Proposal Required", "proposal_required", "No"), text("Next Step", "next_step"), text("Responsible Person", "responsible_person"), text("Notes", "notes")] },
  "outreach:proposal-conversion": { table: "outreach_proposal_conversions", codeColumn: "conversion_code", codePrefix: "OCV", hasUpdatedAt: true, columns: [text("Client Code", "client_code"), text("Client Name", "client_name"), text("Service / Package", "service_package"), text("Proposal Status", "proposal_status", "Required"), text("Quotation Status", "quotation_status", "Not Sent"), number("Estimated Value", "estimated_value"), text("Decision Status", "decision_status", "Waiting Client"), date("Expected Close Date", "expected_close_date"), text("Reason Lost", "reason_lost"), text("Notes", "notes")] },
  "outreach:monthly-report": { table: "outreach_monthly_reports", codeColumn: "report_code", codePrefix: "OUT-RPT", columns: [text("Month", "month"), text("Prepared By", "prepared_by"), int("New Clients Added", "new_clients_added"), int("Clients Contacted", "clients_contacted"), int("Calls Made", "calls_made"), int("WhatsApp Messages Sent", "whatsapp_messages_sent"), int("Emails Sent", "emails_sent"), int("Meetings Scheduled", "meetings_scheduled"), int("Meetings Completed", "meetings_completed"), int("Proposals Sent", "proposals_sent"), int("Quotations Sent", "quotations_sent"), int("Deals Closed", "deals_closed"), text("Summary", "summary"), text("Next Month Plan", "next_month_plan")] },

  "finance:income": { table: "finance_incomes", codeColumn: "income_code", codePrefix: "INC", hasUpdatedAt: true, columns: [date("Date", "date"), text("Client", "client_name"), text("Project / Service", "project_service"), number("Amount", "amount"), text("Payment Method", "payment_method"), text("Reference", "reference"), text("Notes", "notes")] },
  "finance:expenses": { table: "finance_expenses", codeColumn: "expense_code", codePrefix: "EXPEN", hasUpdatedAt: true, columns: [date("Date", "date"), text("Category", "category"), text("Title", "title"), number("Amount", "amount"), text("Payment Method", "payment_method"), fixed("status", "Paid"), text("Notes", "notes")] },
  "finance:invoices": { table: "finance_invoices", codeColumn: "invoice_no", codePrefix: "INV", hasUpdatedAt: true, columns: [text("Client", "client_name"), text("Project / Service", "project_service"), date("Due Date", "due_date"), number("Amount", "amount"), number("Paid Amount", "paid_amount"), number("Remaining Amount", "remaining_amount"), text("Status", "status", "Unpaid"), text("Payment Method", "payment_method")] },
  "finance:receipts": { table: "finance_receipts", codeColumn: "receipt_no", codePrefix: "RCT", columns: [text("Invoice No", "invoice_no"), text("Client", "client_name"), number("Amount", "amount"), text("Payment Method", "payment_method"), date("Received Date", "received_date"), text("Received By", "received_by"), text("Notes", "notes")] },
  "finance:payment-requests": { table: "finance_payment_requests", codeColumn: "request_no", codePrefix: "FIN-PRF", hasUpdatedAt: true, columns: [text("Requester", "requester"), text("Purpose", "purpose"), number("Amount", "amount"), text("Status", "status", "Pending"), text("Approved By", "approved_by"), date("Paid At", "paid_at")] },
  "finance:petty-cash": { table: "finance_petty_cash_entries", codeColumn: "petty_cash_code", codePrefix: "PC", columns: [date("Date", "date"), text("Type", "type"), number("Amount", "amount"), text("Purpose", "purpose"), number("Balance", "balance"), text("Responsible Person", "responsible_person"), text("Notes", "notes")] },
  "finance:salary": { table: "finance_salary_records", columns: [text("Employee Code", "employee_code"), text("Employee Name", "employee_name"), number("Basic Salary", "basic_salary"), number("Allowance", "allowance"), number("Deduction", "deduction"), number("Net Salary", "net_salary"), text("Month", "month"), text("Status", "status", "Pending")] },
  "finance:supplier-payments": { table: "finance_supplier_payments", codeColumn: "supplier_payment_code", codePrefix: "SUP-PAY", columns: [text("Supplier", "supplier_name"), text("Project", "project_code"), number("Amount", "amount"), text("Payment Method", "payment_method"), text("Status", "status", "Pending"), date("Date", "date"), text("Notes", "notes")] },
  "finance:fixed-costs": { table: "finance_fixed_monthly_costs", hasUpdatedAt: true, columns: [text("Cost Name", "cost_name"), text("Category", "category"), number("Amount", "amount"), int("Day of Month", "day_of_month"), text("Status", "status", "Unpaid"), text("Notes", "notes")] },
  "finance:profit-loss": { table: "profit_loss_summaries", codeColumn: "summary_code", codePrefix: "PL", hasUpdatedAt: true, columns: [text("Period", "period"), number("Total Income", "total_income"), number("Total Expenses", "total_expenses"), number("Net Profit / Loss", "net_profit_loss"), text("Prepared By", "prepared_by"), text("Notes", "notes")] },
  "finance:cash-flow": { table: "cash_flow_summaries", codeColumn: "summary_code", codePrefix: "CF", hasUpdatedAt: true, columns: [text("Period", "period"), number("Cash In", "cash_in"), number("Cash Out", "cash_out"), number("Cash Balance", "cash_balance"), text("Prepared By", "prepared_by"), text("Notes", "notes")] },
  "finance:monthly-report": { table: "finance_monthly_reports", codeColumn: "report_code", codePrefix: "FIN-RPT", columns: [text("Month", "month"), text("Prepared By", "prepared_by"), text("Reviewed By", "reviewed_by"), text("Approved By", "approved_by"), text("Summary", "summary")] },
  "finance:actions": { table: "finance_actions", codeColumn: "action_code", codePrefix: "FIN-ACT", columns: [date("Date", "date"), text("Action", "action"), text("Responsible Person", "responsible_person"), date("Due Date", "due_date"), text("Status", "status", "Pending"), text("Notes", "notes")] },

  "hr:employees": { table: "hr_employees", codeColumn: "employee_code", codePrefix: "EMP", hasUpdatedAt: true, columns: [text("Name", "name"), text("Role", "role"), text("Department", "department"), text("Employment Type", "employment_type", "Full-Time"), text("Status", "status", "On Probation"), date("Start Date", "start_date"), int("Annual Leave Entitlement", "annual_leave_entitlement"), int("File Completion", "file_completion"), fixed("leave_used", 0, "int"), fixed("leave_remaining", 21, "int")] },
  "hr:attendance": { table: "hr_attendance_records", codeColumn: "attendance_code", codePrefix: "HR-ATT", hasUpdatedAt: true, columns: [text("Employee Code", "employee_code"), text("Employee Name", "employee_name"), date("Date", "date"), text("Status", "status", "Present"), int("Late Minutes", "late_minutes"), number("Overtime", "overtime_hours"), text("Source", "source", "Manual")] },
  "hr:file-checklist": { table: "hr_employee_file_checklists", hasUpdatedAt: true, columns: [text("Employee Code", "employee_code"), bool("CV", "cv"), bool("ID", "id_document"), bool("Contract", "contract"), bool("Job Description", "job_description"), bool("Photo", "photo"), bool("Bank Info", "bank_info"), bool("Emergency Contact", "emergency_contact"), int("Completion %", "completion_percent")] },
  "hr:agreements": { table: "hr_employment_agreements", codeColumn: "agreement_code", codePrefix: "HR-AGR", columns: [text("Employee Code", "employee_code"), text("Employee Name", "employee_name"), date("Start Date", "start_date"), date("End Date", "end_date"), text("Status", "status", "Draft"), text("Attachment", "attachment")] },
  "hr:job-descriptions": { table: "hr_job_descriptions", codeColumn: "jd_code", codePrefix: "HR-JD", columns: [text("Employee Code", "employee_code"), text("Role", "role"), text("Department", "department"), date("Issue Date", "issue_date"), text("Signed", "signed", "No"), text("Attachment", "attachment")] },
  "hr:fingerprint": { table: "hr_fingerprint_registrations", codeColumn: "fingerprint_code", codePrefix: "HR-FP", columns: [text("Employee Code", "employee_code"), text("Enroll Number", "enroll_number"), text("Device", "device"), date("Registered Date", "registered_date"), text("Status", "status", "Active")] },
  "hr:lateness": { table: "hr_lateness_records", codeColumn: "lateness_code", codePrefix: "HR-LATE", orderColumn: "date", columns: [text("Employee Code", "employee_code"), date("Date", "date"), text("Expected Time", "expected_time"), text("Actual Time", "actual_time"), int("Late Minutes", "late_minutes"), text("Reason", "reason")] },
  "hr:absence": { table: "hr_absence_records", codeColumn: "absence_code", codePrefix: "HR-ABS", orderColumn: "date", columns: [text("Employee Code", "employee_code"), date("Date", "date"), text("Reason", "reason"), text("Approved", "approved", "No"), text("Notes", "notes")] },
  "hr:leave": { table: "hr_leave_requests", codeColumn: "leave_code", codePrefix: "HR-LEAVE", hasUpdatedAt: true, columns: [text("Employee Code", "employee_code"), text("Employee Name", "employee_name"), text("Leave Type", "leave_type"), date("From", "from_date"), date("To", "to_date"), int("Days", "days"), text("Status", "status", "Requested"), text("Approved By", "approved_by")] },
  "hr:leave-balance": { table: "annual_leave_balances", hasUpdatedAt: true, columns: [text("Employee Code", "employee_code"), int("Year", "year"), int("Entitlement Days", "entitlement_days"), int("Used Days", "used_days"), int("Remaining Days", "remaining_days")] },
  "hr:overtime": { table: "hr_overtime_records", codeColumn: "overtime_code", codePrefix: "HR-OT", orderColumn: "date", columns: [text("Employee Code", "employee_code"), date("Date", "date"), number("Hours", "hours"), text("Approved By", "approved_by"), text("Status", "status", "Pending")] },
  "hr:probation": { table: "hr_probation_reviews", codeColumn: "probation_code", codePrefix: "HR-PROB", columns: [text("Employee Code", "employee_code"), date("Start Date", "start_date"), date("Review Due", "review_due"), text("Status", "status", "Under probation"), text("Reviewer", "reviewer"), text("Notes", "notes")] },
  "hr:evaluations": { table: "hr_employee_evaluations", codeColumn: "evaluation_code", codePrefix: "HR-EVAL", columns: [text("Employee Code", "employee_code"), text("Period", "period"), int("Score", "score"), text("Reviewer", "reviewer"), text("Status", "status", "Draft"), text("Notes", "notes")] },
  "hr:training": { table: "hr_training_records", codeColumn: "training_code", codePrefix: "HR-TRN", columns: [text("Employee Code", "employee_code"), text("Training", "training"), date("Date", "date"), text("Provider", "provider"), text("Status", "status", "Planned")] },
  "hr:disciplinary": { table: "hr_disciplinary_records", columns: [text("Employee Code", "employee_code"), date("Date", "date"), text("Type", "type"), text("Reason", "reason"), text("Action Taken", "action_taken"), text("Attachment", "attachment")] },
  "hr:assets": { table: "hr_asset_handovers", columns: [text("Employee Code", "employee_code"), text("Asset", "asset"), text("Serial", "serial"), date("Handover Date", "handover_date"), date("Return Date", "return_date"), text("Status", "status", "Issued")] },
  "hr:it-access": { table: "hr_it_access_records", columns: [text("Employee Code", "employee_code"), text("System", "system"), text("Access Level", "access_level"), date("Granted Date", "granted_date"), date("Revoked Date", "revoked_date"), text("Status", "status", "Active")] },
  "hr:exit": { table: "hr_exit_records", columns: [text("Employee Code", "employee_code"), text("Type", "type"), date("Notice Date", "notice_date"), date("Last Working Day", "last_working_day"), text("Reason", "reason"), text("Status", "status", "Open")] },
  "hr:clearance": { table: "hr_exit_clearances", columns: [text("Employee Code", "employee_code"), text("Assets Returned", "assets_returned", "No"), text("IT Access Revoked", "it_access_revoked", "No"), text("Finance Cleared", "finance_cleared", "No"), text("HR Cleared", "hr_cleared", "No"), text("Status", "status", "Pending")] },
  "hr:monthly-report": { table: "hr_monthly_reports", codeColumn: "report_code", codePrefix: "HR-RPT", columns: [text("Month", "month"), text("Prepared By", "prepared_by"), text("Reviewed By", "reviewed_by"), text("Approved By", "approved_by"), text("Summary", "summary")] },
  "hr:actions": { table: "hr_actions", codeColumn: "action_code", codePrefix: "HR-ACT", orderColumn: "date", columns: [date("Date", "date"), text("Action", "action"), text("Responsible Person", "responsible_person"), date("Due Date", "due_date"), text("Status", "status", "Pending"), text("Notes", "notes")] },

  "operations:projects": { table: "operations_projects", codeColumn: "project_code", codePrefix: "PRJ", hasUpdatedAt: true, columns: [text("Client", "client_name"), text("Project / Service", "project_service"), text("Status", "status", "Not Started"), text("Priority", "priority", "Medium"), text("Project Manager", "project_manager"), text("Responsible Division", "responsible_division"), date("Deadline", "deadline"), number("Approved Value", "approved_value"), text("Payment Status", "payment_status", "Pending"), int("Progress", "progress")] },
  "operations:kickoff": { table: "operations_project_kickoffs", codeColumn: "kickoff_code", codePrefix: "OPS-KO", columns: [text("Project Code", "project_code"), date("Kickoff Date", "kickoff_date"), text("Scope Confirmed", "scope_confirmed", "No"), text("Payment Status", "payment_status", "Pending"), text("Project Manager", "project_manager"), text("Notes", "notes")] },
  "operations:tasks": { table: "operations_tasks", codeColumn: "task_code", codePrefix: "TASK", hasUpdatedAt: true, columns: [text("Project Code", "project_code"), text("Title", "title"), text("Status", "status", "Open"), text("Priority", "priority", "Medium"), text("Responsible Person", "responsible_person"), date("Deadline", "deadline")] },
  "operations:work-orders": { table: "operations_work_orders", codeColumn: "work_order_no", codePrefix: "WO", columns: [text("Project Code", "project_code"), text("Division", "division"), text("Work Description", "work_description"), text("Assigned To", "assigned_to"), date("Due Date", "due_date"), text("Status", "status", "Open")] },
  "operations:timeline": { table: "operations_project_timelines", codeColumn: "timeline_code", codePrefix: "TL", columns: [text("Project Code", "project_code"), text("Milestone", "milestone"), date("Start Date", "start_date"), date("End Date", "end_date"), text("Status", "status", "Open")] },
  "operations:daily-tasks": { table: "operations_daily_tasks", columns: [date("Date", "date"), text("Employee", "employee"), text("Project Code", "project_code"), text("Task", "task"), text("Status", "status", "Open"), text("Notes", "notes")] },
  "operations:weekly-report": { table: "operations_weekly_reports", codeColumn: "report_code", codePrefix: "OPS-RPT", columns: [text("Week", "week"), text("Prepared By", "prepared_by"), text("Reviewed By", "reviewed_by"), text("Approved By", "approved_by"), text("Summary", "summary")] },
  "operations:issues": { table: "operations_issues", codeColumn: "issue_code", codePrefix: "ISS", hasUpdatedAt: true, columns: [text("Project Code", "project_code"), text("Issue Type", "issue_type", "Other"), text("Impact Level", "impact_level", "Medium"), text("Description", "description"), text("Status", "status", "Open"), text("Responsible Person", "responsible_person"), date("Due Date", "due_date")] },
  "operations:quality": { table: "operations_quality_checks", columns: [text("Project Code", "project_code"), date("Check Date", "check_date"), text("Checked By", "checked_by"), text("Result", "result"), text("Approved", "approved", "No"), text("Notes", "notes")] },
  "operations:client-approval": { table: "operations_client_approvals", columns: [text("Project Code", "project_code"), date("Approval Date", "approval_date"), text("Approved By", "approved_by"), text("Status", "status", "Pending"), text("Attachment", "attachment"), text("Notes", "notes")] },
  "operations:delivery": { table: "operations_delivery_handovers", columns: [text("Project Code", "project_code"), date("Delivery Date", "delivery_date"), text("Delivered By", "delivered_by"), text("Received By", "received_by"), text("Status", "status", "Pending"), text("Notes", "notes")] },
  "operations:closure": { table: "operations_project_closures", columns: [text("Project Code", "project_code"), date("Closure Date", "closure_date"), text("Closed By", "closed_by"), text("Client Approval", "client_approval", "Pending"), text("Finance Cleared", "finance_cleared", "No"), text("Status", "status", "Open")] },
  "operations:resources": { table: "operations_resource_assignments", columns: [text("Project Code", "project_code"), text("Resource", "resource"), text("Responsible Person", "responsible_person"), text("Role", "role"), date("Start Date", "start_date"), date("End Date", "end_date")] },
  "operations:workload": { table: "division_workloads", hasUpdatedAt: true, columns: [text("Division", "division"), text("Period", "period"), int("Active Projects", "active_projects"), int("Active Tasks", "active_tasks"), int("Delayed Tasks", "delayed_tasks"), text("Capacity Status", "capacity_status", "Yellow"), text("Owner", "owner"), text("Notes", "notes")] },
  "operations:actions": { table: "operations_actions", codeColumn: "action_code", codePrefix: "OPS-ACT", columns: [text("Project Code", "project_code"), text("Action", "action"), text("Responsible Person", "responsible_person"), date("Due Date", "due_date"), text("Status", "status", "Pending"), text("Notes", "notes")] },

  "packages:categories": { table: "package_categories", codeColumn: "category_code", codePrefix: "PKG-CAT", hasUpdatedAt: true, columns: [text("Name", "name"), text("Description", "description"), text("Status", "status", "Active")] },
  "packages:social": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Social Media Management"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "Range"), text("Requires Quotation", "requires_quotation", "Yes"), fixed("requires_site_survey", "No"), fixed("requires_finance_approval", "No"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:printing": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Printing & Branding"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "Range"), text("Requires Quotation", "requires_quotation", "Yes"), fixed("requires_site_survey", "No"), fixed("requires_finance_approval", "Yes"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:website-it": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Website & IT Services"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "Scope range"), text("Requires Operations Review", "requires_operations_review", "Yes"), fixed("requires_quotation", "Yes"), fixed("requires_site_survey", "No"), fixed("requires_finance_approval", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:events": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Events & Production"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "Scope range"), fixed("requires_quotation", "Yes"), text("Requires Site Survey", "requires_site_survey", "Yes"), fixed("requires_finance_approval", "Yes"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:fitout": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Interior Design & Fit-Out"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "BOQ / scope range"), fixed("requires_quotation", "Yes"), text("Requires Site Survey", "requires_site_survey", "Yes"), fixed("requires_finance_approval", "Yes"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:security": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "CCTV, Security & Access Control"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type"), fixed("pricing_method", "Site survey / BOQ"), fixed("requires_quotation", "Yes"), text("Requires Site Survey", "requires_site_survey", "Yes"), fixed("requires_finance_approval", "Yes"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:retainers": { table: "service_packages", codeColumn: "package_code", codePrefix: "PKG", hasUpdatedAt: true, columns: [fixed("category", "Combined Monthly Retainer Packages"), text("Package / Service Name", "package_name"), text("Recommended For", "recommended_for"), text("Key Includes", "key_includes"), number("Starting Price", "starting_price"), number("High Price", "high_price"), fixed("currency", "USD"), text("Billing Type", "billing_type", "Monthly"), fixed("pricing_method", "Retainer range"), fixed("requires_quotation", "Yes"), fixed("requires_site_survey", "No"), fixed("requires_finance_approval", "Yes"), fixed("requires_operations_review", "Yes"), fixed("status", "Active"), text("Notes", "notes")] },
  "packages:addons": { table: "package_addons", columns: [text("Package Code", "package_code"), text("Add-on Name", "addon_name"), number("Starting Price", "starting_price"), number("High Price", "high_price"), text("Requires Approval", "requires_approval", "Yes"), text("Notes", "notes")] },
  "packages:approvals": { table: "package_approvals", codeColumn: "approval_code", codePrefix: "PKG-APR", hasUpdatedAt: true, columns: [text("Package Code", "package_code"), text("Request Title", "request_title"), text("Requested By", "requested_by"), text("Discount Range", "discount_range"), number("Amount / Value", "amount_value"), text("Status", "status", "Pending"), text("Approved By", "approved_by"), date("Decision Date", "decision_date"), text("Notes", "notes")] },
  "packages:price-change-logs": { table: "price_change_logs", columns: [text("Package Code", "package_code"), number("Old Price", "old_price"), number("New Price", "new_price"), text("Changed By", "changed_by"), text("Reason", "reason")] },
  "packages:payment": { table: "package_payment_terms", columns: [text("Category", "category"), text("Payment Terms", "terms")] },
  "packages:discount": { table: "package_discount_rules", columns: [text("Discount Range", "discount_range"), text("Approval Required", "approval_required"), text("Rule", "rule")] },

  "commercial:quotations": { table: "commercial_documents", codeColumn: "document_no", codePrefix: "QUO", hasUpdatedAt: true, columns: commercialDocumentColumns("Quotation") },
  "commercial:purchase-orders": { table: "commercial_documents", codeColumn: "document_no", codePrefix: "PO", hasUpdatedAt: true, columns: commercialDocumentColumns("Purchase Order") },
  "commercial:supplier-invoices": { table: "commercial_documents", codeColumn: "document_no", codePrefix: "SUP-INV", hasUpdatedAt: true, columns: commercialDocumentColumns("Supplier Invoice") },
  "commercial:delivery-notes": { table: "commercial_documents", codeColumn: "document_no", codePrefix: "DN", hasUpdatedAt: true, columns: commercialDocumentColumns("Delivery Note") },
  "commercial:invoices": { table: "commercial_documents", codeColumn: "document_no", codePrefix: "INV", hasUpdatedAt: true, columns: commercialDocumentColumns("Invoice") },
  "commercial:payments": { table: "commercial_payments", codeColumn: "payment_no", codePrefix: "PAY", hasUpdatedAt: true, columns: [text("Related Document No", "related_document_no"), text("Payment Type", "payment_type", "Client Payment"), text("Client / Supplier", "client_supplier_name"), text("Project Code", "project_code"), number("Amount", "amount"), text("Payment Method", "payment_method", "Cash"), text("Status", "status", "Recorded"), date("Paid At", "paid_at"), text("Received / Paid By", "received_paid_by"), text("Attachment URL", "attachment_url"), text("Notes", "notes")] },
  "commercial:receipts": { table: "commercial_receipts", codeColumn: "receipt_no", codePrefix: "REC", hasUpdatedAt: true, columns: [text("Related Document No", "related_document_no"), text("Client / Supplier", "client_supplier_name"), text("Project Code", "project_code"), number("Amount", "amount"), text("Payment Method", "payment_method", "Cash"), text("Status", "status", "Issued"), date("Received Date", "received_date"), text("Received By", "received_by"), text("Attachment URL", "attachment_url"), text("Notes", "notes")] },
  "commercial:suppliers": { table: "commercial_suppliers", codeColumn: "supplier_code", codePrefix: "SUP", hasUpdatedAt: true, columns: [text("Supplier Name", "supplier_name"), text("Category", "category"), text("Contact Person", "contact_person"), text("Phone", "phone"), text("Email", "email"), text("Address", "address"), text("Payment Terms", "payment_terms"), text("Status", "status", "Active"), text("Notes", "notes")] },
  "commercial:archive": { table: "commercial_archives", codeColumn: "archive_code", codePrefix: "ARC", hasUpdatedAt: true, columns: [text("Document Chain", "document_chain"), text("Client / Supplier", "client_supplier_name"), text("Project Code", "project_code"), text("Quotation No", "quotation_no"), text("Delivery Note No", "delivery_note_no"), text("Invoice No", "invoice_no"), text("Payment No", "payment_no"), text("Receipt No", "receipt_no"), text("Archive Status", "archive_status", "Final"), text("Locked By", "locked_by"), date("Locked At", "locked_at"), text("Storage Location", "storage_location"), text("Notes", "notes")] },

  "approvals:approval-register": { table: "approval_register", codeColumn: "approval_code", codePrefix: "APR", hasUpdatedAt: true, columns: [text("Approval Title", "approval_title"), text("Approval Type", "approval_type"), text("Department", "department"), text("Requested By", "requested_by"), date("Request Date", "request_date"), number("Amount / Value", "amount_value"), text("Priority", "priority", "Medium"), text("Status", "status", "Pending"), text("Approved By", "approved_by"), date("Decision Date", "decision_date"), text("Attachment / Link", "attachment_link"), text("Notes", "notes")] },
  "approvals:decision-register": { table: "decision_register", codeColumn: "decision_code", codePrefix: "DEC", hasUpdatedAt: true, columns: [text("Decision Title", "decision_title"), text("Decision Area", "decision_area"), text("Requested By", "requested_by"), text("Decision Owner", "decision_owner"), date("Decision Date", "decision_date"), text("Decision", "decision"), text("Implementation Owner", "implementation_owner"), date("Due Date", "due_date"), text("Status", "status", "Open"), text("Notes", "notes")] },
  "approvals:ceo-approvals": { table: "ceo_approval_queue", codeColumn: "approval_code", codePrefix: "CEO-APR", hasUpdatedAt: true, columns: [text("Request Title", "request_title"), text("Department", "department"), text("Requested By", "requested_by"), number("Amount / Value", "amount_value"), text("Reason", "reason"), text("Urgency", "urgency", "Normal"), text("Status", "status", "Pending"), text("CEO Decision", "ceo_decision"), date("Decision Date", "decision_date"), text("Notes", "notes")] },
  "approvals:action-followup": { table: "decision_action_followups", codeColumn: "followup_code", codePrefix: "DAF", hasUpdatedAt: true, columns: [text("Decision / Approval Code", "decision_approval_code"), text("Action Required", "action_required"), text("Responsible Person", "responsible_person"), date("Assigned Date", "assigned_date"), date("Due Date", "due_date"), text("Priority", "priority", "Medium"), text("Status", "status", "Pending"), text("Progress", "progress"), text("Notes", "notes")] },

  "documents:controlled-documents": { table: "controlled_documents", codeColumn: "document_register_code", codePrefix: "DOC", hasUpdatedAt: true, columns: [text("Document Code", "document_code"), text("Document Title", "document_title"), text("Version", "version"), text("Classification", "classification"), text("Owner", "owner"), text("Department", "department"), text("Storage Location", "storage_location"), text("Approval Status", "approval_status", "Draft"), text("Approved By", "approved_by"), date("Review Date", "review_date"), text("Attachment Link", "attachment_link"), text("Notes", "notes")] },
  "documents:revision-log": { table: "document_revision_logs", codeColumn: "revision_code", codePrefix: "REV", columns: [text("Document Code", "document_code"), text("Old Version", "old_version"), text("New Version", "new_version"), text("Change Summary", "change_summary"), text("Changed By", "changed_by"), date("Change Date", "change_date"), text("Approved By", "approved_by"), text("Status", "status", "Pending"), text("Notes", "notes")] },
  "documents:storage-map": { table: "file_storage_maps", codeColumn: "storage_code", codePrefix: "FSM", hasUpdatedAt: true, columns: [text("Folder / Location", "folder_location"), text("Module", "module"), text("Document Category", "document_category"), text("Owner", "owner"), text("Access Level", "access_level"), text("Retention Rule", "retention_rule"), text("Backup Location", "backup_location"), text("Status", "status", "Active"), text("Notes", "notes")] },
  "documents:review-calendar": { table: "document_review_calendar", codeColumn: "review_code", codePrefix: "DRC", hasUpdatedAt: true, columns: [text("Document Code", "document_code"), text("Document Title", "document_title"), text("Owner", "owner"), date("Last Review Date", "last_review_date"), date("Next Review Date", "next_review_date"), text("Review Status", "review_status", "Pending"), text("Reviewer", "reviewer"), text("Action Required", "action_required"), text("Notes", "notes")] },

  "requirements:deliverables": { table: "developer_deliverables", codeColumn: "deliverable_code", codePrefix: "DEV", hasUpdatedAt: true, columns: [text("Deliverable", "deliverable"), text("Description", "description"), text("Owner", "owner"), text("Priority", "priority", "High"), text("Status", "status", "Open"), date("Due Date", "due_date"), text("Approved By", "approved_by"), text("Notes", "notes")] },
  "requirements:developer-questions": { table: "developer_questions", codeColumn: "question_code", codePrefix: "Q", hasUpdatedAt: true, columns: [text("Question", "question"), text("Area", "area"), text("Asked By", "asked_by"), text("Answer / Decision", "answer_decision"), text("Owner", "owner"), text("Status", "status", "Open"), date("Decision Date", "decision_date"), text("Notes", "notes")] }
};

export function tableMapKey(moduleId: string, sectionId: string) {
  return `${moduleId}:${sectionId}`;
}

export function getSection(moduleId: string, sectionId: string): ModuleSection | null {
  return documentModules[moduleId]?.sections.find((section) => section.id === sectionId) || null;
}

export function resolveSectionTableMap(moduleId: string, sectionId: string) {
  return sectionTableMaps[tableMapKey(moduleId, sectionId)] || null;
}

export function valueForColumn(spec: ColumnSpec, values: Record<string, string>) {
  const raw = spec.field ? values[spec.field] : undefined;
  const fallback = typeof spec.defaultValue === "function" ? spec.defaultValue() : spec.defaultValue;
  const value = raw === undefined || raw === "" ? fallback : raw;

  if (spec.kind === "number") return Number(value || 0);
  if (spec.kind === "int") return Math.trunc(Number(value || 0));
  if (spec.kind === "date") return value instanceof Date ? value : new Date(String(value || new Date().toISOString()));
  if (spec.kind === "bool") return value === true || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
  return value === undefined || value === null ? "" : String(value);
}

export function createDbId() {
  return randomUUID();
}
