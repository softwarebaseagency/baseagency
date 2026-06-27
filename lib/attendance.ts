import { z } from "zod";

export const attendancePushSchema = z.object({
  device: z.object({
    serialNumber: z.string().trim().min(1),
    name: z.string().trim().default("ZKTeco SpeedFace V5L"),
    ipAddress: z.string().trim().optional().nullable(),
    port: z.coerce.number().int().positive().default(8081),
    model: z.string().trim().default("SpeedFace V5L"),
    location: z.string().trim().default("Base Agency Office")
  }),
  records: z.array(
    z.object({
      employeeCode: z.union([z.string(), z.number()]).transform(String),
      name: z.string().trim().optional().nullable(),
      department: z.string().trim().optional().nullable(),
      position: z.string().trim().optional().nullable(),
      email: z.string().trim().email().optional().nullable(),
      phone: z.string().trim().optional().nullable(),
      timestamp: z.union([z.string(), z.date()]),
      punchType: z.union([z.string(), z.number()]).transform(String).optional().nullable(),
      rawPayload: z.unknown().optional()
    })
  ).min(1),
  syncType: z.string().trim().default("ADMS_PUSH")
});

export type AttendancePushPayload = z.infer<typeof attendancePushSchema>;

export function parseAttendanceDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid attendance timestamp");
  }
  return date;
}

export function attendanceDateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function normalizeAttendanceStatus(date: Date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return hour > 9 || (hour === 9 && minute > 15) ? "LATE" : "PRESENT";
}

export function buildAttendanceUniqueKey(employeeCode: string, deviceId: string, rawTimestamp: Date) {
  return [employeeCode, deviceId, rawTimestamp.toISOString()].join("|");
}

export function verifyBridgeToken(request: Request) {
  const configuredSecret = process.env.ZK_BRIDGE_SECRET;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

  if (!configuredSecret) {
    return { ok: false, status: 500, message: "ZK_BRIDGE_SECRET is not configured" };
  }

  if (!token || token !== configuredSecret) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true as const };
}

export function isAllowedDeviceSerial(serialNumber: string) {
  const allowed = process.env.ZK_BRIDGE_ALLOWED_DEVICE_SERIALS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return !allowed?.length || allowed.includes(serialNumber);
}
