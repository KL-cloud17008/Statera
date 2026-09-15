import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const copy = (value) => structuredClone(value);
const requestId = "e2f874d8-7b5a-4d31-95aa-322571f08100";
const date = (value) => new Date(`${value}T00:00:00.000Z`);
class Clock extends Date {
  constructor(...args) { super(...(args.length ? args : ["2026-09-10T02:00:00.000Z"])); }
  static now() { return new Date("2026-09-10T02:00:00.000Z").getTime(); }
}
function form(values = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

// Real actions run with a clock and isolated database doubles. No application
// DB module or environment credentials are loaded. Transactions model rollback;
// explicit conflict injection checks recovery, not PostgreSQL isolation itself.
function fixture() {
  const state = { weights: [], days: [], users: [{ id: "owner" }], reads: 0, writes: 0,
    transactions: 0, invalidations: [], failDailyUpdate: false, serialConflict: false, upsertCollision: false };
  let auth = { id: "owner", timezone: "America/New_York" };
  let serial = 0;
  let tail = Promise.resolve();
  const same = (a, b) => a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;
  const matches = (row, where = {}) => Object.entries(where).every(([key, value]) => {
    if (key === "userId_date") return matches(row, value);
    if (value && typeof value === "object" && !(value instanceof Date)) {
      if ("not" in value && same(row[key], value.not)) return false;
      if ("gte" in value && !(row[key] >= value.gte)) return false;
      if ("lte" in value && !(row[key] <= value.lte)) return false;
      return true;
    }
    return same(row[key], value);
  });
  const client = {};
  for (const [name, model] of [["weightEntry", "weights"], ["dailyLog", "days"], ["user", "users"]]) {
    const list = ({ where, orderBy } = {}) => {
      state.reads++;
      const rows = state[model].filter((row) => matches(row, where));
      for (const ordering of (Array.isArray(orderBy) ? [...orderBy].reverse() : orderBy ? [orderBy] : [])) {
        const [key, direction] = Object.entries(ordering)[0];
        rows.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (direction === "desc" ? -1 : 1));
      }
      return copy(rows);
    };
    const create = async ({ data }) => {
      const record = { id: `${name}-${++serial}`, createdAt: new Date(), steps: null, sleepHours: null, moodRating: null,
        notes: null, status: "NORMAL", bodyFatPercent: null, timeOfDay: null, ...copy(data) };
      if (state[model].some((row) => row.id === record.id || (model === "days" && row.userId === record.userId && same(row.date, record.date)))) {
        throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
      }
      state[model].push(record); state.writes++;
      return copy(record);
    };
    const update = async ({ where, data }) => {
      if (model === "days" && state.failDailyUpdate) throw new Error("Simulated daily write failure");
      const row = state[model].find((row) => matches(row, where));
      assert.ok(row, "updates require an existing owned row");
      Object.assign(row, copy(data)); state.writes++;
      return copy(row);
    };
    client[name] = {
      findMany: async (args) => list(args), findFirst: async (args) => list(args)[0] ?? null,
      findUnique: async (args) => list(args)[0] ?? null, create, update,
      createMany: async ({ data }) => { for (const entry of data) await create({ data: entry }); return { count: data.length }; },
      upsert: async ({ where, create: data, update: changes }) => {
        const row = list({ where })[0];
        if (row) return Object.keys(changes).length ? update({ where, data: changes }) : row;
        const created = await create({ data });
        if (model === "weights" && state.upsertCollision) {
          state.upsertCollision = false;
          // The other concurrent request won creation before this request's insert.
          throw Object.assign(new Error("Concurrent request already inserted this key"), { code: "P2002" });
        }
        return created;
      },
      updateMany: async ({ where, data }) => {
        const rows = state[model].filter((row) => matches(row, where));
        for (const row of rows) await update({ where: { id: row.id }, data });
        return { count: rows.length };
      },
      deleteMany: async ({ where }) => {
        const before = state[model].length;
        state[model] = state[model].filter((row) => !matches(row, where));
        const count = before - state[model].length; state.writes += count;
        return { count };
      },
    };
  }
  client.$transaction = async (operation, options) => {
    assert.equal(options.isolationLevel, "Serializable");
    const previous = tail; let release;
    tail = new Promise((resolve) => { release = resolve; });
    await previous; state.transactions++;
    const snapshot = copy({ days: state.days, weights: state.weights, writes: state.writes });
    try {
      if (state.serialConflict) throw Object.assign(new Error("Serialization failure"), { code: "P2034" });
      return await operation(client);
    } catch (error) { Object.assign(state, snapshot); throw error; }
    finally { release(); }
  };
  const cache = new Map();
  function load(path) {
    const filename = resolve(path);
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiledModule = { exports: {} }; cache.set(filename, compiledModule);
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename }).outputText;
    vm.runInNewContext(output, { module: compiledModule, exports: compiledModule.exports, Date: Clock, FormData, Number, Set, Map, JSON,
      require: (specifier) => {
        if (specifier === "@/lib/db") return { prisma: client };
        if (specifier === "@/lib/current-user") return { getOrCreateCurrentUser: async () => auth };
        if (specifier === "next/cache") return { revalidatePath: (path) => state.invalidations.push(path) };
        if (specifier.startsWith("@/")) return load(resolve(specifier.replace("@/", "src/")) + ".ts");
        if (specifier.startsWith(".")) return load(resolve(dirname(filename), specifier) + ".ts");
        return require(specifier);
      },
    }, { filename });
    return compiledModule.exports;
  }
  return { state, load, steps: load("src/actions/steps.ts"), weight: load("src/actions/weight.ts"),
    setAuth: (value) => { auth = value; }, addDay: (values = {}) => {
      const row = { id: `day-${++serial}`, userId: "owner", date: date("2026-09-09"), steps: 9000,
        sleepHours: 7.5, moodRating: 8, notes: "Original day", ...values };
      state.days.push(row); return row;
    } };
}

