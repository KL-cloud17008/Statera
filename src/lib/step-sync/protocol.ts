import { createHash, randomBytes } from "node:crypto";
import { addDaysToDateString, getTodayDateString, isValidISODateString } from "@/lib/dates";
export const STEP_SYNC_VERSION = 1;
export const STEP_SYNC_LOOKBACK_DAYS = 7;
export const STEP_SYNC_MAX_BODY_BYTES = 16_384;
export const secretHash = (value: string) => createHash("sha256").update(value).digest("hex");
export const newDeviceToken = () => randomBytes(32).toString("base64url");
export function newPairingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(12), n => alphabet[n & 31]).join("");
}
export function normalizePairingCode(value: unknown) {
  const code = typeof value === "string" ? value.replace(/[\s-]/g, "").toUpperCase() : "";
  return /^[A-HJ-NP-Z2-9]{12}$/.test(code) ? code : null;
}
export function readDeviceToken(request: Request) {
  return /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? null;
}
export async function readSyncJSON(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("Use JSON");
  if (Number(request.headers.get("content-length")) > STEP_SYNC_MAX_BODY_BYTES || !request.body) throw new Error("Invalid request size");
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.length;
    if (bytes > STEP_SYNC_MAX_BODY_BYTES) { await reader.cancel(); throw new Error("Request too large"); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const buffer = new Uint8Array(bytes); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(buffer));
}
export type StepSyncDay = { date: string; steps: number; observedAt: string };
export type StepSyncPayload = { version: number; source: string; timezone: string; days: StepSyncDay[] };
export function validateStepSyncPayload(value: unknown, timezone: string, startedOn: string, now = new Date()): StepSyncPayload | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Partial<StepSyncPayload>;
  if (p.version !== 1 || p.source !== "samsung-health" || p.timezone !== timezone || !Array.isArray(p.days) || p.days.length < 1 || p.days.length > 7) return null;
  const today = getTodayDateString(timezone); const earliest = [startedOn, addDaysToDateString(today, -6)].sort().at(-1)!; const seen = new Set<string>();
  for (const day of p.days) {
    if (!day || typeof day.date !== "string" || !isValidISODateString(day.date) || day.date < earliest || day.date > today || seen.has(day.date) || !Number.isInteger(day.steps) || day.steps < 0 || day.steps > 200000 || typeof day.observedAt !== "string") return null;
    const observed = Date.parse(day.observedAt);
    if (!Number.isFinite(observed) || observed > now.getTime() + 300000 || observed < now.getTime() - 7 * 86400000) return null;
    seen.add(day.date);
  }
  return p as StepSyncPayload;
}
