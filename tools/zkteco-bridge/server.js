const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function collectBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function appendBridgeLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(path.join(__dirname, "requests.log"), line, () => {});
  console.log(line.trim());
}

function targetUrl(requestUrl) {
  const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (!base) throw new Error("PUBLIC_BASE_URL is missing.");
  const url = new URL(requestUrl, "http://local-device");
  return `${base}/api/zkteco/bridge${url.pathname}${url.search}`;
}

function forwardedHeaders(request, body) {
  const headers = { ...request.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];
  delete headers["accept-encoding"];

  headers.authorization = `Bearer ${process.env.BRIDGE_SECRET || ""}`;
  headers["x-zkteco-bridge"] = "base-agency-local-bridge";
  headers["x-zkteco-device-ip"] = request.socket.remoteAddress || "";
  headers["x-forwarded-host"] = request.headers.host || "";
  headers["x-forwarded-proto"] = "http";
  if (body.length) headers["content-length"] = String(body.length);

  return headers;
}

async function forward(request, response) {
  try {
    if (!process.env.BRIDGE_SECRET) throw new Error("BRIDGE_SECRET is missing.");

    const body = await collectBody(request);
    const remoteIp = request.socket.remoteAddress || "";
    appendBridgeLog(`${remoteIp} ${request.method} ${request.url} body=${body.length}`);

    const upstream = await fetch(targetUrl(request.url), {
      method: request.method,
      headers: forwardedHeaders(request, body),
      body: request.method === "GET" || request.method === "HEAD" ? undefined : body,
      redirect: "manual"
    });

    const text = await upstream.text();
    appendBridgeLog(`${remoteIp} -> website status=${upstream.status} response=${JSON.stringify(text.slice(0, 120))}`);
    response.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") || "text/plain; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end(text);
  } catch (error) {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Bridge error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

loadEnv();

const port = Number(process.env.PORT || 8081);
const server = http.createServer(forward);

server.listen(port, "0.0.0.0", () => {
  console.log(`Base Agency ZKTeco bridge listening on 0.0.0.0:${port}`);
});