test("measurement parsers reject partial numbers, exponents, infinities and fractional steps before DB work", async () => {
  const f = fixture();
  for (const steps of ["9000steps", "1e4", "Infinity", "8.5", "-1", "200001", "0x10", ""]) {
    assert.ok((await f.steps.logSteps(form({ date: "2026-09-09", steps }))).error, steps);
  }
  for (const values of [{ weight: "270lb" }, { weight: "Infinity" }, { weight: "2.7e2" }, { weight: "49" }, { weight: "1000" }, { status: "INVALID" }, { bodyFatPercent: "abc" }, { bodyFatPercent: "71" }, { notes: "n".repeat(2001) }]) {
    assert.ok((await f.weight.addWeightEntry(form({ date: "2026-09-09", weight: "270", ...values }))).error, JSON.stringify(values));
  }
  assert.equal(f.state.reads, 0); assert.equal(f.state.writes, 0);
});

test("calendar validation uses the saved user timezone and stores dates at UTC midnight", async () => {
  const f = fixture();
  for (const invalid of ["", "2026-02-30", "2026-13-01", "2026-9-09", "2026-09-10"]) {
    assert.ok((await f.steps.logSteps(form({ date: invalid, steps: "0" }))).error, invalid);
    assert.ok((await f.weight.addWeightEntry(form({ date: invalid, weight: "270" }))).error, invalid);
  }
  f.setAuth({ id: "owner", timezone: "Asia/Tokyo" });
  assert.ok(!(await f.steps.logSteps(form({ date: "2026-09-10", steps: "0" }))).error);
  assert.equal(f.state.days[0].date.toISOString(), "2026-09-10T00:00:00.000Z");
  assert.equal(await f.steps.getTodaySteps("owner", "America/New_York"), 0);
});

test("measurement reads and all mutations enforce authentication and ownership", async () => {
  const f = fixture(); const foreign = f.addDay({ userId: "other" });
  f.state.weights.push({ id: "foreign-weight", userId: "other", date: date("2026-09-09"), weight: 270 });
  assert.equal((await f.steps.getStepsEntries("other")).length, 0);
  assert.equal(await f.steps.getTodaySteps("other"), null);
  assert.equal((await f.weight.getWeightEntries("other")).length, 0);
  assert.ok((await f.steps.updateStepsEntry(form({ id: foreign.id, date: "2026-09-09", steps: "1" }))).error);
  assert.ok((await f.steps.deleteStepsEntry(form({ id: foreign.id }))).error);
  assert.ok((await f.weight.updateWeightEntry(form({ id: "foreign-weight", date: "2026-09-09", weight: "271" }))).error);
  assert.ok((await f.weight.deleteWeightEntry(form({ id: "foreign-weight" }))).error);
  assert.equal((await f.weight.exportWeightCSV()).csv.split("\n").length, 1);
  f.setAuth(null);
  for (const action of [f.steps.logSteps, f.steps.updateStepsEntry, f.steps.deleteStepsEntry, f.weight.addWeightEntry, f.weight.updateWeightEntry, f.weight.deleteWeightEntry, f.weight.importWeightCSV]) {
    assert.equal((await action(form())).error, "Not authenticated");
  }
  assert.equal((await f.weight.getWeightEntries("owner")).length, 0);
  assert.equal((await f.weight.exportWeightCSV()).csv, "");
  assert.equal(f.state.writes, 0);
});

