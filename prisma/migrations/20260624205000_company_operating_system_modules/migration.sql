CREATE TABLE IF NOT EXISTS "executive_kpi_snapshots" (
  "id" TEXT NOT NULL,
  "kpi_code" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "prepared_by" TEXT,
  "sales_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "pipeline_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "cash_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "pending_payments" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "active_employees" INTEGER NOT NULL DEFAULT 0,
  "attendance_issues" INTEGER NOT NULL DEFAULT 0,
  "active_projects" INTEGER NOT NULL DEFAULT 0,
  "delayed_projects" INTEGER NOT NULL DEFAULT 0,
  "open_risks" INTEGER NOT NULL DEFAULT 0,
  "pending_approvals" INTEGER NOT NULL DEFAULT 0,
  "overall_status" TEXT NOT NULL DEFAULT 'Yellow',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "executive_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "client_experience_records" (
  "id" TEXT NOT NULL,
  "client_experience_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "feedback_type" TEXT,
  "satisfaction_level" TEXT,
  "complaint_request" TEXT,
  "channel" TEXT,
  "issue_feedback" TEXT,
  "impact_level" TEXT,
  "responsible_person" TEXT,
  "resolution_action" TEXT,
  "action_required" TEXT,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "client_experience_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quality_risk_records" (
  "id" TEXT NOT NULL,
  "risk_code" TEXT NOT NULL,
  "risk_issue_title" TEXT NOT NULL,
  "department" TEXT,
  "impact_level" TEXT,
  "owner" TEXT,
  "date_identified" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "corrective_action" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "escalated_to" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quality_risk_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quality_control_records" (
  "id" TEXT NOT NULL,
  "quality_code" TEXT NOT NULL,
  "check_title" TEXT NOT NULL,
  "department" TEXT,
  "project_area" TEXT,
  "checked_by" TEXT,
  "check_date" TIMESTAMP(3),
  "result" TEXT,
  "corrective_action" TEXT,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quality_control_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "risk_compliance_records" (
  "id" TEXT NOT NULL,
  "risk_code" TEXT NOT NULL,
  "risk_title" TEXT NOT NULL,
  "department" TEXT,
  "risk_type" TEXT,
  "impact_level" TEXT,
  "owner" TEXT,
  "identified_date" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "corrective_action" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "risk_compliance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "it_access_controls" (
  "id" TEXT NOT NULL,
  "control_code" TEXT NOT NULL,
  "control_title" TEXT NOT NULL,
  "system_area" TEXT,
  "owner" TEXT,
  "access_level" TEXT,
  "backup_frequency" TEXT,
  "last_review_date" TIMESTAMP(3),
  "next_review_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Active',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "it_access_controls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "management_weekly_meetings" (
  "id" TEXT NOT NULL,
  "meeting_code" TEXT NOT NULL,
  "meeting_date" TIMESTAMP(3) NOT NULL,
  "chairperson" TEXT,
  "attendees" TEXT,
  "sales_review" TEXT,
  "finance_review" TEXT,
  "hr_review" TEXT,
  "operations_review" TEXT,
  "risks" TEXT,
  "decisions" TEXT,
  "next_actions" TEXT,
  "prepared_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "management_weekly_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "management_monthly_reports" (
  "id" TEXT NOT NULL,
  "report_code" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "prepared_by" TEXT,
  "reviewed_by" TEXT,
  "approved_by" TEXT,
  "executive_summary" TEXT,
  "sales_summary" TEXT,
  "finance_summary" TEXT,
  "hr_summary" TEXT,
  "operations_summary" TEXT,
  "risk_summary" TEXT,
  "next_month_plan" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "management_monthly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "management_action_items" (
  "id" TEXT NOT NULL,
  "action_code" TEXT NOT NULL,
  "action_title" TEXT NOT NULL,
  "department" TEXT,
  "responsible_person" TEXT,
  "assigned_date" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "progress" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "management_action_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_target_clients" (
  "id" TEXT NOT NULL,
  "client_code" TEXT NOT NULL,
  "company_client_name" TEXT NOT NULL,
  "industry" TEXT,
  "location" TEXT,
  "phone" TEXT,
  "instagram_website" TEXT,
  "service_opportunity" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'New',
  "next_follow_up" TIMESTAMP(3),
  "contact_person" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outreach_target_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_contact_attempts" (
  "id" TEXT NOT NULL,
  "attempt_code" TEXT NOT NULL,
  "client_code" TEXT,
  "client_name" TEXT,
  "attempt_date" TIMESTAMP(3) NOT NULL,
  "method" TEXT,
  "contact_person" TEXT,
  "result" TEXT,
  "next_action" TEXT,
  "next_follow_up" TIMESTAMP(3),
  "responsible_person" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "outreach_contact_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_followups" (
  "id" TEXT NOT NULL,
  "followup_code" TEXT NOT NULL,
  "client_code" TEXT,
  "client_name" TEXT,
  "last_contact_date" TIMESTAMP(3) NOT NULL,
  "method" TEXT,
  "discussion_summary" TEXT,
  "next_action" TEXT,
  "next_follow_up_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "responsible_person" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outreach_followups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_meeting_conversions" (
  "id" TEXT NOT NULL,
  "meeting_code" TEXT NOT NULL,
  "client_code" TEXT,
  "client_name" TEXT,
  "meeting_date" TIMESTAMP(3) NOT NULL,
  "meeting_status" TEXT,
  "meeting_purpose" TEXT,
  "decision_maker" TEXT,
  "proposal_required" TEXT,
  "next_step" TEXT,
  "responsible_person" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outreach_meeting_conversions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_proposal_conversions" (
  "id" TEXT NOT NULL,
  "conversion_code" TEXT NOT NULL,
  "client_code" TEXT,
  "client_name" TEXT,
  "service_package" TEXT,
  "proposal_status" TEXT,
  "quotation_status" TEXT,
  "estimated_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "decision_status" TEXT,
  "expected_close_date" TIMESTAMP(3),
  "reason_lost" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outreach_proposal_conversions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_monthly_reports" (
  "id" TEXT NOT NULL,
  "report_code" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "prepared_by" TEXT,
  "new_clients_added" INTEGER NOT NULL DEFAULT 0,
  "clients_contacted" INTEGER NOT NULL DEFAULT 0,
  "calls_made" INTEGER NOT NULL DEFAULT 0,
  "whatsapp_messages_sent" INTEGER NOT NULL DEFAULT 0,
  "emails_sent" INTEGER NOT NULL DEFAULT 0,
  "meetings_scheduled" INTEGER NOT NULL DEFAULT 0,
  "meetings_completed" INTEGER NOT NULL DEFAULT 0,
  "proposals_sent" INTEGER NOT NULL DEFAULT 0,
  "quotations_sent" INTEGER NOT NULL DEFAULT 0,
  "deals_closed" INTEGER NOT NULL DEFAULT 0,
  "summary" TEXT,
  "next_month_plan" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "outreach_monthly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "approval_register" (
  "id" TEXT NOT NULL,
  "approval_code" TEXT NOT NULL,
  "approval_title" TEXT,
  "request_title" TEXT,
  "approval_type" TEXT,
  "department" TEXT,
  "requested_by" TEXT,
  "request_date" TIMESTAMP(3),
  "amount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "decision_needed" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "approved_by" TEXT,
  "decision_date" TIMESTAMP(3),
  "attachment_link" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "approval_register_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "decision_register" (
  "id" TEXT NOT NULL,
  "decision_code" TEXT NOT NULL,
  "decision_title" TEXT NOT NULL,
  "decision_area" TEXT,
  "requested_by" TEXT,
  "decision_owner" TEXT,
  "decision_date" TIMESTAMP(3),
  "decision" TEXT,
  "implementation_owner" TEXT,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "decision_register_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ceo_approval_queue" (
  "id" TEXT NOT NULL,
  "approval_code" TEXT NOT NULL,
  "request_title" TEXT NOT NULL,
  "department" TEXT,
  "requested_by" TEXT,
  "amount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "reason" TEXT,
  "urgency" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "ceo_decision" TEXT,
  "decision_date" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ceo_approval_queue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "decision_action_followups" (
  "id" TEXT NOT NULL,
  "followup_code" TEXT NOT NULL,
  "decision_approval_code" TEXT,
  "action_required" TEXT,
  "responsible_person" TEXT,
  "assigned_date" TIMESTAMP(3),
  "due_date" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "progress" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "decision_action_followups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "controlled_documents" (
  "id" TEXT NOT NULL,
  "document_register_code" TEXT NOT NULL,
  "document_code" TEXT NOT NULL,
  "document_title" TEXT NOT NULL,
  "version" TEXT,
  "classification" TEXT,
  "owner" TEXT,
  "department" TEXT,
  "storage_location" TEXT,
  "approval_status" TEXT NOT NULL DEFAULT 'Draft',
  "approved_by" TEXT,
  "review_date" TIMESTAMP(3),
  "attachment_link" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "controlled_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "document_revision_logs" (
  "id" TEXT NOT NULL,
  "revision_code" TEXT NOT NULL,
  "document_code" TEXT NOT NULL,
  "old_version" TEXT,
  "new_version" TEXT,
  "change_summary" TEXT,
  "changed_by" TEXT,
  "change_date" TIMESTAMP(3),
  "approved_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_revision_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "file_storage_maps" (
  "id" TEXT NOT NULL,
  "storage_code" TEXT NOT NULL,
  "folder_location" TEXT NOT NULL,
  "module" TEXT,
  "document_category" TEXT,
  "owner" TEXT,
  "access_level" TEXT,
  "retention_rule" TEXT,
  "backup_location" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "file_storage_maps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "document_review_calendar" (
  "id" TEXT NOT NULL,
  "review_code" TEXT NOT NULL,
  "document_code" TEXT NOT NULL,
  "document_title" TEXT,
  "owner" TEXT,
  "last_review_date" TIMESTAMP(3),
  "next_review_date" TIMESTAMP(3),
  "review_status" TEXT NOT NULL DEFAULT 'Pending',
  "reviewer" TEXT,
  "action_required" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_review_calendar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "developer_deliverables" (
  "id" TEXT NOT NULL,
  "deliverable_code" TEXT NOT NULL,
  "deliverable" TEXT NOT NULL,
  "description" TEXT,
  "owner" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'High',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "due_date" TIMESTAMP(3),
  "approved_by" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "developer_deliverables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "developer_questions" (
  "id" TEXT NOT NULL,
  "question_code" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "area" TEXT,
  "asked_by" TEXT,
  "answer_decision" TEXT,
  "owner" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "decision_date" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "developer_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_employment_agreements" (
  "id" TEXT NOT NULL,
  "agreement_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "employee_name" TEXT,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "attachment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_employment_agreements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_job_descriptions" (
  "id" TEXT NOT NULL,
  "jd_code" TEXT NOT NULL,
  "employee_code" TEXT,
  "role" TEXT,
  "department" TEXT,
  "issue_date" TIMESTAMP(3),
  "signed" TEXT,
  "attachment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_job_descriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_probation_reviews" (
  "id" TEXT NOT NULL,
  "probation_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "start_date" TIMESTAMP(3),
  "review_due" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Under probation',
  "reviewer" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_probation_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_employee_evaluations" (
  "id" TEXT NOT NULL,
  "evaluation_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "period" TEXT,
  "score" INTEGER NOT NULL DEFAULT 0,
  "reviewer" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_employee_evaluations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_training_records" (
  "id" TEXT NOT NULL,
  "training_code" TEXT NOT NULL,
  "employee_code" TEXT,
  "training" TEXT,
  "date" TIMESTAMP(3),
  "provider" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Planned',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_training_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_disciplinary_records" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT,
  "date" TIMESTAMP(3),
  "type" TEXT,
  "reason" TEXT,
  "action_taken" TEXT,
  "attachment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_disciplinary_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_asset_handovers" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT,
  "asset" TEXT,
  "serial" TEXT,
  "handover_date" TIMESTAMP(3),
  "return_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Issued',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_asset_handovers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_it_access_records" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT,
  "system" TEXT,
  "access_level" TEXT,
  "granted_date" TIMESTAMP(3),
  "revoked_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_it_access_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_exit_records" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT,
  "type" TEXT,
  "notice_date" TIMESTAMP(3),
  "last_working_day" TIMESTAMP(3),
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_exit_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_exit_clearances" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT,
  "assets_returned" TEXT,
  "it_access_revoked" TEXT,
  "finance_cleared" TEXT,
  "hr_cleared" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_exit_clearances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hr_monthly_reports" (
  "id" TEXT NOT NULL,
  "report_code" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "prepared_by" TEXT,
  "reviewed_by" TEXT,
  "approved_by" TEXT,
  "summary" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_monthly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_project_timelines" (
  "id" TEXT NOT NULL,
  "timeline_code" TEXT NOT NULL,
  "project_code" TEXT,
  "milestone" TEXT,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_project_timelines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_daily_tasks" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3),
  "employee" TEXT,
  "project_code" TEXT,
  "task" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_daily_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_weekly_reports" (
  "id" TEXT NOT NULL,
  "report_code" TEXT NOT NULL,
  "week" TEXT,
  "prepared_by" TEXT,
  "reviewed_by" TEXT,
  "approved_by" TEXT,
  "summary" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_weekly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_client_approvals" (
  "id" TEXT NOT NULL,
  "project_code" TEXT,
  "approval_date" TIMESTAMP(3),
  "approved_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "attachment" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_client_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_project_closures" (
  "id" TEXT NOT NULL,
  "project_code" TEXT,
  "closure_date" TIMESTAMP(3),
  "closed_by" TEXT,
  "client_approval" TEXT,
  "finance_cleared" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_project_closures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "operations_resource_assignments" (
  "id" TEXT NOT NULL,
  "project_code" TEXT,
  "resource" TEXT,
  "responsible_person" TEXT,
  "role" TEXT,
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operations_resource_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "executive_kpi_snapshots_kpi_code_key" ON "executive_kpi_snapshots"("kpi_code");
CREATE UNIQUE INDEX IF NOT EXISTS "client_experience_records_code_key" ON "client_experience_records"("client_experience_code");
CREATE UNIQUE INDEX IF NOT EXISTS "quality_risk_records_risk_code_key" ON "quality_risk_records"("risk_code");
CREATE UNIQUE INDEX IF NOT EXISTS "quality_control_records_quality_code_key" ON "quality_control_records"("quality_code");
CREATE UNIQUE INDEX IF NOT EXISTS "risk_compliance_records_risk_code_key" ON "risk_compliance_records"("risk_code");
CREATE UNIQUE INDEX IF NOT EXISTS "it_access_controls_control_code_key" ON "it_access_controls"("control_code");
CREATE UNIQUE INDEX IF NOT EXISTS "management_weekly_meetings_meeting_code_key" ON "management_weekly_meetings"("meeting_code");
CREATE UNIQUE INDEX IF NOT EXISTS "management_monthly_reports_report_code_key" ON "management_monthly_reports"("report_code");
CREATE UNIQUE INDEX IF NOT EXISTS "management_action_items_action_code_key" ON "management_action_items"("action_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_target_clients_client_code_key" ON "outreach_target_clients"("client_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_contact_attempts_attempt_code_key" ON "outreach_contact_attempts"("attempt_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_followups_followup_code_key" ON "outreach_followups"("followup_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_meeting_conversions_meeting_code_key" ON "outreach_meeting_conversions"("meeting_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_proposal_conversions_conversion_code_key" ON "outreach_proposal_conversions"("conversion_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_monthly_reports_report_code_key" ON "outreach_monthly_reports"("report_code");
CREATE UNIQUE INDEX IF NOT EXISTS "approval_register_approval_code_key" ON "approval_register"("approval_code");
CREATE UNIQUE INDEX IF NOT EXISTS "decision_register_decision_code_key" ON "decision_register"("decision_code");
CREATE UNIQUE INDEX IF NOT EXISTS "ceo_approval_queue_approval_code_key" ON "ceo_approval_queue"("approval_code");
CREATE UNIQUE INDEX IF NOT EXISTS "decision_action_followups_followup_code_key" ON "decision_action_followups"("followup_code");
CREATE UNIQUE INDEX IF NOT EXISTS "controlled_documents_register_code_key" ON "controlled_documents"("document_register_code");
CREATE UNIQUE INDEX IF NOT EXISTS "document_revision_logs_revision_code_key" ON "document_revision_logs"("revision_code");
CREATE UNIQUE INDEX IF NOT EXISTS "file_storage_maps_storage_code_key" ON "file_storage_maps"("storage_code");
CREATE UNIQUE INDEX IF NOT EXISTS "document_review_calendar_review_code_key" ON "document_review_calendar"("review_code");
CREATE UNIQUE INDEX IF NOT EXISTS "developer_deliverables_code_key" ON "developer_deliverables"("deliverable_code");
CREATE UNIQUE INDEX IF NOT EXISTS "developer_questions_code_key" ON "developer_questions"("question_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_employment_agreements_agreement_code_key" ON "hr_employment_agreements"("agreement_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_job_descriptions_jd_code_key" ON "hr_job_descriptions"("jd_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_probation_reviews_probation_code_key" ON "hr_probation_reviews"("probation_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_employee_evaluations_evaluation_code_key" ON "hr_employee_evaluations"("evaluation_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_training_records_training_code_key" ON "hr_training_records"("training_code");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_monthly_reports_report_code_key" ON "hr_monthly_reports"("report_code");
CREATE UNIQUE INDEX IF NOT EXISTS "operations_project_timelines_timeline_code_key" ON "operations_project_timelines"("timeline_code");
CREATE UNIQUE INDEX IF NOT EXISTS "operations_weekly_reports_report_code_key" ON "operations_weekly_reports"("report_code");
