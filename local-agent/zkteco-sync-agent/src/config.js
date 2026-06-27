import "dotenv/config";

export function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required. Add it to local-agent/zkteco-sync-agent/.env`);
  }

  return value;
}

export const config = {
  deviceIp: process.env.ZKTECO_IP || "192.168.1.201",
  devicePort: Number(process.env.ZKTECO_PORT || 4370),
  commKey: Number(process.env.ZKTECO_COMM_KEY || 0),
  forceUdp: String(process.env.ZKTECO_FORCE_UDP || "true").toLowerCase() === "true",
  vercelAppUrl: process.env.VERCEL_APP_URL?.replace(/\/$/, "") || "",
  syncSecret: process.env.ZKTECO_SYNC_SECRET || "",
  syncIntervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES || 5),
  deviceName: process.env.ZKTECO_DEVICE_NAME || "Base Agency ZKTeco"
};

export function logLoadedConfig() {
  console.log("[config] Loaded local agent config");
  console.log(`[config] ZKTeco IP: ${config.deviceIp}`);
  console.log(`[config] ZKTeco port: ${config.devicePort}`);
  console.log(`[config] Communication key configured: ${Number.isFinite(config.commKey) ? "yes" : "no"}`);
  console.log(`[config] Force UDP: ${config.forceUdp}`);
  console.log(`[config] Vercel app URL: ${config.vercelAppUrl || "not configured"}`);
  console.log(`[config] Sync secret configured: ${config.syncSecret ? "yes" : "no"}`);
  console.log(`[config] Sync interval minutes: ${config.syncIntervalMinutes}`);
}

export function devicePayload() {
  return {
    name: config.deviceName,
    ipAddress: config.deviceIp,
    port: config.devicePort
  };
}
