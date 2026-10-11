import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const initialWeek = { date: "2026-10-13", dayOfWeek: 2, completedToday: false, completedDates: [], todayDose: null };

// Exercise the actual component's handlers and subsequent renders. This checks
// client state and requests; it makes no claim about rendered browser layouts.
function fixture() {
  let active, hookIndex = 0;
  const modules = new Map();
  const env = { requests: [], refreshes: 0, response: async () => ({}) };
  const hooks = {
    useState(initial) {
      const index = hookIndex++, host = active;
      if (!(index in host.slots)) host.slots[index] = typeof initial === "function" ? initial() : initial;
      return [host.slots[index], value => { host.slots[index] = typeof value === "function" ? value(host.slots[index]) : value; }];
    },
    useRef(initial) { return active.slots[hookIndex++] ??= { current: initial }; },
    useTransition() {
      const [pending, setPending] = hooks.useState(false);
      return [pending, operation => { setPending(true); Promise.resolve(operation()).finally(() => setPending(false)); }];
    },
  };
  const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
  const ui = new Proxy({}, { get: (_target, name) => name });
  function load(file) {
    let path = resolve(file);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (modules.has(path)) return modules.get(path).exports;
    const loaded = { exports: {} }; modules.set(path, loaded);
    const source = ts.transpileModule(readFileSync(path, "utf8"), { fileName: path, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(source, { module: loaded, exports: loaded.exports, FormData, Date, Intl, Set,
      require(name) {
        if (name === "react") return hooks;
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (name === "next/navigation") return { useRouter: () => ({ refresh() { env.refreshes++; } }) };
        if (name === "@/actions/home-core") return { logHomeCore: async form => { env.requests.push(Object.fromEntries(form)); return env.response(); } };
        if (name === "lucide-react" || name.startsWith("@/components/")) return ui;
        if (name === "@/lib/utils") return { cn: (...parts) => parts.filter(Boolean).join(" ") };
        if (name.startsWith("@/")) return load(resolve("src", name.slice(2)));
        if (name.startsWith(".")) return load(resolve(dirname(path), name));
        return require(name);
      },
    }, { filename: path });
    return loaded.exports;
  }
  const Component = load("src/components/mobility/HomeCoreRoutine.tsx").HomeCoreRoutine;
  env.mount = (week = initialWeek) => {
    const host = { slots: [], week };
    host.render = (nextWeek) => { if (nextWeek) host.week = nextWeek; active = host; hookIndex = 0; host.tree = Component({ week: host.week }); return host; };
    host.nodes = predicate => nodes(host.tree).filter(predicate);
    host.button = label => { const node = host.nodes(node => ["Button", "button"].includes(node.type) && text(node) === label)[0]; assert.ok(node, `Missing button: ${label}`); return node; };
    return host.render();
  };
  return env;
}
function nodes(node) { if (Array.isArray(node)) return node.flatMap(nodes); if (!node || typeof node !== "object") return []; return [node, ...nodes(node.props?.children)]; }
function text(node) { if (Array.isArray(node)) return node.map(text).join(""); if (node === null || node === undefined || typeof node === "boolean") return ""; if (typeof node !== "object") return String(node); return text(node.props?.children); }

test("home core keeps the selected dose after a failed save and supports retry without concurrent submissions", async () => {
  const env = fixture(), host = env.mount();
  host.button("Build: 2 sets").props.onClick(); host.render();
  const checklist = () => host.nodes(node => node.type === "MobilityChecklist")[0];
  assert.equal(checklist().key, "full");
  assert.equal(checklist().props.blocks[0].exercises[1].dose, "2 sets of 10–15 reps");
  let reject;
  env.response = () => new Promise((_resolve, fail) => { reject = fail; });
  const staleSubmit = host.button("Mark core complete").props.onClick;
  staleSubmit(); staleSubmit(); host.render();
  assert.equal(env.requests.length, 1);
  assert.equal(env.requests[0].dose, "full");
  assert.equal(host.button("Saving core...").props.disabled, true);
  assert.equal(host.button("Start: 1 set").props.disabled, true);
  reject(new Error("Connection interrupted")); await flush(); host.render();
  assert.match(text(host.nodes(node => node.props.role === "alert")[0]), /not confirmed.*retry/);
  assert.equal(checklist().key, "full");
  assert.equal(host.button("Mark core complete").props.disabled, false);
  env.response = async () => ({});
  host.button("Mark core complete").props.onClick(); await flush(); host.render();
  assert.equal(env.requests.length, 2);
  assert.equal(env.refreshes, 1);
  assert.equal(host.button("Core logged today").props.disabled, true);
  assert.match(text(host.tree), /1 session logged this calendar week/);
  assert.match(text(host.nodes(node => node.props.role === "status")[0]), /completion is saved/);
  assert.equal(host.nodes(node => node.props.role === "alert").length, 0);
  host.render({ ...initialWeek, completedToday: true, completedDates: [initialWeek.date], todayDose: "full" });
  assert.match(text(host.tree), /1 session logged this calendar week/);
});

test("home core restores a saved two-set dose on remount and leaves a reported save error retryable", async () => {
  const env = fixture();
  const completed = env.mount({ ...initialWeek, completedToday: true, completedDates: [initialWeek.date], todayDose: "full" });
  assert.equal(completed.button("Build: 2 sets").props["aria-pressed"], true);
  completed.button("Core logged today").props.onClick();
  assert.equal(env.requests.length, 0);
  const host = env.mount();
  env.response = async () => ({ error: "Choose one or two sets" });
  host.button("Mark core complete").props.onClick(); await flush(); host.render();
  assert.equal(text(host.nodes(node => node.props.role === "alert")[0]), "Choose one or two sets");
  assert.equal(host.button("Start: 1 set").props["aria-pressed"], true);
  assert.equal(host.button("Mark core complete").props.disabled, false);
  assert.equal(env.refreshes, 0);
});
