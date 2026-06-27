const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    if (!process.env[trimmed.slice(0, separator)]) {
      process.env[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
    }
  }
}

loadEnv();

const host = process.env.LOCAL_HOST === "0.0.0.0" ? "127.0.0.1" : process.env.LOCAL_HOST || "127.0.0.1";
const port = process.env.LOCAL_PORT || 8081;

fetch(`http://${host}:${port}/iclock/cdata?SN=TEST-SPEEDFACE-V5L`, {
  method: "POST",
  headers: { "content-type": "text/plain" },
  body: `PIN=1001 Time=${new Date().toISOString()} Status=0 Name=TestUser`
})
  .then(async (response) => {
    console.log(response.status, await response.text());
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
