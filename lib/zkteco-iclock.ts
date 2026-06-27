import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_SERIAL = "SYZ8254200145";
const DEFAULT_DEVICE_IP = "192.168.1.201";
const DEFAULT_DEVICE_NAME = "Base Agency SpeedFace V5L";

type IclockInput = {
  method: string;
  pathname: string;
  searchParams: URLSearchParams;
  headers: Record<string, string>;
  rawBody: string;
  remoteAddress?: string | null;
};

function plain(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function jsonObject(value: unknown) {
  return JSON.stringify(value ?? {});
}

function serialFrom(input: IclockInput) {
  return (
    input.searchParams.get("SN") ||
    input.searchParams.get("sn") ||
    input.searchParams.get("SerialNumber") ||
    input.headers["x-zk-sn"] ||
    DEFAULT_SERIAL
  );
}

function requestIp(input: IclockInput, serialNumber: string) {
  const explicitIp = input.searchParams.get("ip") || input.headers["x-zkteco-device-ip"];
  if (explicitIp && !["127.0.0.1", "::1", "::ffff:127.0.0.1", "192.168.1.100"].includes(explicitIp)) return explicitIp;
  if (serialNumber === DEFAULT_SERIAL) return DEFAULT_DEVICE_IP;

  const forwarded = input.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  return forwarded || input.remoteAddress || DEFAULT_DEVICE_IP;
}

function optionResponse(serialNumber: string) {
  return [
    `GET OPTION FROM: ${serialNumber}`,
    "Stamp=9999",
    "OpStamp=9999",
    "PhotoStamp=9999",
    "ErrorDelay=60",
    "Delay=15",
    "TransTimes=00:00;14:05",
    "TransInterval=1",
    "TransFlag=1111000000",
    "Realtime=1",
    "Encrypt=0"
  ].join("\n");
}

function parseDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseKeyValueLine(line: string) {
  const output: Record<string, string> = {};
  const pattern = /([A-Za-z_]+)=([^=]*?)(?=\s+[A-Za-z_]+=|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line))) {
    output[match[1].toLowerCase()] = match[2].trim();
  }
  return output;
}

function parseAttendanceLines(rawBody: string) {
  const records: Array<{
    userId: string;
    employeeName?: string | null;
    timestamp: Date;
    punchType?: string | null;
    verifyType?: string | null;
    workCode?: string | null;
    rawLine: string;
  }> = [];

  for (const rawLine of rawBody.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const kv = parseKeyValueLine(line);
    const tabParts = line.split(/\t+/).map((part) => part.trim());
    const userId = kv.pin || kv.userid || kv.user_id || kv.uid || tabParts[0];
    const timestampText = kv.time || kv.timestamp || kv.datetime || tabParts[1];
    const timestamp = timestampText ? parseDate(timestampText) : null;

    if (!userId || !timestamp) continue;

    records.push({
      userId,
      employeeName: kv.name || null,
      timestamp,
      punchType: kv.status || kv.punch || kv.punchtype || tabParts[2] || null,
      verifyType: kv.verify || kv.verifytype || tabParts[3] || null,
      workCode: kv.workcode || tabParts[4] || null,
      rawLine: line
    });
  }

  return records;
}

function parseEmployeeLines(rawBody: string) {
  const employees: Array<{
    userId: string;
    name?: string | null;
    department?: string | null;
    position?: string | null;
    rawLine: string;
  }> = [];

  for (const rawLine of rawBody.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const normalized = line.replace(/^USER\s+/i, "");
    const kv = parseKeyValueLine(normalized);
    const tabParts = normalized.split(/\t+/).map((part) => part.trim());
    const userId = kv.pin || kv.userid || kv.user_id || kv.uid || kv.id || tabParts[0];
    const name = kv.name || kv.username || kv.user_name || tabParts[1] || null;

    if (!userId || (!name && !/^USER\s+/i.test(line))) continue;

    employees.push({
      userId,
      name,
      department: kv.department || kv.dept || null,
      position: kv.position || kv.title || null,
      rawLine: line
    });
  }

  return employees;
}

async function upsertDevice(serialNumber: string, ipAddress: string) {
  const rows = await prisma.$queryRawUnsafe(
    `
      WITH existing AS (
        SELECT id
        FROM zkteco_devices
        WHERE serial_number = $3 OR ip_address = $4
        ORDER BY created_at ASC
        LIMIT 1
      ),
      updated AS (
        UPDATE zkteco_devices
        SET
          name = $2,
          serial_number = $3,
          ip_address = $4,
          port = 8081,
          model = 'SpeedFace V5L',
          location = 'Base Agency Office',
          status = 'ONLINE',
          last_seen_at = now(),
          last_heartbeat_at = now(),
          updated_at = now()
        WHERE id IN (SELECT id FROM existing)
        RETURNING id
      ),
      inserted AS (
        INSERT INTO zkteco_devices (id, name, serial_number, ip_address, port, model, location, status, last_seen_at, last_heartbeat_at, updated_at)
        SELECT $1, $2, $3, $4, 8081, 'SpeedFace V5L', 'Base Agency Office', 'ONLINE', now(), now(), now()
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        ON CONFLICT (serial_number)
        DO UPDATE SET
          name = EXCLUDED.name,
          ip_address = EXCLUDED.ip_address,
          model = EXCLUDED.model,
          location = EXCLUDED.location,
          status = 'ONLINE',
          last_seen_at = now(),
          last_heartbeat_at = now(),
          updated_at = now()
        RETURNING id
      )
      SELECT id FROM updated
      UNION ALL
      SELECT id FROM inserted
      LIMIT 1
    `,
    randomUUID(),
    DEFAULT_DEVICE_NAME,
    serialNumber,
    ipAddress
  );

  return (rows as any[])[0]?.id as string | undefined;
}

