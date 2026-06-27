# ZKTeco SpeedFace V5L ADMS Setup

This system receives ZKTeco SpeedFace V5L attendance directly through ADMS/iClock. BioTime is not required.

## 1. Run the website migration

Run Prisma migration for the hosted PostgreSQL database:

```powershell
npm run prisma:migrate
```

For production deployment, run the production migration command used by the host.

## 2. Set environment variables

Set these on the website host:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
BRIDGE_SECRET=use-a-long-random-secret
```

`ZK_BRIDGE_SECRET` is also accepted for compatibility, but `BRIDGE_SECRET` is preferred.

## 3. Start the local bridge on the office PC

In `tools/zkteco-bridge`, create `.env`:

```env
PUBLIC_BASE_URL=https://YOUR-WEBSITE-DOMAIN.com
BRIDGE_SECRET=use-the-same-secret-as-the-website
PORT=8081
```

Then start it:

```powershell
npm start
```

## 4. Set SpeedFace Cloud Server

On the SpeedFace V5L:

```text
Server Mode: ADMS
Enable Domain Name: OFF
Server Address: 192.168.1.100
Server Port: 8081
Proxy: OFF
```

Device serial number:

```text
SYZ8254200145
```

On first contact, the website automatically registers it as:

```text
Name: Base Agency SpeedFace V5L
IP: 192.168.1.201
Status: online
```

## 5. Test ping and browser

From the office PC or LAN:

```text
http://192.168.1.100:8081/iclock/ping?SN=SYZ8254200145
```

Expected response:

```text
OK
```

For iClock options:

```text
http://192.168.1.100:8081/iclock/cdata?SN=SYZ8254200145&options=all
```

Expected response starts with:

```text
GET OPTION FROM: SYZ8254200145
```

## 6. Check debug logs

Open:

```text
/admin/attendance/debug
```

Every device request is logged with method, path, query parameters, headers, raw body, serial number, response body, IP, and timestamp.

## 7. Confirm a real punch

Make one face or fingerprint punch on the SpeedFace V5L. Then refresh:

```text
/admin/attendance
```

The dashboard counts, table, filters, export, print, and debug page should show real database data only.
