import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isPlaceholderDatabaseUrl(url: string): boolean {
  return (
    url.includes("db.example.com") ||
    url.includes("USER:PASSWORD") ||
    url.includes("user:pass@")
  );
}

function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.sampleEc_POSTGRES_URL,
    process.env.sampleEc_PRISMA_DATABASE_URL,
    process.env.sampleEc_DATABASE_URL,
  ].filter((url): url is string => Boolean(url));

  return (
    candidates.find((url) => !isPlaceholderDatabaseUrl(url)) ??
    candidates[0] ??
    ""
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
