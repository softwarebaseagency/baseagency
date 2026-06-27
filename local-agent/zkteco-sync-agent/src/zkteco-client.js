import { execFile } from "node:child_process";
import net from "node:net";
import { promisify } from "node:util";
import ZKLibPackage from "zklib-js";
import { config } from "./config.js";

const execFileAsync = promisify(execFile);
const ZKLib = ZKLibPackage.default || ZKLibPackage;
const SOCKET_TIMEOUT_MS = 10000;
const IN_PORT = 5200;

function normalizeArray(result, preferredKeys) {
  if (Array.isArray(result)) return result;

  for (const key of preferredKeys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  return [];
}

export function normalizeUser(user) {
  return {
    zktecoUserId: String(user.userId ?? user.user_id ?? user.uid ?? user.id ?? ""),
    name: user.name ?? user.username ?? null,
    cardNumber: user.cardno ?? user.cardNumber ?? user.card_number ?? null,
    privilege: user.privilege ?? user.role ?? null,
    rawPayload: user
  };
}

export function normalizeAttendanceLog(log) {
  const timestamp = log.recordTime ?? log.timestamp ?? log.attendanceTimestamp ?? log.time ?? log.date;

  return {
    zktecoUserId: String(log.userId ?? log.user_id ?? log.uid ?? log.id ?? ""),
    employeeName: log.name ?? log.employeeName ?? null,
    attendanceTimestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    punchType: log.type ?? log.punchType ?? log.status ?? null,
    verifyType: log.verifyType ?? log.verify_type ?? null,
    workCode: log.workCode ?? log.work_code ?? null,
    rawPayload: log
  };
}

function attachFriendlyError(error, code, message) {
  error.code = code;
  error.friendlyMessage = message;
  return error;
}

function classifyDeviceError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  if (message.includes("comm") || message.includes("key") || message.includes("password")) {
    return { code: "WRONG_COMM_KEY", message: "wrong comm key" };
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return { code: "TIMEOUT", message: "device protocol timeout" };
  }

  if (message.includes("udp") || message.includes("econnreset")) {
    return { code: "UDP_BLOCKED", message: "UDP blocked or no UDP reply from device" };
  }

  if (message.includes("unsupported") || message.includes("invalid packet") || message.includes("malformed")) {
    return { code: "UNSUPPORTED_PROTOCOL", message: "unsupported device protocol" };
  }

  if (message.includes("ehostunreach") || message.includes("enotfound") || message.includes("econnrefused")) {
    return { code: "WRONG_IP", message: "wrong IP or device unreachable" };
  }

  return { code: "SDK_LIBRARY_ERROR", message: `SDK/library error: ${error?.message || error}` };
}

function applySdkOptions(zk) {
  for (const property of ["commKey", "communicationKey", "password"]) {
    try {
      zk[property] = config.commKey;
    } catch {
      // Some SDK versions expose read-only fields.
    }
  }
}

function createClient({ udp }) {
  try {
    return new ZKLib(
      config.deviceIp,
      config.devicePort,
      SOCKET_TIMEOUT_MS,
      IN_PORT,
      config.commKey,
      udp
    );
  } catch {
    return new ZKLib(config.deviceIp, config.devicePort, SOCKET_TIMEOUT_MS, IN_PORT);
  }
}

async function openProtocolConnection({ udp }) {
  const zk = createClient({ udp });
  applySdkOptions(zk);

  try {
    if (udp && zk.zklibUdp?.createSocket && zk.zklibUdp?.connect) {
      await zk.zklibUdp.createSocket();
      await zk.zklibUdp.connect();
      zk.connectionType = "udp";
      return zk;
    }

    if (!udp && zk.zklibTcp?.createSocket && zk.zklibTcp?.connect) {
      await zk.zklibTcp.createSocket();
      await zk.zklibTcp.connect();
      zk.connectionType = "tcp";
      return zk;
    }

    if (typeof zk.createSocket !== "function") {
      throw attachFriendlyError(
        new Error("Installed zklib-js package does not expose createSocket()."),
        "SDK_LIBRARY_ERROR",
        "SDK/library error"
      );
    }

    await zk.createSocket();
    return zk;
  } catch (error) {
    try {
      if (udp) await zk.zklibUdp?.disconnect?.();
      else await zk.zklibTcp?.disconnect?.();
    } catch {
      // Failed connection attempts can leave half-open sockets in some SDK versions.
    }
    throw error;
  }
}

export async function checkPingReachability() {
  try {
    const { stdout } = await execFileAsync("ping", ["-n", "1", "-w", "1000", config.deviceIp]);
    return /ttl=/i.test(stdout) || /bytes=/i.test(stdout);
  } catch {
    return false;
  }
}

