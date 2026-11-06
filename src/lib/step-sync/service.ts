import { prisma } from "@/lib/db";
import { measurementDate } from "@/lib/measurement-input";
import { getTodayDateString } from "@/lib/dates";
import { lockStepUser, stepSyncInstalled } from "./schema";
import { newDeviceToken, normalizePairingCode, readDeviceToken, secretHash, validateStepSyncPayload } from "./protocol";
export async function claimStepSyncCode(value: unknown) {
  const p = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const code = normalizePairingCode(p.code);
  if (!code || !await stepSyncInstalled()) return null;
  const candidate = await prisma.stepSyncConnection.findUnique({ where: { pairCodeHash: secretHash(code) } });
  if (!candidate) return null;
  return prisma.$transaction(async tx => {
    await lockStepUser(tx, candidate.userId);
    const current = await tx.stepSyncConnection.findUnique({ where: { id: candidate.id } });
    if (!current || current.pairCodeHash !== secretHash(code) || !current.pairCodeExpiresAt || current.pairCodeExpiresAt <= new Date()) return null;
    const user = await tx.user.findUnique({ where: { id: current.userId } });
    if (!user) return null;
    const token = newDeviceToken(); const today = getTodayDateString(user.timezone);
    await tx.stepSyncConnection.update({ where: { id: current.id }, data: { tokenHash: secretHash(token), pairCodeHash: null, pairCodeExpiresAt: null,
      timezone: user.timezone, startedOn: measurementDate(today), deviceLabel: typeof p.deviceLabel === "string" ? p.deviceLabel.trim().slice(0, 80) : "Android phone", pairedAt: new Date(), lastSyncAt: null } });
    return { version: 1, token, timezone: user.timezone, startedOn: today, lookbackDays: 7 };
  });
}
export async function authenticateStepDevice(request: Request) {
  const token = readDeviceToken(request);
  if (!token || !await stepSyncInstalled()) return null;
  return prisma.stepSyncConnection.findUnique({ where: { tokenHash: secretHash(token) } });
}
export async function revokeDeviceToken(tokenHash: string) {
  const connection = await prisma.stepSyncConnection.findUnique({ where: { tokenHash } });
  if (!connection) return;
  await prisma.$transaction(async tx => { await lockStepUser(tx, connection.userId);
    await tx.stepSyncConnection.updateMany({ where: { id: connection.id, tokenHash }, data: { tokenHash: null, pairCodeHash: null, pairCodeExpiresAt: null } }); });
}
export async function importDeviceSteps(tokenHash: string, value: unknown) {
  const connection = await prisma.stepSyncConnection.findUnique({ where: { tokenHash } });
  if (!connection) return { status: 401, error: "Device is disconnected. Pair again." } as const;
  return prisma.$transaction(async tx => {
    await lockStepUser(tx, connection.userId);
    const active = await tx.stepSyncConnection.findUnique({ where: { id: connection.id } });
    if (!active || active.tokenHash !== tokenHash) return { status: 401, error: "Device is disconnected. Pair again." } as const;
    const user = await tx.user.findUnique({ where: { id: active.userId } });
    if (!user || user.timezone !== active.timezone) return { status: 409, error: "Athanor time zone changed. Pair again before syncing." } as const;
    const payload = validateStepSyncPayload(value, active.timezone, active.startedOn.toISOString().slice(0, 10));
    if (!payload) return { status: 400, error: "Invalid step totals, dates, time zone or protocol version." } as const;
    const results: Array<{ date: string; status: string; steps?: number }> = [];
    for (const day of payload.days) {
      const date = measurementDate(day.date); const key = { connectionId: active.id, date };
      const previous = await tx.stepSyncRecord.findUnique({ where: { connectionId_date: key } });
      const existing = await tx.dailyLog.findUnique({ where: { userId_date: { userId: active.userId, date } } });
      const observedAt = new Date(day.observedAt);
      if (previous?.observedAt && observedAt < previous.observedAt) { results.push({ date: day.date, status: "stale" }); continue; }
      if (previous?.blocked || (!previous && existing?.steps != null) || (previous && existing?.steps !== previous.lastSteps)) {
        await tx.stepSyncRecord.upsert({ where: { connectionId_date: key }, create: { ...key, blocked: true }, update: { blocked: true } });
        results.push({ date: day.date, status: "manual-entry-kept" }); continue;
      }
      if (previous?.observedAt && observedAt.getTime() === previous.observedAt.getTime() && day.steps !== previous.lastSteps) { results.push({ date: day.date, status: "stale" }); continue; }
      if (existing) {
        const updated = await tx.dailyLog.updateMany({ where: { id: existing.id, userId: active.userId, steps: existing.steps }, data: { steps: day.steps } });
        if (!updated.count) throw new Error("Concurrent correction; retry");
      } else await tx.dailyLog.create({ data: { userId: active.userId, date, steps: day.steps } });
      await tx.stepSyncRecord.upsert({ where: { connectionId_date: key }, create: { ...key, lastSteps: day.steps, observedAt }, update: { lastSteps: day.steps, observedAt } });
      results.push({ date: day.date, status: "saved", steps: day.steps });
    }
    await tx.stepSyncConnection.update({ where: { id: active.id }, data: { lastSyncAt: new Date() } });
    return { status: 200, results } as const;
  }, { isolationLevel: "Serializable", maxWait: 10000, timeout: 20000 });
}
