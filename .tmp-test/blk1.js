
var activeCountry = "";
var lastStatus = null;
var probeSeq = 0, fullSeq = 0, verifySeq = 0;
var searchTimer = null, pollCtl = null;
var sortKey = "real", sortDir = 1, pendingTag = null, pendingTimer = null;
var lastBytes = null, rateHist = {dn: [], up: []}, lastLogLines = [];
function authHeaders() {
  return {"Authorization": "Bearer " + (localStorage.getItem("admin_token") || "")};
}
function showConsole() {
  document.getElementById("login-gate").classList.add("hidden");
  document.getElementById("console").style.display = "";
  refresh();
  refreshLogs(null);
}
function lockConsole() {
  probeSeq++; fullSeq++; verifySeq++;
  if (pollCtl) { pollCtl.abort(); pollCtl = null; }
  localStorage.removeItem("admin_token");
  document.getElementById("console").style.display = "none";
  const gate = document.getElementById("login-gate");
  gate.classList.remove("hidden");
  document.getElementById("login-token").value = "";
  document.getElementById("login-err").textContent = "";
}
async function loginEnter() {
  const input = document.getElementById("login-token");
  const btn = document.getElementById("btn-login");
  const err = document.getElementById("login-err");
  const trial = input.value.trim();
  if (!trial) { err.textContent = "请先填写 token"; return; }
  btn.disabled = true;
  btn.textContent = "验证中…";
  err.textContent = "";
  localStorage.setItem("admin_token", trial);
  try {
    await api("/api/status");
    showConsole();
  } catch (e) {
    localStorage.removeItem("admin_token");
    err.textContent = "token 不对，请重试";
    const card = document.querySelector(".login-card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }
  btn.disabled = false;
  btn.textContent = "进入控制台";
}
async function silentLogin() {
  if (!localStorage.getItem("admin_token")) return;
  try {
    await api("/api/status");
    showConsole();
  } catch (e) {
    localStorage.removeItem("admin_token");
  }
}
function toast(msg, isErr) {
  const box = document.getElementById("toast");
  if ([...box.children].some(c => c.textContent === msg)) return;
  while (box.children.length >= 3) box.firstChild.remove();
  const el = document.createElement("div");
  el.className = "toast-msg" + (isErr ? " err" : "");
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}
function setBusy(id, busy, busyText) {
  const el = document.getElementById(id);
  if (!el) return;
  if (busy) {
    if (el.dataset.orig === undefined) el.dataset.orig = el.textContent;
    el.disabled = true;
    el.classList.add("busy");
    el.textContent = busyText || "进行中…";
  } else {
    el.disabled = false;
    el.classList.remove("busy");
    if (el.dataset.orig !== undefined) el.textContent = el.dataset.orig;
  }
}
async function api(path, method, body, signal) {
  const r = await fetch(path, {method: method || "GET", headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined, signal: signal || undefined});
  if (r.status === 401) throw new Error("unauthorized: save ADMIN_TOKEN first");
  if (!r.ok) throw new Error("HTTP " + r.status + ": " + (await r.text()).slice(0, 160));
  return r.json();
}
function isAbort(e) { return !!e && e.name === "AbortError"; }
function fmtMs(v) { return v == null ? "—" : v + "ms"; }
function safeTag(t) { return String(t || "").replace(/[^a-zA-Z0-9-_]/g, ""); }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function latCls(v) { if (v == null) return "l-na"; if (v < 250) return "l-good"; if (v < 600) return "l-mid"; return "l-bad"; }
function latBar(v) {
  if (v == null) return '<span class="l-na">—</span>';
  const w = Math.max(6, Math.min(100, Math.round(v / 8)));
  return '<span class="lat"><span class="bar"><i style="width:' + w + '%;background:currentColor" class="' + latCls(v) + '"></i></span><span class="' + latCls(v) + '">' + v + 'ms</span></span>';
}
function fmtGB(v) { return v == null ? "—" : (v / 1e9).toFixed(1) + " GB"; }
function nodeQuery() { const el = document.getElementById("node-search"); return el ? el.value.trim().toLowerCase() : ""; }
function sortVal(e) {
  if (sortKey === "country") return (e.country || "") + (e.tag || "");
  if (sortKey === "tag") return e.tag || "";
  if (sortKey === "hand") return e.latency_ms == null ? 1e9 : e.latency_ms;
  if (sortKey === "alive") return -(e.alive_seconds || 0);
  return e.real_latency_ms == null ? 1e9 : e.real_latency_ms;
}
function filteredEndpoints(s) {
  const q = nodeQuery();
  const arr = s.endpoints.filter(e => (!activeCountry || e.country_short === activeCountry) &&
    (!q || (e.tag || "").toLowerCase().includes(q) || (e.country_short || "").toLowerCase().includes(q) ||
      (e.country || "").toLowerCase().includes(q) || (e.server || "").toLowerCase().includes(q)));
  arr.sort((a, b) => { const x = sortVal(a), y = sortVal(b); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
  return arr;
}
function debouncedRefresh() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { searchTimer = null; renderFiltered(); }, 300);
}
function clearFilter() {
  activeCountry = "";
  const el = document.getElementById("node-search");
  if (el) el.value = "";
  renderFiltered();
}
async function refresh() {
  try {
    const s = await api("/api/status");
    lastStatus = s;
    renderAll(s);
  } catch (e) {
    if (isAbort(e)) return;
    document.getElementById("hero-sub").textContent = "status fetch failed: " + e.message;
    toast("状态拉取失败: " + e.message, true);
  }
}
function renderFiltered() {
  if (!lastStatus) { refresh(); return; }
  renderAll(lastStatus);
}
function renderAll(s) {
  try {
    if (pendingTag && s.preferred_tag === pendingTag && !(s.probe && s.probe.state === "running")) pendingTag = null;
    const eps = filteredEndpoints(s);
    const pref = s.endpoints.find(e => e.tag === s.preferred_tag) || eps[0];
    document.getElementById("hero-kicker").innerHTML =
      (pref ? esc(pref.country_short) + "<br>" + fmtMs(pref.real_latency_ms != null ? pref.real_latency_ms : pref.latency_ms) : "—<br>无节点");
    document.getElementById("hero-sub").textContent =
      pref ? ("经 " + pref.tag + " 出站 · " + pref.server + ":" + pref.server_port + " · 存活 " + (pref.alive_seconds || 0) + "s") : "暂无可用节点";
    renderVerify(s.verify, pref);
    renderStatusbar(s, pref);
    renderTraffic(s);
    renderRoutes(s);
    renderSub(s);
    document.getElementById("stat-nodes").textContent = s.endpoints.length;
    const measured = s.endpoints.filter(e => e.real_latency_ms != null).map(e => e.real_latency_ms);
    document.getElementById("stat-best").textContent = measured.length ? Math.min.apply(null, measured) + "ms" : "—";
    document.getElementById("stat-uptime").textContent = Math.floor((s.uptime_seconds || 0) / 60) + "m";
    document.getElementById("stat-refresh").textContent = s.refresh_ok + "/" + s.refresh_fail;
    const byCountry = {};
    s.endpoints.forEach(e => { byCountry[e.country_short] = (byCountry[e.country_short] || 0) + 1; });
    document.getElementById("pills").innerHTML =
      '<span role="button" tabindex="0" aria-pressed="' + (activeCountry === "") + '" data-c="" class="' + (activeCountry === "" ? "on" : "") + '">全部 ' + s.endpoints.length + "</span>" +
      s.countries.map(c => '<span role="button" tabindex="0" aria-pressed="' + (activeCountry === c.code) + '" data-c="' + c.code + '" class="' + (activeCountry === c.code ? "on" : "") + '">' + esc(c.name) + " " + (byCountry[c.code] || 0) + "</span>").join("");
    document.querySelectorAll("#pills span").forEach(el => {
      const pick = () => { activeCountry = el.getAttribute("data-c"); renderFiltered(); };
      el.onclick = pick;
      el.onkeydown = (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } };
    });
    const probingTag = (s.probe && s.probe.state === "running") ? s.probe.tag : null;
    const rows = eps.map(e => {
      const t = safeTag(e.tag);
      const isPinned = e.tag === s.preferred_tag, isPending = e.tag === pendingTag;
      const pinned = isPinned ? '<span class="badge">生效中</span>' : "";
      const pending = isPending ? '<span class="badge probing">切换中</span>' : "";
      const probing = (!isPending && e.tag === probingTag) ? '<span class="badge probing">测速中</span>' : "";
      const unmeasured = e.real_latency_ms == null;
      const unm = (!isPinned && !isPending && unmeasured) ? '<span class="badge unmeasured">未测通</span>' : "";
      const disSw = unmeasured ? ' aria-disabled="true" class="disabled"' : "";
      const disPb = (e.tag === probingTag) ? ' aria-disabled="true" class="disabled"' : "";
      return "<tr class='" + (isPinned ? "pinned" : "") + (isPending ? " pending" : "") + "'><td class='hl'>" + esc(e.tag) + pinned + pending + probing + unm + "</td><td><span class='cc'>" + esc(e.country_short) + "</span>" + esc(e.country) + "</td><td class='hl'>" + fmtMs(e.latency_ms) +
      "</td><td class='hl'>" + latBar(e.real_latency_ms) + "</td><td>" + (e.alive_seconds || 0) + "s</td>" +
      "<td class='op'><a role='button' tabindex='0' data-probe='" + t + "'" + disPb + ">测速</a><a role='button' tabindex='0' data-switch='" + t + "'" + disSw + ">切换</a></td></tr>";
    }).join("");
    document.getElementById("bench-body").innerHTML = rows ||
      '<tr><td colspan="6"><div class="empty">无匹配节点，换个关键词或 <a style="color:#8ab4ff;cursor:pointer" onclick="clearFilter()">清除筛选</a></div></td></tr>';
    document.getElementById("node-count").textContent = eps.length + " / " + s.endpoints.length;
    renderProbeProgress(s.full_probe);
    document.getElementById("history-line").textContent =
      "refresh ok/fail: " + s.refresh_ok + "/" + s.refresh_fail + " · uptime: " + s.uptime_seconds + "s · error: " + (s.last_error || "—");
    const hist = (s.refresh_history || []).slice().reverse().slice(0, 12);
    document.getElementById("history-list").innerHTML = hist.length ?
      hist.map(h => "<li><b>" + esc(h.event) + "</b> " + esc(h.detail || "") + " · " + esc(h.ts || "") + "</li>").join("") :
      '<li style="color:#8b91a5">暂无事件</li>';
    document.getElementById("foot-status").textContent = "uptime " + s.uptime_seconds + "s · refresh " + s.refresh_ok + "/" + s.refresh_fail;
  } catch (e) {
    if (isAbort(e)) return;
    document.getElementById("hero-sub").textContent = "status fetch failed: " + e.message;
    toast("状态拉取失败: " + e.message, true);
  }
}
function renderStatusbar(s, pref) {
  const exitIp = (s.verify && s.verify.exit_ip) || "—";
  document.getElementById("sb-exit").textContent = exitIp;
  document.getElementById("sb-node").textContent = s.preferred_tag ? (s.preferred_tag + " · 已 pin") : (pref ? (pref.tag + " · 自动") : "—");
}
function renderTraffic(s) {
  const t = s.traffic || {};
  document.getElementById("stat-down").textContent = fmtGB(t.bytes_down).replace(" GB", "");
  document.getElementById("stat-up").textContent = fmtGB(t.bytes_up).replace(" GB", "");
  const now = Date.now();
  if (lastBytes && now > lastBytes.at) {
    const dt = (now - lastBytes.at) / 1000;
    const dn = Math.max(0, (t.bytes_down - lastBytes.dn) * 8 / dt / 1e6);
    const up = Math.max(0, (t.bytes_up - lastBytes.up) * 8 / dt / 1e6);
    document.getElementById("rate-dn").textContent = dn.toFixed(2);
    document.getElementById("rate-up").textContent = up.toFixed(2);
    rateHist.dn.push(dn); rateHist.up.push(up);
    if (rateHist.dn.length > 60) { rateHist.dn.shift(); rateHist.up.shift(); }
    document.getElementById("rate-card").hidden = false;
    drawSpark();
  }
  lastBytes = {at: now, dn: t.bytes_down || 0, up: t.bytes_up || 0};
}
function drawSpark() {
  const c = document.getElementById("spark");
  if (!c || !rateHist.dn.length) return;
  const x = c.getContext("2d"), W = c.width, H = c.height;
  x.clearRect(0, 0, W, H);
  const dark = document.documentElement.dataset.theme !== "light";
  const line = (arr, col, max) => {
    x.strokeStyle = col; x.lineWidth = 2; x.beginPath();
    arr.forEach((v, i) => { const px = i / Math.max(1, arr.length - 1) * W, py = H - 4 - Math.min(1, v / max) * (H - 10); i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.stroke();
  };
  line(rateHist.dn, dark ? "#6ee7b7" : "#047857", Math.max(2, ...rateHist.dn));
  line(rateHist.up, dark ? "#7dd3fc" : "#0284c7", Math.max(1, ...rateHist.up));
}
function renderRoutes(s) {
  const strip = document.getElementById("route-strip");
  if (!strip) return;
  strip.hidden = false;
  document.getElementById("route-direct").textContent = location.hostname + " 本机";
  const via = s.preferred_tag || "auto";
  const exitIp = (s.verify && s.verify.exit_ip) || "未验证";
  document.getElementById("route-chain").textContent = "via " + via + " · " + exitIp;
}
function renderSub(s) {
  const sec = document.getElementById("sec-sub");
  if (!sec) return;
  if (!s.vless) { sec.hidden = true; return; }
  sec.hidden = false;
  const host = location.hostname, uuid = s.vless.uuid;
  const mk = (path, label) => "vless://" + uuid + "@" + host + ":443?security=tls&sni=" + host + "&type=ws&path=" + path + "#" + label;
  sec.dataset.direct = mk(s.vless.direct_path, "direct");
  sec.dataset.chain = mk(s.vless.chain_path, "vpngate");
  document.getElementById("sub-direct").textContent = sec.dataset.direct;
  document.getElementById("sub-chain").textContent = sec.dataset.chain;
}
async function copySub(which) {
  const sec = document.getElementById("sec-sub");
  const text = which === "direct" ? sec.dataset.direct : sec.dataset.chain;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (_e) {}
    ta.remove();
  }
  toast("链接已复制");
}
async function refreshLogs(btn) {
  if (btn) { btn.disabled = true; }
  try {
    const r = await api("/api/logs?lines=100");
    lastLogLines = r.lines || [];
    renderLogs();
  } catch (e) { if (!isAbort(e)) toast("日志拉取失败: " + e.message, true); }
  if (btn) { btn.disabled = false; }
}
function logLevel(line) {
  if (/error|fail|refus|denied|exception/i.test(line)) return "err";
  if (/warn|timeout|retry|invalid/i.test(line)) return "warn";
  if (/verify|switch|refresh-ok|restarted|started|exit=/i.test(line)) return "ok";
  return "info";
}
function renderLogs() {
  const box = document.getElementById("logbox");
  if (!box) return;
  const lv = (document.getElementById("loglevel") || {}).value || "";
  const rows = lastLogLines.filter(l => !lv || logLevel(l) === lv);
  box.innerHTML = rows.length ? rows.map(l => '<div><span class="' + logLevel(l) + '">' + esc(l).slice(0, 300) + "</span></div>").join("")
    : '<div style="color:#8b91a5">暂无日志</div>';
  box.scrollTop = box.scrollHeight;
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = cur;
  try { localStorage.setItem("theme", cur); } catch (e) {}
  syncThemeLabel();
}
function syncThemeLabel() {
  const btn = document.getElementById("btn-theme");
  if (btn) btn.textContent = document.documentElement.dataset.theme === "light" ? "深色" : "浅色";
}
function skeletonRows() {
  let s = "";
  for (let i = 0; i < 5; i++) s += '<tr class="skel"><td><div class="sk" style="width:60%"></div></td><td><div class="sk" style="width:40%"></div></td><td><div class="sk" style="width:50%"></div></td><td><div class="sk" style="width:70%"></div></td><td><div class="sk" style="width:30%"></div></td><td><div class="sk" style="width:70%"></div></td></tr>';
  document.getElementById("bench-body").innerHTML = s;
}
function renderVerify(v, pref) {
  const el = document.getElementById("verify-result");
  if (!v || v.state === "idle") {
    el.textContent = pref ? "尚未验证当前出口，点击「验证出口 IP」真实走一次 VPN 链路。" : "";
    return;
  }
  if (v.state === "running") {
    el.textContent = "正在经 " + (v.via_tag || "…") + " 验证出口…";
    return;
  }
  el.textContent = v.exit_ip ? ("当前出口 IP：" + v.exit_ip + "（经 " + v.via_tag + "，" + v.ms + "ms）")
    : ("验证失败" + (v.error ? "：" + v.error : ""));
}
function renderProbeProgress(fp) {
  const box = document.getElementById("probe-progress");
  if (!fp || fp.state === "idle" || !fp.total) { box.classList.remove("show"); return; }
  box.classList.add("show");
  const pct = fp.total ? Math.round(fp.done / fp.total * 100) : 0;
  const fill = document.getElementById("probe-fill");
  fill.style.width = pct + "%";
  fill.setAttribute("aria-valuenow", String(pct));
  document.getElementById("probe-txt").textContent = "全量真测 " + fp.state + " " + fp.done + "/" + fp.total + "（" + pct + "%）";
}
async function switchTag(tag) {
  const ep = (lastStatus && lastStatus.endpoints || []).find(x => x.tag === tag);
  if (ep && ep.real_latency_ms == null) { toast("先测速再切换：该节点还未测通", true); return; }
  pendingTag = tag;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => { pendingTag = null; renderFiltered(); }, 20000);
  renderFiltered();
  try {
    const r = await api("/api/switch", "POST", {"tag": tag});
    toast("已切换到 " + (r.preferred_tag || tag) + "，正在验证新出口…");
    await verifyExit();
  } catch (e) {
    if (!isAbort(e)) toast("切换失败: " + e.message, true);
    pendingTag = null;
    refresh();
  }
}
async function probeOne(tag) {
  const my = ++probeSeq;
  if (pollCtl) pollCtl.abort();
  pollCtl = new AbortController();
  const sig = pollCtl.signal;
  try {
    await api("/api/probe", "POST", {"tag": tag}, sig);
    toast("单测 " + tag + " 进行中…");
    for (let i = 0; i < 40; i++) {
      if (my !== probeSeq) break;
      await new Promise(r => setTimeout(r, 3000));
      if (my !== probeSeq) break;
      const s = await api("/api/status", "GET", null, sig);
      lastStatus = s;
      if (s.probe && s.probe.state === "done" && s.probe.tag === tag) {
        toast(s.probe.ms != null ? ("单测 " + tag + " 完成：" + s.probe.ms + "ms") : ("单测 " + tag + " 未打通"));
        break;
      }
      if (i === 39) toast("单测超时，请重试", true);
    }
  } catch (e) {
    if (isAbort(e)) return;
    if (/409/.test(e.message || "")) { toast("已有单测进行中，稍后再试", true); refresh(); return; }
    toast("单测失败: " + e.message, true);
  }
  refresh();
}
async function refreshNow() {
  const btn = document.getElementById("btn-refresh");
  if (btn && btn.disabled) return;
  setBusy("btn-refresh", true, "刷新中…");
  if (lastStatus) skeletonRows();
  try {
    const r = await api("/api/refresh", "POST", {});
    toast(r.ok ? "节点已刷新" : "刷新完成但有失败");
    refreshLogs(null);
  } catch (e) { if (!isAbort(e)) toast("刷新失败: " + e.message, true); }
  setBusy("btn-refresh", false);
  refresh();
}
async function fullProbeNow() {
  const my = ++fullSeq;
  if (pollCtl) pollCtl.abort();
  pollCtl = new AbortController();
  const sig = pollCtl.signal;
  setBusy("btn-fullprobe", true, "真测中…");
  try {
    await api("/api/full_probe", "POST", {}, sig);
  } catch (e) {
    setBusy("btn-fullprobe", false);
    if (isAbort(e)) return;
    toast(/409/.test(e.message || "") ? "已有全量任务进行中，稍后再试" : ("全量真测失败: " + e.message), true);
    return;
  }
  try {
    toast("全量真测已开始，后台逐个拨号…");
    for (let i = 0; i < 200; i++) {
      if (my !== fullSeq) break;
      await new Promise(r => setTimeout(r, 3000));
      if (my !== fullSeq) break;
      const s = await api("/api/status", "GET", null, sig);
      lastStatus = s;
      renderProbeProgress(s.full_probe);
      if (s.full_probe && s.full_probe.state === "done") {
        toast("全量真测完成：" + s.full_probe.done + "/" + s.full_probe.total);
        break;
      }
      if (i === 199) toast("全量真测超时，请重试", true);
    }
  } catch (e) { if (!isAbort(e)) toast("全量真测失败: " + e.message, true); }
  setBusy("btn-fullprobe", false);
  refresh();
}
async function verifyExit() {
  const my = ++verifySeq;
  if (pollCtl) pollCtl.abort();
  pollCtl = new AbortController();
  const sig = pollCtl.signal;
  setBusy("btn-verify", true, "验证中…");
  document.getElementById("verify-result").textContent = "正在建立 VPN 链路并抓取出口 IP…";
  try {
    await api("/api/verify", "POST", {}, sig);
    for (let i = 0; i < 40; i++) {
      if (my !== verifySeq) break;
      await new Promise(r => setTimeout(r, 3000));
      if (my !== verifySeq) break;
      const s = await api("/api/status", "GET", null, sig);
      lastStatus = s;
      renderVerify(s.verify);
      if (s.verify && s.verify.state === "done") {
        toast(s.verify.exit_ip ? ("出口 IP：" + s.verify.exit_ip) : "验证未拿到出口 IP", !s.verify.exit_ip);
        break;
      }
      if (i === 39) toast("验证超时，请重试", true);
    }
  } catch (e) {
    if (isAbort(e)) return;
    if (/409/.test(e.message || "")) {
      toast("已有验证进行中，稍后再试", true);
      setBusy("btn-verify", false);
      refresh();
      return;
    }
    const el = document.getElementById("verify-result");
    el.textContent = "验证失败：" + e.message;
    el.style.color = "#fca5a5";
    toast("验证失败: " + e.message, true);
  }
  setBusy("btn-verify", false);
  refresh();
}
silentLogin();
syncThemeLabel();
document.getElementById("sortsel").addEventListener("change", (ev) => { sortKey = ev.target.value; sortDir = 1; renderFiltered(); });
document.querySelectorAll("th.sortable").forEach((th) => {
  th.onclick = () => {
    const k = th.getAttribute("data-k");
    if (sortKey === k) sortDir *= -1;
    else { sortKey = k; sortDir = 1; }
    const sel = document.getElementById("sortsel");
    if (sel && (k === "real" || k === "hand" || k === "country" || k === "alive")) sel.value = k;
    renderFiltered();
  };
});
document.getElementById("loglevel").addEventListener("change", renderLogs);
const spySecs = ["sec-overview", "sec-nodes", "sec-logs", "sec-sub", "sec-hist"];
window.addEventListener("scroll", () => {
  let cur = spySecs[0];
  spySecs.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 170) cur = id; });
  document.querySelectorAll("#topnav .links a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + cur));
}, {passive: true});
document.getElementById("bench-body").onclick = (ev) => {
  const link = ev.target && ev.target.closest ? ev.target.closest("a") : null;
  if (!link) return;
  if (link.getAttribute("aria-disabled") === "true") {
    if (link.getAttribute("data-switch")) toast("先测速再切换：该节点还未测通", true);
    return;
  }
  const p = link.getAttribute("data-probe");
  const sw = link.getAttribute("data-switch");
  if (p) probeOne(p);
  else if (sw) switchTag(sw);
};
document.getElementById("bench-body").onkeydown = (ev) => {
  if (ev.key !== "Enter" && ev.key !== " ") return;
  const link = ev.target && ev.target.closest ? ev.target.closest("a") : null;
  if (!link || link.getAttribute("aria-disabled") === "true") return;
  ev.preventDefault();
  const p = link.getAttribute("data-probe");
  const sw = link.getAttribute("data-switch");
  if (p) probeOne(p);
  else if (sw) switchTag(sw);
};
setInterval(() => {
  if (document.getElementById("console").style.display === "none") return;
  if (document.hidden) return;
  if (document.querySelector(".btn.busy")) return;
  refresh();
}, 15000);