async function saveEmployees(deviceId: string, serialNumber: string, rawBody: string) {
  let insertedOrUpdated = 0;

  for (const employee of parseEmployeeLines(rawBody)) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO zkteco_employees (id, device_id, user_id, name, department, position, is_active, raw_payload, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7::jsonb, now())
        ON CONFLICT (device_id, user_id)
        DO UPDATE SET
          name = COALESCE(EXCLUDED.name, zkteco_employees.name),
          department = COALESCE(EXCLUDED.department, zkteco_employees.department),
          position = COALESCE(EXCLUDED.position, zkteco_employees.position),
          is_active = true,
          raw_payload = EXCLUDED.raw_payload,
          updated_at = now()
      `,
      randomUUID(),
      deviceId,
      employee.userId,
      employee.name || null,
      employee.department || null,
      employee.position || null,
      jsonObject({ serialNumber, rawLine: employee.rawLine })
    );
    insertedOrUpdated += 1;
  }

  return insertedOrUpdated;
}

async function saveAttendance(deviceId: string, serialNumber: string, rawBody: string) {
  let inserted = 0;

  for (const record of parseAttendanceLines(rawBody)) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO zkteco_employees (id, device_id, user_id, name, is_active, raw_payload, updated_at)
        VALUES ($1, $2, $3, $4, true, $5::jsonb, now())
        ON CONFLICT (device_id, user_id)
        DO UPDATE SET
          name = COALESCE(EXCLUDED.name, zkteco_employees.name),
          is_active = true,
          raw_payload = EXCLUDED.raw_payload,
          updated_at = now()
      `,
      randomUUID(),
      deviceId,
      record.userId,
      record.employeeName || null,
      jsonObject({ serialNumber, rawLine: record.rawLine })
    );

    const uniqueKey = [serialNumber, record.userId, record.timestamp.toISOString(), record.punchType || "unknown"].join("|");
    const result = await prisma.$queryRawUnsafe(
      `
        INSERT INTO zkteco_attendance_logs (id, device_id, zkteco_user_id, employee_name, attendance_timestamp, punch_type, verify_type, work_code, raw_payload, unique_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
        ON CONFLICT (unique_key) DO NOTHING
        RETURNING id
      `,
      randomUUID(),
      deviceId,
      record.userId,
      record.employeeName || null,
      record.timestamp,
      record.punchType || null,
      record.verifyType || null,
      record.workCode || null,
      jsonObject({ serialNumber, rawLine: record.rawLine }),
      uniqueKey
    );

    if ((result as any[]).length) inserted += 1;
  }

  return inserted;
}

async function pendingCommands(deviceId?: string) {
  if (!deviceId) return [];

  const rows = await prisma.$queryRawUnsafe(
    `
      UPDATE zkteco_device_commands
      SET status = 'SENT', sent_at = now(), updated_at = now()
      WHERE id IN (
        SELECT id
        FROM zkteco_device_commands
        WHERE device_id = $1 AND status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 5
      )
      RETURNING command_code, command
    `,
    deviceId
  );

  return rows as Array<{ command_code: string; command: string }>;
}

async function writeDebugLog(input: IclockInput, deviceId: string | undefined, serialNumber: string, responseBody: string) {
  try {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO zkteco_debug_logs (id, device_id, serial_number, method, path, query_params, headers, raw_body, response_body, remote_address)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
      `,
      randomUUID(),
      deviceId || null,
      serialNumber,
      input.method,
      input.pathname,
      jsonObject(Object.fromEntries(input.searchParams.entries())),
      jsonObject(input.headers),
      input.rawBody || null,
      responseBody,
      input.remoteAddress || null
    );
  } catch {
    // Debug logging must never block the device response.
  }
}

export async function handleZktecoIclock(input: IclockInput) {
  const serialNumber = serialFrom(input);
  let deviceId: string | undefined;
  let responseBody = "OK";

  try {
    deviceId = await upsertDevice(serialNumber, requestIp(input, serialNumber));
    const action = (input.pathname.split("/").filter(Boolean).pop()?.toLowerCase() || "").replace(/\.aspx$/, "");

    if (action === "cdata" && input.method === "GET" && input.searchParams.get("options") === "all") {
      responseBody = optionResponse(serialNumber);
    } else if (action === "getrequest") {
      const commands = await pendingCommands(deviceId);
      responseBody = commands.length
        ? commands.map((command) => `C:${command.command_code}:${command.command}`).join("\n")
        : "OK";
    } else if (action === "devicecmd") {
      responseBody = "OK";
    } else if (action === "registry" || action === "ping") {
      responseBody = "OK";
    } else if (action === "cdata" && input.method === "POST") {
      await saveEmployees(deviceId as string, serialNumber, input.rawBody);
      await saveAttendance(deviceId as string, serialNumber, input.rawBody);
      responseBody = "OK";
    } else {
      responseBody = input.method === "GET" ? "OK" : "OK";
    }
  } catch {
    responseBody = "OK";
  }

  await writeDebugLog(input, deviceId, serialNumber, responseBody);
  return plain(responseBody);
}

export async function requestToIclockInput(request: Request, pathOverride?: string) {
  const url = new URL(request.url);
  return {
    method: request.method.toUpperCase(),
    pathname: pathOverride || url.pathname,
    searchParams: url.searchParams,
    headers: Object.fromEntries(request.headers.entries()),
    rawBody: request.method.toUpperCase() === "GET" ? "" : await request.text(),
    remoteAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  };
}