export function checkRawTcp() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: config.deviceIp, port: config.devicePort });
    let settled = false;

    const done = (ok, error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, error });
    };

    socket.setTimeout(2500);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false, new Error("raw TCP timeout")));
    socket.once("error", (error) => done(false, error));
  });
}

export async function connectZktecoProtocol({ debug = false } = {}) {
  const modes = config.forceUdp
    ? [{ udp: true, label: "UDP/ZKTeco protocol" }, { udp: false, label: "TCP/ZKTeco protocol" }]
    : [{ udp: false, label: "TCP/ZKTeco protocol" }, { udp: true, label: "UDP/ZKTeco protocol" }];
  let lastError;
  const failures = [];

  for (const mode of modes) {
    console.log(`[device] Trying ${mode.label}`);

    try {
      const zk = await openProtocolConnection(mode);
      console.log("[device] ZKTeco protocol connected");
      return zk;
    } catch (error) {
      lastError = error;
      const classified = classifyDeviceError(error);
      failures.push({ mode, error, classified });
      if (debug) console.log(`[device] ${mode.label} failed: ${error.stack || error.message || error}`);
      else console.log(`[device] ${mode.label} failed: ${classified.message}`);
    }
  }

  const primaryFailure = config.forceUdp
    ? failures.find((failure) => failure.mode.udp) || failures.at(-1)
    : failures.at(-1);
  const primaryError = primaryFailure?.error || lastError || new Error("ZKTeco protocol connection failed");
  const classified = primaryFailure?.classified || classifyDeviceError(primaryError);
  const details = failures
    .map((failure) => `${failure.mode.label}: ${failure.error?.message || failure.error}`)
    .join("; ");
  if (details) {
    primaryError.message = `${primaryError.message || primaryError}; attempts: ${details}`;
  }
  throw attachFriendlyError(primaryError, classified.code, classified.message);
}

export async function withDevice(callback, options = {}) {
  let zk;

  try {
    zk = await connectZktecoProtocol(options);
    return await callback(zk);
  } catch (error) {
    if (!error.friendlyMessage) {
      const classified = classifyDeviceError(error);
      attachFriendlyError(error, classified.code, classified.message);
    }
    throw error;
  } finally {
    if (zk) {
      try {
        await zk.disconnect();
      } catch {
        // The socket may already be closed after a failed connection.
      }
    }
  }
}

export async function testDeviceConnection({ debug = false } = {}) {
  return withDevice(async () => true, { debug });
}

export async function fetchDeviceData(options = {}) {
  return withDevice(async (zk) => {
    const [usersResult, attendanceResult] = await Promise.all([
      zk.getUsers(),
      zk.getAttendances()
    ]);

    const users = normalizeArray(usersResult, ["users"]).map(normalizeUser).filter((user) => user.zktecoUserId);
    const logs = normalizeArray(attendanceResult, ["attendance", "attendances", "logs"])
      .map(normalizeAttendanceLog)
      .filter((log) => log.zktecoUserId);

    return { users, logs };
  }, options);
}

export class ZktecoAdapter {
  constructor(options = {}) {
    this.options = options;
    this.client = null;
  }

  async connect() {
    this.client = await connectZktecoProtocol(this.options);
    return true;
  }

  async disconnect() {
    if (!this.client) return;
    try {
      await this.client.disconnect();
    } finally {
      this.client = null;
    }
  }

  async testConnection() {
    await this.connect();
    await this.disconnect();
    return true;
  }

  async getDeviceInfo() {
    if (!this.client) await this.connect();
    const info = {};

    for (const [key, method] of [
      ["serialNumber", "getSerialNumber"],
      ["deviceName", "getDeviceName"],
      ["firmware", "getFirmware"],
      ["platform", "getPlatform"],
      ["os", "getOS"]
    ]) {
      try {
        if (typeof this.client[method] === "function") {
          info[key] = await this.client[method]();
        }
      } catch (error) {
        info[`${key}Error`] = error.message || String(error);
      }
    }

    return info;
  }

  async getUsers() {
    if (!this.client) await this.connect();
    const result = await this.client.getUsers();
    return normalizeArray(result, ["users"]).map(normalizeUser).filter((user) => user.zktecoUserId);
  }

  async getAttendanceLogs() {
    if (!this.client) await this.connect();
    const result = await this.client.getAttendances();
    return normalizeArray(result, ["attendance", "attendances", "logs"])
      .map(normalizeAttendanceLog)
      .filter((log) => log.zktecoUserId);
  }

  normalizeAttendanceLog(log) {
    return normalizeAttendanceLog(log);
  }

  normalizeUser(user) {
    return normalizeUser(user);
  }
}
