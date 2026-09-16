import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const clone = (value) => JSON.parse(JSON.stringify(value));
const saved = { weightUsed: 42.5, repsCompleted: 10, actualRPE: 7, notes: null };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

// Execute the actual client components with a small deterministic hook host.
// We call their rendered event handlers, inspect their next render, and replace
// only platform dependencies. No DOM/Android behavior is claimed by this suite.
function fixture(sharedStorage = new Map()) {
  let active, hookIndex = 0;
  const modules = new Map();
  const env = { now: 1_800_000_000_000, blockStorage: false, requests: [], navigation: [], notices: [], vibrations: [], focus: [], intervals: new Set(), storage: sharedStorage };
  const window = new EventTarget();
  Object.assign(window, {
    localStorage: {
      get length() { return sharedStorage.size; }, key: (index) => [...sharedStorage.keys()][index] ?? null,
      getItem: (key) => sharedStorage.get(key) ?? null,
      setItem: (key, value) => { if (env.blockStorage) throw new Error("Storage blocked"); sharedStorage.set(key, value); },
      removeItem: (key) => { if (env.blockStorage) throw new Error("Storage blocked"); sharedStorage.delete(key); },
    },
    confirm: () => true,
    setInterval: (fn) => { env.intervals.add(fn); return fn; }, clearInterval: (fn) => env.intervals.delete(fn),
    setTimeout: (fn) => { fn(); return fn; }, clearTimeout: () => {},
  });
  const document = new EventTarget(); document.visibilityState = "visible";
  env.window = window; env.document = document;
  class ClockDate extends Date { constructor(...args) { super(...(args.length ? args : [env.now])); } static now() { return env.now; } }
  env.actions = {
    logSet: async (form) => { env.requests.push(Object.fromEntries(form)); return { savedSet: saved }; },
    startWorkoutSession: async (planId) => { env.requests.push({ planId }); return { sessionId: "session" }; },
    completeSession: async (sessionId) => { env.requests.push({ complete: sessionId }); return {}; },
    discardWorkoutSession: async (sessionId) => { env.requests.push({ discard: sessionId }); return {}; },
  };
  const hooks = {
    useState: (initial) => { const index = hookIndex++; const host = active; if (!(index in host.slots)) host.slots[index] = typeof initial === "function" ? initial() : initial; return [host.slots[index], (value) => { host.slots[index] = typeof value === "function" ? value(host.slots[index]) : value; }]; },
    useRef: (value) => { const index = hookIndex++; return active.slots[index] ??= { current: value }; },
    useSyncExternalStore: (_subscribe, snapshot) => { hookIndex++; return snapshot(); },
    useMemo: (calculate) => { hookIndex++; return calculate(); },
    useEffect: (effect, deps) => {
      const index = hookIndex++, host = active, previous = host.slots[index];
      if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        host.effects.push(() => { previous?.cleanup?.(); host.slots[index] = { deps, cleanup: effect() }; });
      }
    },
    useTransition: () => {
      const [pending, setPending] = hooks.useState(false);
      return [pending, (operation) => { setPending(true); Promise.resolve(operation()).finally(() => setPending(false)); }];
    },
  };
  const jsx = (type, props, key) => {
    if (props?.ref) props.ref.current = { focus: () => env.focus.push(props["aria-label"]), scrollIntoView: () => {} };
    return { type, key, props: props ?? {} };
  };
  const ui = new Proxy({}, { get: (_target, name) => name });
  function load(path) {
    let filename = resolve(path);
    if (!existsSync(filename)) filename += existsSync(filename + ".tsx") ? ".tsx" : ".ts";
    if (modules.has(filename)) return modules.get(filename).exports;
    const compiledModule = { exports: {} }; modules.set(filename, compiledModule);
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }, fileName: filename }).outputText;
    vm.runInNewContext(output, {
      module: compiledModule, exports: compiledModule.exports, Date: ClockDate, FormData, Event, Error, Number, Map, Set, JSON, window, document,
      navigator: { vibrate: (pattern) => env.vibrations.push(pattern) }, crypto: { randomUUID },
      require: (name) => {
        if (name === "react") return hooks;
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "Fragment" };
        if (name === "next/navigation") return { useRouter: () => ({ push: (path) => env.navigation.push(path), refresh: () => env.navigation.push("refresh") }) };
        if (name === "next/link") return { default: "Link" };
        if (name === "sonner") return { toast: { error: (message) => env.notices.push(message), success: (message) => env.notices.push(message) } };
        if (name === "lucide-react" || name.startsWith("@/components/ui/")) return ui;
        if (name === "@/actions/workout") return env.actions;
        if (name === "@/lib/utils") return { cn: (...parts) => parts.filter(Boolean).join(" ") };
        if (name.startsWith("@/")) return load(name.replace("@/", "src/"));
        if (name.startsWith(".")) return load(resolve(dirname(filename), name));
        return require(name);
      },
    }, { filename });
    return compiledModule.exports;
  }
  env.lib = load("src/lib/workout-entry-state.ts");
  env.mount = (name, props) => {
    const Component = load(`src/components/workout/${name}.tsx`)[name];
    const host = { slots: [], effects: [], props };
    host.render = (nextProps) => {
      if (nextProps) host.props = { ...host.props, ...nextProps };
      active = host; hookIndex = 0; host.tree = Component(host.props);
      host.effects.splice(0).forEach((effect) => effect()); return host;
    };
    host.nodes = (type) => nodes(host.tree).filter((node) => typeof type === "function" ? type(node) : node.type === type || node.type?.name === type);
    host.button = (label) => { const button = host.nodes((node) => ["Button", "button"].includes(node.type) && text(node) === label)[0]; assert.ok(button, `Missing button: ${label}`); return button; };
    host.input = (field) => { const input = host.nodes("Input").find((node) => node.props["aria-label"]?.endsWith(field)); assert.ok(input, `Missing input: ${field}`); return input; };
    host.change = (field, value) => { host.input(field).props.onChange({ target: { value } }); return host.render(); };
    host.submit = () => host.nodes("form")[0].props.onSubmit({ preventDefault() {} });
    host.unmount = () => host.slots.forEach((slot) => slot?.cleanup?.());
    return host.render();
  };
  return env;
}

