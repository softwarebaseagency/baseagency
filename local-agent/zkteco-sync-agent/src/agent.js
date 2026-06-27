import { config, logLoadedConfig } from "./config.js";
import { runSync } from "./sync.js";

const intervalMs = Math.max(config.syncIntervalMinutes, 1) * 60 * 1000;

console.log(`[agent] ZKTeco auto sync started. Interval: ${config.syncIntervalMinutes} minute(s)`);
logLoadedConfig();

async function tick() {
  try {
    await runSync();
  } catch (error) {
    console.log(`[agent] Sync crashed unexpectedly: ${error.message}`);
  }
}

await tick();
setInterval(tick, intervalMs);
