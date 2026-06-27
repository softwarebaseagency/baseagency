# Base Agency System — Netlify Deployment Guide

## Detected project configuration

- Framework: Next.js 14.2 with React 18 and TypeScript
- Router: App Router (`app/`), including dynamic route handlers
- Package manager: pnpm 11.8.0 (`pnpm-lock.yaml`)
- Node.js: 22.x on Netlify
- Build command: `corepack pnpm build`
- Publish directory: `.next`
- Database/ORM: PostgreSQL with Prisma 5
- Authentication/authorization: the existing custom admin role check in `lib/admin-auth.ts`, using the `x-base-role` request header or the `base_role`/`base-agency-role` cookie
- API support: Next.js route handlers under `app/api/`, plus `/iclock` dynamic handlers

Netlify automatically applies its current OpenNext adapter to this Next.js version. It provides SSR, App Router, dynamic routes, API route handlers, and image optimization. Do not configure a static export, an SPA catch-all redirect, or a pinned legacy Next.js plugin.

## Required Netlify build settings

| Setting | Value |
| --- | --- |
| Base directory | Repository root (leave blank in Netlify) |
| Build command | `corepack pnpm build` |
| Publish directory | `.next` |
| Node version | `22` (already set in `netlify.toml`) |

No manual redirect rule or separate Netlify Functions directory is required. The OpenNext adapter converts the existing Next.js route handlers and server-rendered routes into the required Netlify functions.

## Environment variables

Add these in **Netlify > Project configuration > Environment variables**. Apply them to Production and to any Deploy Preview that should use a database. Never paste real values into `.env.example`, `netlify.toml`, or source control.

### Required for the application

| Variable | Purpose | Example format |
| --- | --- | --- |
| `DATABASE_URL` | Production PostgreSQL connection used by Prisma | `postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public` |

The database host must be reachable from Netlify's serverless runtime. Use the connection/pooling URL recommended by the PostgreSQL provider for serverless applications when one is available.

### Required when the corresponding integration is used

| Variable | Purpose |
| --- | --- |
| `BASE_AGENCY_API_KEY` | Protects `POST /api/customers/import` |
| `ZKTECO_SYNC_SECRET` | Protects the ZKTeco sync endpoints |
| `ZK_BRIDGE_SECRET` | Protects attendance pushes from the local ADMS bridge |
| `BRIDGE_SECRET` | Protects the hosted bridge proxy; use the same value as `ZK_BRIDGE_SECRET` |
| `ZK_BRIDGE_ALLOWED_DEVICE_SERIALS` | Optional comma-separated allow-list of device serial numbers; leave unset to disable serial filtering |

Generate independent, long random values for the API and sync secrets. `ZK_BRIDGE_SECRET` and `BRIDGE_SECRET` may intentionally share one value because the local and hosted sides of that bridge must agree.

`NEXT_PUBLIC_APP_URL` is retained in `.env.example` as the canonical public URL for deployment/integration configuration, although the current Next.js application does not read it at runtime. Set it to the final `https://...netlify.app` or custom-domain URL if external tooling uses it.

Do **not** add `ZK_BRIDGE_LOCAL_HOST`, `ZK_BRIDGE_LOCAL_PORT`, or `WEBSITE_ATTENDANCE_PUSH_URL` to Netlify. Those belong to the local ZKTeco bridge. After deployment, set its push URL to:

```text
https://YOUR-SITE.netlify.app/api/zkteco/attendance/push
```

This project does not use NextAuth or Supabase, so `AUTH_SECRET`, `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are not required.

## Database migration

The build generates Prisma Client but deliberately does not mutate the production database. Before the first production deploy, or whenever a new migration is added, run this from a trusted machine or CI environment with the production `DATABASE_URL` set:

```bash
pnpm exec prisma migrate deploy
```

Do not run `prisma migrate dev` against production. Seeding is not part of deployment and must not be run unless production seed data is explicitly wanted.

## Deploy from Git (recommended when CLI credentials are unavailable)

1. Push the project to a private GitHub repository. Confirm `.env` and `.env.local` are not committed. If `git status` reports that this is not a repository, initialize or reconnect the workspace to the intended private repository first; do not upload the folder manually with secret files included.
2. Sign in to Netlify and choose **Add new project > Import an existing project**.
3. Select GitHub and choose the repository.
4. Keep the base directory at the repository root.
5. Confirm build command `corepack pnpm build` and publish directory `.next`.
6. Add the environment variables listed above.
7. Run `pnpm exec prisma migrate deploy` against the production database.
8. Choose **Deploy** and inspect the deploy log before publishing or attaching a custom domain.

## Deploy with Netlify CLI

For an already-created Netlify project, make `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` available only in the local shell or secret store. Do not save them in project files.

```bash
pnpm dlx netlify-cli deploy --build
pnpm dlx netlify-cli deploy --prod --build
```

Run the first command as a draft deploy. Use the production command only after the draft URL passes the checklist below.

## Post-deploy verification checklist

- Open `/`, `/dashboard`, `/customers`, `/sales`, `/finance`, `/hr`, `/operations`, `/reports`, and `/settings` and confirm pages render without function errors.
- Verify `/admin/attendance` and `/admin/attendance/debug` using the existing production role header/cookie flow. The project has no standalone login page or NextAuth provider; Netlify does not create one automatically.
- Confirm database-backed dashboard and document data loads from the production PostgreSQL database.
- Exercise `POST /api/customers/import` with `x-api-key` and a safe test record only when an authorized production test is approved.
- Verify ZKTeco sync and attendance push routes with their matching bearer secrets and an approved device.
- Confirm dynamic endpoints such as `/api/document-modules/{moduleId}/{sectionId}` and `/iclock/{action}` resolve through the Next.js runtime.
- Check Netlify function logs for Prisma connection, timeout, or missing-environment errors.
- Confirm no `.env`, `.env.local`, database password, API key, sync secret, Netlify token, or site ID appears in the repository or deploy logs.
- Confirm no fake or seed data was introduced as part of deployment.

If a database request fails after deployment, first verify `DATABASE_URL`, provider network allow-lists, TLS parameters, connection limits/pooling, and that `prisma migrate deploy` completed successfully.
