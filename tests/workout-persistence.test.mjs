import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const copy = (value) => structuredClone(value);

// Execute real action/library code with an isolated in-memory repository. The
// repository models transaction rollback and the cross-request user row lock;
// it never loads environment credentials or connects to the production DB.
function fixture() {
  const state = { plans: [], sessions: [], sets: [], invalidations: [], locks: 0, writes: 0, failSetWrite: false };
  let auth = { id: "owner", timezone: "America/New_York" };
  let serial = 0;
  let tail = Promise.resolve();
  const cache = new Map();
  const matches = (row, where = {}) => Object.entries(where).every(([key, value]) => {
    if (key === "workoutPlan") return matches(state.plans.find((plan) => plan.id === row.workoutPlanId) ?? {}, value);
    if (key === "workoutSession") return matches(state.sessions.find((session) => session.id === row.workoutSessionId) ?? {}, value);
    const current = row[key];
    if (value && typeof value === "object" && !(value instanceof Date)) {
      if ("not" in value && current === value.not) return false;
      if ("in" in value && !value.in.includes(current)) return false;
      if ("gte" in value && !(current >= value.gte)) return false;
      return true;
    }
    return current === value;
  });
  const attach = (model, row) => {
    if (!row) return null;
    const result = copy(row);
    if (model === "sessions") {
      result.workoutPlan = copy(state.plans.find((plan) => plan.id === row.workoutPlanId) ?? null);
      result.sets = copy(state.sets.filter((set) => set.workoutSessionId === row.id));
      result._count = { sets: result.sets.length };
    }
    return result;
  };
  const client = {};
  for (const [name, model] of [["workoutPlan", "plans"], ["workoutSession", "sessions"], ["sessionSet", "sets"]]) {
    const list = ({ where, orderBy, take } = {}) => {
      let rows = state[model].filter((row) => matches(row, where));
      if (orderBy && !Array.isArray(orderBy)) {
        const [key, direction] = Object.entries(orderBy)[0];
        rows = [...rows].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (direction === "desc" ? -1 : 1));
      }
      return (take ? rows.slice(0, take) : rows).map((row) => attach(model, row));
    };
    client[name] = {
      findMany: async (args) => list(args),
      findFirst: async (args) => list(args)[0] ?? null,
      create: async ({ data }) => {
        if (model === "sets" && state.failSetWrite) throw new Error("Simulated failed write");
        const record = { id: name + ++serial, completed: false, workoutPlanId: null, createdAt: new Date(), notes: null, ...copy(data) };
        if (model === "plans" && data.exercises?.create) record.exercises = data.exercises.create.map((exercise, index) => ({ id: record.id + "-" + index, ...copy(exercise) }));
        state[model].push(record); state.writes++;
        return attach(model, record);
      },
      update: async ({ where, data }) => {
        const row = state[model].find((row) => matches(row, where));
        assert.ok(row, "update must target an existing owned record");
        Object.assign(row, copy(data)); state.writes++;
        return attach(model, row);
      },
      updateMany: async ({ where, data }) => {
        const rows = state[model].filter((row) => matches(row, where));
        rows.forEach((row) => Object.assign(row, copy(data))); state.writes += rows.length;
        return { count: rows.length };
      },
      delete: async ({ where }) => {
        const rows = state[model].filter((row) => matches(row, where));
        state[model] = state[model].filter((row) => !matches(row, where)); state.writes += rows.length;
        if (model === "sessions") state.sets = state.sets.filter((set) => !rows.some((row) => row.id === set.workoutSessionId));
        return rows[0];
      },
    };
  }
  client.$transaction = async (operation) => {
    let release, snapshot;
    const tx = { ...client };
    delete tx.$transaction;
    tx.$queryRaw = async (_strings, userId) => {
      assert.equal(userId, "owner");
      const previous = tail;
      tail = new Promise((resolve) => { release = resolve; });
      await previous;
      state.locks++;
      snapshot = copy({ plans: state.plans, sessions: state.sessions, sets: state.sets, writes: state.writes });
      return [{ id: userId }];
    };
    try { return await operation(tx); }
    catch (error) { if (snapshot) Object.assign(state, snapshot); throw error; }
    finally { release?.(); }
  };
  function load(path) {
    const filename = resolve(path);
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiledModule = { exports: {} }; cache.set(filename, compiledModule);
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename }).outputText;
    vm.runInNewContext(output, { module: compiledModule, exports: compiledModule.exports, Date, FormData, Number, Map, Set, JSON,
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
  const defaults = load("src/lib/default-workout-plan.ts");
  const version = load("src/lib/workout-plan-version.ts");
  state.plans = copy(defaults.DEFAULT_WORKOUT_PLAN).map((day) => ({
    id: "plan-" + day.dayOfWeek, userId: "owner", isActive: true, ...copy(day),
    exercises: day.exercises.map((exercise, i) => ({ id: "exercise-" + day.dayOfWeek + "-" + i, sortOrder: i, ...copy(exercise) })),
  }));
  const addSession = (overrides = {}) => {
    const plan = state.plans[0];
    const row = {
      id: "session-" + ++serial, userId: "owner", workoutPlanId: plan.id, completed: false,
      createdAt: new Date(), date: new Date(), trainingDate: new Date(), endTime: null,
      notes: JSON.stringify({ label: plan.sessionName, source: "plan", loadUnit: "kg", planTemplateVersion: defaults.DEFAULT_WORKOUT_PLAN_VERSION, planContentHash: version.getWorkoutPlanContentHash(plan) }), ...overrides,
    };
    state.sessions.push(row); return row;
  };
  const form = (sessionId, values = {}) => {
    const data = new FormData();
    const fields = { sessionId, exerciseName: state.plans[0].exercises[0].exerciseName, planExerciseId: "foreign-exercise", setNumber: "1", weightUsed: "25.5", repsCompleted: "12", actualRPE: "7", notes: "", expectedSet: "null", ...values };
    for (const [key, value] of Object.entries(fields)) if (value !== undefined) data.set(key, value);
    return data;
  };
  return { state, actions: load("src/actions/workout.ts"), load, client, addSession, form, setAuth: (value) => { auth = value; } };
}

test("concurrent starts and retries return the same open session", async () => {
  const f = fixture();
  const results = await Promise.all(Array.from({ length: 5 }, () => f.actions.startWorkoutSession("plan-1")));
  assert.equal(new Set(results.map((result) => result.sessionId)).size, 1);
  assert.equal(f.state.sessions.length, 1);
  assert.equal(f.state.locks, 5);
  assert.equal((await f.actions.startWorkoutSession("plan-2")).sessionId, results[0].sessionId);
});

test("planned and custom starts share the same concurrency boundary", async () => {
  const f = fixture(); const form = new FormData();
  form.set("exercises", JSON.stringify([{ name: "Cable Curl", sets: 2, reps: "10-15", restSeconds: 60, muscleGroup: "Arms" }]));
  const results = await Promise.all([f.actions.startWorkoutSession("plan-1"), f.actions.startCustomWorkoutSession(form)]);
  assert.equal(results[0].sessionId, results[1].sessionId); assert.equal(f.state.sessions.length, 1);
});

test("duplicate save requests create one set and resolve a lost-response retry", async () => {
  const f = fixture(); const session = f.addSession();
  const results = await Promise.all([f.actions.logSet(f.form(session.id)), f.actions.logSet(f.form(session.id))]);
  assert.ok(results.every((result) => !result.error)); assert.equal(f.state.sets.length, 1);
  assert.equal(f.state.sets[0].planExerciseId, f.state.plans[0].exercises[0].id, "ignore client foreign key");
  const writes = f.state.writes;
  assert.equal((await f.actions.logSet(f.form(session.id))).savedSet.weightUsed, 25.5);
  assert.equal(f.state.writes, writes);
});

test("overlapping edits retain the first save and return current data for explicit resolution", async () => {
  const f = fixture(); const session = f.addSession();
  const results = await Promise.all([f.actions.logSet(f.form(session.id)), f.actions.logSet(f.form(session.id, { weightUsed: "30" }))]);
  const conflict = results.find((result) => result.conflict);
  assert.ok(conflict); assert.equal(conflict.savedSet.weightUsed, 25.5); assert.equal(f.state.sets[0].weightUsed, 25.5);
  const resolve = await f.actions.logSet(f.form(session.id, { weightUsed: "30", expectedSet: JSON.stringify(conflict.savedSet) }));
  assert.equal(resolve.savedSet.weightUsed, 30); assert.equal(f.state.sets.length, 1);
});

test("invalid partial, infinite and fractional integer input is rejected before any DB transaction", async () => {
  const f = fixture(); const session = f.addSession();
  for (const values of [{ weightUsed: "20kg" }, { weightUsed: "Infinity" }, { weightUsed: "0x10" }, { weightUsed: "1e2" }, { repsCompleted: "12.5" }, { actualRPE: "6.5" }, { duration: "2s" }, { setNumber: "1abc" }, { setNumber: "0x1" }, { expectedSet: "{}" }]) {
    assert.ok((await f.actions.logSet(f.form(session.id, values))).error, JSON.stringify(values));
  }
  assert.equal(f.state.locks, 0); assert.equal(f.state.sets.length, 0);
});

test("completion retries preserve end time and late saves cannot mutate completed history", async () => {
  const f = fixture(); const session = f.addSession();
  await f.actions.logSet(f.form(session.id)); await f.actions.completeSession(session.id);
  const snapshot = copy(f.state); const endTime = f.state.sessions[0].endTime;
  await f.actions.completeSession(session.id);
  assert.equal(f.state.sessions[0].endTime.getTime(), endTime.getTime()); assert.equal(f.state.writes, snapshot.writes);
  assert.ok((await f.actions.logSet(f.form(session.id, { repsCompleted: "8", expectedSet: undefined }))).error);
  assert.deepEqual(f.state.sets, snapshot.sets);
  assert.ok((await f.actions.discardWorkoutSession(session.id)).error);
});

test("empty completion fails, finish racing a queued save does not create a partial history", async () => {
  const f = fixture(); const session = f.addSession();
  assert.ok((await f.actions.completeSession(session.id)).error);
  const [saved, completed] = await Promise.all([f.actions.logSet(f.form(session.id)), f.actions.completeSession(session.id)]);
  assert.ok(!saved.error && !completed.error); assert.equal(f.state.sessions[0].completed, true); assert.equal(f.state.sets.length, 1);
});

test("all workout reads and mutations enforce authenticated record ownership", async () => {
  const f = fixture(); const foreign = f.addSession({ userId: "other" });
  assert.equal(await f.actions.getSessionWithSets(foreign.id), null);
  assert.equal((await f.actions.getWorkoutPlans("other")).length, 0);
  assert.equal((await f.actions.getWorkoutPlanDayStatuses("other")).length, 0);
  assert.equal(await f.actions.getTodaysPlan("other"), null);
  assert.equal((await f.actions.getPreviousSessionSets("other", "plan-1")).length, 0);
  assert.equal((await f.actions.getRecentSessions("other")).length, 0);
  assert.equal((await f.actions.getExerciseHistory("other", "Cable Curl")).length, 0);
  assert.ok((await f.actions.logSet(f.form(foreign.id))).error);
  assert.ok((await f.actions.completeSession(foreign.id)).error);
  await f.actions.discardWorkoutSession(foreign.id); assert.equal(f.state.sessions.length, 1);
  f.setAuth(null);
  assert.equal(await f.actions.getSessionWithSets(foreign.id), null);
  assert.ok((await f.actions.startWorkoutSession("plan-1")).error); assert.equal(f.state.writes, 0);
});

test("stale open snapshot is refreshed without deleting entries or relabeling legacy pounds", async () => {
  const f = fixture(); const session = f.addSession({ notes: JSON.stringify({ label: "Old plan", source: "plan", planTemplateVersion: "old" }) });
  f.state.sets.push({ id: "set", workoutSessionId: session.id, exerciseName: "Retired exercise", setNumber: 1, weightUsed: 100 });
  const saved = copy(f.state.sets);
  assert.equal(await f.load("src/lib/workout-plan-seed.ts").ensureDefaultWorkoutPlans(f.client, "owner"), true);
  assert.equal(f.state.sessions.length, 1); assert.deepEqual(f.state.sets, saved);
  assert.equal(JSON.parse(f.state.sessions[0].notes).loadUnit, "lb");
  assert.equal(JSON.parse(f.state.sessions[0].notes).planTemplateVersion, f.load("src/lib/default-workout-plan.ts").DEFAULT_WORKOUT_PLAN_VERSION);
});

test("plan version rotation retains all open sets and leaves completed sessions and old plan prescriptions untouched", async () => {
  const f = fixture(); f.state.plans[0].exercises[0].reps = "old prescription";
  const open = f.addSession(); const completed = f.addSession({ completed: true, endTime: new Date("2026-09-01") });
  f.state.sets.push({ id: "open-set", workoutSessionId: open.id, exerciseName: "Retired exercise", setNumber: 1, weightUsed: 25 });
  const originalCompleted = copy(completed), saved = copy(f.state.sets), oldExercises = copy(f.state.plans[0].exercises);
  await f.load("src/lib/workout-plan-seed.ts").ensureDefaultWorkoutPlans(f.client, "owner");
  assert.equal(f.state.sessions.length, 2); assert.deepEqual(f.state.sets, saved);
  assert.deepEqual(f.state.sessions.find((session) => session.id === completed.id), originalCompleted);
  assert.deepEqual(f.state.plans.find((plan) => plan.id === "plan-1").exercises, oldExercises);
  assert.notEqual(f.state.sessions.find((session) => session.id === open.id).workoutPlanId, "plan-1");
});

test("concurrent first plan reads do not create duplicate defaults", async () => {
  const f = fixture(); f.state.plans = [];
  const ensure = f.load("src/lib/workout-plan-seed.ts").ensureDefaultWorkoutPlans;
  await Promise.all([ensure(f.client, "owner"), ensure(f.client, "owner")]);
  assert.equal(f.state.plans.length, 5); assert.equal(new Set(f.state.plans.map((plan) => plan.dayOfWeek)).size, 5);
});

test("plan reset never silently discards an active workout", async () => {
  const f = fixture(); f.addSession(); const before = copy(f.state);
  assert.ok((await f.actions.resetCurrentWorkoutPlan()).error);
  assert.deepEqual(f.state.plans, before.plans); assert.deepEqual(f.state.sessions, before.sessions);
});

test("retained exercise names and extra logged sets stay visible without mutating plan order", () => {
  const f = fixture(); const exercises = f.state.plans[0].exercises; const before = copy(exercises);
  const result = f.load("src/lib/workout-session-exercises.ts").mergeSavedSessionExercises(exercises, [{ exerciseName: exercises[0].exerciseName, setNumber: 7 }, { exerciseName: "Retired exercise", setNumber: 2 }]);
  assert.equal(result[0].sets, 7); assert.equal(result.at(-1).exerciseName, "Retired exercise");
  assert.deepEqual(Array.from(result.slice(0, exercises.length), (exercise) => exercise.exerciseName), exercises.map((exercise) => exercise.exerciseName));
  assert.deepEqual(exercises, before);
});

test("failed normalization/save rolls back legacy values and metadata together", async () => {
  const f = fixture(); const session = f.addSession({ notes: JSON.stringify({ label: "Legacy", source: "plan" }) });
  f.state.sets.push({ id: "old", workoutSessionId: session.id, exerciseName: f.state.plans[0].exercises[1].exerciseName, setNumber: 1, weightUsed: 100 });
  const before = copy({ sets: f.state.sets, sessions: f.state.sessions }); f.state.failSetWrite = true;
  await assert.rejects(f.actions.logSet(f.form(session.id)), /Simulated failed write/);
  assert.deepEqual(f.state.sets, before.sets); assert.deepEqual(f.state.sessions, before.sessions);
  f.state.failSetWrite = false; assert.ok(!(await f.actions.logSet(f.form(session.id))).error);
  assert.equal(JSON.parse(f.state.sessions[0].notes).loadUnit, "kg"); assert.equal(f.state.sets[0].weightUsed, 45.359237);
});

test("previous performance survives plan IDs changing and remains scoped to the owner", async () => {
  const f = fixture(); const previous = f.addSession({ completed: true });
  f.state.sets.push({ id: "previous-set", workoutSessionId: previous.id, exerciseName: f.state.plans[0].exercises[0].exerciseName, setNumber: 1, weightUsed: 30, repsCompleted: 10, actualRPE: 7 });
  const next = copy(f.state.plans[0]); next.id = "new-plan"; f.state.plans.push(next);
  const history = await f.actions.getPreviousSessionSets("owner", "new-plan");
  assert.equal(history[0].weightUsed, 30); assert.equal(history[0].repsCompleted, 10);
  assert.equal(history[0].actualRPE, 7);
});

test("correcting an open set preserves stored duration and AMRAP when the editor does not submit them", async () => {
  const f = fixture(); const session = f.addSession();
  const baseline = { weightUsed: 25.5, repsCompleted: 12, actualRPE: 7, notes: null };
  f.state.sets.push({ id: "timed-set", workoutSessionId: session.id, exerciseName: f.state.plans[0].exercises[0].exerciseName,
    setNumber: 1, ...baseline, duration: 45, isAMRAP: true });
  assert.ok(!(await f.actions.logSet(f.form(session.id, { repsCompleted: "13", expectedSet: JSON.stringify(baseline) }))).error);
  assert.equal(f.state.sets[0].duration, 45); assert.equal(f.state.sets[0].isAMRAP, true); assert.equal(f.state.sets[0].repsCompleted, 13);
});

test("unmatched open plans remain recoverable with their sets", async () => {
  const f = fixture(); const unusualPlan = copy(f.state.plans[0]);
  unusualPlan.id = "unmatched"; unusualPlan.dayOfWeek = 6; unusualPlan.isActive = false; f.state.plans.push(unusualPlan);
  const session = f.addSession({ workoutPlanId: unusualPlan.id, notes: "Old custom plan" });
  f.state.sets.push({ id: "retained", workoutSessionId: session.id, exerciseName: "Saved exercise", setNumber: 1, weightUsed: 20 });
  const before = copy({ sessions: f.state.sessions, sets: f.state.sets });
  await f.load("src/lib/workout-plan-seed.ts").ensureDefaultWorkoutPlans(f.client, "owner");
  assert.deepEqual(f.state.sessions, before.sessions); assert.deepEqual(f.state.sets, before.sets);
  assert.equal((await f.actions.startWorkoutSession("plan-1")).sessionId, session.id);
});

test("training date storage and weekdays are independent of process timezone across noon and DST", () => {
  const cases = [
    ["2026-09-10T15:59:59Z", "America/New_York", "2026-09-10T00:00:00.000Z", 4],
    ["2026-09-10T16:00:00Z", "America/New_York", "2026-09-11T00:00:00.000Z", 5],
    ["2026-09-10T04:00:00Z", "America/New_York", "2026-09-10T00:00:00.000Z", 4],
    ["2026-03-08T07:30:00Z", "America/New_York", "2026-03-08T00:00:00.000Z", 0],
    ["2026-11-01T06:30:00Z", "America/New_York", "2026-11-01T00:00:00.000Z", 0],
    ["2026-09-09T15:00:00Z", "Asia/Tokyo", "2026-09-10T00:00:00.000Z", 4],
  ];
  const script = `
    const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path"), ts = require("typescript");
    function load(filename) {
      const compiledModule = { exports: {} };
      const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      vm.runInNewContext(output, { module: compiledModule, exports: compiledModule.exports, Date, Intl,
        require: (name) => load(path.resolve(path.dirname(filename), name) + ".ts") });
      return compiledModule.exports;
    }
    const dates = load(path.resolve("src/lib/dates.ts"));
    const cases = JSON.parse(process.argv[1]);
    process.stdout.write(JSON.stringify(cases.map(([timestamp, timezone]) => {
      const instant = new Date(timestamp);
      return [dates.getTrainingDate(instant, timezone).toISOString(), dates.getTrainingDayOfWeek(instant, timezone), dates.getTrainingDayNumber(instant, timezone)];
    })));
  `;
  const expected = cases.map(([, , iso, weekday]) => [iso, weekday, weekday >= 1 && weekday <= 5 ? weekday : null]);
  for (const timezone of ["UTC", "America/New_York", "Asia/Tokyo"]) {
    const result = spawnSync(process.execPath, ["-e", script, JSON.stringify(cases)], { cwd: process.cwd(), env: { ...process.env, TZ: timezone }, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), expected, `process timezone ${timezone}`);
  }
});

test("rotated plans authorize recovered drafts only from the owned old exercise identities",async()=>{
 const f=fixture();const oldName="Retired draft movement";f.state.plans[0].exercises[0].exerciseName=oldName;
 const session=f.addSession();await f.load("src/lib/workout-plan-seed.ts").ensureDefaultWorkoutPlans(f.client,"owner");
 assert.ok(JSON.parse(f.state.sessions[0].notes).retainedExerciseNames.includes(oldName));
 const result=await f.actions.logSet(f.form(session.id,{exerciseName:oldName,weightUsed:"22.5",repsCompleted:"12",actualRPE:"7"}));
 assert.ok(!result.error,result.error);assert.equal(f.state.sets[0].exerciseName,oldName);assert.equal(f.state.sets[0].planExerciseId,null);
 assert.ok((await f.actions.logSet(f.form(session.id,{exerciseName:"Foreign injected exercise"}))).error);
});
