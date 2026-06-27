import { devicePayload, logLoadedConfig } from "./config.js";
import { loadCache, markSuccessfulSync, saveCache } from "./cache.js";
import { sendAttendance, sendStatus, sendUsers } from "./api-client.js";
import { fetchDeviceData } from "./zkteco-client.js";

function createBatchId() {
  return `zk-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${Math.random().toString(36).slice(2, 8)}`;
}

async function safeSendStatus(payload) {
  try {
    await sendStatus(payload);
  } catch (error) {
    console.log(`[status] Could not send sync status: ${error.message}`);
  }
}

async function flushPending(cache, batchId, startedAt) {
  if (cache.pendingUsers.length) {
    console.log(`[cache] Sending ${cache.pendingUsers.length} cached users`);
    await sendUsers({
      batchId,
      device: devicePayload(),
      users: cache.pendingUsers
    });
    cache.pendingUsers = [];
  }

  if (cache.pendingAttendance.length) {
    console.log(`[cache] Sending ${cache.pendingAttendance.length} cached attendance logs`);
    await sendAttendance({
      batchId,
      startedAt,
      finishedAt: new Date().toISOString(),
      device: devicePayload(),
      logs: cache.pendingAttendance
    });
    cache.pendingAttendance = [];
  }
}

export async function runSync({ debug = false } = {}) {
  const batchId = createBatchId();
  const startedAt = new Date().toISOString();
  const cache = await loadCache();
  let fetchedUsers = [];
  let fetchedLogs = [];

  console.log(`[sync] Starting ZKTeco sync batch ${batchId}`);
  logLoadedConfig();
  console.log(`[device] Connecting to ${devicePayload().ipAddress}:${devicePayload().port}`);
  console.log("[device] Device connection started");

  try {
    await flushPending(cache, batchId, startedAt);
    const { users, logs } = await fetchDeviceData({ debug });
    fetchedUsers = users;
    fetchedLogs = logs;

    console.log(`[device] Fetched ${users.length} users and ${logs.length} attendance logs`);

    const usersResult = await sendUsers({
      batchId,
      device: devicePayload(),
      users
    }, { debug });

    const attendanceResult = await sendAttendance({
      batchId,
      startedAt,
      finishedAt: new Date().toISOString(),
      device: devicePayload(),
      logs
    }, { debug });

    await sendStatus({
      batchId,
      device: devicePayload(),
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "SUCCESS",
      usersFetched: users.length,
      usersInserted: usersResult?.usersInserted || 0,
      logsFetched: logs.length,
      logsInserted: attendanceResult?.logsInserted || 0,
      duplicatesSkipped: attendanceResult?.duplicatesSkipped || 0
    }, { debug });

    await markSuccessfulSync(cache, logs);

    console.log(
      `[sync] Complete. Inserted ${attendanceResult?.logsInserted || 0}, skipped ${attendanceResult?.duplicatesSkipped || 0} duplicates`
    );

    return { ok: true, batchId };
  } catch (error) {
    const code = error.code || (error.status === 401 ? "API_TOKEN_INVALID" : "FAILED");
    const message = error.friendlyMessage || error.message || "sync failed";

    if (code === "API_TOKEN_INVALID") console.log("[api] API token invalid");
    else if (error.status) console.log("[api] Vercel API unavailable");
    else console.log(`[sync] ${message}`);
    if (debug && error.stack) console.log(error.stack);

    if (error.status && error.status !== 401) {
      cache.pendingUsers = [...(cache.pendingUsers || []), ...fetchedUsers];
      cache.pendingAttendance = [...(cache.pendingAttendance || []), ...fetchedLogs];
      await saveCache(cache);
    }

    await safeSendStatus({
      batchId,
      device: devicePayload(),
      startedAt,
      finishedAt: new Date().toISOString(),
      status: code,
      errorCode: code,
      errorMessage: message
    });

    return { ok: false, batchId, error: message };
  }
}
