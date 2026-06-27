import "dotenv/config";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const configPath = path.join(rootDir, ".agent-config.json");
const port = Number(process.env.ZKTECO_AGENT_UI_PORT || 8787);
const logs = [];
let running = false;
let lastSuccess = null;

function pushLog(message) {
  const line = `[${new Date().toLocaleTimeString()}] ${message}`;
  logs.push(line);
  if (logs.length > 500) logs.shift();
  console.log(line);
}

function redact(value) {
  return value ? "configured" : "";
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

async function loadUiConfig() {
  const stored = existsSync(configPath)
    ? JSON.parse(await readFile(configPath, "utf8"))
    : {};

  return {
    ZKTECO_IP: stored.ZKTECO_IP || process.env.ZKTECO_IP || config.deviceIp,
    ZKTECO_PORT: stored.ZKTECO_PORT || process.env.ZKTECO_PORT || String(config.devicePort),
    ZKTECO_COMM_KEY: stored.ZKTECO_COMM_KEY || process.env.ZKTECO_COMM_KEY || String(config.commKey),
    ZKTECO_FORCE_UDP: stored.ZKTECO_FORCE_UDP || process.env.ZKTECO_FORCE_UDP || String(config.forceUdp),
    VERCEL_APP_URL: stored.VERCEL_APP_URL || process.env.VERCEL_APP_URL || config.vercelAppUrl,
    ZKTECO_SYNC_SECRET: stored.ZKTECO_SYNC_SECRET || process.env.ZKTECO_SYNC_SECRET || config.syncSecret,
    SYNC_INTERVAL_MINUTES: stored.SYNC_INTERVAL_MINUTES || process.env.SYNC_INTERVAL_MINUTES || String(config.syncIntervalMinutes)
  };
}

async function saveUiConfig(nextConfig) {
  const current = await loadUiConfig();
  const merged = {
    ...current,
    ...nextConfig,
    ZKTECO_FORCE_UDP: String(nextConfig.ZKTECO_FORCE_UDP ?? current.ZKTECO_FORCE_UDP) === "true" ? "true" : "false"
  };
  await writeFile(configPath, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

function publicConfig(configValues) {
  return {
    ...configValues,
    ZKTECO_SYNC_SECRET: redact(configValues.ZKTECO_SYNC_SECRET)
  };
}

function runCommand(script, { debug = false } = {}) {
  return new Promise(async (resolve) => {
    if (running) {
      resolve({ ok: false, message: "Another agent command is already running." });
      return;
    }

    running = true;
    const envConfig = await loadUiConfig();
    const args = script === "sync:debug" ? ["src/sync-now.js", "--debug"] : [`src/${script}.js`];
    const child = spawn("node", args, {
      cwd: rootDir,
      env: { ...process.env, ...envConfig, ZKTECO_DEBUG: debug ? "true" : process.env.ZKTECO_DEBUG || "" },
      windowsHide: true
    });

    pushLog(`Started ${script}`);
    child.stdout.on("data", (chunk) => pushLog(chunk.toString().trim()));
    child.stderr.on("data", (chunk) => pushLog(chunk.toString().trim()));
    child.on("close", (code) => {
      running = false;
      if (code === 0 && (script === "sync-now" || script === "sync:debug")) lastSuccess = new Date().toISOString();
      pushLog(`${script} finished with exit code ${code}`);
      resolve({ ok: code === 0, code });
    });
  });
}

function html() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Base Agency ZKTeco Local Agent</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Segoe UI, Arial, sans-serif; background: #f5f3ed; color: #191714; }
    body { margin: 0; }
    main { max-width: 1120px; margin: 0 auto; padding: 28px; }
    header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 18px; }
    h1 { margin: 0; font-size: 28px; }
    p { color: #5f5a51; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .card { background: #fff; border: 1px solid #ddd7ca; border-radius: 8px; padding: 18px; }
    label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #403c35; }
    input, select { height: 40px; border: 1px solid #cfc6b6; border-radius: 6px; padding: 0 10px; font: inherit; }
    button { border: 1px solid #191714; background: #191714; color: #fff; border-radius: 6px; height: 40px; padding: 0 14px; font-weight: 800; cursor: pointer; }
    button.secondary { background: #fff; color: #191714; }
    button:disabled { opacity: .55; cursor: wait; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .status { display: grid; gap: 8px; font-size: 14px; }
    pre { background: #14120f; color: #f8f0dd; padding: 14px; border-radius: 8px; min-height: 260px; overflow: auto; white-space: pre-wrap; }
    .note { border-left: 4px solid #d9a520; padding-left: 12px; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } header { display: block; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Base Agency ZKTeco Local Agent</h1>
        <p>Run this on the Windows PC connected to the same LAN as the ZKTeco device. The cloud app cannot read local IP devices directly.</p>
      </div>
      <div class="card status">
        <strong>Agent status</strong>
        <span id="running">Loading...</span>
        <span id="lastSuccess">Last successful sync: -</span>
      </div>
    </header>

    <section class="grid">
      <div class="card">
        <h2>Device and API settings</h2>
        <div class="grid">
          <label>Device IP<input id="ZKTECO_IP" value="192.168.1.201" /></label>
          <label>Port<input id="ZKTECO_PORT" value="4370" /></label>
          <label>Communication key<input id="ZKTECO_COMM_KEY" value="0" /></label>
          <label>Force UDP<select id="ZKTECO_FORCE_UDP"><option value="true">true</option><option value="false">false</option></select></label>
          <label>Backend API URL<input id="VERCEL_APP_URL" placeholder="https://your-app.vercel.app" /></label>
          <label>API token/key<input id="ZKTECO_SYNC_SECRET" type="password" placeholder="Leave blank to keep existing" /></label>
          <label>Sync interval minutes<input id="SYNC_INTERVAL_MINUTES" value="5" /></label>
        </div>
        <div class="actions">
          <button onclick="saveConfig()">Save settings</button>
          <button class="secondary" onclick="loadConfig()">Reload</button>
        </div>
      </div>

      <div class="card">
        <h2>Actions</h2>
        <p class="note">If ping works but TCP 4370 fails, the device is reachable but the ZKTeco communication service may be closed, blocked, password-protected, or using UDP/protocol mode.</p>
        <div class="actions">
          <button onclick="run('test-device')">Test Ping / TCP / ZKTeco Protocol</button>
          <button onclick="run('test-api')">Test Backend API</button>
          <button onclick="run('sync:debug')">Manual Sync With Debug Logs</button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:14px">
      <h2>Logs</h2>
      <pre id="logs"></pre>
    </section>
  </main>
  <script>
    const fields = ["ZKTECO_IP","ZKTECO_PORT","ZKTECO_COMM_KEY","ZKTECO_FORCE_UDP","VERCEL_APP_URL","ZKTECO_SYNC_SECRET","SYNC_INTERVAL_MINUTES"];
    async function api(path, options) {
      const response = await fetch(path, options);
      return response.json();
    }
    async function loadConfig() {
      const data = await api("/api/config");
      for (const field of fields) {
        if (field === "ZKTECO_SYNC_SECRET") continue;
        document.getElementById(field).value = data.config[field] || "";
      }
      document.getElementById("running").textContent = data.running ? "Running command..." : "Idle";
      document.getElementById("lastSuccess").textContent = "Last successful sync: " + (data.lastSuccess || "-");
    }
    async function saveConfig() {
      const payload = {};
      for (const field of fields) {
        const value = document.getElementById(field).value;
        if (field === "ZKTECO_SYNC_SECRET" && !value) continue;
        payload[field] = value;
      }
      await api("/api/config", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      await loadConfig();
      await refreshLogs();
    }
    async function run(name) {
      await api("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      await refreshLogs();
    }
    async function refreshLogs() {
      const data = await api("/api/logs");
      document.getElementById("logs").textContent = data.logs.join("\\n");
      document.getElementById("running").textContent = data.running ? "Running command..." : "Idle";
      document.getElementById("lastSuccess").textContent = "Last successful sync: " + (data.lastSuccess || "-");
    }
    loadConfig(); refreshLogs(); setInterval(refreshLogs, 1500);
  </script>
</body>
</html>`;
}

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(body));
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/config") {
      json(response, 200, { config: publicConfig(await loadUiConfig()), running, lastSuccess });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/config") {
      const saved = await saveUiConfig(await readJsonBody(request));
      pushLog("Saved local agent settings");
      json(response, 200, { success: true, config: publicConfig(saved) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/run") {
      const body = await readJsonBody(request);
      const commands = {
        "test-device": "test-device",
        "test-api": "test-api",
        "sync:debug": "sync:debug"
      };
      if (!commands[body.name]) {
        json(response, 400, { success: false, message: "Unsupported command" });
        return;
      }
      runCommand(commands[body.name], { debug: body.name === "sync:debug" });
      json(response, 202, { success: true, message: "Command started" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/logs") {
      json(response, 200, { logs, running, lastSuccess });
      return;
    }

    json(response, 404, { success: false, message: "Not found" });
  } catch (error) {
    pushLog(error instanceof Error ? error.message : String(error));
    json(response, 500, { success: false, message: error instanceof Error ? error.message : "Local agent UI error" });
  }
}).listen(port, "127.0.0.1", () => {
  pushLog(`Local Agent UI ready at http://127.0.0.1:${port}`);
});
