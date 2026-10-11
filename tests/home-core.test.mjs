import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const copy = (value) => structuredClone(value);

function fixture() {
  const state = { logs: [], reads: 0, writes: 0, invalidations: [], failWrite: false, failInvalidation: false };
  let auth = { id: "owner", timezone: "America/New_York" };
  let instant = "2026-10-13T18:00:00.000Z"; // Tuesday afternoon; the gym training date has already rolled to Wednesday.
  let serial = 0, tail = Promise.resolve();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [instant])); }
    static now() { return new Date(instant).getTime(); }
  }
  const matches = (row, where) => Object.entries(where).every(([key, value]) => {
    if (value instanceof Date) return row[key].getTime() === value.getTime();
    if (value && typeof value === "object") return !(value.gte && row[key] < value.gte) && !(value.lte && row[key] > value.lte);
    return row[key] === value;
  });
  const client = {
    mobilityLog: {
      findMany: async ({ where }) => { state.reads++; return copy(state.logs.filter((row) => matches(row, where))); },
      findFirst: async ({ where }) => { state.reads++; return copy(state.logs.find((row) => matches(row, where)) ?? null); },
      create: async ({ data }) => {
        if (state.failWrite) throw new Error("Write interrupted");
        const row = { id: "core-" + ++serial, ...copy(data) };
        state.logs.push(row); state.writes++; return copy(row);
      },
    },
    $transaction: async (operation) => {
      let release, snapshot;
      const tx = { mobilityLog: client.mobilityLog, $queryRaw: async (_query, userId) => {
        assert.equal(userId, auth.id);
        const previous = tail;
        tail = new Promise((resolve) => { release = resolve; });
        await previous;
        snapshot = copy({ logs: state.logs, writes: state.writes });
        return [{ id: userId }];
      } };
      try { return await operation(tx); }
      catch (error) { if (snapshot) Object.assign(state, snapshot); throw error; }
      finally { release?.(); }
    },
  };
  const cache = new Map();
  function load(file) {
    const path = resolve(file);
    if (cache.has(path)) return cache.get(path).exports;
    const loadedModule = { exports: {} }; cache.set(path, loadedModule);
    const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(output, { module: loadedModule, exports: loadedModule.exports, Date: Clock, FormData, Intl, Set, JSON,
      require: (name) => {
        if (name === "@/lib/db") return { prisma: client };
        if (name === "@/lib/current-user") return { getOrCreateCurrentUser: async () => auth };
        if (name === "next/cache") return { revalidatePath: (path) => { if (state.failInvalidation) throw new Error("Lost response after commit"); state.invalidations.push(path); } };
        if (name.startsWith("@/")) return load(resolve("src", name.slice(2)) + ".ts");
        if (name.startsWith(".")) return load(resolve(dirname(path), name) + ".ts");
        return require(name);
      },
    }, { filename: path });
    return loadedModule.exports;
  }
  const form = (dose = "intro", extra = {}) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ dose, ...extra })) data.set(key, value);
    return data;
  };
  return { state, load, actions: load("src/actions/home-core.ts"), form,
    setAuth: (value) => { auth = value; }, setTime: (value) => { instant = value; } };
}

test("home core uses the user's calendar day and Monday week independently of the gym noon boundary", async () => {
  const f = fixture();
  assert.equal(f.load("src/lib/dates.ts").getTrainingDate(new Date("2026-10-13T18:00:00Z"), "America/New_York").getUTCDay(), 3);
  await f.actions.logHomeCore(f.form("intro", { date: "2030-01-01", userId: "other" }));
  assert.equal(f.state.logs[0].date.toISOString(), "2026-10-13T00:00:00.000Z");
  assert.equal(f.state.logs[0].userId, "owner");
  const week = await f.actions.getHomeCoreWeek("owner");
  assert.equal(week.dayOfWeek, 2);
  assert.equal(week.completedToday, true);
  assert.equal(week.todayDose, "intro");
  assert.deepEqual(Array.from(week.completedDates), ["2026-10-13"]);
  const core = f.load("src/lib/home-core.ts");
  assert.equal(core.getHomeCoreDayLabel(week.dayOfWeek), "Core day");
  for (const [time, zone, date, day] of [
    ["2026-10-13T03:00:00Z", "America/New_York", "2026-10-12", 1],
    ["2026-10-12T16:30:00Z", "Asia/Tokyo", "2026-10-13", 2],
    ["2026-10-13T00:30:00Z", "Europe/London", "2026-10-13", 2],
    ["2026-11-01T06:30:00Z", "America/New_York", "2026-11-01", 0],
  ]) {
    const calendar = core.getHomeCoreCalendar(new Date(time), zone);
    assert.equal(calendar.date, date); assert.equal(calendar.dayOfWeek, day);
    assert.equal(calendar.weekStart.getUTCDay(), 1);
    assert.equal(calendar.calendarDate.getUTCHours(), 0);
  }
});

