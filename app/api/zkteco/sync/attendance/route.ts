import { NextResponse } from "next/server";
import {
  buildAttendanceUniqueKey,
  getAttendanceTimestamp,
  getZktecoUserId,
  requireZktecoSyncSecret,
  syncAttendancePayloadSchema,
  upsertZktecoDevice
} from "@/lib/zkteco";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  const unauthorized = requireZktecoSyncSecret(request);
  if (unauthorized) return unauthorized;

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = syncAttendancePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const device = await upsertZktecoDevice(parsed.data.device);
    const startedAt = parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date();

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO zkteco_sync_batches (
          id,
          device_id,
          batch_id,
          started_at,
          status,
          logs_fetched
        )
        VALUES ($1, $2, $3, $4, 'PENDING', $5)
        ON CONFLICT (batch_id)
        DO UPDATE SET
          device_id = EXCLUDED.device_id,
          logs_fetched = EXCLUDED.logs_fetched
      `,
      randomUUID(),
      device.id,
      parsed.data.batchId,
      startedAt,
      parsed.data.logs.length
    );

    const deviceUsers = await prisma.$queryRawUnsafe(
      `
        SELECT zkteco_user_id AS "zktecoUserId", name
        FROM zkteco_users
        WHERE device_id = $1
      `,
      device.id
    );
    const namesByUserId = new Map(
      (deviceUsers as any[]).map((user) => [user.zktecoUserId, user.name])
    );

    const logs = parsed.data.logs
      .flatMap((log) => {
        const zktecoUserId = getZktecoUserId(log);
        if (!zktecoUserId) return [];
        const attendanceTimestamp = getAttendanceTimestamp(log);
        const punchType = log.punchType || log.status || null;

        return [{
          deviceId: device.id,
          zktecoUserId,
          employeeName: log.employeeName || namesByUserId.get(zktecoUserId) || null,
          attendanceTimestamp,
          punchType,
          verifyType: log.verifyType || null,
          workCode: log.workCode || null,
          rawPayload: (log.rawPayload || log) as object,
          syncBatchId: parsed.data.batchId,
          uniqueKey: buildAttendanceUniqueKey({
            deviceIp: device.ipAddress,
            zktecoUserId,
            attendanceTimestamp,
            punchType
          })
        }];
      });

    let inserted = 0;

    for (const log of logs) {
      const result = await prisma.$executeRawUnsafe(
        `
          INSERT INTO zkteco_attendance_logs (
            id,
            device_id,
            zkteco_user_id,
            employee_name,
            attendance_timestamp,
            punch_type,
            verify_type,
            work_code,
            raw_payload,
            sync_batch_id,
            unique_key
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
          ON CONFLICT (unique_key) DO NOTHING
        `,
        randomUUID(),
        log.deviceId,
        log.zktecoUserId,
        log.employeeName,
        log.attendanceTimestamp,
        log.punchType,
        log.verifyType,
        log.workCode,
        JSON.stringify(log.rawPayload || log),
        log.syncBatchId,
        log.uniqueKey
      );
      inserted += Number(result || 0);
    }

    const duplicatesSkipped = logs.length - inserted;

    await prisma.$executeRawUnsafe(
      `
        UPDATE zkteco_sync_batches
        SET
          finished_at = $2,
          status = 'SUCCESS',
          logs_fetched = $3,
          logs_inserted = $4,
          duplicates_skipped = $5
        WHERE batch_id = $1
      `,
      parsed.data.batchId,
      parsed.data.finishedAt ? new Date(parsed.data.finishedAt) : new Date(),
      parsed.data.logs.length,
      inserted,
      duplicatesSkipped
    );

    return NextResponse.json({
      success: true,
      batchId: parsed.data.batchId,
      received: parsed.data.logs.length,
      inserted,
      logsFetched: parsed.data.logs.length,
      logsInserted: inserted,
      duplicatesSkipped,
      message: "Attendance logs synced successfully"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ZKTeco attendance sync error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
