import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// These constant statements mirror the additive migration. Existing records are untouched.
export const STEP_SYNC_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS "StepSyncConnection" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "tokenHash" TEXT UNIQUE, "pairCodeHash" TEXT UNIQUE, "pairCodeExpiresAt" TIMESTAMP(3),
    "startedOn" DATE NOT NULL, "timezone" TEXT NOT NULL, "deviceLabel" TEXT, "pairedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "StepSyncRecord" (
    "id" TEXT PRIMARY KEY, "connectionId" TEXT NOT NULL REFERENCES "StepSyncConnection"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL, "lastSteps" INTEGER, "observedAt" TIMESTAMP(3), "blocked" BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE ("connectionId", "date"))`,
  `ALTER TABLE "StepSyncConnection" ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE "StepSyncRecord" ENABLE ROW LEVEL SECURITY`,
];
let setup: Promise<void> | undefined;
/** Only called after website user authentication. Native public endpoints never provision storage. */
export function ensureStepSyncSchema() {
  return setup ??= prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(684221905)::text`;
    for (const sql of STEP_SYNC_SCHEMA) await tx.$executeRawUnsafe(sql);
  }).catch(error => { setup = undefined; throw error; });
}
export async function stepSyncInstalled(tx: Prisma.TransactionClient = prisma) {
  const rows = await tx.$queryRaw<Array<{ installed: boolean }>>`SELECT to_regclass('public."StepSyncConnection"') IS NOT NULL AND to_regclass('public."StepSyncRecord"') IS NOT NULL AS installed`;
  return rows[0]?.installed === true;
}
export async function lockStepUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}
export async function keepManualDates(tx: Prisma.TransactionClient, userId: string, dates: Date[]) {
  if (!await stepSyncInstalled(tx)) return;
  const connection = await tx.stepSyncConnection.findUnique({ where: { userId } });
  if (!connection) return;
  for (const date of dates) {
    const key = { connectionId: connection.id, date };
    await tx.stepSyncRecord.upsert({ where: { connectionId_date: key }, create: { ...key, blocked: true }, update: { blocked: true } });
  }
}
/** Clearing/restoring data revokes a phone before it can upload more totals. */
export async function revokeStepSyncBeforeReplacement(userId: string) {
  if (!await stepSyncInstalled()) return;
  await prisma.$transaction(async tx => { await lockStepUser(tx, userId); await tx.stepSyncConnection.deleteMany({ where: { userId } }); });
}
