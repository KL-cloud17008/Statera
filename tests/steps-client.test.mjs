import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url), ts = require("typescript");
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const entries = [{ id: "one", date: "2026-11-01", steps: 12000 }, { id: "zero", date: "2026-11-03", steps: 0 }];
function nodes(node) { if (Array.isArray(node)) return node.flatMap(nodes); if (!node || typeof node !== "object") return []; return [node, ...nodes(node.props?.children)]; }
function text(node) { if (Array.isArray(node)) return node.map(text).join(""); if (node == null || typeof node === "boolean") return ""; return typeof node === "object" ? text(node.props?.children) : String(node); }
function fixture() {
  const env = { requests: [], response: async () => ({}), focuses: 0, scrolls: 0 }, cache = new Map();
  let active, hookIndex;
  class TestDate extends Date { constructor(...args) { super(...(args.length ? args : ["2026-11-05T13:00:00Z"])); } }
  class TestFormData extends FormData { constructor(fields) { super(); for (const [key, value] of Object.entries(fields ?? {})) this.set(key, value); } }
  const hooks = {
    useState(initial) { const host = active, i = hookIndex++; if (!(i in host.slots)) host.slots[i] = typeof initial === "function" ? initial() : initial; return [host.slots[i], value => { const next = typeof value === "function" ? value(host.slots[i]) : value; if (!Object.is(next, host.slots[i])) { host.slots[i] = next; host.dirty = true; } }]; },
    useRef(initial) { return active.slots[hookIndex++] ??= { current: initial }; },
    useMemo(callback) { hookIndex++; return callback(); },
    useEffect(callback, deps) { const i = hookIndex++, host = active, previous = host.effects[i]; if (!previous || deps.some((v, j) => !Object.is(v, previous.deps[j]))) host.queue.push(() => { host.effects[i] = { deps }; callback(); }); },
  };
  const ui = new Proxy({}, { get: (_target, name) => name }), jsx = (type, props, key) => ({ type, props: props ?? {}, key });
  function load(file) {
    let path = resolve(file); if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path).exports;
    const loaded = { exports: {} }; cache.set(path, loaded);
    const source = ts.transpileModule(readFileSync(path, "utf8"), { fileName: path, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(source, { module: loaded, exports: loaded.exports, Date: TestDate, Intl, FormData: TestFormData, Map, Set,
      require(name) {
        if (name === "react") return hooks;
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (name === "next/link") return { default: "Link" };
        if (name === "sonner") return { toast: { success() {} } };
        if (name === "@/components/settings/AppSettingsProvider") return { useAppSettings: () => ({ settings: { stepGoal: 9000, distanceUnit: "mi" } }) };
        if (name === "@/actions/steps") return Object.fromEntries(["logSteps", "updateStepsEntry"].map(action => [action, async form => { env.requests.push({ action, ...Object.fromEntries(form) }); return env.response(); }]));
        if (name === "lucide-react" || name.startsWith("@/components/")) return ui;
        if (name.startsWith("@/")) return load(resolve("src", name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return require(name);
      },
    }, { filename: path });
    return loaded.exports;
  }
  env.mount = (name, props) => {
    const Component = load(`src/components/steps/${name}.tsx`)[name], host = { slots: [], effects: [], props };
    host.render = next => { if (next) host.props = { ...host.props, ...next }; let attempts = 0; do { active = host; hookIndex = 0; host.dirty = false; host.queue = []; host.tree = Component(host.props); assert.ok(++attempts < 10); } while (host.dirty); host.queue.forEach(run => run()); return host; };
    host.node = predicate => nodes(host.tree).find(predicate);
    host.input = id => host.node(node => node.props.id === id);
    host.child = name => host.node(node => node.type === name);
    host.submit = () => host.child("form").props.onSubmit({ preventDefault() {}, currentTarget: { date: host.input("steps-date")?.props.value ?? host.node(n => n.props.name === "date").props.value, steps: host.node(n => n.props.name === "steps").props.value } });
    return host.render();
  };
  return env;
}

test("calendar and entry share the selected date, backfill links, and a synchronous save lock", () => {
  const env = fixture(), page = env.mount("StepsPageClient", { entries, timezone: "America/New_York" });
  assert.equal(page.child("StepsEntryForm").props.selectedDate, "2026-11-05");
  page.child("StepsHeatmap").props.onSelectDate("2026-11-02"); page.render();
  assert.equal(page.child("StepsEntryForm").props.selectedDate, "2026-11-02");
  assert.equal(page.child("StepsEntryForm").props.focusRequest, 1);
  page.child("StepsEntryForm").props.onDateChange("2026-10-31"); page.render();
  assert.equal(page.child("StepsHeatmap").props.selectedDate, "2026-10-31");
  assert.equal(page.child("StepsEntryForm").props.focusRequest, 1);
  page.child("StepsEntryForm").props.onPendingChange(true);
  page.child("StepsHeatmap").props.onSelectDate("2026-11-04"); page.render();
  assert.equal(page.child("StepsHeatmap").props.disabled, true);
  assert.equal(page.child("StepsEntryForm").props.selectedDate, "2026-10-31");
  page.child("StepsEntryForm").props.onPendingChange(false); page.render({ backfillDate: "2026-11-03" });
  assert.equal(page.child("StepsEntryForm").props.selectedDate, "2026-11-03");
  assert.equal(page.child("StepsEntryForm").key, undefined, "date changes must not remount and discard count drafts");
  assert.equal(env.requests.length, 0, "selecting a date never saves");
});

test("switching dates keeps unfinished counts, loads saved zero totals, and calendar focus does not interrupt the native date picker", () => {
  const env = fixture(), dates = [], form = env.mount("StepsEntryForm", { entries, selectedDate: "2026-11-02", onDateChange: date => dates.push(date) });
  assert.equal(form.input("steps-value").props.value, "");
  form.input("steps-value").props.onChange({ target: { value: "9250" } }); form.render({ selectedDate: "2026-11-01" });
  assert.equal(form.input("steps-value").props.value, "12000");
  form.input("steps-value").props.onChange({ target: { value: "13500" } }); form.render({ selectedDate: "2026-11-03" });
  assert.equal(form.input("steps-value").props.value, "0");
  form.render({ selectedDate: "2026-11-02" }); assert.equal(form.input("steps-value").props.value, "9250");
  form.child("form").props.ref.current = { scrollIntoView() { env.scrolls++; } };
  form.input("steps-value").props.ref.current = { focus() { env.focuses++; } };
  form.render({ focusRequest: 1 }); assert.equal(env.focuses, 1); assert.equal(env.scrolls, 1);
  form.input("steps-date").props.onChange({ target: { value: "2026-11-04" } }); form.render({ selectedDate: "2026-11-04" });
  assert.deepEqual(dates, ["2026-11-04"]); assert.equal(env.focuses, 1);
  form.render({ selectedDate: "2026-11-01" }); assert.equal(form.input("steps-value").props.value, "13500");
  assert.equal(env.requests.length, 0);
});

test("failed step saves retain their date and count, retry once, and scope feedback to the submitted day", async () => {
  const env = fixture(), pending = [], form = env.mount("StepsEntryForm", { entries, selectedDate: "2026-11-02", onPendingChange: value => pending.push(value) });
  form.input("steps-value").props.onChange({ target: { value: "9250" } }); form.render();
  let reject; env.response = () => new Promise((_resolve, fail) => { reject = fail; });
  form.submit(); form.submit(); form.render();
  assert.equal(env.requests.length, 1); assert.equal(form.child("fieldset").props.disabled, true);
  reject(new Error("Offline")); await flush(); form.render();
  assert.match(text(form.tree), /Save could not be confirmed/); assert.equal(form.input("steps-value").props.value, "9250");
  form.render({ selectedDate: "2026-11-01" }); assert.doesNotMatch(text(form.tree), /Save could not be confirmed/);
  form.render({ selectedDate: "2026-11-02" }); env.response = async () => ({}); form.submit(); await flush(); form.render();
  assert.equal(env.requests.length, 2); assert.equal(env.requests[1].date, "2026-11-02"); assert.equal(env.requests[1].steps, "9250");
  assert.match(text(form.tree), /9,250 steps saved for 2026-11-02/); assert.deepEqual(pending, [true, false, true, false]);
  form.render({ selectedDate: "2026-11-03" }); assert.doesNotMatch(text(form.tree), /steps saved for/);
});

test("calendar selection follows the entry month, exposes exact totals, and blocks future dates and pending saves", () => {
  const env = fixture(), selected = [], calendar = env.mount("StepsHeatmap", { entries, goal: 9000, timezone: "America/New_York", selectedDate: "2026-11-03", onSelectDate: date => selected.push(date) });
  const day = date => calendar.node(node => node.props["aria-label"]?.startsWith(date));
  assert.match(day("Tuesday, November 3").props["aria-label"], /0 steps/);
  assert.equal(day("Tuesday, November 3").props["aria-pressed"], true);
  day("Monday, November 2").props.onClick(); assert.deepEqual(selected, ["2026-11-02"]);
  calendar.render({ selectedDate: "2026-11-02" }); assert.equal(day("Monday, November 2").props["aria-pressed"], true);
  assert.equal(day("Friday, November 6").props.disabled, true); day("Friday, November 6").props.onClick(); assert.equal(selected.length, 1);
  calendar.render({ disabled: true }); assert.ok(nodes(calendar.tree).filter(n => n.type === "button").every(n => n.props.disabled));
  day("Tuesday, November 3").props.onClick(); assert.equal(selected.length, 1);
  calendar.render({ disabled: false, selectedDate: "2026-10-31" }); assert.match(text(calendar.tree), /October 2026/);
  assert.equal(day("Saturday, October 31").props["aria-pressed"], true);
});

test("inline history date corrections retain their count and use the existing correction action", async () => {
  const env = fixture(), form = env.mount("StepsEntryForm", { editEntry: entries[0] });
  form.node(n => n.props.name === "date").props.onChange({ target: { value: "2026-10-31" } }); form.render();
  assert.equal(form.node(n => n.props.name === "steps").props.value, "12000");
  form.submit(); await flush();
  assert.equal(env.requests[0].action, "updateStepsEntry"); assert.equal(env.requests[0].originalDate, "2026-11-01"); assert.equal(env.requests[0].date, "2026-10-31"); assert.equal(env.requests[0].steps, "12000");
});
