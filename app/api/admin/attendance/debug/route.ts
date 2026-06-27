import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const forbidden = requireAdminApi(request);
  if (forbidden) return forbidden;

  try {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT
          id,
          serial_number AS "serialNumber",
          method,
          path,
          query_params AS "queryParams",
          headers,
          raw_body AS "rawBody",
          response_body AS "responseBody",
          remote_address AS "remoteAddress",
          created_at AS "createdAt"
        FROM zkteco_debug_logs
        ORDER BY created_at DESC
        LIMIT 200
      `
    );

    return NextResponse.json({ success: true, logs: rows });
  } catch {
    return NextResponse.json({
      success: true,
      databaseAvailable: false,
      message: "Database is not reachable or debug logs table has not been migrated.",
      logs: []
    });
  }
}
