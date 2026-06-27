import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function pushFilter(filters: string[], values: unknown[], sql: string, value: unknown) {
  values.push(value);
  filters.push(sql.replace("?", `$${values.length}`));
}

export async function GET(request: Request) {
  const forbidden = requireAdminApi(request);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const startDate = searchParams.get("startDate")?.trim();
  const endDate = searchParams.get("endDate")?.trim();
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200);
  const offset = (page - 1) * limit;
  const filters: string[] = [];
  const values: unknown[] = [];

  if (search) {
    values.push(`%${search}%`);
    const index = `$${values.length}`;
    filters.push(`(COALESCE(e.name, l.employee_name, '') ILIKE ${index} OR l.zkteco_user_id ILIKE ${index})`);
  }
  if (startDate) pushFilter(filters, values, "l.attendance_timestamp >= ?::timestamp", `${startDate}T00:00:00.000Z`);
  if (endDate) pushFilter(filters, values, "l.attendance_timestamp <= ?::timestamp", `${endDate}T23:59:59.999Z`);

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const rows = await prisma.$queryRawUnsafe(
      `
        SELECT
          l.id,
          l.zkteco_user_id AS "employeeCode",
          COALESCE(e.name, l.employee_name, CONCAT('User ', l.zkteco_user_id)) AS "employeeName",
          CASE WHEN COALESCE(l.punch_type, '') IN ('0', 'in', 'IN', 'checkin', 'check_in') THEN l.attendance_timestamp ELSE NULL END AS "checkInTime",
          CASE WHEN COALESCE(l.punch_type, '') IN ('1', 'out', 'OUT', 'checkout', 'check_out') THEN l.attendance_timestamp ELSE NULL END AS "checkOutTime",
          l.attendance_timestamp::date AS "attendanceDate",
          l.attendance_timestamp AS "rawTimestamp",
          CASE
            WHEN (l.attendance_timestamp::time > TIME '09:15:00') THEN 'LATE'
            ELSE 'PRESENT'
          END AS "status",
          'ZKTECO_ADMS' AS "source",
          d.name AS "deviceName",
          COALESCE(d.serial_number, d.ip_address) AS "deviceSerialNumber",
          d.location AS "deviceLocation",
          l.created_at AS "createdAt"
        FROM zkteco_attendance_logs l
        JOIN zkteco_devices d ON d.id = l.device_id
        LEFT JOIN zkteco_employees e ON e.device_id = d.id AND e.user_id = l.zkteco_user_id
        ${where}
        ORDER BY l.attendance_timestamp DESC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `,
      ...values,
      limit,
      offset
    );

    const countRows = await prisma.$queryRawUnsafe(
      `
        SELECT COUNT(*)::int AS count
        FROM zkteco_attendance_logs l
        JOIN zkteco_devices d ON d.id = l.device_id
        LEFT JOIN zkteco_employees e ON e.device_id = d.id AND e.user_id = l.zkteco_user_id
        ${where}
      `,
      ...values
    );

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: (countRows as any[])[0]?.count || 0,
      logs: rows
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      databaseAvailable: false,
      message: "Database is not reachable. Connect PostgreSQL or set DATABASE_URL to the production database.",
      page,
      limit,
      total: 0,
      logs: []
    });
  }
}
