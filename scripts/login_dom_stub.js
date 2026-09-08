// Dev-only harness: drives the served /ui script's login flow in Node.
// Appended AFTER the page JS. Not shipped, not imported by prod code.
(function () {
  const els = {};
  function mkEl(id) {
    return {
      id, textContent: "", value: "", disabled: false, dataset: {},
      style: { display: "" },
      classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
      onclick: null,
    };
  }
  ["login-gate", "login-token", "btn-login", "login-err", "console",
   "hero-kicker", "hero-sub", "verify-result", "stat-nodes", "stat-best",
   "stat-uptime", "stat-refresh", "pills", "bench-body", "probe-progress",
   "probe-fill", "probe-txt", "history-line", "history-list", "foot-status",
   "toast", "node-search", "btn-verify", "btn-refresh", "btn-fullprobe",
  ].forEach((id) => { els[id] = mkEl(id); });
  // console starts hidden, gate visible (mirrors served HTML)
  els["console"].style.display = "none";

  const store = {};
  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  let fetchMode = "ok"; // "ok" | "unauth"
  global.fetch = async (path) => {
    if (path === "/api/status" && fetchMode === "unauth") {
      return { status: 401, ok: false, text: async () => "nope", json: async () => ({}) };
    }
    if (path === "/api/status") {
      return {
        status: 200, ok: true,
        json: async () => ({
          endpoints: [], countries: [], preferred_tag: null,
          refresh_ok: 0, refresh_fail: 0, uptime_seconds: 1, last_error: null,
          full_probe: { state: "idle", done: 0, total: 0 },
          probe: { state: "idle" }, verify: { state: "idle" },
          refresh_history: [],
        }),
      };
    }
    throw new Error("unexpected fetch " + path);
  };
  global.document = {
    getElementById: (id) => els[id] || null,
    querySelector: (sel) => (sel === ".login-card" ? mkEl("card") : null),
    querySelectorAll: () => [],
    createElement: () => mkEl("anon"),
  };
  global.setInterval = () => 0;
  global.setTimeout = (fn) => 0;

  const assert = require("assert");
  (async () => {
    // 1. success path
    els["login-token"].value = "vpn";
    await loginEnter();
    assert.strictEqual(els["console"].style.display, "", "console shown after ok login");
    assert.ok(els["login-gate"].classList.contains("hidden"), "gate hidden after ok login");
    assert.strictEqual(store["admin_token"], "vpn", "token stored");
    console.log("PASS: login success path");

    // 2. failure path
    lockConsole();
    assert.strictEqual(store["admin_token"], undefined, "token cleared on lock");
    assert.strictEqual(els["console"].style.display, "none", "console hidden after lock");
    fetchMode = "unauth";
    els["login-token"].value = "wrong";
    await loginEnter();
    assert.strictEqual(els["console"].style.display, "none", "console stays hidden on 401");
    assert.ok(!els["login-gate"].classList.contains("hidden"), "gate stays visible on 401");
    assert.ok(els["login-err"].textContent.length > 0, "error text shown on 401");
    assert.strictEqual(store["admin_token"], undefined, "bad token not stored");
    console.log("PASS: login failure path");
  })().catch((e) => { console.error("HARNESS FAIL:", e); process.exit(1); });
})();
