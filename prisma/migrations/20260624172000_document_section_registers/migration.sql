CREATE TABLE "finance_incomes" (
  "id" TEXT NOT NULL,
  "income_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "client_name" TEXT NOT NULL,
  "project_service" TEXT,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_method" TEXT,
  "reference" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "finance_incomes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_receipts" (
  "id" TEXT NOT NULL,
  "receipt_no" TEXT NOT NULL,
  "invoice_no" TEXT,
  "client_name" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_method" TEXT,
  "received_date" TIMESTAMP(3) NOT NULL,
  "received_by" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_petty_cash_entries" (
  "id" TEXT NOT NULL,
  "petty_cash_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "purpose" TEXT NOT NULL,
  "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "responsible_person" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_petty_cash_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_salary_records" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "basic_salary" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "allowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "deduction" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "net_salary" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "month" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_salary_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_supplier_payments" (
  "id" TEXT NOT NULL,
  "supplier_payment_code" TEXT NOT NULL,
  "supplier_name" TEXT NOT NULL,
  "project_code" TEXT,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_method" TEXT,
  "status" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_supplier_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_fixed_monthly_costs" (
  "id" TEXT NOT NULL,
  "cost_name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "day_of_month" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "finance_fixed_monthly_costs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_monthly_reports" (
  "id" TEXT NOT NULL,
  "report_code" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "prepared_by" TEXT NOT NULL,
  "reviewed_by" TEXT,
  "approved_by" TEXT,
  "summary" TEXT,
  "data" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_monthly_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_actions" (
  "id" TEXT NOT NULL,
  "action_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "action" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "finance_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_employee_file_checklists" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "cv" BOOLEAN NOT NULL DEFAULT false,
  "id_document" BOOLEAN NOT NULL DEFAULT false,
  "contract" BOOLEAN NOT NULL DEFAULT false,
  "job_description" BOOLEAN NOT NULL DEFAULT false,
  "photo" BOOLEAN NOT NULL DEFAULT false,
  "bank_info" BOOLEAN NOT NULL DEFAULT false,
  "emergency_contact" BOOLEAN NOT NULL DEFAULT false,
  "completion_percent" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_employee_file_checklists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_fingerprint_registrations" (
  "id" TEXT NOT NULL,
  "fingerprint_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "enroll_number" TEXT NOT NULL,
  "device" TEXT,
  "registered_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_fingerprint_registrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_lateness_records" (
  "id" TEXT NOT NULL,
  "lateness_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "expected_time" TEXT NOT NULL,
  "actual_time" TEXT NOT NULL,
  "late_minutes" INTEGER NOT NULL DEFAULT 0,
  "reason" TEXT,
  CONSTRAINT "hr_lateness_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_absence_records" (
  "id" TEXT NOT NULL,
  "absence_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "reason" TEXT,
  "approved" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "hr_absence_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_overtime_records" (
  "id" TEXT NOT NULL,
  "overtime_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "approved_by" TEXT,
  "status" TEXT NOT NULL,
  CONSTRAINT "hr_overtime_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_actions" (
  "id" TEXT NOT NULL,
  "action_code" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "action" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "hr_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_project_kickoffs" (
  "id" TEXT NOT NULL,
  "kickoff_code" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "kickoff_date" TIMESTAMP(3) NOT NULL,
  "scope_confirmed" TEXT NOT NULL,
  "payment_status" TEXT NOT NULL,
  "project_manager" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "operations_project_kickoffs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_work_orders" (
  "id" TEXT NOT NULL,
  "work_order_no" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "work_description" TEXT NOT NULL,
  "assigned_to" TEXT NOT NULL,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  CONSTRAINT "operations_work_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_quality_checks" (
  "id" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "check_date" TIMESTAMP(3) NOT NULL,
  "checked_by" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "approved" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "operations_quality_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_delivery_handovers" (
  "id" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "delivery_date" TIMESTAMP(3) NOT NULL,
  "delivered_by" TEXT NOT NULL,
  "received_by" TEXT,
  "status" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "operations_delivery_handovers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_actions" (
  "id" TEXT NOT NULL,
  "action_code" TEXT NOT NULL,
  "project_code" TEXT,
  "action" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "due_date" TIMESTAMP(3),
  "status" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "operations_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "package_addons" (
  "id" TEXT NOT NULL,
  "package_code" TEXT,
  "addon_name" TEXT NOT NULL,
  "starting_price" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "high_price" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "requires_approval" TEXT NOT NULL,
  "notes" TEXT,
  CONSTRAINT "package_addons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "package_payment_terms" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "terms" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "package_payment_terms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "package_discount_rules" (
  "id" TEXT NOT NULL,
  "discount_range" TEXT NOT NULL,
  "approval_required" TEXT NOT NULL,
  "rule" TEXT NOT NULL,
  CONSTRAINT "package_discount_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "price_change_logs" (
  "id" TEXT NOT NULL,
  "package_code" TEXT NOT NULL,
  "old_price" DECIMAL(14,2),
  "new_price" DECIMAL(14,2),
  "changed_by" TEXT,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  CONSTRAINT "price_change_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "finance_incomes_income_code_key" ON "finance_incomes"("income_code");
CREATE UNIQUE INDEX "finance_receipts_receipt_no_key" ON "finance_receipts"("receipt_no");
CREATE UNIQUE INDEX "finance_petty_cash_entries_petty_cash_code_key" ON "finance_petty_cash_entries"("petty_cash_code");
CREATE UNIQUE INDEX "finance_supplier_payments_supplier_payment_code_key" ON "finance_supplier_payments"("supplier_payment_code");
CREATE UNIQUE INDEX "finance_monthly_reports_report_code_key" ON "finance_monthly_reports"("report_code");
CREATE UNIQUE INDEX "finance_actions_action_code_key" ON "finance_actions"("action_code");
CREATE UNIQUE INDEX "hr_fingerprint_registrations_fingerprint_code_key" ON "hr_fingerprint_registrations"("fingerprint_code");
CREATE UNIQUE INDEX "hr_lateness_records_lateness_code_key" ON "hr_lateness_records"("lateness_code");
CREATE UNIQUE INDEX "hr_absence_records_absence_code_key" ON "hr_absence_records"("absence_code");
CREATE UNIQUE INDEX "hr_overtime_records_overtime_code_key" ON "hr_overtime_records"("overtime_code");
CREATE UNIQUE INDEX "hr_actions_action_code_key" ON "hr_actions"("action_code");
CREATE UNIQUE INDEX "operations_project_kickoffs_kickoff_code_key" ON "operations_project_kickoffs"("kickoff_code");
CREATE UNIQUE INDEX "operations_work_orders_work_order_no_key" ON "operations_work_orders"("work_order_no");
CREATE UNIQUE INDEX "operations_actions_action_code_key" ON "operations_actions"("action_code");

CREATE INDEX "finance_incomes_date_idx" ON "finance_incomes"("date");
CREATE INDEX "finance_expenses_date_category_idx" ON "finance_expenses"("date", "category");
CREATE INDEX "hr_employee_file_checklists_employee_code_idx" ON "hr_employee_file_checklists"("employee_code");
CREATE INDEX "hr_lateness_records_employee_code_date_idx" ON "hr_lateness_records"("employee_code", "date");
CREATE INDEX "hr_absence_records_employee_code_date_idx" ON "hr_absence_records"("employee_code", "date");
CREATE INDEX "operations_work_orders_project_code_idx" ON "operations_work_orders"("project_code");
CREATE INDEX "operations_quality_checks_project_code_idx" ON "operations_quality_checks"("project_code");
CREATE INDEX "operations_delivery_handovers_project_code_idx" ON "operations_delivery_handovers"("project_code");
CREATE INDEX "package_addons_package_code_idx" ON "package_addons"("package_code");
CREATE INDEX "price_change_logs_package_code_idx" ON "price_change_logs"("package_code");
