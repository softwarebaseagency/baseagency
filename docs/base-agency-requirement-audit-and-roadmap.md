# Base Agency Company Operating System Requirement Audit

## Requirement Audit Summary

Source reviewed in this implementation pass:

- Master Codex prompt from the pasted attachment.
- Existing extracted Base Agency source files under `docs/source-extracts`.
- Current Next.js, Prisma, module registry, RBAC, workflow, and audit-log implementation.

Current system coverage:

- Core module framework exists for CEO dashboard, management, sales/CRM, client outreach, finance, HR, operations, service packages, approvals, document control, reports, settings, ZKTeco attendance, audit logs, attachments, notifications, reminders, and document sequences.
- Database-backed generic CRUD exists for many register/report/workflow sections through `app/api/document-modules/[moduleId]/[sectionId]/route.ts`.
- Role checks exist through `lib/rbac.ts`, with restricted finance/HR/CEO sections.
- Automatic BA reference numbers exist through `lib/document-sequences.ts`.
- Audit logging exists for create, update, archive, and workflow actions when the database is available.

Main gaps found:

- Commercial documents were spread across Sales, Finance, and Operations but did not have a single workflow control module.
- The required chain `Client -> Quotation -> Project -> Delivery Note -> Invoice -> Payment -> Receipt -> Archive` was not visible as one controlled operating workflow.
- Supplier chain `Purchase Order -> Supplier -> Supplier Invoice / Expense -> Payment -> Archive` needed a dedicated register set.
- Approved/final commercial document versioning needed backend enforcement.
- Full secure login/session enforcement is still pending; current local UI defaults to `Admin / System Owner`.
- PDF export currently uses browser print; true templated PDF generation remains Phase 2.

## System Structure Plan

Primary navigation modules:

- CEO Dashboard
- Management
- Sales / CRM
- Client List & Outreach
- Finance
- Commercial Documents
- HR & Attendance
- Operations & Projects
- Service Packages
- Reports & KPIs
- Approvals & Decisions
- Document Control
- Settings
- System Requirements / Developer Reference

Commercial Documents is now the control center for quotations, purchase orders, supplier invoices, delivery notes, invoices, payments, receipts, suppliers, and final archive.

## 15 Module Mapping

- Management Dashboard: `/ceo-dashboard`
- Management Reports & Executive Dashboard: `/reports` and `/ceo-dashboard`
- HR & Employee Management: `/hr`
- Employee Contracts & HR Documents: `/hr` file, agreement, job description, disciplinary, exit, clearance tabs
- Attendance, Leave & Probation Tracking: `/hr` attendance, leave, probation tabs plus `/zkteco-attendance`
- Finance & Accounting: `/finance`
- Sales / CRM: `/sales`
- Client Database & Outreach: `/client-outreach`
- Service Packages & Pricing: `/service-packages`
- Commercial Documents: `/commercial-documents`
- Operations & Project Management: `/operations`
- KPI & Performance Management: `/reports`, `/ceo-dashboard`, management action/KPI sections
- Document Archive & Master Index: `/document-control` and `/commercial-documents` archive
- Company Operating Manual / Policies: `/management`
- System Requirements, Roles & Permissions: `/system-requirements` and `/settings`

## Database Schema / ERD Plan

Core tables already present:

- Users, roles, permissions
- CRM clients, contacts, leads, deals, contact logs, meetings, proposals, quotations, closed/lost deals
- Finance invoices, expenses, income, receipts, payment requests, petty cash, salary, supplier payments
- HR employees, attendance, leave, employee files, contracts, job descriptions, probation, training, disciplinary, assets, IT access, exit, clearance
- Operations projects, tasks, kickoffs, work orders, timelines, issues, quality checks, client approvals, delivery handovers, closures, workloads
- Attachments, audit logs, notifications, reminders, system settings, document sequences

Added in this pass:

- `commercial_documents`
- `commercial_payments`
- `commercial_receipts`
- `commercial_suppliers`
- `commercial_archives`

Commercial relationship plan:

