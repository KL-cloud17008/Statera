import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = ts.transpileModule(readFileSync("src/components/layout/PresentationFrame.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

// Exercise the real component lifecycle with controllable viewport/media
// events. Native browser and OS preference coverage is recorded separately.
function fixture({ reduced = false, pathname = "/weight", observerAvailable = true } = {}) {
  const seen = new Set(), observers = [], listeners = new Set();
  const preference = { matches: reduced, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  let host, index;
  const hooks = {
    createContext: () => ({}), useContext: () => seen,
    useRef: () => host.slots[index++] ??= { current: {} },
    useState: (value) => { const i = index++, owner = host; if (!(i in owner.slots)) owner.slots[i] = value; return [owner.slots[i], next => { owner.slots[i] = next; }]; },
    useEffect: (effect, deps) => {
      const i = index++, owner = host, old = owner.slots[i];
      if (!old || deps.some((value, j) => value !== old.deps[j])) owner.effects.push(() => { old?.cleanup?.(); owner.slots[i] = { deps, cleanup: effect() }; });
    },
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    enter() { if (!this.disconnected) this.callback([{ isIntersecting: true }]); }
  }
  const loadedModule = { exports: {} };
  vm.runInNewContext(source, {
    module: loadedModule, exports: loadedModule.exports,
    window: { matchMedia: () => preference }, IntersectionObserver: observerAvailable ? Observer : undefined,
    require: name => name === "react" ? hooks : name === "next/navigation" ? { usePathname: () => pathname } : name === "react/jsx-runtime" ? { jsx: (type, props) => ({ type, props }) } : { routeTone: () => "weight" },
  });
  const children = { input: "unsaved weigh-in", focused: true, scrollTop: 120 };
  const mount = () => {
    const owner = { slots: [], effects: [] };
    owner.render = () => { host = owner; index = 0; owner.tree = loadedModule.exports.FrameReveal({ name: "Trend", children }); owner.effects.splice(0).forEach(fn => fn()); return owner.tree; };
    owner.unmount = () => owner.slots.forEach(slot => slot?.cleanup?.());
    owner.render(); return owner;
  };
  return { mount, children, observers, seen, reduce: () => { preference.matches = true; listeners.forEach(fn => fn()); }, listeners };
}

test("frame content is available before reveal and its identity survives entry and rerenders", () => {
  const env = fixture(), host = env.mount();
  assert.equal(host.tree.props.children, env.children);
  assert.equal(host.tree.props["data-frame-enter"], undefined);
  env.observers[0].enter(); host.render(); host.render();
  assert.equal(host.tree.props["data-frame-enter"], "true");
  assert.equal(host.tree.props.children, env.children);
  assert.equal(env.observers.length, 1);
});

test("a return visit does not replay a section and disposes listeners", () => {
  const env = fixture(), first = env.mount();
  env.observers[0].enter(); first.render(); first.unmount();
  assert.equal(env.listeners.size, 0);
  const second = env.mount();
  assert.equal(second.tree.props["data-frame-enter"], undefined);
  assert.equal(env.observers.length, 1);
});

test("reduced motion leaves all content available without an entrance", () => {
  const env = fixture({ reduced: true }), host = env.mount();
  env.observers[0].enter(); host.render();
  assert.equal(host.tree.props["data-frame-enter"], undefined);
  assert.equal(host.tree.props.children, env.children);
});

test("enabling reduced motion cancels an active entrance", () => {
  const env = fixture(), host = env.mount();
  env.observers[0].enter(); host.render(); env.reduce(); host.render();
  assert.equal(host.tree.props["data-frame-enter"], undefined);
  assert.equal(host.tree.props.children, env.children);
});

test("active logging and browsers without IntersectionObserver remain static and usable", () => {
  for (const options of [{ pathname: "/workout" }, { observerAvailable: false }]) {
    const env = fixture(options), host = env.mount();
    assert.equal(env.observers.length, 0);
    assert.equal(host.tree.props["data-frame-enter"], undefined);
    assert.equal(host.tree.props.children, env.children);
  }
});
