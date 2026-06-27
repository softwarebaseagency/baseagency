// Loaded with require so this file can typecheck before Prisma Client is generated.
const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("node:crypto");

const prisma = new PrismaClient();

const sections = [
  "Website Development",
  "Social Media Management",
  "Graphic Design",
  "Advertising Campaigns",
  "Software/System Development",
  "Other Services"
];

const roles = [
  ["CEO / Founder", "Full company access across dashboards, finance, HR, approvals, reports, and settings."],
  ["COO / Operations Leadership", "Operations, management dashboard, reports, projects, and department coordination."],
  ["Management", "Management dashboard, reports, approvals, and cross-department review."],
  ["Sales / Client Relations", "Sales CRM, outreach, follow-ups, meetings, proposals, quotations, and packages."],
  ["Finance", "Finance, invoices, receipts, expenses, payment requests, salary review, and finance reports."],
  ["HR / Office Admin", "Employees, attendance, leave, HR files, evaluations, warnings, and HR reports."],
  ["Operations Manager", "Projects, tasks, work orders, issues, quality checks, delivery, and handover."],
  ["Project Manager", "Assigned projects, tasks, timelines, team workload, and project reports."],
  ["Employee / Team Member", "Assigned tasks and allowed personal HR records."],
  ["Admin / System Owner", "System settings, users, roles, permissions, data backup, and integrations."]
];

const modules = [
  "ceo-dashboard",
  "management",
  "sales",
  "client-outreach",
  "finance",
  "hr",
  "operations",
  "service-packages",
  "reports",
  "approvals",
  "document-control",
  "settings"
];

const restrictedMatrix: Record<string, string> = {
  "CEO / Founder": "full",
  "Admin / System Owner": "full",
  "COO / Operations Leadership": "management",
  Management: "management",
  "Sales / Client Relations": "sales",
  Finance: "finance",
  "HR / Office Admin": "hr",
  "Operations Manager": "operations",
  "Project Manager": "operations",
  "Employee / Team Member": "employee"
};

const optionSettings = {
  globalPriorities: ["High", "Medium", "Low"],
  managementStatus: ["Green", "Yellow", "Red"],
  globalStatuses: ["Open", "In Progress", "Completed", "Closed", "Delayed"],
  salesStatuses: ["New Lead", "Contacted", "Interested", "Meeting Scheduled", "Meeting Completed", "Proposal Required", "Proposal Sent", "Quotation Sent", "Waiting Client", "Negotiation", "Approved", "Invoice Required", "Project Started", "Closed Won", "Closed Lost", "Follow-Up Later", "Not Qualified"],
  financePaymentMethods: ["Cash", "Bank Transfer", "Card Payment", "Online Payment", "Cheque", "Other"],
  financeInvoiceStatuses: ["Unpaid", "Partially Paid", "Paid", "Overdue", "Cancelled"],
  hrEmployeeStatuses: ["Active", "On Probation", "Confirmed", "On Leave", "Suspended", "Resigned", "Terminated", "Archived"],
  hrAttendanceStatuses: ["Present", "Late", "Absent", "Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Official Assignment", "Remote Work Approved", "Public Holiday", "Off Day"],
  operationsProjectStatuses: ["Not Started", "In Progress", "Waiting Client", "Waiting Internal Approval", "Delayed", "Quality Check", "Ready for Delivery", "Delivered", "Completed", "Closed", "Cancelled"],
  operationsTaskStatuses: ["Open", "In Progress", "Waiting Client", "Waiting Approval", "Completed", "Delayed", "Cancelled", "Closed"]
};

const sequencePrefixes = [
  "LEAD", "DEAL", "CLOG", "MTG", "PRO", "QTN", "CLIENT", "INC", "EXPEN", "INV", "RCT", "FIN-PRF", "PC", "SUP-PAY",
  "EMP", "HR-AGR", "HR-JD", "HR-FP", "HR-LATE", "HR-ABS", "HR-LEAVE", "HR-OT", "HR-PROB", "HR-EVAL", "HR-TRN",
  "PRJ", "OPS-KO", "TASK", "WO", "TL", "ISS", "QC", "MGMT-ACT", "APR", "DEC", "DOC", "REV", "OUT-RPT",
  "SALES-ACT", "PKG-CAT", "PKG-APR", "OUT-CAT", "PL", "CF"
];

function accessFor(role: string, module: string) {
  const mode = restrictedMatrix[role];
  if (mode === "full") return ["view", "create", "edit", "delete", "approve", "export"];
  if (mode === "management") return ["view", "edit", "approve", "export"];
  if (mode === "sales") return ["sales", "client-outreach", "service-packages", "reports"].includes(module) ? ["view", "create", "edit", "export"] : ["view"];
  if (mode === "finance") return ["finance", "reports", "approvals"].includes(module) ? ["view", "create", "edit", "approve", "export"] : ["view"];
  if (mode === "hr") return ["hr", "reports", "approvals"].includes(module) ? ["view", "create", "edit", "approve", "export"] : ["view"];
  if (mode === "operations") return ["operations", "reports", "approvals"].includes(module) ? ["view", "create", "edit", "export"] : ["view"];
  return ["view"];
}

async function main() {
  for (const [index, name] of sections.entries()) {
    await prisma.salesSection.upsert({
      where: { name },
      update: { sortOrder: index + 1, isActive: true },
      create: { name, sortOrder: index + 1 }
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@base-agency.local" },
    update: {},
    create: {
      name: "Base Agency Admin",
      email: "admin@base-agency.local",
      role: "admin"
    }
  });

  for (const [name, description] of roles) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO roles (id, name, description, is_system, updated_at)
        VALUES ($1, $2, $3, true, now())
        ON CONFLICT (name)
        DO UPDATE SET description = EXCLUDED.description, updated_at = now()
      `,
      randomUUID(),
      name,
      description
    );
  }

  for (const [role] of roles) {
    for (const module of modules) {
      for (const action of accessFor(role, module)) {
        await prisma.permission.upsert({
          where: { role_module_action: { role, module, action } },
          update: { description: `${role} can ${action} ${module}` },
          create: { role, module, action, description: `${role} can ${action} ${module}` }
        });
      }
    }
  }

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO system_settings (id, key, value, module, description, updated_by, updated_at)
      VALUES ($1, 'base_agency_official_options', $2::jsonb, 'settings', 'Official Base Agency ERP dropdown/status options from source documents.', 'seed', now())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'seed'
    `,
    randomUUID(),
    JSON.stringify(optionSettings)
  );

  const year = new Date().getFullYear();
  for (const prefix of sequencePrefixes) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO document_sequences (id, prefix, year, next_value, updated_at)
        VALUES ($1, $2, $3, 1, now())
        ON CONFLICT (prefix, year) DO NOTHING
      `,
      randomUUID(),
      prefix,
      year
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