function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== "object") return [];
  return [node, ...nodes(node.props?.children)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return text(node.props?.children);
}
function entryProps(overrides = {}) {
  return { sessionId: "session", planExerciseId: "row", exerciseName: "Machine Row", setNumber: 1, isFinisher: false, logged: null, previous: { weightUsed: 40, repsCompleted: 10 }, onSaved() {}, ...overrides };
}
function loggerProps(overrides = {}) {
  return { sessionId: "session", sessionName: "Upper A", exercises: [
    { id: "row", exerciseName: "Machine Row", sets: 2, reps: "8–12", exerciseType: "STANDARD", restSeconds: 90, targetRPE: "6–7" },
    { id: "curl", exerciseName: "Cable Curl", sets: 1, reps: "10–15", exerciseType: "STANDARD", restSeconds: 60 },
  ], existingSets: [], previousSets: [], startTime: new Date(1_800_000_000_000).toISOString(), trainingDate: "2027-01-15", isStale: false, ...overrides };
}

test("Resume and View render direct links without invoking the start action", () => {
  const env = fixture();
  const resume = env.mount("WorkoutSessionActionButton", { planId: "plan", status: "resume" });
  assert.equal(resume.nodes("Link")[0].props.href, "/workout");
  assert.equal(text(resume.tree), "Resume session");
  assert.equal(resume.nodes("Button")[0].props.onClick, undefined);
  const view = env.mount("WorkoutSessionActionButton", { planId: "plan", status: "view" });
  assert.equal(view.nodes("Link")[0].props.href, "/workout/history");
  assert.deepEqual(env.requests, []);
});

test("Start guards double taps, resets after interruption, and navigates after retry", async () => {
  const env = fixture(), first = deferred(); let calls = 0;
  env.actions.startWorkoutSession = async () => { calls++; return calls === 1 ? first.promise : { sessionId: "session" }; };
  const host = env.mount("WorkoutSessionActionButton", { planId: "plan", status: "start" });
  const click = host.button("Start session").props.onClick;
  click(); click(); host.render();
  assert.equal(calls, 1); assert.equal(host.button("Starting...").props.disabled, true);
  first.reject(new Error("Network interrupted")); await flush(); host.render();
  assert.equal(host.button("Start session").props.disabled, false);
  assert.match(env.notices[0], /interrupted/);
  host.button("Start session").props.onClick(); await flush();
  assert.equal(calls, 2); assert.deepEqual(env.navigation, ["/workout", "refresh"]);
});

