import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const zktecoDeviceSchema = z.object({
  name: z.string().trim().optional(),
  ipAddress: z.string().trim().optional(),
  ip_address: z.string().trim().optional(),
  port: z.coerce.number().int().positive().default(4370),
  location: z.string().trim().optional()
});

export const zktecoUserSchema = z.object({
  zktecoUserId: z.union([z.string(), z.number()]).transform(String).optional(),
  userId: z.union([z.string(), z.number()]).transform(String).optional(),
  uid: z.union([z.string(), z.number()]).transform(String).optional(),
  name: z.string().trim().optional().nullable(),
  cardNumber: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  cardno: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  privilege: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  rawPayload: z.unknown().optional()
});

export const zktecoAttendanceLogSchema = z.object({
  zktecoUserId: z.union([z.string(), z.number()]).transform(String).optional(),
  userId: z.union([z.string(), z.number()]).transform(String).optional(),
  uid: z.union([z.string(), z.number()]).transform(String).optional(),
  employeeName: z.string().trim().optional().nullable(),
  timestamp: z.union([z.string(), z.date()]).optional(),
  attendanceTimestamp: z.union([z.string(), z.date()]).optional(),
  punchType: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  status: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  verifyType: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  workCode: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
  rawPayload: z.unknown().optional()
});

export const syncUsersPayloadSchema = z.object({
  batchId: z.string().trim().optional(),
  device: zktecoDeviceSchema,
  users: z.array(zktecoUserSchema).default([])
});

export const syncAttendancePayloadSchema = z.object({
  batchId: z.string().trim(),
  startedAt: z.union([z.string(), z.date()]).optional(),
  finishedAt: z.union([z.string(), z.date()]).optional(),
  device: zktecoDeviceSchema,
  logs: z.array(zktecoAttendanceLogSchema).default([])
});

export const syncStatusPayloadSchema = z.object({
  batchId: z.string().trim(),
  device: zktecoDeviceSchema,
  startedAt: z.union([z.string(), z.date()]).optional(),
  finishedAt: z.union([z.string(), z.date()]).optional(),
  status: z.string().trim(),
  logsFetched: z.coerce.number().int().min(0).optional(),
  logsInserted: z.coerce.number().int().min(0).optional(),
  duplicatesSkipped: z.coerce.number().int().min(0).optional(),
  usersFetched: z.coerce.number().int().min(0).optional(),
  usersInserted: z.coerce.number().int().min(0).optional(),
  errorCode: z.string().trim().optional().nullable(),
  errorMessage: z.string().trim().optional().nullable()
});

const writableStatuses = new Set([
  "SUCCESS",
  "DEVICE_OFFLINE",
  "WRONG_IP",
  "TIMEOUT",
  "API_TOKEN_INVALID",
  "DATABASE_ERROR",
  "PARTIAL_SYNC",
  "FAILED",
  "PENDING"
]);

export function requireZktecoSyncSecret(request: Request) {
  const configuredSecret = process.env.ZKTECO_SYNC_SECRET;
  const requestSecret = request.headers.get("x-zkteco-sync-secret");

  if (!configuredSecret) {
    return NextResponse.json(
      { success: false, message: "ZKTECO_SYNC_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!requestSecret || requestSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}

export function normalizeDevice(data: z.infer<typeof zktecoDeviceSchema>) {
  const ipAddress = data.ipAddress || data.ip_address;

  if (!ipAddress) {
    throw new Error("Device IP address is required");
  }

  return {
    name: data.name || `ZKTeco ${ipAddress}`,
    ipAddress,
    port: data.port || 4370,
    location: data.location || null
  };
}

export function normalizeStatus(status: string) {
  const normalized = status
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  return writableStatuses.has(normalized) ? normalized : "FAILED";
}

export function parseDate(value: string | Date | undefined, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function getZktecoUserId(
  item: z.infer<typeof zktecoUserSchema> | z.infer<typeof zktecoAttendanceLogSchema>
) {
  return item.zktecoUserId || item.userId || item.uid;
}

export function getAttendanceTimestamp(item: z.infer<typeof zktecoAttendanceLogSchema>) {
  return parseDate(item.attendanceTimestamp || item.timestamp);
}

export function buildAttendanceUniqueKey({
  deviceIp,
  zktecoUserId,
  attendanceTimestamp,
  punchType
}: {
  deviceIp: string;
  zktecoUserId: string;
  attendanceTimestamp: Date;
  punchType?: string | null;
}) {
  return [deviceIp, zktecoUserId, attendanceTimestamp.toISOString(), punchType || "unknown"].join("|");
}

export async function upsertZktecoDevice(deviceInput: z.infer<typeof zktecoDeviceSchema>) {
  const device = normalizeDevice(deviceInput);

  const rows = await prisma.$queryRawUnsafe(
    `
      INSERT INTO zkteco_devices (
        id,
        name,
        ip_address,
        port,
        location,
        status,
        last_seen_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'ONLINE', now(), now())
      ON CONFLICT (ip_address)
      DO UPDATE SET
        name = EXCLUDED.name,
        port = EXCLUDED.port,
        location = EXCLUDED.location,
        status = 'ONLINE',
        last_seen_at = now(),
        updated_at = now()
      RETURNING
        id,
        name,
        ip_address AS "ipAddress",
        port,
        location,
        status::text AS status,
        last_seen_at AS "lastSeenAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    randomUUID(),
    device.name,
    device.ipAddress,
    device.port,
    device.location
  );

  return (rows as any[])[0];
}

export function serializeDevice(device: any) {
  return {
    id: device.id,
    name: device.name,
    ipAddress: device.ipAddress,
    port: device.port,
    location: device.location,
    status: device.status,
    lastSeenAt: device.lastSeenAt,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt
  };
}

export function serializeSyncBatch(batch: any) {
  return {
    id: batch.id,
    batchId: batch.batchId,
    device: batch.device ? serializeDevice(batch.device) : null,
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
  };
}

export function serializeUser(user: any) {
  return {
    id: user.id,
    device: user.device ? serializeDevice(user.device) : null,
    zktecoUserId: user.zktecoUserId,
    name: user.name,
    cardNumber: user.cardNumber,
    privilege: user.privilege,
    lastSyncedAt: user.lastSyncedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function serializeAttendanceLog(log: any) {
  return {
    id: log.id,
    device: log.device ? serializeDevice(log.device) : null,
    zktecoUserId: log.zktecoUserId,
    employeeName: log.employeeName,
    attendanceTimestamp: log.attendanceTimestamp,
    attendanceDate: log.attendanceTimestamp?.toISOString().slice(0, 10) || null,
    attendanceTime: log.attendanceTimestamp?.toISOString().slice(11, 19) || null,
    punchType: log.punchType,
    verifyType: log.verifyType,
    workCode: log.workCode,
    syncBatchId: log.syncBatchId,
    syncStatus: log.syncBatch?.status || null,
    createdAt: log.createdAt
  };
}
