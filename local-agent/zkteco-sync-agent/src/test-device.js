import { config, logLoadedConfig } from "./config.js";
import { checkPingReachability, checkRawTcp, testDeviceConnection } from "./zkteco-client.js";

try {
  const debug = process.argv.includes("--debug") || process.env.ZKTECO_DEBUG === "true";

  logLoadedConfig();
  console.log(`[device] Testing ${config.deviceIp}:${config.devicePort}`);
  console.log(`[device] Communication key: ${config.commKey}`);
  console.log(`[device] Force UDP: ${config.forceUdp}`);

  const pingWorks = await checkPingReachability();
  console.log(pingWorks ? "Ping works" : "Ping failed or unavailable from this shell");

  const tcp = await checkRawTcp();
  console.log(tcp.ok ? "TCP raw socket connected" : "TCP raw socket failed");

  if (!tcp.ok) {
    console.log("Raw TCP socket failed. This can be normal for some ZKTeco devices.");
    if (pingWorks) {
      console.log(
        "Ping works, but TCP port 4370 is closed or blocked. The device is reachable on the network, but the ZKTeco communication service is not accepting connections. Check device TCP/IP settings, port, communication key, firewall, router isolation, or whether another software is already connected."
      );
    }
    console.log("Trying ZKTeco protocol / UDP mode");
  }

  await testDeviceConnection({ debug });
  console.log("[device] Connection successful");
} catch (error) {
  const message = error.friendlyMessage || error.message || "device connection failed";
  console.log(`[device] ${message}`);
  if (error.code) console.log(`[device] Error code: ${error.code}`);
  if (error.message) console.log(`[device] Exact error: ${error.message}`);
  process.exitCode = 1;
}
