# Base Agency ZKTeco Local Bridge

This bridge runs on the office PC and receives ADMS/iClock traffic from the ZKTeco SpeedFace V5L. It forwards the exact request path, query string, method, headers, and raw body to the hosted Base Agency website.

## 1. Configure

Copy `.env.example` to `.env`:

```env
PUBLIC_BASE_URL=https://YOUR-WEBSITE-DOMAIN.com
BRIDGE_SECRET=change-this-secret
PORT=8081
```

Use the same `BRIDGE_SECRET` on the hosted website.

## 2. Start

```powershell
npm start
```

The bridge listens on:

```text
0.0.0.0:8081
```

## 3. SpeedFace V5L Cloud Server Settings

Set the device to:

```text
Server Mode: ADMS
Enable Domain Name: OFF
Server Address: 192.168.1.100
Server Port: 8081
Proxy: OFF
```

## 4. Test

From the office network, open:

```text
http://192.168.1.100:8081/iclock/ping?SN=SYZ8254200145
```

The response should be plain text:

```text
OK
```

Then check:

```text
/admin/attendance/debug
```

Make one real face or fingerprint punch and confirm it appears in `/admin/attendance`.