test("entry drafts survive field edits, set/exercise switches and a fresh page instance; typing does not save", () => {
  const env = fixture();
  const first = env.mount("SetInput", entryProps()).change("weight", "42.5").change("reps", "11").change("RPE", "7");
  assert.equal(first.input("weight").props.value, "42.5");
  assert.equal(first.input("weight").props.onBlur, undefined);
  first.unmount();
  const second = env.mount("SetInput", entryProps({ setNumber: 2 }));
  assert.equal(second.input("weight").props.value, "");
  const other = env.mount("SetInput", entryProps({ exerciseName: "Cable Curl" }));
  assert.equal(other.input("reps").props.value, "");
  const refreshed = fixture(env.storage).mount("SetInput", entryProps());
  assert.equal(refreshed.input("weight").props.value, "42.5");
  assert.equal(refreshed.input("reps").props.value, "11");
  assert.equal(refreshed.input("RPE").props.value, "7");
  assert.deepEqual(env.requests, []);
});

test("previous performance includes the available RPE at the point of entry", () => {
  const env = fixture();
  const host = env.mount("SetInput", entryProps({ previous: { weightUsed: 35, repsCompleted: 10, actualRPE: 6 } }));
  assert.match(text(host.tree), /Previous: 35 kg × 10 · RPE 6/);
});

test("explicit save sends the exact saved baseline, guards double submit, retains failed data and retries", async () => {
  const env = fixture(), request = deferred(), acknowledged = [];
  let calls = 0;
  env.actions.logSet = async (form) => { env.requests.push(Object.fromEntries(form)); return ++calls === 1 ? request.promise : { savedSet: saved }; };
  const host = env.mount("SetInput", entryProps({ logged: { ...saved, weightUsed: 40.125 }, onSaved: (...args) => acknowledged.push(args) }));
  host.change("weight", "42.5"); host.submit(); host.submit(); host.render();
  assert.equal(calls, 1); assert.equal(host.button("Saving…").props.disabled, true);
  assert.equal(JSON.parse(env.requests[0].expectedSet).weightUsed, 40.125);
  request.reject(new Error("Network disconnected")); await flush(); host.render();
  assert.equal(host.input("weight").props.value, "42.5");
  assert.match(text(host.tree), /Network disconnected/);
  const refreshed = fixture(env.storage).mount("SetInput", entryProps({ logged: { ...saved, weightUsed: 40.125 } }));
  assert.equal(refreshed.input("weight").props.value, "42.5");
  host.submit(); await flush(); host.render({ logged: saved });
  assert.equal(calls, 2); assert.equal(env.lib.sessionDraftSnapshot("session"), "[]");
  assert.equal(acknowledged.length, 1); assert.equal(host.button("Saved").props.disabled, true);
});

test("refresh during an unconfirmed request preserves a retryable draft", () => {
  const env = fixture(); env.actions.logSet = () => new Promise(() => {});
  const host = env.mount("SetInput", entryProps()).change("reps", "10"); host.submit(); host.unmount();
  const refreshed = fixture(env.storage).mount("SetInput", entryProps());
  assert.match(text(refreshed.tree), /Save unconfirmed/);
  assert.equal(refreshed.button("Retry save").props.disabled, false);
  assert.equal(refreshed.input("reps").props.value, "10");
});

test("save acknowledgments retain newer cross-tab drafts and rebase them on the actual result", async () => {
  const env = fixture(), request = deferred(), acknowledged = [];
  env.actions.logSet = async () => request.promise;
  const host = env.mount("SetInput", entryProps({ onSaved: (...args) => acknowledged.push(args) })).change("weight", "42.5").change("reps", "10");
  host.submit();
  const key = env.lib.workoutDraftKey("session", "Machine Row", 1);
  const pending = env.lib.parseWorkoutDraft(env.lib.readWorkoutStorage(key));
  env.lib.writeWorkoutStorage(key, JSON.stringify({ ...pending, revision: "other-tab", status: "draft", fields: { ...pending.fields, reps: "12" } }));
  request.resolve({ savedSet: saved }); await flush(); host.render({ logged: saved });
  assert.equal(host.input("reps").props.value, "12");
  assert.deepEqual(clone(env.lib.parseWorkoutDraft(env.lib.readWorkoutStorage(key)).baseline), saved);
  assert.equal(acknowledged.length, 1); assert.equal(acknowledged[0][2], false, "Newer draft keeps the current editor");
  let nextBaseline;
  env.actions.logSet = async (form) => { nextBaseline = JSON.parse(form.get("expectedSet")); return { savedSet: { ...saved, repsCompleted: 12 } }; };
  host.submit(); await flush();
  assert.deepEqual(nextBaseline, saved); assert.equal(env.lib.sessionDraftSnapshot("session"), "[]");
});