- `commercial_documents.related_document_no` links quotation, PO, supplier invoice, delivery note, and invoice records.
- `commercial_payments.related_document_no` links a payment to invoice, PO, or supplier invoice.
- `commercial_receipts.related_document_no` links the receipt to the paid invoice/payment.
- `commercial_archives` stores final chain references and storage location.

## User Roles And Permissions Plan

Roles required:

- CEO / Founder
- COO / Operations Leadership
- Management
- Sales / Client Relations
- Finance
- HR / Office Admin
- Operations Manager
- Project Manager
- Admin / System Owner
- Employee / limited user

Sensitive controls:

- Salary: CEO, Finance, authorized HR/Admin only.
- HR disciplinary, exit, clearance: CEO, authorized HR/Admin only.
- CEO approval queue: CEO/Admin only.
- Commercial documents: CEO, COO, Management, Sales, Finance, Operations, Project roles, and Admin.
- Backend route checks must remain mandatory; frontend menu hiding is not enough.

## Workflow Map

Client chain:

1. Outreach target or CRM lead is created.
2. Proposal/quotation is prepared.
3. Quotation must be approved before sending.
4. Approved/won deal creates operations project and finance invoice request.
5. Delivery note must be signed or confirmed before delivery closure.
6. Invoice remains unpaid or partial until payment is recorded.
7. Receipt is issued after payment.
8. Final chain is archived and locked.

Supplier chain:

1. Supplier is registered.
2. Purchase order is prepared and approved.
3. Supplier invoice or expense is matched to PO/project.
4. Supplier payment is recorded.
5. Final supplier chain is archived.

Versioning rule:

- Approved, locked, archived, or final commercial records are preserved.
- Editing these records creates a new version and keeps the old record for audit.

## UI Navigation Map

Each operating module follows the same daily-work pattern:

- Dashboard or overview tab
- Register tabs for operational records
- Reference/rules tabs for policy
- Report tabs where applicable
- Search, status filter, add/edit/detail, CSV export, print/PDF through browser print
- Audit timeline note on detail records

## Screen List

Required screen coverage:

- Executive dashboard: `/ceo-dashboard`
- Employee profile/register: `/hr`
- Client profile/lead/outreach: `/sales`, `/client-outreach`
- Quotation screen: `/commercial-documents` quotation register and `/sales` quotation tracker
- Invoice screen: `/commercial-documents` invoice register and `/finance` invoice register
- Project screen: `/operations`
- Reports screen: `/reports`
- User management/settings: `/settings`
- Role and permission settings: `/settings` and RBAC backend
- Document archive: `/document-control` and `/commercial-documents` archive
- System settings: `/settings`

## Testing Plan

Required acceptance tests:

- Create employee and complete HR file checklist.
- Create attendance and leave approval.
- Create client/outreach record and convert to CRM lead.
- Create quotation, approve it, and create project/invoice workflow records.
- Create invoice, partial payment, full payment, and receipt.
- Create project with task, issue/delay, delivery note, and closure.
- Create purchase order, supplier, supplier invoice, and payment.
- Create expenses and monthly profit report.
- Create KPI snapshot and management report.
- Test role access using CEO, COO, HR, Finance, Sales, Operations/Project, and Employee-style roles.
- Verify approved commercial document edit creates a new version.

Bug severity:

- Critical: blocks system use or exposes sensitive data.
- High: important workflow/permission broken.
- Medium: wrong calculation or workflow issue.
- Low: UI text, spacing, or minor display issue.

## Development Roadmap

Phase 1 Core System:

- Complete HR, Finance, Sales/CRM, Operations, Commercial Documents, Dashboard, Document Archive, Roles and Permissions.
- Connect commercial workflow spine and versioning controls.
- Seed sample data for UAT.

Phase 2 Control & Governance:

- Improve PDF templates for quotation, PO, delivery note, invoice, receipt.
- Add approval-specific actions and email/notification reminders.
- Add stronger session/login provider.
- Add real file upload/storage controls.
- Add advanced reports and CEO/COO sign-off workflows.

Phase 3 Advanced Corporate System:

- Risk, training, quality, client experience, AI automation, branch management, mobile access, and international expansion.

