import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessModule, roleFromRequest } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!canAccessModule(roleFromRequest(request), "management")) {
    return NextResponse.json({ success: false, message: "You do not have permission to view audit logs." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  const recordId = searchParams.get("recordId");

  try {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT id, actor_name, action, module_id, section_id, record_id, entity_table, before_data, after_data, ip_address, created_at
        FROM audit_logs
        WHERE ($1::text IS NULL OR module_id = $1)
          AND ($2::text IS NULL OR record_id = $2)
        ORDER BY created_at DESC
        LIMIT 500
      `,
      moduleId,
      recordId
    );

    return NextResponse.json({ success: true, auditLogs: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load audit logs";
    return NextResponse.json({ success: false, databaseBacked: false, message, auditLogs: [] });
  }
}
