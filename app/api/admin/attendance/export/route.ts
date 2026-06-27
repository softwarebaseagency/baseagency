import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function pushFilter(filters: string[], values: unknown[], sql: string, value: unknown) {
  values.push(value);
  filters.push(sql.replace("?", `$${values.length}`));
}

export async function POST(request: Request) {
  const forbidden = requireAdminApi(request);
  if (forbidden) return forbidden;

  const body = await request.json().catch(() => ({}));
  const search = String(body.search || "").trim();
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();
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

  let rows: any[] = [];

  try {
    rows = await prisma.$queryRawUnsafe(
      `
        SELECT
          l.zkteco_user_id AS "employeeCode",
          COALESCE(e.name, l.employee_name, CONCAT('User ', l.zkteco_user_id)) AS "employeeName",
          l.attendance_timestamp::date AS "attendanceDate",
          CASE WHEN COALESCE(l.punch_type, '') IN ('0', 'in', 'IN', 'checkin', 'check_in') THEN l.attendance_timestamp ELSE NULL END AS "checkInTime",
          CASE WHEN COALESCE(l.punch_type, '') IN ('1', 'out', 'OUT', 'checkout', 'check_out') THEN l.attendance_timestamp ELSE NULL END AS "checkOutTime",
          d.name AS "deviceName",
          CASE
            WHEN (l.attendance_timestamp::time > TIME '09:15:00') THEN 'LATE'
            ELSE 'PRESENT'
          END AS "status"
        FROM zkteco_attendance_logs l
        JOIN zkteco_devices d ON d.id = l.device_id
        LEFT JOIN zkteco_employees e ON e.device_id = d.id AND e.user_id = l.zkteco_user_id
        ${where}
        ORDER BY l.attendance_timestamp DESC
        LIMIT 5000
      `,
      ...values
    ) as any[];
  } catch {
    rows = [];
  }

  const headers = ["Employee/User ID", "Name", "Date", "Check-in time", "Check-out time", "Device name", "Status"];
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => [
      row.employeeCode,
      row.employeeName,
      row.attendanceDate instanceof Date ? row.attendanceDate.toISOString().slice(0, 10) : row.attendanceDate,
      row.checkInTime instanceof Date ? row.checkInTime.toISOString() : row.checkInTime,
      row.checkOutTime instanceof Date ? row.checkOutTime.toISOString() : row.checkOutTime,
      row.deviceName,
      row.status
    ].map(csvCell).join(","))
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "application/vnd.ms-excel; charset=utf-8",
      "content-disposition": `attachment; filename="attendance-report-${new Date().toISOString().slice(0, 10)}.xlsx"`
    }
  });
}
