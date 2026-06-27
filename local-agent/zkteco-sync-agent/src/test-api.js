import { config, devicePayload, logLoadedConfig } from "./config.js";
import { postJson } from "./api-client.js";

const batchId = `api-test-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;

try {
  logLoadedConfig();
  console.log("[api-test] Testing Vercel API sync status endpoint");

  const response = await postJson(
    "/api/zkteco/sync/status",
    {
      batchId,
      device: devicePayload(),
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status: "PENDING",
      logsFetched: 0,
      logsInserted: 0,
      duplicatesSkipped: 0,
      usersFetched: 0,
      usersInserted: 0,
      errorCode: null,
      errorMessage: "Local API connectivity test"
    },
    { debug: true }
  );

  console.log(`[api-test] API reachable: ${Boolean(response?.success)}`);
} catch (error) {
  console.log(`[api-test] Failed: ${error.message}`);

  if (error.status === 401) console.log("[api-test] 401 token mismatch. Check ZKTECO_SYNC_SECRET in Vercel and local .env.");
  else if (error.status === 404) console.log("[api-test] 404 wrong endpoint or wrong Vercel app URL.");
  else if (error.status >= 500) console.log("[api-test] 500 server/database error. Check DATABASE_URL, migration, and Vercel logs.");
  else if (!config.vercelAppUrl) console.log("[api-test] VERCEL_APP_URL is missing.");

  process.exitCode = 1;
}
