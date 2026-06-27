# Base Agency Local ZKTeco ADMS Bridge

This bridge runs on the Base Agency office PC and receives ADMS requests from the ZKTeco SpeedFace V5L device. It then forwards sanitized attendance records to the deployed Base Agency website API on Vercel.

## Why This Bridge Exists

The ZKTeco device is on the local network and sends ADMS data to `192.168.1.100:8081`. Vercel cannot receive LAN traffic directly. The bridge solves this:

1. SpeedFace V5L sends ADMS traffic to the local PC.
2. The bridge listens on `0.0.0.0:8081`.
3. The bridge parses/preserves the ADMS payload.
4. The bridge forwards records to `{WEBSITE_URL}/api/zkteco/attendance/push`.
5. The website validates `Authorization: Bearer {ZK_BRIDGE_SECRET}` before saving records.

## Install

```powershell
cd local-zkteco-bridge
npm install
```

This bridge uses Node.js built-in modules only, so install is lightweight.

## Configure

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Set:

```env
WEBSITE_URL=https://your-vercel-domain.vercel.app
ZK_BRIDGE_SECRET=the-same-secret-you-add-to-vercel
LOCAL_PORT=8081
LOCAL_HOST=0.0.0.0
DEVICE_NAME=ZKTeco SpeedFace V5L
DEVICE_LOCATION=Base Agency Office
DEVICE_MODEL=SpeedFace V5L
```

## Run

```powershell
npm run dev
```

For production on the PC:

```powershell
npm start
```

## ZKTeco Device ADMS Settings

Set the SpeedFace V5L device:

- ADMS: Enabled
- Server Address: `192.168.1.100`
- Server Port: `8081`
- Protocol: HTTP / ADMS
- Device serial number: keep the real device SN; add it to `ZK_BRIDGE_ALLOWED_DEVICE_SERIALS` on Vercel if you want serial allow-listing.

## Test

With the bridge running:

```powershell
npm run test:push
```

Expected bridge log:

```text
Device request received
ADMS payload received
Data forwarded successfully
```

## Troubleshooting

- Make sure the PC IP is static: `192.168.1.100`.
- Allow inbound Windows Firewall traffic on TCP port `8081`.
- Confirm the device and PC are on the same network.
- Confirm `WEBSITE_URL` points to the deployed website, not localhost.
- Confirm `ZK_BRIDGE_SECRET` exactly matches the Vercel environment variable.
- If Vercel rejects the device, check `ZK_BRIDGE_ALLOWED_DEVICE_SERIALS`.
- Do not put the bridge secret in frontend/browser code.
