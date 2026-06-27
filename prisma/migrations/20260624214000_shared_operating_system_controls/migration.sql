CREATE TABLE IF NOT EXISTS "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_system" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "attachments" (
  "id" TEXT NOT NULL,
  "module_id" TEXT NOT NULL,
  "section_id" TEXT,
  "record_id" TEXT,
  "file_name" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "mime_type" TEXT,
  "size_bytes" INTEGER,
  "uploaded_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "actor_id" TEXT,
  "actor_name" TEXT,
  "action" TEXT NOT NULL,
  "module_id" TEXT,
  "section_id" TEXT,
  "record_id" TEXT,
  "entity_table" TEXT,
  "before_data" JSONB,
  "after_data" JSONB,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "module_id" TEXT,
  "record_id" TEXT,
  "user_role" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Unread',
  "due_at" TIMESTAMP(3),
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reminders" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "module_id" TEXT NOT NULL,
  "section_id" TEXT,
  "record_id" TEXT,
  "assigned_to" TEXT,
  "due_at" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "module" TEXT,
  "description" TEXT,
  "updated_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "package_categories" (
  "id" TEXT NOT NULL,
  "category_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "package_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "package_approvals" (
  "id" TEXT NOT NULL,
  "approval_code" TEXT NOT NULL,
  "package_code" TEXT,
  "request_title" TEXT NOT NULL,
  "requested_by" TEXT,
  "discount_range" TEXT,
  "amount_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "approved_by" TEXT,
  "decision_date" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "package_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kpi_targets" (
  "id" TEXT NOT NULL,
  "kpi_code" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "metric_name" TEXT NOT NULL,
  "target_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "period" TEXT,
  "owner" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "kpi_targets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "annual_leave_balances" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "entitlement_days" INTEGER NOT NULL DEFAULT 21,
  "used_days" INTEGER NOT NULL DEFAULT 0,
  "remaining_days" INTEGER NOT NULL DEFAULT 21,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "annual_leave_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "profit_loss_summaries" (
  "id" TEXT NOT NULL,
  "summary_code" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "total_income" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total_expenses" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "net_profit_loss" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "prepared_by" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "profit_loss_summaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "cash_flow_summaries" (
  "id" TEXT NOT NULL,
  "summary_code" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "cash_in" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "cash_out" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "cash_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "prepared_by" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cash_flow_summaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_actions" (
  "id" TEXT NOT NULL,
  "action_code" TEXT NOT NULL,
  "lead_code" TEXT,
  "client_name" TEXT,
  "action" TEXT NOT NULL,
  "responsible_person" TEXT,
  "due_date" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sales_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "division_workloads" (
  "id" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "period" TEXT,
  "active_projects" INTEGER NOT NULL DEFAULT 0,
  "active_tasks" INTEGER NOT NULL DEFAULT 0,
  "delayed_tasks" INTEGER NOT NULL DEFAULT 0,
  "capacity_status" TEXT NOT NULL DEFAULT 'Yellow',
  "owner" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "division_workloads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "outreach_categories" (
  "id" TEXT NOT NULL,
  "category_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "main_opportunity" TEXT,
  "target_count" INTEGER NOT NULL DEFAULT 0,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outreach_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "document_control_records" (
  "id" TEXT NOT NULL,
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
  CONSTRAINT "document_control_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE INDEX IF NOT EXISTS "attachments_record_idx" ON "attachments"("module_id", "section_id", "record_id");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_idx" ON "audit_logs"("module_id", "section_id", "record_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX IF NOT EXISTS "notifications_role_status_idx" ON "notifications"("user_role", "status");
CREATE INDEX IF NOT EXISTS "reminders_due_status_idx" ON "reminders"("due_at", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "system_settings_key_key" ON "system_settings"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "package_categories_category_code_key" ON "package_categories"("category_code");
CREATE UNIQUE INDEX IF NOT EXISTS "package_categories_name_key" ON "package_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "package_approvals_approval_code_key" ON "package_approvals"("approval_code");
CREATE UNIQUE INDEX IF NOT EXISTS "kpi_targets_kpi_code_key" ON "kpi_targets"("kpi_code");
CREATE UNIQUE INDEX IF NOT EXISTS "annual_leave_balances_employee_year_key" ON "annual_leave_balances"("employee_code", "year");
CREATE UNIQUE INDEX IF NOT EXISTS "profit_loss_summaries_summary_code_key" ON "profit_loss_summaries"("summary_code");
CREATE UNIQUE INDEX IF NOT EXISTS "cash_flow_summaries_summary_code_key" ON "cash_flow_summaries"("summary_code");
CREATE UNIQUE INDEX IF NOT EXISTS "sales_actions_action_code_key" ON "sales_actions"("action_code");
CREATE UNIQUE INDEX IF NOT EXISTS "outreach_categories_category_code_key" ON "outreach_categories"("category_code");
CREATE UNIQUE INDEX IF NOT EXISTS "document_control_records_document_code_version_key" ON "document_control_records"("document_code", "version");

DO $$
DECLARE
  table_name text;
  table_names text[] := ARRAY[
    'crm_leads','crm_deals','crm_contact_logs','crm_meetings','crm_proposals','crm_quotations',
    'crm_closed_deals','crm_lost_deals','crm_target_clients','crm_sales_handovers',
    'outreach_target_clients','outreach_contact_attempts','outreach_followups','outreach_meeting_conversions','outreach_proposal_conversions',
    'finance_incomes','finance_expenses','finance_invoices','finance_receipts','finance_payment_requests','finance_petty_cash_entries',
    'finance_salary_records','finance_supplier_payments','finance_fixed_monthly_costs',
    'hr_employees','hr_attendance_records','hr_leave_requests','hr_employee_file_checklists','hr_employment_agreements','hr_job_descriptions',
    'hr_probation_reviews','hr_employee_evaluations','hr_training_records','hr_disciplinary_records',
    'operations_projects','operations_tasks','operations_issues','operations_project_kickoffs','operations_work_orders','operations_quality_checks',
    'operations_client_approvals','operations_delivery_handovers','operations_project_closures',
    'service_packages','package_addons','package_payment_terms','package_discount_rules','package_approvals',
    'approval_register','decision_register','ceo_approval_queue','decision_action_followups',
    'controlled_documents','document_revision_logs','file_storage_maps','document_review_calendar',
    'management_action_items','management_weekly_meetings','management_monthly_reports'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    IF to_regclass(table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_by TEXT', table_name);
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_by TEXT', table_name);
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)', table_name);
    END IF;
  END LOOP;
END $$;
