import { runSync } from "./sync.js";

const debug = process.argv.includes("--debug") || process.env.ZKTECO_DEBUG === "true";
const result = await runSync({ debug });

if (!result.ok) {
  process.exitCode = 1;
}
