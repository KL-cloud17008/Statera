-- Additive step connector storage. Public API roles have no RLS policies.
CREATE TABLE IF NOT EXISTS "StepSyncConnection" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "tokenHash" TEXT UNIQUE, "pairCodeHash" TEXT UNIQUE, "pairCodeExpiresAt" TIMESTAMP(3),
    "startedOn" DATE NOT NULL, "timezone" TEXT NOT NULL, "deviceLabel" TEXT, "pairedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS "StepSyncRecord" (
    "id" TEXT PRIMARY KEY, "connectionId" TEXT NOT NULL REFERENCES "StepSyncConnection"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL, "lastSteps" INTEGER, "observedAt" TIMESTAMP(3), "blocked" BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE ("connectionId", "date"));

ALTER TABLE "StepSyncConnection" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "StepSyncRecord" ENABLE ROW LEVEL SECURITY;