test("step totals retry without duplicate days and preserve sleep, mood and notes", async () => {
  const f = fixture(); const day = f.addDay(); const before = copy(day);
  await Promise.all([f.steps.logSteps(form({ date: "2026-09-09", steps: "10192" })), f.steps.logSteps(form({ date: "2026-09-09", steps: "10192" }))]);
  assert.equal(f.state.days.length, 1); assert.deepEqual(f.state.days[0], { ...before, steps: 10192 });
  assert.equal(await f.steps.getTodaySteps("owner"), 10192);
  assert.ok(["/", "/steps", "/workout", "/mobility"].every((path) => f.state.invalidations.includes(path)));
});

test("step read windows use calendar dates and do not expose future or foreign entries", async () => {
  const f = fixture(); f.addDay(); f.addDay({ date: date("2026-09-08"), steps: 8000 });
  f.addDay({ date: date("2026-09-07") }); f.addDay({ date: date("2026-09-10") }); f.addDay({ userId: "other" });
  const rows = await f.steps.getStepsEntries("owner", 2);
  assert.deepEqual(Array.from(rows, (row) => row.date.toISOString().slice(0, 10)), ["2026-09-09", "2026-09-08"]);
});

test("same-date step correction rejects a stale baseline but accepts an identical retry", async () => {
  const f = fixture(); const day = f.addDay();
  const correction = form({ id: day.id, originalDate: "2026-09-09", originalSteps: "9000", date: "2026-09-09", steps: "9500" });
  assert.ok(!(await f.steps.updateStepsEntry(correction)).error);
  assert.ok(!(await f.steps.updateStepsEntry(correction)).error, "lost-response retry must confirm the already-saved correction");
  assert.ok((await f.steps.updateStepsEntry(form({ id: day.id, originalDate: "2026-09-09", originalSteps: "9000", date: "2026-09-09", steps: "9800" }))).error);
  assert.equal(f.state.days[0].steps, 9500);
});

test("moving steps preserves both dates' other fields, rejects collisions and supports retry", async () => {
  const f = fixture(); const source = f.addDay(); const target = f.addDay({ date: date("2026-09-08"), steps: null, sleepHours: 6, notes: "Target day" });
  const beforeSource = copy(source), beforeTarget = copy(target);
  const correction = form({ id: source.id, originalDate: "2026-09-09", originalSteps: "9000", date: "2026-09-08", steps: "9100" });
  assert.ok(!(await f.steps.updateStepsEntry(correction)).error);
  assert.deepEqual(f.state.days[0], { ...beforeSource, steps: null });
  assert.deepEqual(f.state.days[1], { ...beforeTarget, steps: 9100 });
  assert.ok(!(await f.steps.updateStepsEntry(correction)).error, "date move retry must confirm without moving other data");
  const third = f.addDay({ date: date("2026-09-07"), steps: 7000 });
  assert.ok((await f.steps.updateStepsEntry(form({ id: third.id, date: "2026-09-08", steps: "7500" }))).error);
  assert.equal(f.state.days[1].steps, 9100); assert.equal(f.state.days[2].steps, 7000);
});

test("failed date moves roll back both writes and serialization conflicts have actionable errors", async () => {
  const f = fixture(); const source = f.addDay(); const before = copy(f.state.days);
  const correction = form({ id: source.id, date: "2026-09-08", steps: "9100" });
  f.state.failDailyUpdate = true;
  await assert.rejects(f.steps.updateStepsEntry(correction), /Simulated daily write failure/);
  assert.deepEqual(f.state.days, before); assert.equal(f.state.invalidations.length, 0);
  f.state.failDailyUpdate = false; f.state.serialConflict = true;
  assert.match((await f.steps.updateStepsEntry(correction)).error, /same time/);
  assert.deepEqual(f.state.days, before);
});

