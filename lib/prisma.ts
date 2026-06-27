const globalForPrisma = globalThis as unknown as {
  prisma: unknown;
};

function createPrismaClient() {
  // Loaded lazily so the UI can typecheck before `prisma generate` has created
  // node_modules/.prisma/client. API/database routes still use the real client.
  const { PrismaClient } = require("@prisma/client");

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
