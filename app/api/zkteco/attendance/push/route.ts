import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  attendanceDateOnly,
  attendancePushSchema,
  buildAttendanceUniqueKey,
  isAllowedDeviceSerial,
  normalizeAttendanceStatus,
  parseAttendanceDate,
  verifyBridgeToken
} from "@/lib/attendance";

export const dynamic = "force-dynamic";

async function writeSyncLog({
  deviceId,
  status,
  message,
  payload,
  startedAt
}: {
  deviceId?: string | null;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  message: string;
  payload: unknown;
  startedAt: Date;
}) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO sync_logs (id, device_id, sync_type, status, message, payload, started_at, finished_at)
      VALUES ($1, $2, 'ADMS_PUSH', $3::"AttendanceSyncStatus", $4, $5::jsonb, $6, now())
    `,
    randomUUID(),
    deviceId || null,
    status,
    message,
    JSON.stringify(payload ?? {}),
    startedAt
  );
}

export async function POST(request: Request) {
  const startedAt = new Date();
  const token = verifyBridgeToken(request);

  if (!token.ok) {
    return NextResponse.json({ success: false, message: token.message }, { status: token.status });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = attendancePushSchema.safeParse(body);

  if (!parsed.success) {
    await writeSyncLog({
      status: "FAILED",
      message: "Validation failed",
      payload: parsed.error.flatten(),
      startedAt
    }).catch(() => undefined);

    return NextResponse.json({ success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const payload = parsed.data;

  if (!isAllowedDeviceSerial(payload.device.serialNumber)) {
    await writeSyncLog({
      status: "FAILED",
      message: "Device serial is not allowed",
      payload: { serialNumber: payload.device.serialNumber },
      startedAt
    }).catch(() => undefined);

    return NextResponse.json({ success: false, message: "Device serial is not allowed" }, { status: 403 });
  }

  let deviceId: string | null = null;
  let inserted = 0;
  let duplicates = 0;

  try {
    const deviceRows = await prisma.$queryRawUnsafe(
      `
        INSERT INTO devices (id, name, serial_number, ip_address, port, model, location, is_active, last_seen_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, now(), now())
        ON CONFLICT (serial_number)
        DO UPDATE SET
          name = EXCLUDED.name,
          ip_address = EXCLUDED.ip_address,
          port = EXCLUDED.port,
          model = EXCLUDED.model,
          location = EXCLUDED.location,
          is_active = true,
          last_seen_at = now(),
          updated_at = now()
        RETURNING id
      `,
      randomUUID(),
      payload.device.name,
      payload.device.serialNumber,
      payload.device.ipAddress || null,
      payload.device.port,
      payload.device.model,
      payload.device.location
    );

    deviceId = (deviceRows as any[])[0]?.id;

    for (const record of payload.records) {
      const rawTimestamp = parseAttendanceDate(record.timestamp);
      const attendanceDate = attendanceDateOnly(rawTimestamp);
      const employeeRows = await prisma.$queryRawUnsafe(
        `
          INSERT INTO employees (id, employee_code, name, department, position, email, phone, is_active, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true, now())
          ON CONFLICT (employee_code)
          DO UPDATE SET
            name = COALESCE(NULLIF(EXCLUDED.name, ''), employees.name),
            department = COALESCE(EXCLUDED.department, employees.department),
            position = COALESCE(EXCLUDED.position, employees.position),
            email = COALESCE(EXCLUDED.email, employees.email),
            phone = COALESCE(EXCLUDED.phone, employees.phone),
            is_active = true,
            updated_at = now()
          RETURNING id
        `,
        randomUUID(),
        record.employeeCode,
        record.name || `Employee ${record.employeeCode}`,
        record.department || null,
        record.position || null,
        record.email || null,
        record.phone || null
      );
      const employeeId = (employeeRows as any[])[0]?.id;
      const punch = String(record.punchType || "").toLowerCase();
      const isCheckout = ["1", "out", "checkout", "check_out"].includes(punch);
      const uniqueKey = buildAttendanceUniqueKey(record.employeeCode, deviceId as string, rawTimestamp);

      // Deduplication is based on employee code, device id, and raw device timestamp.
      const result = await prisma.$queryRawUnsafe(
        `
          INSERT INTO attendance_logs (
            id,
            employee_id,
            device_id,
            employee_code,
            check_in_time,
            check_out_time,
            attendance_date,
            raw_timestamp,
            status,
            source,
            raw_payload,
            unique_key,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::"AttendanceStatus", 'ZKTECO_ADMS', $10::jsonb, $11, now())
          ON CONFLICT (unique_key) DO NOTHING
          RETURNING id
        `,
        randomUUID(),
        employeeId,
        deviceId,
        record.employeeCode,
        isCheckout ? null : rawTimestamp,
        isCheckout ? rawTimestamp : null,
        attendanceDate,
        rawTimestamp,
        normalizeAttendanceStatus(rawTimestamp),
        JSON.stringify(record.rawPayload ?? record),
        uniqueKey
      );

      if ((result as any[]).length) inserted += 1;
      else duplicates += 1;
    }

    await writeSyncLog({
      deviceId,
      status: inserted && duplicates ? "PARTIAL" : "SUCCESS",
      message: `ADMS push processed. Inserted ${inserted}, skipped ${duplicates} duplicate(s).`,
      payload: { recordsReceived: payload.records.length, inserted, duplicates, serialNumber: payload.device.serialNumber },
      startedAt
    });

    return NextResponse.json({ success: true, inserted, duplicates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Attendance push failed";
    await writeSyncLog({
      deviceId,
      status: "FAILED",
      message,
      payload: { recordsReceived: payload.records.length, serialNumber: payload.device.serialNumber },
      startedAt
    }).catch(() => undefined);

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
