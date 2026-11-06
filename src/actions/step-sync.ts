"use server";
import { prisma } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { ensureStepSyncSchema, lockStepUser, stepSyncInstalled } from "@/lib/step-sync/schema";
import { newPairingCode, secretHash } from "@/lib/step-sync/protocol";
import { getTodayDateString } from "@/lib/dates";
import { measurementDate } from "@/lib/measurement-input";
import { revalidatePath } from "next/cache";
export async function getStepSyncStatus() {
  const user = await getOrCreateCurrentUser();
  if (!user) return null;
  const connection = await stepSyncInstalled() ? await prisma.stepSyncConnection.findUnique({ where: { userId: user.id } }) : null;
  return { paired: !!connection?.tokenHash, deviceLabel: connection?.deviceLabel ?? null, pairedAt: connection?.pairedAt?.toISOString() ?? null,
    lastSyncAt: connection?.lastSyncAt?.toISOString() ?? null, timezone: user.timezone };
}
export async function createStepPairingCode() {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Sign in to Athanor first." };
  await ensureStepSyncSchema();
  const code = newPairingCode(); const expires = new Date(Date.now() + 600000);
  await prisma.$transaction(async tx => {
    await lockStepUser(tx, user.id);
    await tx.stepSyncConnection.upsert({ where: { userId: user.id },
      create: { userId: user.id, startedOn: measurementDate(getTodayDateString(user.timezone)), timezone: user.timezone, pairCodeHash: secretHash(code), pairCodeExpiresAt: expires },
      update: { pairCodeHash: secretHash(code), pairCodeExpiresAt: expires } });
  });
  return { code: code.match(/.{4}/g)!.join("-"), expiresAt: expires.toISOString() };
}
export async function disconnectStepSync() {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  if (!await stepSyncInstalled()) return {};
  await prisma.$transaction(async tx => { await lockStepUser(tx, user.id);
    await tx.stepSyncConnection.updateMany({ where: { userId: user.id }, data: { tokenHash: null, pairCodeHash: null, pairCodeExpiresAt: null } }); });
  revalidatePath("/steps/connect"); return {};
}
