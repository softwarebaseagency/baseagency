import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/zkteco";

const emptySummary = {
  totalLogs: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  latestSyncTime: null,
  deviceStatus: "UNKNOWN",
  successfulSyncCount: 0,
  failedSyncCount: 0
};

function emptyResponse() {
  return NextResponse.json({
    success: true,
    summary: emptySummary,
    logs: []
  });
}

function pushFilter(filters: string[], values: unknown[], sql: string, value: unknown) {
  values.push(value);
  filters.push(sql.replace("?", `$${values.length}`));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get("employee")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const device = searchParams.get("device")?.trim();
  const syncStatus = searchParams.get("syncStatus")?.trim();
  const search = searchParams.get("search")?.trim();
  const filters: string[] = [];
  const values: unknown[] = [];

  if (employee) pushFilter(filters, values, "l.zkteco_user_id = ?", employee);
  if (from) pushFilter(filters, values, "l.attendance_timestamp >= ?::timestamp", `${from}T00:00:00.000Z`);
  if (to) pushFilter(filters, values, "l.attendance_timestamp <= ?::timestamp", `${to}T23:59:59.999Z`);
  if (device) pushFilter(filters, values, "d.ip_address = ?", device);
  if (syncStatus && syncStatus !== "ALL") pushFilter(filters, values, "b.status::text = ?", normalizeStatus(syncStatus));
  if (search) {
    values.push(`%${search}%`);
    const index = `$${values.length}`;
    filters.push(`(l.employee_name ILIKE ${index} OR l.zkteco_user_id ILIKE ${index})`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const logs = await prisma.$queryRawUnsafe(
      `
        SELECT
          l.id,
          l.zkteco_user_id AS "zktecoUserId",
          l.employee_name AS "employeeName",
          l.attendance_timestamp AS "attendanceTimestamp",
          l.punch_type AS "punchType",
          l.verify_type AS "verifyType",
          l.work_code AS "workCode",
          l.sync_batch_id AS "syncBatchId",
          l.created_at AS "createdAt",
          b.status::text AS "syncStatus",
          d.id AS "deviceId",
          d.name AS "deviceName",
          d.ip_address AS "deviceIp",
          d.port AS "devicePort",
          d.location AS "deviceLocation",
          d.status::text AS "deviceStatus",
          d.last_seen_at AS "deviceLastSeenAt"
        FROM zkteco_attendance_logs l
        JOIN zkteco_devices d ON d.id = l.device_id
        LEFT JOIN zkteco_sync_batches b ON b.batch_id = l.sync_batch_id
        ${where}
        ORDER BY l.attendance_timestamp DESC
        LIMIT 500
      `,
      ...values
    );

    const [totalRows, todayRows, latestRows, successRows, failedRows] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_attendance_logs`),
      prisma.$queryRawUnsafe(
        `
          SELECT punch_type AS "punchType"
          FROM zkteco_attendance_logs
          WHERE attendance_timestamp >= date_trunc('day', now())
        `
      ),
      prisma.$queryRawUnsafe(
        `
          SELECT b.started_at AS "startedAt", b.finished_at AS "finishedAt", d.status::text AS "deviceStatus"
          FROM zkteco_sync_batches b
          JOIN zkteco_devices d ON d.id = b.device_id
          ORDER BY b.started_at DESC
          LIMIT 1
        `
      ),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_sync_batches WHERE status = 'SUCCESS'`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM zkteco_sync_batches WHERE status <> 'SUCCESS'`)
    ]);

    const attendanceLogs = logs as any[];
    const totalCountRows = totalRows as any[];
    const todayLogs = (todayRows || []) as any[];
    const latestSyncRows = latestRows as any[];
    const successCountRows = successRows as any[];
    const failedCountRows = failedRows as any[];
    const checkIns = todayLogs.filter((log: any) =>
      ["0", "in", "checkin", "check_in"].includes(String(log.punchType || "").toLowerCase())
    ).length;
    const checkOuts = todayLogs.filter((log: any) =>
      ["1", "out", "checkout", "check_out"].includes(String(log.punchType || "").toLowerCase())
    ).length;
    const latest = latestSyncRows[0];

    return NextResponse.json({
      success: true,
      summary: {
        totalLogs: totalCountRows[0]?.count || 0,
        todayCheckIns: checkIns || todayLogs.length,
        todayCheckOuts: checkOuts,
        latestSyncTime: latest?.finishedAt || latest?.startedAt || null,
        deviceStatus: latest?.deviceStatus || "UNKNOWN",
        successfulSyncCount: successCountRows[0]?.count || 0,
        failedSyncCount: failedCountRows[0]?.count || 0
      },
      logs: attendanceLogs.map((log: any) => ({
        id: log.id,
        device: {
          id: log.deviceId,
          name: log.deviceName,
          ipAddress: log.deviceIp,
          port: log.devicePort,
          location: log.deviceLocation,
          status: log.deviceStatus,
          lastSeenAt: log.deviceLastSeenAt
        },
        zktecoUserId: log.zktecoUserId,
        employeeName: log.employeeName,
        attendanceTimestamp: log.attendanceTimestamp,
        attendanceDate: log.attendanceTimestamp?.toISOString().slice(0, 10) || null,
        attendanceTime: log.attendanceTimestamp?.toISOString().slice(11, 19) || null,
        punchType: log.punchType,
        verifyType: log.verifyType,
        workCode: log.workCode,
        syncBatchId: log.syncBatchId,
        syncStatus: log.syncStatus,
        createdAt: log.createdAt
      }))
    });
  } catch {
    return emptyResponse();
  }
}
