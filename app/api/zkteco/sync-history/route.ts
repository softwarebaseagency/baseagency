import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/zkteco";

function pushFilter(filters: string[], values: unknown[], sql: string, value: unknown) {
  values.push(value);
  filters.push(sql.replace("?", `$${values.length}`));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const device = searchParams.get("device")?.trim();
  const status = searchParams.get("status")?.trim();
  const filters: string[] = [];
  const values: unknown[] = [];

  if (device) pushFilter(filters, values, "d.ip_address = ?", device);
  if (status && status !== "ALL") pushFilter(filters, values, "b.status::text = ?", normalizeStatus(status));

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const batches = await prisma.$queryRawUnsafe(
      `
        SELECT
          b.id,
          b.batch_id AS "batchId",
          b.started_at AS "startedAt",
          b.finished_at AS "finishedAt",
          b.status::text,
          b.logs_fetched AS "logsFetched",
          b.logs_inserted AS "logsInserted",
          b.duplicates_skipped AS "duplicatesSkipped",
          b.users_fetched AS "usersFetched",
          b.users_inserted AS "usersInserted",
          b.error_code AS "errorCode",
          b.error_message AS "errorMessage",
          b.created_at AS "createdAt",
          d.id AS "deviceId",
          d.name AS "deviceName",
          d.ip_address AS "deviceIp",
          d.port AS "devicePort",
          d.location AS "deviceLocation",
          d.status::text AS "deviceStatus",
          d.last_seen_at AS "deviceLastSeenAt"
        FROM zkteco_sync_batches b
        JOIN zkteco_devices d ON d.id = b.device_id
        ${where}
        ORDER BY b.started_at DESC
        LIMIT 200
      `,
      ...values
    );

    return NextResponse.json({
      success: true,
      syncHistory: (batches as any[]).map((batch: any) => ({
        id: batch.id,
        batchId: batch.batchId,
        device: {
          id: batch.deviceId,
          name: batch.deviceName,
          ipAddress: batch.deviceIp,
          port: batch.devicePort,
          location: batch.deviceLocation,
          status: batch.deviceStatus,
          lastSeenAt: batch.deviceLastSeenAt
        },
        startedAt: batch.startedAt,
        finishedAt: batch.finishedAt,
        status: batch.status,
        logsFetched: batch.logsFetched,
        logsInserted: batch.logsInserted,
        duplicatesSkipped: batch.duplicatesSkipped,
        usersFetched: batch.usersFetched,
        usersInserted: batch.usersInserted,
        errorCode: batch.errorCode,
        errorMessage: batch.errorMessage,
        createdAt: batch.createdAt
      }))
    });
  } catch {
    return NextResponse.json({ success: true, syncHistory: [] });
  }
}
