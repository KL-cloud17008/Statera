BEGIN;
SET LOCAL lock_timeout = '5s';
SELECT pg_advisory_xact_lock(hashtext('statera.training_journal.20261114'));

CREATE TABLE IF NOT EXISTS "WorkoutCheckIn" (
    "workoutSessionId" TEXT PRIMARY KEY REFERENCES "WorkoutSession"("id") ON DELETE CASCADE,
    "effort" INTEGER NOT NULL,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "RecoveryCheckIn" (
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "energy" INTEGER NOT NULL,
    "soreness" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("userId", "date")
);

CREATE TABLE IF NOT EXISTS "SupplementEntry" (
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT,
    "time" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("userId", "id")
);

CREATE INDEX IF NOT EXISTS "SupplementEntry_userId_date_idx" ON "SupplementEntry"("userId", "date");

ALTER TABLE "WorkoutCheckIn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecoveryCheckIn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupplementEntry" ENABLE ROW LEVEL SECURITY;

COMMIT;
