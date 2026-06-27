import { config } from "./config.js";

function classifyApiError(status, payload) {
  if (status === 401) return "API token invalid";
  if (status === 404) return "Wrong API endpoint";
  if (status >= 500) return payload?.message ? `Server/database error: ${payload.message}` : "Server/database error";
  return payload?.message || `Vercel API unavailable (${status})`;
}

export async function postJson(path, body, { debug = false } = {}) {
  if (!config.vercelAppUrl) {
    throw new Error("VERCEL_APP_URL is required for sync. Add it to local-agent/zkteco-sync-agent/.env");
  }

  if (!config.syncSecret) {
    throw new Error("ZKTECO_SYNC_SECRET is required for sync. Add it to local-agent/zkteco-sync-agent/.env");
  }

  const url = `${config.vercelAppUrl}${path}`;
  console.log(`[api] POST ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-zkteco-sync-secret": config.syncSecret
    },
    body: JSON.stringify(body)
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  console.log(`[api] Response status: ${response.status}`);
  console.log(`[api] Response body: ${JSON.stringify(payload)}`);

  if (!response.ok) {
    const message = classifyApiError(response.status, payload);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (debug) console.log(`[api] ${path} accepted`);
  return payload;
}

export async function sendUsers(payload, options) {
  return postJson("/api/zkteco/sync/users", payload, options);
}

export async function sendAttendance(payload, options) {
  return postJson("/api/zkteco/sync/attendance", payload, options);
}

export async function sendStatus(payload, options) {
  return postJson("/api/zkteco/sync/status", payload, options);
}
