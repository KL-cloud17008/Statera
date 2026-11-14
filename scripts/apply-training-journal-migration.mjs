import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

if (process.env.VERCEL_ENV !== "production") {
  if (process.env.VERCEL === "1" && !process.env.VERCEL_ENV) {
    throw new Error("Vercel must expose its system environment variables to run the release build.");
  }
  process.exit(0);
}

if (process.env.VERCEL_GIT_COMMIT_REF !== "main") {
  throw new Error("The journal migration runs on Vercel's main production branch.");
}

const connection = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connection) throw new Error("The production database connection is missing.");

const require = createRequire(import.meta.url);
const prisma = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [
  prisma, "db", "execute", "--schema", "prisma/schema.prisma",
  "--file", "prisma/migrations/20261114_training_journal/migration.sql",
], {
  env: { ...process.env, DIRECT_URL: connection, DATABASE_URL: connection },
  encoding: "utf8",
});

if (result.status !== 0) {
  const errorCode = result.stderr?.match(/\bP\d{4}\b/)?.[0];
  throw new Error(`Training journal migration failed${errorCode ? ` (${errorCode})` : ""}. Verify the production database connection and permissions.`);
}

console.log("Training journal migration applied.");
