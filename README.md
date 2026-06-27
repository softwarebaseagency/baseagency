# Base Agency Accounting CRM System

A Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL accounting CRM for Base Agency.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Update `DATABASE_URL` and `BASE_AGENCY_API_KEY`.
4. Create the local PostgreSQL database:
   ```bash
   createdb base_agency_crm
   ```
   Example local database URL:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/base_agency_crm?schema=public"
   ```
5. Generate Prisma Client:
   ```bash
   pnpm prisma:generate
   ```
6. Create database tables:
   ```bash
   pnpm prisma:migrate
   ```
7. Seed sales sections and admin user:
   ```bash
   pnpm db:seed
   ```
8. Run checks:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
9. Run the app:
   ```bash
   pnpm dev
   ```
   Local URL:
   ```text
   http://localhost:4040
   ```

## Customer Import API

Endpoint: `POST http://localhost:4040/api/customers/import`

Header:
```http
x-api-key: your-api-key
```

Body:
```json
{
  "full_name": "Customer Name",
  "phone": "+9647500000000",
  "whatsapp": "+9647500000000",
  "email": "customer@example.com",
  "address": "Erbil",
  "source": "website",
  "service_interest": "Website Development",
  "status": "NEW",
  "notes": "Imported from website contact form"
}
```