test("core completion is idempotent across concurrent taps and a lost response, without changing other routines", async () => {
  const f = fixture();
  const previous = { id: "prior", userId: "owner", date: new Date("2026-10-12"), type: "HOME_CORE", completed: true, version: "old" };
  const recovery = { ...previous, id: "recovery", type: "POST_WORKOUT" };
  f.state.logs.push(previous, recovery);
  const original = copy(f.state.logs);
  f.state.failInvalidation = true;
  await assert.rejects(f.actions.logHomeCore(f.form()), /Lost response/);
  f.state.failInvalidation = false;
  await Promise.all(Array.from({ length: 5 }, () => f.actions.logHomeCore(f.form())));
  assert.equal(f.state.writes, 1);
  assert.equal(f.state.logs.length, 3);
  assert.deepEqual(f.state.logs.slice(0, 2), original);
  assert.ok(["/mobility", "/flexibility-balance", "/"].every((path) => f.state.invalidations.includes(path)));
  f.setTime("2026-10-16T18:00:00Z");
  await f.actions.logHomeCore(f.form("full"));
  assert.equal(f.state.logs.at(-1).version, "home-core-v1:full");
  assert.equal((await f.actions.getHomeCoreWeek("owner")).todayDose, "full");
});

test("core week counts only completed owned core dates, skips future records and resets on Monday", async () => {
  const f = fixture();
  const row = (id, date, extra = {}) => ({ id, date: new Date(date), userId: "owner", type: "HOME_CORE", completed: true, version: "home-core-v1:intro", ...extra });
  f.state.logs.push(row("old-week", "2026-10-11"), row("a", "2026-10-12"), row("duplicate-legacy", "2026-10-12"), row("future", "2026-10-16"), row("other-owner", "2026-10-13", { userId: "other" }), row("recovery", "2026-10-13", { type: "POST_WORKOUT" }), row("unfinished", "2026-10-13", { completed: false }));
  const week = await f.actions.getHomeCoreWeek("owner");
  assert.deepEqual(Array.from(week.completedDates), ["2026-10-12"]);
  assert.equal(week.completedToday, false);
  f.setTime("2026-10-19T18:00:00Z");
  assert.equal((await f.actions.getHomeCoreWeek("owner")).completedDates.length, 0);
});

test("core reads and writes require authentication and invalid selections never write", async () => {
  const f = fixture();
  assert.equal(await f.actions.getHomeCoreWeek("other"), null);
  for (const dose of ["", "three", "intro:forged", "full extra"]) assert.ok((await f.actions.logHomeCore(f.form(dose))).error);
  assert.equal(f.state.reads, 0); assert.equal(f.state.writes, 0);
  f.setAuth(null);
  assert.equal(await f.actions.getHomeCoreWeek("owner"), null);
  assert.equal((await f.actions.logHomeCore(f.form())).error, "Not authenticated");
  assert.equal(f.state.writes, 0);
});

test("a failed core save rolls back and the same completion remains retryable", async () => {
  const f = fixture(); f.state.failWrite = true;
  await assert.rejects(f.actions.logHomeCore(f.form()), /Write interrupted/);
  assert.equal(f.state.logs.length, 0);
  f.state.failWrite = false;
  assert.ok(!(await f.actions.logHomeCore(f.form())).error);
  assert.equal(f.state.writes, 1);
});
