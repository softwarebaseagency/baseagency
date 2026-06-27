import { NextResponse } from "next/server";
import {
  normalizeStatus,
  parseDate,
  requireZktecoSyncSecret,
  syncStatusPayloadSchema,
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

  const parsed = syncStatusPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const device = await upsertZktecoDevice(parsed.data.device);
    const status = normalizeStatus(parsed.data.status);

    if (status !== "SUCCESS") {
      await prisma.$executeRawUnsafe(
        `
          UPDATE zkteco_devices
          SET status = $2::"ZktecoDeviceStatus", updated_at = now()
          WHERE id = $1
        `,
        device.id,
        status === "PENDING" ? "UNKNOWN" : "OFFLINE"
      );
    }

    const batchRows = await prisma.$queryRawUnsafe(
      `
        INSERT INTO zkteco_sync_batches (
          id,
          device_id,
          batch_id,
          started_at,
          finished_at,
          status,
          logs_fetched,
          logs_inserted,
          duplicates_skipped,
          users_fetched,
          users_inserted,
          error_code,
          error_message
        )
        VALUES ($1, $2, $3, $4, $5, $6::"ZktecoSyncStatus", $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (batch_id)
        DO UPDATE SET
          device_id = EXCLUDED.device_id,
          finished_at = COALESCE(EXCLUDED.finished_at, now()),
          status = EXCLUDED.status,
          logs_fetched = EXCLUDED.logs_fetched,
          logs_inserted = EXCLUDED.logs_inserted,
          duplicates_skipped = EXCLUDED.duplicates_skipped,
          users_fetched = EXCLUDED.users_fetched,
          users_inserted = EXCLUDED.users_inserted,
          error_code = EXCLUDED.error_code,
          error_message = EXCLUDED.error_message
        RETURNING batch_id AS "batchId", status::text AS status
      `,
      randomUUID(),
      device.id,
      parsed.data.batchId,
      parseDate(parsed.data.startedAt),
      parsed.data.finishedAt ? parseDate(parsed.data.finishedAt) : null,
      status,
      parsed.data.logsFetched || 0,
      parsed.data.logsInserted || 0,
      parsed.data.duplicatesSkipped || 0,
      parsed.data.usersFetched || 0,
      parsed.data.usersInserted || 0,
      parsed.data.errorCode || null,
      parsed.data.errorMessage || null
    );
    const batch = (batchRows as any[])[0];

    return NextResponse.json({
      success: true,
      batchId: batch.batchId,
      status: batch.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ZKTeco status sync error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
