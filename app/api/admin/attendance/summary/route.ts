import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const forbidden = requireAdminApi(request);
  if (forbidden) return forbidden;

  try {
    const [todayRows, weeklyRows, monthlyRows, lateRows, employeeRows, presentRows, deviceRows] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_attendance_logs WHERE attendance_timestamp::date = CURRENT_DATE`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_attendance_logs WHERE attendance_timestamp::date >= CURRENT_DATE - INTERVAL '6 days'`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_attendance_logs WHERE attendance_timestamp::date >= date_trunc('month', CURRENT_DATE)::date`),
      prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT zkteco_user_id)::int AS count FROM zkteco_attendance_logs WHERE attendance_timestamp::date = CURRENT_DATE AND attendance_timestamp::time > TIME '09:15:00'`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_employees WHERE is_active = true`),
      prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT zkteco_user_id)::int AS count FROM zkteco_attendance_logs WHERE attendance_timestamp::date = CURRENT_DATE`),
      prisma.$queryRawUnsafe(`
        SELECT
          name,
          serial_number AS "serialNumber",
          ip_address AS "ipAddress",
          status,
          last_heartbeat_at AS "lastHeartbeatAt",
          latest_real_request_at AS "lastRealDeviceRequestAt",
          (latest_real_request_at > now() - INTERVAL '2 minutes') AS "onlineNow"
        FROM (
          SELECT
            d.*,
            (
              SELECT MAX(l.created_at)
              FROM zkteco_debug_logs l
              WHERE l.serial_number = d.serial_number
                AND (
                  l.remote_address LIKE '%192.168.1.201%'
                  OR l.headers->>'x-zkteco-device-ip' = '192.168.1.201'
                )
            ) AS latest_real_request_at
          FROM zkteco_devices d
        ) devices
        ORDER BY updated_at DESC
        LIMIT 5
      `)
    ]);

    const activeEmployees = (employeeRows as any[])[0]?.count || 0;
    const presentEmployees = (presentRows as any[])[0]?.count || 0;

    return NextResponse.json({
      success: true,
      summary: {
        todayAttendanceCount: (todayRows as any[])[0]?.count || 0,
        weeklyAttendanceCount: (weeklyRows as any[])[0]?.count || 0,
        monthlyAttendanceCount: (monthlyRows as any[])[0]?.count || 0,
        lateEmployeesCount: (lateRows as any[])[0]?.count || 0,
        activeEmployeesCount: activeEmployees,
        absentEmployeesCount: activeEmployees ? Math.max(activeEmployees - presentEmployees, 0) : 0,
        scheduleConfigured: false,
        devices: deviceRows
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      databaseAvailable: false,
      message: "Database is not reachable. Connect PostgreSQL or set DATABASE_URL to the production database.",
      summary: {
        todayAttendanceCount: 0,
        weeklyAttendanceCount: 0,
        monthlyAttendanceCount: 0,
        lateEmployeesCount: 0,
        activeEmployeesCount: 0,
        absentEmployeesCount: 0,
        scheduleConfigured: false,
        devices: []
      }
    });
  }
}
