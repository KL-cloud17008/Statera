import type { Prisma, PrismaClient } from "@prisma/client";

/** Serialize a user's workout writes across tabs, retries and server instances. */
export async function withWorkoutTransaction<T>(
  client: PrismaClient,
  userId: string,
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return client.$transaction(async (tx) => {
    // The existing user row supplies a stable lock without a schema migration.
    // Every workout mutation takes this lock before reading its write preconditions.
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    return operation(tx);
  }, { maxWait: 10_000, timeout: 20_000 });
}