test("deleting steps removes only the count and is safe to retry", async () => {
  const f = fixture(); const day = f.addDay(); const before = copy(day);
  assert.ok(!(await f.steps.deleteStepsEntry(form({ id: day.id }))).error);
  assert.ok(!(await f.steps.deleteStepsEntry(form({ id: day.id }))).error);
  assert.deepEqual(f.state.days[0], { ...before, steps: null });
});

test("weigh-in request IDs make concurrent/lost-response retries durable and user-scoped", async () => {
  const f = fixture(); const entry = form({ requestId, date: "2026-09-09", weight: "270.06", status: "FASTING", bodyFatPercent: "25", notes: "Morning" });
  const results = await Promise.all([f.weight.addWeightEntry(entry), f.weight.addWeightEntry(entry)]);
  assert.ok(results.every((result) => !result.error)); assert.equal(f.state.weights.length, 1);
  assert.equal(f.state.weights[0].weight, 270.1); assert.equal(f.state.weights[0].date.toISOString(), "2026-09-09T00:00:00.000Z");
  assert.ok((await f.weight.addWeightEntry(form({ requestId, date: "2026-09-09", weight: "275" }))).error);
  assert.equal(f.state.weights[0].weight, 270.1);
  f.setAuth({ id: "other", timezone: "America/New_York" });
  assert.ok(!(await f.weight.addWeightEntry(entry)).error); assert.equal(f.state.weights.length, 2);
  assert.notEqual(f.state.weights[0].id, f.state.weights[1].id);
});

test("weigh-in retries recover Prisma upsert unique-key races without another entry", async () => {
  const f = fixture(); f.state.upsertCollision = true;
  const result = await f.weight.addWeightEntry(form({ requestId, date: "2026-09-09", weight: "270" }));
  assert.ok(!result.error); assert.equal(f.state.weights.length, 1);
});

test("weight corrections preserve unrelated columns and invalid requests do not write", async () => {
  const f = fixture(); await f.weight.addWeightEntry(form({ requestId, date: "2026-09-09", weight: "270" }));
  const entry = f.state.weights[0]; entry.timeOfDay = "morning";
  assert.ok(!(await f.weight.updateWeightEntry(form({ id: entry.id, date: "2026-09-08", weight: "269.5", notes: "Corrected" }))).error);
  assert.equal(f.state.weights[0].timeOfDay, "morning"); assert.equal(f.state.weights[0].weight, 269.5);
  const writes = f.state.writes;
  assert.ok((await f.weight.addWeightEntry(form({ requestId: "bad", date: "2026-09-09", weight: "270" }))).error);
  assert.equal(f.state.writes, writes);
});

test("weight CSV validation skips malformed, future and duplicate dates and keeps pounds", async () => {
  const f = fixture();
  const result = await f.weight.importWeightCSV(form({ csv: "Status,Date,Weight (Scale),Body Fat % (Scale)\nNormal,9/8/2026,270.04,25\nNormal,9/8/2026,271,25\nNormal,2/30/2026,270,25\nNormal,9/10/2026,270,25\nNormal,9/7/2026,270lb,25\nNormal,9/6/2026,270,80" }));
  assert.equal(result.imported, 1); assert.equal(result.errors.length, 5); assert.equal(f.state.weights[0].weight, 270);
  assert.match((await f.weight.exportWeightCSV()).csv, /Normal,9\/8\/2026,270,25/);
});

test("profile changes validate numeric fields/timezone and update only the authenticated user", async () => {
  const f = fixture(); const actions = f.load("src/actions/user.ts");
  for (const values of [{ heightCm: "175cm" }, { startWeight: "326lb" }, { goalWeight: "NaN" }, { timezone: "Not/AZone" }]) {
    assert.ok((await actions.updateUserProfile(form({ heightCm: "175", startWeight: "326.7", goalWeight: "154", timezone: "America/New_York", ...values }))).error);
  }
  assert.equal(f.state.writes, 0);
  await actions.updateUserProfile(form({ userId: "other", heightCm: "175", startWeight: "326.7", goalWeight: "154", timezone: "Asia/Tokyo" }));
  assert.equal(f.state.users[0].id, "owner"); assert.equal(f.state.users[0].heightInches, 69);
  assert.equal(f.state.users[0].startWeight, 326.7); assert.equal(f.state.users[0].goalWeight, 154);
  assert.ok(["/", "/weight", "/workout", "/steps", "/mobility", "/settings"].every((path) => f.state.invalidations.includes(path)));
});
