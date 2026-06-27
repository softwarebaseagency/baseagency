import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function pushFilter(filters: string[], values: unknown[], sql: string, value: unknown) {
  values.push(value);
  filters.push(sql.replace("?", `$${values.length}`));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const device = searchParams.get("device")?.trim();
  const filters: string[] = [];
  const values: unknown[] = [];

  if (device) pushFilter(filters, values, "d.ip_address = ?", device);
  if (search) {
    values.push(`%${search}%`);
    const index = `$${values.length}`;
    filters.push(`(u.name ILIKE ${index} OR u.zkteco_user_id ILIKE ${index} OR u.card_number ILIKE ${index})`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const users = await prisma.$queryRawUnsafe(
      `
        SELECT
          u.id,
          u.zkteco_user_id AS "zktecoUserId",
          u.name,
          u.card_number AS "cardNumber",
          u.privilege,
          u.last_synced_at AS "lastSyncedAt",
          u.created_at AS "createdAt",
          u.updated_at AS "updatedAt",
          d.id AS "deviceId",
          d.name AS "deviceName",
          d.ip_address AS "deviceIp",
          d.port AS "devicePort",
          d.location AS "deviceLocation",
          d.status::text AS "deviceStatus",
          d.last_seen_at AS "deviceLastSeenAt"
        FROM zkteco_users u
        JOIN zkteco_devices d ON d.id = u.device_id
        ${where}
        ORDER BY u.last_synced_at DESC, u.name ASC
        LIMIT 500
      `,
      ...values
    );

    return NextResponse.json({
      success: true,
      users: (users as any[]).map((user: any) => ({
        id: user.id,
        device: {
          id: user.deviceId,
          name: user.deviceName,
          ipAddress: user.deviceIp,
          port: user.devicePort,
          location: user.deviceLocation,
          status: user.deviceStatus,
          lastSeenAt: user.deviceLastSeenAt
        },
        zktecoUserId: user.zktecoUserId,
        name: user.name,
        cardNumber: user.cardNumber,
        privilege: user.privilege,
        lastSyncedAt: user.lastSyncedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch {
    return NextResponse.json({ success: true, users: [] });
  }
}
