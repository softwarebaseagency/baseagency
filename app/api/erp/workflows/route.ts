import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextDocumentCode } from "@/lib/document-sequences";
import { writeAuditLog } from "@/lib/erp-audit";
import { canAccessModule, roleFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

type WorkflowBody = {
  action?: string;
  moduleId?: string;
  sectionId?: string;
  recordId?: string;
  values?: Record<string, string>;
};

function value(values: Record<string, string>, keys: string[], fallback = "") {
  for (const key of keys) {
    const candidate = values[key];
    if (candidate) return candidate;
  }
  return fallback;
}

function money(input: string | undefined) {
  return Number(input || 0);
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function createNotification(title: string, message: string, moduleId: string, recordId?: string, userRole = "Management") {
  try {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO notifications (id, title, message, module_id, record_id, user_role)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      randomUUID(),
      title,
      message,
      moduleId,
      recordId || null,
      userRole
    );
  } catch {
    // Notification failure should not block workflow completion.
  }
}

async function convertOutreachToLead(body: WorkflowBody) {
  const values = body.values || {};
  const leadCode = await nextDocumentCode("LEAD");
  const clientName = value(values, ["Company / Client Name", "Client Name"], "Unnamed Client");

  const inserted = await prisma.$queryRawUnsafe(
    `
      INSERT INTO crm_leads
        (id, lead_code, date_added, client_name, contact_person, phone, instagram_website, location, lead_source, industry, service_required, estimated_value, priority, status, next_follow_up, responsible_person, notes, created_by, updated_at)
      VALUES
        ($1, $2, now(), $3, $4, $5, $6, $7, 'Client Outreach', $8, $9, 0, $10, 'Interested', $11, $12, $13, 'Client Outreach', now())
      ON CONFLICT (lead_code) DO NOTHING
      RETURNING id, lead_code
    `,
    randomUUID(),
    leadCode,
    clientName,
    value(values, ["Contact Person"]),
    value(values, ["Phone"]),
    value(values, ["Instagram / Website"]),
    value(values, ["Location"], "Erbil"),
    value(values, ["Industry"]),
    value(values, ["Service Opportunity", "Service / Package", "Service Required"], "Service opportunity"),
    value(values, ["Priority"], "Medium"),
    values["Next Follow-Up"] ? new Date(values["Next Follow-Up"]) : futureDate(2),
    value(values, ["Responsible Person"], "Sales / Client Relations"),
    value(values, ["Notes", "Discussion Summary"])
  );

  const row = (inserted as any[])[0];
  await writeAuditLog({
    action: "workflow:outreach-to-lead",
    moduleId: body.moduleId,
    sectionId: body.sectionId,
    recordId: body.recordId,
    entityTable: "crm_leads",
    afterData: { leadCode, sourceRecordId: body.recordId, clientName }
  });
  await createNotification("New CRM lead from outreach", `${clientName} was converted to ${leadCode}.`, "sales", row?.id, "Sales / Client Relations");

  return { leadCode, recordId: row?.id };
}

async function createFinanceInvoice(body: WorkflowBody) {
  const values = body.values || {};
  const invoiceNo = await nextDocumentCode("INV");
  const clientName = value(values, ["Client Name", "Client"]);
  const projectService = value(values, ["Project / Service", "Service / Item", "Service / Package"], "Approved service");
  const amount = money(value(values, ["Proposal Value", "Amount", "Final Value", "Estimated Value", "Deal Value"], "0"));

  const inserted = await prisma.$queryRawUnsafe(
    `
      INSERT INTO finance_invoices
        (id, invoice_no, client_name, project_service, amount, paid_amount, remaining_amount, status, due_date, payment_method, source_deal_code, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, 0, $5, 'Unpaid', $6, 'Cash', $7, now())
      RETURNING id, invoice_no
    `,
    randomUUID(),
    invoiceNo,
    clientName || "Approved Client",
    projectService,
    amount,
    futureDate(7),
    value(values, ["Deal Code", "Lead Code"])
  );

  const row = (inserted as any[])[0];
  await writeAuditLog({
    action: "workflow:sales-to-finance-invoice",
    moduleId: body.moduleId,
    sectionId: body.sectionId,
    recordId: body.recordId,
    entityTable: "finance_invoices",
    afterData: { invoiceNo, sourceRecordId: body.recordId, clientName, amount }
  });
  await createNotification("Invoice request created", `${invoiceNo} was created for ${clientName || "approved client"}.`, "finance", row?.id, "Finance");

  return { invoiceNo, recordId: row?.id };
}

async function createOperationsProject(body: WorkflowBody) {
  const values = body.values || {};
  const projectCode = await nextDocumentCode("PRJ");
  const handoverCode = await nextDocumentCode("HND");
  const kickoffCode = await nextDocumentCode("OPS-KO");
  const clientName = value(values, ["Client Name", "Client"]);
  const projectService = value(values, ["Service / Project", "Project / Service", "Service / Package"], "Closed won project");
  const approvedValue = money(value(values, ["Final Value", "Approved Value", "Deal Value", "Amount"], "0"));

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO crm_sales_handovers
        (id, handover_code, client_name, project_service, approved_value, payment_status, handover_date, approved_scope, client_requirements, operations_responsible_person, sales_responsible_person, date, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, now(), $7, $8, $9, $10, now(), now())
    `,
    randomUUID(),
    handoverCode,
    clientName || "Closed Won Client",
    projectService,
    approvedValue,
    value(values, ["Payment Status"], "Pending"),
    value(values, ["Approved Scope", "Scope of Work"], projectService),
    value(values, ["Notes", "Client Requirements"]),
    value(values, ["Operations Responsible Person"], "Operations Manager"),
    value(values, ["Responsible Person", "Sales Responsible Person"], "Sales / Client Relations")
  );

  const inserted = await prisma.$queryRawUnsafe(
    `
      INSERT INTO operations_projects
        (id, project_code, client_name, project_service, status, priority, project_manager, responsible_division, deadline, approved_value, payment_status, progress, source_deal_code, updated_at)
      VALUES
        ($1, $2, $3, $4, 'Not Started', $5, $6, $7, $8, $9, $10, 0, $11, now())
      RETURNING id, project_code
    `,
    randomUUID(),
    projectCode,
    clientName || "Closed Won Client",
    projectService,
    value(values, ["Priority"], "Medium"),
    value(values, ["Operations Responsible Person", "Project Manager"], "Operations Manager"),
    value(values, ["Responsible Division"], "Operations"),
    futureDate(14),
    approvedValue,
    value(values, ["Payment Status"], "Pending"),
    value(values, ["Deal Code", "Lead Code"])
  );

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO operations_project_kickoffs
        (id, kickoff_code, project_code, kickoff_date, scope_confirmed, payment_status, project_manager, notes)
      VALUES
        ($1, $2, $3, now(), 'No', $4, $5, $6)
    `,
    randomUUID(),
    kickoffCode,
    projectCode,
    value(values, ["Payment Status"], "Pending"),
    value(values, ["Operations Responsible Person", "Project Manager"], "Operations Manager"),
    `Created from ${handoverCode}`
  );

  const row = (inserted as any[])[0];
  await writeAuditLog({
    action: "workflow:sales-to-operations-project",
    moduleId: body.moduleId,
    sectionId: body.sectionId,
    recordId: body.recordId,
    entityTable: "operations_projects",
    afterData: { projectCode, handoverCode, kickoffCode, sourceRecordId: body.recordId, clientName }
  });
  await createNotification("Operations project created", `${projectCode} was created from a closed deal.`, "operations", row?.id, "Operations Manager");

  return { projectCode, handoverCode, kickoffCode, recordId: row?.id };
}

export async function POST(request: Request) {
  let body: WorkflowBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (!canAccessModule(roleFromRequest(request), body.moduleId || "", body.sectionId)) {
    return NextResponse.json({ success: false, message: "You do not have permission to run this workflow." }, { status: 403 });
  }

  try {
    if (body.action === "outreach-to-lead") {
      return NextResponse.json({ success: true, result: await convertOutreachToLead(body) });
    }
    if (body.action === "sales-to-finance-invoice") {
      return NextResponse.json({ success: true, result: await createFinanceInvoice(body) });
    }
    if (body.action === "sales-to-operations-project") {
      return NextResponse.json({ success: true, result: await createOperationsProject(body) });
    }

    return NextResponse.json({ success: false, message: "Unsupported workflow action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
