import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const cachePath = resolve("data", "sync-cache.json");

const emptyCache = {
  lastSuccessfulSyncAt: null,
  lastFetchedLogTimestamp: null,
  pendingUsers: [],
  pendingAttendance: []
};

export async function loadCache() {
  try {
    const content = await readFile(cachePath, "utf8");
    return { ...emptyCache, ...JSON.parse(content) };
  } catch {
    return { ...emptyCache };
  }
}

export async function saveCache(cache) {
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify({ ...emptyCache, ...cache }, null, 2));
}

export async function markSuccessfulSync(cache, logs) {
  const timestamps = logs
    .map((log) => log.attendanceTimestamp || log.timestamp)
    .filter(Boolean)
    .map((value) => new Date(value).toISOString())
    .sort();

  await saveCache({
    ...cache,
    lastSuccessfulSyncAt: new Date().toISOString(),
    lastFetchedLogTimestamp: timestamps.at(-1) || cache.lastFetchedLogTimestamp,
    pendingUsers: [],
    pendingAttendance: []
  });
}
