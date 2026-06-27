# Word Document To System Module Mapping

Each uploaded Word document maps to one main module route, and each document section maps to a child tab.

## Main Navigation

- `/ceo-dashboard` - CEO Dashboard
- `/management` - Management
- `/sales` - Sales / CRM
- `/client-outreach` - Client List & Outreach
- `/finance` - Finance
- `/commercial-documents` - Commercial Documents
- `/hr` - HR & Attendance
- `/operations` - Operations & Projects
- `/service-packages` - Service Packages
- `/reports` - Reports & KPIs
- `/approvals-decisions` - Approvals & Decisions
- `/document-control` - Document Control
- `/settings` - Settings
- `/system-requirements` - System Requirements / Developer Reference

## Section Conversion

Register sections render as CRUD-style screens with:

- Add record form
- Edit record action
- Delete record action
- Auto document code where required
- Search
- Data table
- Status/priority badges
- Export CSV
- Print/PDF through browser print
- Database-backed API persistence when PostgreSQL migrations are applied
- Local fallback only when the database is unavailable during development

Dashboard sections render KPI cards and section counts.

Rules/options sections render read-only reference panels and seeded dropdown/reference values.

Report sections render report-ready structures with print/export controls.

## CRUD API

```text
GET    /api/document-modules/:moduleId/:sectionId
POST   /api/document-modules/:moduleId/:sectionId
PUT    /api/document-modules/:moduleId/:sectionId
DELETE /api/document-modules/:moduleId/:sectionId?id=...
```

The API uses explicit section-to-table mappings in `lib/document-module-db.ts`, so records are saved into named tables such as:

- `crm_leads`
- `crm_deals`
- `crm_contact_logs`
- `finance_invoices`
- `finance_expenses`
- `commercial_documents`
- `commercial_payments`
- `commercial_receipts`
- `commercial_suppliers`
- `commercial_archives`
- `hr_employees`
- `hr_attendance_records`
- `operations_projects`
- `operations_tasks`
- `service_packages`
- `executive_kpi_snapshots`
- `management_weekly_meetings`
- `management_action_items`
- `outreach_target_clients`
- `outreach_contact_attempts`
- `outreach_followups`
- `approval_register`
- `decision_register`
- `controlled_documents`
- `document_revision_logs`
- `roles`
- `attachments`
- `audit_logs`
- `notifications`
- `reminders`
- `system_settings`
- `package_categories`
- `package_approvals`
- `kpi_targets`
- `sales_actions`
- `annual_leave_balances`
- `profit_loss_summaries`
- `cash_flow_summaries`
- `division_workloads`

## Database

Named migrations exist for the document modules:

- `20260624150000_sales_tracker_crm`
- `20260624162000_business_control_system`
- `20260624172000_document_section_registers`
- `20260624205000_company_operating_system_modules`
- `20260624214000_shared_operating_system_controls`
- `20260625110000_commercial_document_workflow`

Run:

```powershell
npm run prisma:migrate
npm run prisma:generate
npm run db:seed
```

## Shared APIs

```text
GET  /api/erp/dashboard
POST /api/erp/workflows
GET  /api/erp/attachments
POST /api/erp/attachments
GET  /api/erp/audit-logs
```

Workflow actions:

- `outreach-to-lead`
- `sales-to-finance-invoice`
- `sales-to-operations-project`

Commercial document controls:

- Client workflow: Client -> Quotation -> Project -> Delivery Note -> Invoice -> Payment -> Receipt -> Archive
- Supplier workflow: Purchase Order -> Supplier -> Supplier Invoice / Expense -> Payment -> Archive
- Commercial documents use unique BA reference numbers, status, approval status, owner, attachments, version, lock flag, archive status, and audit log.
- Approved, locked, or final archived commercial documents are not overwritten by direct edits. The API creates a new versioned record and preserves the original.

The document-module API also writes audit events for create, update, and archive actions when the database is available.

## Access Control

The API supports role checks through the `x-base-role` request header. The current local UI defaults to `Admin / System Owner` until a login/session provider is connected.

## Seed Data

Document options and section definitions are seeded in code:

- `lib/document-modules.ts`
- `lib/document-module-db.ts`
- `lib/sales-tracker.ts`
- `lib/business-control.ts`

These files contain CRM statuses, lead sources, service categories, Finance categories, HR statuses, Operations statuses, package rules, payment terms, discount rules, section definitions, and database table mappings.
