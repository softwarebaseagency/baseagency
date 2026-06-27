import { NextResponse } from "next/server";
import {
  getZktecoUserId,
  requireZktecoSyncSecret,
  syncUsersPayloadSchema,
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

  const parsed = syncUsersPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const device = await upsertZktecoDevice(parsed.data.device);
    const users = parsed.data.users.flatMap((user) => {
      const zktecoUserId = getZktecoUserId(user);
      return zktecoUserId ? [{ ...user, zktecoUserId }] : [];
    });

    const existingUsers = users.length
      ? await prisma.$queryRawUnsafe(
          `
            SELECT zkteco_user_id AS "zktecoUserId"
            FROM zkteco_users
            WHERE device_id = $1
              AND zkteco_user_id = ANY($2::text[])
          `,
          device.id,
          users.map((user) => user.zktecoUserId)
        )
      : [];
    const existingIds = new Set((existingUsers as any[]).map((user) => user.zktecoUserId));

    for (const user of users) {
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO zkteco_users (
            id,
            device_id,
            zkteco_user_id,
            name,
            card_number,
            privilege,
            raw_payload,
            last_synced_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, now(), now())
          ON CONFLICT (device_id, zkteco_user_id)
          DO UPDATE SET
            name = EXCLUDED.name,
            card_number = EXCLUDED.card_number,
            privilege = EXCLUDED.privilege,
            raw_payload = EXCLUDED.raw_payload,
            last_synced_at = now(),
            updated_at = now()
        `,
        randomUUID(),
        device.id,
        user.zktecoUserId,
        user.name || null,
        user.cardNumber || user.cardno || null,
        user.privilege ? String(user.privilege) : null,
        JSON.stringify(user.rawPayload || user)
      );
    }

    const inserted = users.filter((user) => !existingIds.has(user.zktecoUserId)).length;

    return NextResponse.json({
      success: true,
      usersFetched: users.length,
      usersInserted: inserted,
      usersUpdated: users.length - inserted
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ZKTeco user sync error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