test("a conflict preserves the draft until explicit replacement uses the server's current baseline", async () => {
  const env = fixture(); const remote = { ...saved, repsCompleted: 9 }; let calls = 0;
  env.actions.logSet = async (form) => { env.requests.push(Object.fromEntries(form)); return ++calls === 1 ? { error: "Saved elsewhere", conflict: true, savedSet: remote } : { savedSet: saved }; };
  const host = env.mount("SetInput", entryProps({ logged: { ...saved, weightUsed: 40 } })).change("weight", "42.5");
  host.submit(); await flush(); host.render();
  assert.equal(host.input("weight").props.value, "42.5"); assert.match(text(host.tree), /Your draft is preserved/);
  host.button("Replace saved set with my draft").props.onClick(); await flush();
  assert.deepEqual(JSON.parse(env.requests[1].expectedSet), remote); assert.equal(env.lib.sessionDraftSnapshot("session"), "[]");
});

test("storage failure is disclosed and failed removal does not resurrect a discarded draft", () => {
  const env = fixture(); const host = env.mount("SetInput", entryProps()).change("reps", "10");
  env.blockStorage = true; host.change("reps", "11");
  assert.match(text(host.tree), /storage is unavailable/);
  host.button("Discard draft").props.onClick(); host.render();
  assert.equal(host.input("reps").props.value, ""); assert.equal(env.lib.sessionDraftSnapshot("session"), "[]");
});

test("client entry validation accepts decimals and rejects invalid ranges, exponent text, RPE-only and long notes", () => {
  const env = fixture(); const fields = { weight: "0", reps: "1000", rpe: "1", notes: "" };
  assert.equal(env.lib.parseEntry(fields).values.repsCompleted, 1000);
  assert.equal(env.lib.parseEntry({ ...fields, weight: ".125" }).values.weightUsed, 0.125);
  for (const change of [{ weight: "1500.1" }, { weight: "0x10" }, { weight: "1e2" }, { reps: "1.5" }, { reps: "1001" }, { rpe: "0" }, { rpe: "7.5" }, { notes: "x".repeat(241) }, { weight: "", reps: "", rpe: "7" }]) {
    assert.ok(env.lib.parseEntry({ ...fields, ...change }).error, JSON.stringify(change));
  }
});

test("the current-set editor advances after success, shows the last saved load, and restores draft selection", () => {
  const env = fixture(), host = env.mount("SessionLogger", loggerProps());
  let editor = host.nodes("SetInput")[0];
  assert.equal(editor.props.exerciseName, "Machine Row"); assert.equal(editor.props.setNumber, 1);
  const firstKey = editor.key;
  editor.props.onSaved("Machine Row:1", saved); host.render(); editor = host.nodes("SetInput")[0];
  assert.equal(editor.props.setNumber, 2); assert.notEqual(editor.key, firstKey); assert.equal(editor.props.prefill.weightUsed, 42.5);
  assert.equal(editor.props.shouldAdvance, true);
  assert.equal(env.lib.parseRestState(env.lib.readWorkoutStorage(env.lib.restStorageKey("session"))).deadline, env.now + 90_000);
  const draftKey = env.lib.workoutDraftKey("session", "Cable Curl", 1);
  env.lib.writeWorkoutStorage(draftKey, JSON.stringify({ version: 1, fields: { weight: "10", reps: "", rpe: "", notes: "" }, baseline: null, revision: "draft", status: "draft" }));
  const reopened = env.mount("SessionLogger", loggerProps({ existingSets: [{ exerciseName: "Machine Row", setNumber: 1, ...saved }] }));
  assert.equal(reopened.nodes("SetInput")[0].props.exerciseName, "Cable Curl");
  assert.equal(reopened.button("Finish session").props.disabled, true);
});

test("save/finish/discard operations cannot overlap; completion failure remains retryable", async () => {
  const env = fixture(), host = env.mount("SessionLogger", loggerProps({ isStale: true })), request = deferred();
  host.nodes("SetInput")[0].props.onPendingChange(true); host.render();
  host.button("Finish session").props.onClick(); host.button("Discard old session").props.onClick();
  assert.deepEqual(env.requests, []); assert.equal(host.button("Discard old session").props.disabled, true);
  host.nodes("SetInput")[0].props.onPendingChange(false); host.render();
  env.actions.completeSession = async () => request.promise;
  host.button("Finish session").props.onClick(); host.render();
  assert.equal(host.nodes("SetInput")[0].props.disabled, true);
  request.reject(new Error("Could not finish")); await flush(); host.render();
  assert.equal(host.nodes("SetInput")[0].props.disabled, false); assert.match(text(host.tree), /Could not finish/);
  env.actions.completeSession = async () => ({});
  host.button("Finish session").props.onClick(); await flush();
  assert.deepEqual(env.navigation, ["/workout/history", "refresh"]);
});

