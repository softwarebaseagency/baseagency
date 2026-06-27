import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  moduleId?: string;
  sectionId?: string;
  recordId?: string;
  entityTable?: string;
  beforeData?: unknown;
  afterData?: unknown;
  actorName?: string;
  ipAddress?: string;
};

export async function writeAuditLog(input: AuditInput) {
  try {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO audit_logs
          (id, actor_name, action, module_id, section_id, record_id, entity_table, before_data, after_data, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10)
      `,
      randomUUID(),
      input.actorName || "System",
      input.action,
      input.moduleId || null,
      input.sectionId || null,
      input.recordId || null,
      input.entityTable || null,
      input.beforeData === undefined ? null : JSON.stringify(input.beforeData),
      input.afterData === undefined ? null : JSON.stringify(input.afterData),
      input.ipAddress || null
    );
  } catch {
    // Audit logging must never block the user's main action.
  }
}
