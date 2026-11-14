import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Allows the application to keep working until the additive migration is applied. */
export async function trainingJournalInstalled(client: Prisma.TransactionClient = prisma) {
  const rows = await client.$queryRaw<Array<{ installed: boolean }>>`
    SELECT to_regclass('public."WorkoutCheckIn"') IS NOT NULL
      AND to_regclass('public."RecoveryCheckIn"') IS NOT NULL
      AND to_regclass('public."SupplementEntry"') IS NOT NULL AS installed
  `;
  return rows[0]?.installed === true;
}
