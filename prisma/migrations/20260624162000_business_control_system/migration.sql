CREATE TABLE "departments" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "divisions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
  "id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_sequences" (
  "id" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "next_value" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_invoices" (
  "id" TEXT NOT NULL,
  "invoice_no" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "project_service" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "remaining_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL,
  "due_date" TIMESTAMP(3) NOT NULL,
  "payment_method" TEXT,
  "source_deal_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "finance_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_expenses" (
  "id" TEXT NOT NULL,
  "expense_code" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "date" TIMESTAMP(3) NOT NULL,
  "payment_method" TEXT,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "finance_expenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "finance_payment_requests" (
  "id" TEXT NOT NULL,
  "request_no" TEXT NOT NULL,
  "requester" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL,
  "approved_by" TEXT,
  "paid_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "finance_payment_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_employees" (
  "id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "department" TEXT,
  "employment_type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "annual_leave_entitlement" INTEGER NOT NULL DEFAULT 21,
  "leave_used" INTEGER NOT NULL DEFAULT 0,
  "leave_remaining" INTEGER NOT NULL DEFAULT 21,
  "file_completion" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_attendance_records" (
  "id" TEXT NOT NULL,
  "attendance_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "late_minutes" INTEGER NOT NULL DEFAULT 0,
  "overtime_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "source" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_attendance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hr_leave_requests" (
  "id" TEXT NOT NULL,
  "leave_code" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "leave_type" TEXT NOT NULL,
  "from_date" TIMESTAMP(3) NOT NULL,
  "to_date" TIMESTAMP(3) NOT NULL,
  "days" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "approved_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_projects" (
  "id" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "project_service" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "project_manager" TEXT NOT NULL,
  "responsible_division" TEXT NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "approved_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "payment_status" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "source_deal_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operations_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_tasks" (
  "id" TEXT NOT NULL,
  "task_code" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "deadline" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operations_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "operations_issues" (
  "id" TEXT NOT NULL,
  "issue_code" TEXT NOT NULL,
  "project_code" TEXT NOT NULL,
  "issue_type" TEXT NOT NULL,
  "impact_level" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "due_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "operations_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_packages" (
  "id" TEXT NOT NULL,
  "package_code" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "package_name" TEXT NOT NULL,
  "recommended_for" TEXT,
  "key_includes" TEXT NOT NULL,
  "starting_price" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "high_price" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "billing_type" TEXT NOT NULL,
  "pricing_method" TEXT NOT NULL,
  "requires_quotation" TEXT NOT NULL,
  "requires_site_survey" TEXT NOT NULL,
  "requires_finance_approval" TEXT NOT NULL,
  "requires_operations_review" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");
CREATE UNIQUE INDEX "permissions_role_module_action_key" ON "permissions"("role", "module", "action");
CREATE INDEX "permissions_role_idx" ON "permissions"("role");
CREATE INDEX "permissions_module_idx" ON "permissions"("module");
CREATE UNIQUE INDEX "document_sequences_prefix_year_key" ON "document_sequences"("prefix", "year");

CREATE UNIQUE INDEX "finance_invoices_invoice_no_key" ON "finance_invoices"("invoice_no");
CREATE INDEX "finance_invoices_invoice_no_idx" ON "finance_invoices"("invoice_no");
CREATE INDEX "finance_invoices_status_idx" ON "finance_invoices"("status");
CREATE INDEX "finance_invoices_due_date_idx" ON "finance_invoices"("due_date");
CREATE INDEX "finance_invoices_client_name_idx" ON "finance_invoices"("client_name");

CREATE UNIQUE INDEX "finance_expenses_expense_code_key" ON "finance_expenses"("expense_code");
CREATE INDEX "finance_expenses_expense_code_idx" ON "finance_expenses"("expense_code");
CREATE INDEX "finance_expenses_category_idx" ON "finance_expenses"("category");
CREATE INDEX "finance_expenses_date_idx" ON "finance_expenses"("date");
CREATE INDEX "finance_expenses_status_idx" ON "finance_expenses"("status");

CREATE UNIQUE INDEX "finance_payment_requests_request_no_key" ON "finance_payment_requests"("request_no");
CREATE INDEX "finance_payment_requests_request_no_idx" ON "finance_payment_requests"("request_no");
CREATE INDEX "finance_payment_requests_status_idx" ON "finance_payment_requests"("status");
CREATE INDEX "finance_payment_requests_requester_idx" ON "finance_payment_requests"("requester");

CREATE UNIQUE INDEX "hr_employees_employee_code_key" ON "hr_employees"("employee_code");
CREATE INDEX "hr_employees_employee_code_idx" ON "hr_employees"("employee_code");
CREATE INDEX "hr_employees_status_idx" ON "hr_employees"("status");
CREATE INDEX "hr_employees_department_idx" ON "hr_employees"("department");
CREATE INDEX "hr_employees_start_date_idx" ON "hr_employees"("start_date");

CREATE UNIQUE INDEX "hr_attendance_records_attendance_code_key" ON "hr_attendance_records"("attendance_code");
CREATE INDEX "hr_attendance_records_attendance_code_idx" ON "hr_attendance_records"("attendance_code");
CREATE INDEX "hr_attendance_records_employee_code_idx" ON "hr_attendance_records"("employee_code");
CREATE INDEX "hr_attendance_records_date_idx" ON "hr_attendance_records"("date");
CREATE INDEX "hr_attendance_records_status_idx" ON "hr_attendance_records"("status");

CREATE UNIQUE INDEX "hr_leave_requests_leave_code_key" ON "hr_leave_requests"("leave_code");
CREATE INDEX "hr_leave_requests_leave_code_idx" ON "hr_leave_requests"("leave_code");
CREATE INDEX "hr_leave_requests_employee_code_idx" ON "hr_leave_requests"("employee_code");
CREATE INDEX "hr_leave_requests_status_idx" ON "hr_leave_requests"("status");
CREATE INDEX "hr_leave_requests_from_date_idx" ON "hr_leave_requests"("from_date");

CREATE UNIQUE INDEX "operations_projects_project_code_key" ON "operations_projects"("project_code");
CREATE INDEX "operations_projects_project_code_idx" ON "operations_projects"("project_code");
CREATE INDEX "operations_projects_status_idx" ON "operations_projects"("status");
CREATE INDEX "operations_projects_priority_idx" ON "operations_projects"("priority");
CREATE INDEX "operations_projects_project_manager_idx" ON "operations_projects"("project_manager");
CREATE INDEX "operations_projects_deadline_idx" ON "operations_projects"("deadline");

CREATE UNIQUE INDEX "operations_tasks_task_code_key" ON "operations_tasks"("task_code");
CREATE INDEX "operations_tasks_task_code_idx" ON "operations_tasks"("task_code");
CREATE INDEX "operations_tasks_project_code_idx" ON "operations_tasks"("project_code");
CREATE INDEX "operations_tasks_status_idx" ON "operations_tasks"("status");
CREATE INDEX "operations_tasks_priority_idx" ON "operations_tasks"("priority");
CREATE INDEX "operations_tasks_responsible_person_idx" ON "operations_tasks"("responsible_person");
CREATE INDEX "operations_tasks_deadline_idx" ON "operations_tasks"("deadline");

CREATE UNIQUE INDEX "operations_issues_issue_code_key" ON "operations_issues"("issue_code");
CREATE INDEX "operations_issues_issue_code_idx" ON "operations_issues"("issue_code");
CREATE INDEX "operations_issues_project_code_idx" ON "operations_issues"("project_code");
CREATE INDEX "operations_issues_status_idx" ON "operations_issues"("status");
CREATE INDEX "operations_issues_impact_level_idx" ON "operations_issues"("impact_level");

CREATE UNIQUE INDEX "service_packages_package_code_key" ON "service_packages"("package_code");
CREATE INDEX "service_packages_package_code_idx" ON "service_packages"("package_code");
CREATE INDEX "service_packages_category_idx" ON "service_packages"("category");
CREATE INDEX "service_packages_status_idx" ON "service_packages"("status");