test("zero-rest paired slots advance to their partner before rest, including unequal set counts and refresh", () => {
  const env = fixture();
  const props = loggerProps({ exercises: [
    { id: "neutral", exerciseName: "Neutral pulldown", sets: 3, reps: "8–12", exerciseType: "WORKING", restSeconds: 0, supersetGroup: "B" },
    { id: "close", exerciseName: "Close pulldown", sets: 2, reps: "10–12", exerciseType: "WORKING", restSeconds: 120, supersetGroup: "B" },
  ] });
  const host = env.mount("SessionLogger", props);
  const finishSet = () => { const editor = host.nodes("SetInput")[0]; editor.props.onSaved(`${editor.props.exerciseName}:${editor.props.setNumber}`, saved); host.render(); };
  finishSet();
  assert.equal(host.nodes("SetInput")[0].props.exerciseName, "Close pulldown");
  assert.equal(host.nodes("SetInput")[0].props.setNumber, 1);
  assert.equal(env.lib.readWorkoutStorage(env.lib.restStorageKey("session")), null);
  const reopened = env.mount("SessionLogger", { ...props, existingSets: [{ exerciseName: "Neutral pulldown", setNumber: 1, ...saved }] });
  assert.equal(reopened.nodes("SetInput")[0].props.exerciseName, "Close pulldown");
  finishSet();
  assert.equal(host.nodes("SetInput")[0].props.exerciseName, "Neutral pulldown");
  assert.equal(host.nodes("SetInput")[0].props.setNumber, 2);
  assert.equal(env.lib.parseRestState(env.lib.readWorkoutStorage(env.lib.restStorageKey("session"))).deadline, env.now + 120_000);
  finishSet(); finishSet();
  assert.equal(host.nodes("SetInput")[0].props.exerciseName, "Neutral pulldown");
  assert.equal(host.nodes("SetInput")[0].props.setNumber, 3);
  finishSet(); assert.match(text(host.tree), /All planned sets saved/);
});

test("the rest timer uses a persisted deadline through background throttling and refresh", () => {
  const env = fixture(); env.lib.startSessionRest("session", 90, env.now);
  const host = env.mount("RestTimer", { sessionId: "session", defaultSeconds: 90 });
  assert.equal(text(host.nodes((node) => node.props.role === "timer")[0]), "1:30");
  env.document.visibilityState = "hidden"; env.now += 65_000;
  env.document.dispatchEvent(new Event("visibilitychange")); host.render();
  assert.equal(text(host.nodes((node) => node.props.role === "timer")[0]), "0:25");
  host.unmount();
  const refreshed = env.mount("RestTimer", { sessionId: "session", defaultSeconds: 60 });
  assert.equal(text(refreshed.nodes((node) => node.props.role === "timer")[0]), "0:25");
  env.now += 30_000; env.document.visibilityState = "visible"; env.window.dispatchEvent(new Event("focus")); refreshed.render();
  assert.equal(text(refreshed.nodes((node) => node.props.role === "timer")[0]), "0:00");
  assert.equal(env.vibrations.length, 1); refreshed.render(); assert.equal(env.vibrations.length, 1);
  assert.equal(refreshed.button("Restart").props.disabled, undefined);
});

test("introductory curl sets are actionable, explicit confirmation unlocks targets, and refresh retains the choice", () => {
  for (const [name,target,intro] of [["E1 Seated Leg Curl — Working Sets",3,2],["C2 Seated Leg Curl",4,3]]) {
    const env=fixture(), props=loggerProps({exercises:[{id:"curl",exerciseName:name,sets:target,reps:"10-15",restSeconds:120,exerciseType:"WORKING",cues:"Introduction: lower volume"}]});
    const host=env.mount("SessionLogger",props);
    assert.equal(host.nodes("ExerciseCard")[0].props.exercise.sets,intro);
    env.now += 14*86400000;host.render();assert.equal(host.nodes("ExerciseCard")[0].props.exercise.sets,intro);
    env.window.confirm=()=>false;host.button("Confirm recovery & enable target set").props.onClick();host.render();assert.equal(host.nodes("ExerciseCard")[0].props.exercise.sets,intro);
    env.window.confirm=()=>true;host.button("Confirm recovery & enable target set").props.onClick();host.render();assert.equal(host.nodes("ExerciseCard")[0].props.exercise.sets,target);
    assert.equal(env.mount("SessionLogger",props).nodes("ExerciseCard")[0].props.exercise.sets,target);
    const fresh=fixture(), introduction=fresh.mount("SessionLogger",props);
    for(let i=0;i<intro;i++){introduction.nodes("SetInput")[0].props.onSaved("",saved);introduction.render();}
    assert.match(text(introduction.tree),/All planned sets saved/);
  }
});

