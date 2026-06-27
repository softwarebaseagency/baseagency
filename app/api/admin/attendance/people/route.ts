import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const forbidden = requireAdminApi(request);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const values: unknown[] = [];
  const filters: string[] = ["e.is_active = true"];

  if (search) {
    values.push(`%${search}%`);
    const index = `$${values.length}`;
    filters.push(`(e.user_id ILIKE ${index} OR COALESCE(e.name, '') ILIKE ${index})`);
  }

  try {
    const people = await prisma.$queryRawUnsafe(
      `
        SELECT
          e.id,
          e.user_id AS "userId",
          COALESCE(e.name, CONCAT('User ', e.user_id)) AS name,
          e.department,
          e.position,
          e.updated_at AS "updatedAt",
          d.name AS "deviceName",
          d.serial_number AS "serialNumber",
          latest.attendance_timestamp AS "lastPunchAt",
          COALESCE(stats.punch_count, 0)::int AS "punchCount"
        FROM zkteco_employees e
        LEFT JOIN zkteco_devices d ON d.id = e.device_id
        LEFT JOIN LATERAL (
          SELECT l.attendance_timestamp
          FROM zkteco_attendance_logs l
          WHERE l.device_id = e.device_id AND l.zkteco_user_id = e.user_id
          ORDER BY l.attendance_timestamp DESC
          LIMIT 1
        ) latest ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS punch_count
          FROM zkteco_attendance_logs l
          WHERE l.device_id = e.device_id AND l.zkteco_user_id = e.user_id
        ) stats ON true
        WHERE ${filters.join(" AND ")}
        ORDER BY latest.attendance_timestamp DESC NULLS LAST, e.updated_at DESC
        LIMIT 200
      `,
      ...values
    );

    return NextResponse.json({ success: true, people });
  } catch {
    return NextResponse.json({
      success: true,
      databaseAvailable: false,
      message: "Database is not reachable or people table has not been migrated.",
      people: []
    });
  }
}
