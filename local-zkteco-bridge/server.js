const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, ".env");
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const LOCAL_HOST = process.env.LOCAL_HOST || "0.0.0.0";
const LOCAL_PORT = Number(process.env.LOCAL_PORT || 8081);
const WEBSITE_URL = (process.env.WEBSITE_URL || "").replace(/\/$/, "");
const ZK_BRIDGE_SECRET = process.env.ZK_BRIDGE_SECRET || "";
const DEVICE_NAME = process.env.DEVICE_NAME || "ZKTeco SpeedFace V5L";
const DEVICE_LOCATION = process.env.DEVICE_LOCATION || "Base Agency Office";
const DEVICE_MODEL = process.env.DEVICE_MODEL || "SpeedFace V5L";

function log(message, details) {
  const suffix = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[${new Date().toISOString()}] ${message}${suffix}`);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function parseKeyValueLine(line) {
  const record = {};
  for (const part of line.split(/\s+/)) {
    const [key, ...rest] = part.split("=");
    if (!key || !rest.length) continue;
    record[key.toLowerCase()] = rest.join("=");
  }
  return record;
}

function parseTabLine(line) {
  const parts = line.split(/\t+/).map((item) => item.trim());
  if (parts.length < 2) return null;

  return {
    employeeCode: parts[0],
    timestamp: parts[1],
    punchType: parts[2] || null,
    verifyType: parts[3] || null,
    workCode: parts[4] || null
  };
}

function parseAdmsRecords(body, serialNumber) {
  const records = [];

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const kv = parseKeyValueLine(line);
    const tab = parseTabLine(line);
    const employeeCode = kv.pin || kv.user_id || kv.userid || kv.uid || tab?.employeeCode;
    const timestamp = kv.time || kv.timestamp || kv.datetime || tab?.timestamp;

    if (!employeeCode || !timestamp) {
      log("Invalid ADMS line skipped", { serialNumber, line });
      continue;
    }

    // ZKTeco ADMS payload formats vary by firmware. Preserve the full line
    // while normalizing the stable fields needed by the website API.
    records.push({
      employeeCode,
      name: kv.name || null,
      deviceSerialNumber: serialNumber,
      deviceName: DEVICE_NAME,
      timestamp,
      punchType: kv.status || kv.punch || kv.punchtype || tab?.punchType || null,
      rawPayload: { line, parsed: kv }
    });
  }

  return records;
}

async function forwardRecords({ serialNumber, ipAddress, records }) {
  if (!WEBSITE_URL || !ZK_BRIDGE_SECRET) {
    throw new Error("WEBSITE_URL and ZK_BRIDGE_SECRET must be configured in .env");
  }

  const response = await fetch(`${WEBSITE_URL}/api/zkteco/attendance/push`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ZK_BRIDGE_SECRET}`
    },
    body: JSON.stringify({
      device: {
        serialNumber,
        name: DEVICE_NAME,
        ipAddress,
        port: LOCAL_PORT,
        model: DEVICE_MODEL,
        location: DEVICE_LOCATION
      },
      records
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Website API rejected attendance push (${response.status}): ${text}`);
  }

  return text;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const serialNumber = url.searchParams.get("SN") || url.searchParams.get("sn") || request.headers["x-zk-sn"] || "UNKNOWN-SERIAL";
  const ipAddress = request.socket.remoteAddress;

  try {
    if (request.method === "GET") {
      log("Device request received", { method: request.method, path: url.pathname, serialNumber, ipAddress });
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("OK");
      return;
    }

    if (request.method !== "POST") {
      response.writeHead(405, { "content-type": "text/plain" });
      response.end("Method Not Allowed");
      return;
    }

    const body = await readBody(request);
    log("ADMS payload received", { path: url.pathname, serialNumber, bytes: Buffer.byteLength(body) });

    const records = parseAdmsRecords(body, String(serialNumber));

    if (!records.length) {
      log("Invalid payload", { serialNumber });
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("OK");
      return;
    }

    await forwardRecords({ serialNumber: String(serialNumber), ipAddress, records });
    log("Data forwarded successfully", { serialNumber, count: records.length });
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("OK");
  } catch (error) {
    log("Forwarding failed", { message: error.message });
    response.writeHead(500, { "content-type": "text/plain" });
    response.end("ERROR");
  }
});

server.listen(LOCAL_PORT, LOCAL_HOST, () => {
  log("Bridge started", { host: LOCAL_HOST, port: LOCAL_PORT, websiteUrl: WEBSITE_URL || "not configured" });
});