test("Tuesday 2/1 and Friday 2/3 pairs have no phantom sets or completion blocks",()=>{
  for(const counts of [[2,1],[2,3]]){
    const env=fixture(),host=env.mount("SessionLogger",loggerProps({exercises:counts.map((sets,i)=>({id:String(i),exerciseName:i?"Partner":"First",sets,reps:"10-15",restSeconds:i?120:0,supersetGroup:"B",exerciseType:"WORKING"}))}));
    const observed=[];
    for(let n=0;n<counts[0]+counts[1];n++){const editor=host.nodes("SetInput")[0];observed.push([editor.props.exerciseName,editor.props.setNumber]);editor.props.onSaved("",saved);host.render();}
    assert.deepEqual(observed,counts[0]===2&&counts[1]===1?[["First",1],["Partner",1],["First",2]]:[["First",1],["Partner",1],["First",2],["Partner",2],["Partner",3]]);
    assert.match(text(host.tree),/All planned sets saved/);
  }
});

test("removed exercise drafts remain reachable under original names after plan refresh",()=>{
  const env=fixture(),key=env.lib.workoutDraftKey("session","Removed curl",3);
  env.lib.writeWorkoutStorage(key,JSON.stringify({version:1,fields:{weight:"22.5",reps:"12",rpe:"7",notes:""},baseline:null,revision:"recovery",status:"draft"}));
  const host=env.mount("SessionLogger",loggerProps());
  assert.equal(host.nodes("SetInput")[0].props.exerciseName,"Removed curl");assert.equal(host.nodes("SetInput")[0].props.setNumber,3);
  assert.match(text(host.tree),/original exercise names/);
  assert.equal(host.button("Finish session").props.disabled,true);
  assert.equal(env.lib.parseWorkoutDraft(env.lib.readWorkoutStorage(key)).fields.weight,"22.5");
});

test("Thursday triset alternates all three identities while preserving programmed rest",()=>{
 const env=fixture(),host=env.mount("SessionLogger",loggerProps({exercises:["Pressdown","Reverse crossover","Bayesian curl"].map((exerciseName,i)=>({id:String(i),exerciseName,sets:3,reps:"10-15",restSeconds:120,supersetGroup:"C",exerciseType:"WORKING"}))}));
 const names=[];for(let i=0;i<9;i++){const editor=host.nodes("SetInput")[0];names.push(editor.props.exerciseName);editor.props.onSaved("",saved);host.render();assert.equal(env.lib.parseRestState(env.lib.readWorkoutStorage(env.lib.restStorageKey("session"))).duration,120);}
 assert.deepEqual(names,["Pressdown","Reverse crossover","Bayesian curl","Pressdown","Reverse crossover","Bayesian curl","Pressdown","Reverse crossover","Bayesian curl"]);
 assert.match(text(host.tree),/All planned sets saved/);
});

test("shoulder press is gated but existing entries survive; previous performance ignores only safe label changes",()=>{
 const env=fixture(),props=loggerProps({backPainGateActive:true,exercises:[{id:"press",exerciseName:"C1 Seated Machine Shoulder Press",sets:2,exerciseType:"WORKING"},{id:"ext",exerciseName:"D1 Seated Leg Extension",sets:2,exerciseType:"WORKING"}],previousSets:[{exerciseName:"D1 Leg Extension",setNumber:1,...saved}]});
 const host=env.mount("SessionLogger",props);assert.equal(host.nodes("SetInput")[0].props.exerciseName,"D1 Seated Leg Extension");assert.equal(host.nodes("SetInput")[0].props.previous.weightUsed,42.5);
 const retained=env.mount("SessionLogger",{...props,existingSets:[{exerciseName:"C1 Seated Machine Shoulder Press",setNumber:1,...saved}]});assert.ok(retained.nodes("ExerciseCard").some(n=>n.props.exercise.exerciseName==="C1 Seated Machine Shoulder Press"));
});
