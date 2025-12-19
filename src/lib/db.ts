import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

export let db: PrismaClient;
function buildSupabaseUrl() {
  const password = process.env.SUPABASE_PASSWORD;
  const host =
    process.env.SUPABASE_HOST ||
    (process.env.SUPABASE_PROJECT_REF ? `db.${process.env.SUPABASE_PROJECT_REF}.supabase.co` : undefined);
  if (password && host) {
    return `postgresql://postgres:${password}@${host}:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1`;
  }
  return undefined;
}

const rawUrl = process.env.DATABASE_URL || "";
const computedUrl = buildSupabaseUrl() || rawUrl;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient(
    computedUrl ? { datasources: { db: { url: computedUrl } } } : undefined
  );
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(
      computedUrl ? { datasources: { db: { url: computedUrl } } } : undefined
    );
  }
  db = global.cachedPrisma;
}
