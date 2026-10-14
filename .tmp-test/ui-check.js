try{document.documentElement.dataset.theme=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){document.documentElement.dataset.theme="dark"}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 55% 40% at 75% 8%,rgba(99,102,241,.28),transparent 70%),radial-gradient(ellipse 45% 35% at 12% 25%,rgba(34,211,238,.16),transparent 70%),radial-gradient(ellipse 50% 45% at 50% 100%,rgba(16,185,129,.14),transparent 70%),#000}
#topnav{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:26px;padding:14px 32px;font-size:14px;background:rgba(10,12,24,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.09)}
#topnav .logo{font-weight:800;font-size:16px;background:linear-gradient(90deg,#a5b4fc,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent}
#topnav .live{font-size:11px;color:#6ee7b7;border:1px solid rgba(110,231,183,.4);border-radius:999px;padding:2px 10px}
#topnav .links{display:flex;gap:22px;color:#ccc}
#topnav .right{margin-left:auto;display:flex;gap:14px;align-items:center}
#topnav input{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:10px;padding:7px 12px;font-size:13px}
#topnav .cta{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 18px;cursor:pointer;background:rgba(255,255,255,.06)}
#topnav .cta:hover{background:rgba(255,255,255,.14)}
.wrap{max-width:1180px;margin:0 auto;padding:34px 28px 60px}
.glass-card{background:rgba(255,255,255,.055);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.11);border-radius:22px;padding:28px 30px;margin-bottom:22px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
.glass-card h2{font-size:19px;font-weight:700;margin-bottom:6px}
.glass-card .desc{color:#a8adbd;font-size:13px;line-height:1.7;margin-bottom:16px}
#exit-card{background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(34,211,238,.1)),rgba(255,255,255,.055)}
#hero-kicker{font-size:52px;font-weight:800;letter-spacing:-.03em;line-height:1.08;background:linear-gradient(92deg,#fff,#a5b4fc 60%,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent}
#hero-sub{color:#c2c7d6;font-size:14px;margin-top:10px}
#verify-result{margin-top:12px;font-size:14px;color:#6ee7b7;min-height:22px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px 18px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.stat .k{font-size:12px;color:#8b91a5}
.stat .v{font-size:24px;font-weight:700;margin-top:4px}
.btn{border-radius:999px;padding:10px 24px;font-size:14px;cursor:pointer;border:1px solid rgba(255,255,255,.2);color:#fff;background:rgba(255,255,255,.07);transition:transform .12s ease,background .15s ease}
.btn:hover{background:rgba(255,255,255,.15)}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.55;cursor:wait;transform:none}
.btn.primary{background:linear-gradient(92deg,#6366f1,#0ea5e9);border:none;font-weight:600;box-shadow:0 6px 24px rgba(99,102,241,.45)}
.btn.busy{animation:pulse 1.1s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
#pills{display:flex;gap:10px;margin:14px 0;flex-wrap:wrap}
#pills span{border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:7px 18px;font-size:13px;color:#ddd;cursor:pointer;background:rgba(255,255,255,.04)}
#pills span.on{background:linear-gradient(92deg,#6366f1,#0ea5e9);color:#fff;border-color:transparent}
.actions{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
#btn-verify{background:linear-gradient(92deg,#6366f1,#0ea5e9);color:#fff;border-radius:999px;padding:10px 26px;font-size:14px;font-weight:600;cursor:pointer;border:none;box-shadow:0 6px 24px rgba(99,102,241,.45)}
#btn-refresh{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:10px 26px;font-size:14px;color:#fff;background:rgba(255,255,255,.07);cursor:pointer}
#btn-fullprobe{border:1px solid rgba(138,180,255,.55);border-radius:999px;padding:10px 26px;font-size:14px;color:#8ab4ff;background:rgba(138,180,255,.08);cursor:pointer}
#btn-verify:disabled,#btn-refresh:disabled,#btn-fullprobe:disabled{opacity:.55;cursor:wait}
#node-search{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:10px;padding:8px 14px;font-size:13px;width:230px}
table.bench{width:100%;border-collapse:collapse;font-size:14px}
table.bench th,table.bench td{text-align:left;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
table.bench th{color:#8b91a5;font-weight:500;font-size:12px}
table.bench tr:hover td{background:rgba(255,255,255,.035)}
table.bench td.hl{color:#fff;font-weight:600}
table.bench td.op a{color:#8ab4ff;cursor:pointer;text-decoration:none;margin-right:12px}
table.bench td.op a:hover{text-decoration:underline}
.badge{display:inline-block;font-size:11px;border-radius:999px;padding:2px 10px;margin-left:8px;background:linear-gradient(92deg,#6366f1,#0ea5e9);color:#fff}
.badge.probing{background:rgba(251,191,36,.18);color:#fbbf24;border:1px solid rgba(251,191,36,.4)}
#probe-progress{display:none;margin:14px 0 4px}
#probe-progress.show{display:block}
#probe-progress .bar{height:8px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}
#probe-progress .fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#6366f1,#22d3ee);transition:width .4s ease}
#probe-progress .txt{font-size:12px;color:#8b91a5;margin-top:6px}
#history-line{color:#8b91a5;font-size:13px;margin-top:14px}
#history-list{list-style:none;margin-top:10px;max-height:220px;overflow:auto}
#history-list li{font-size:12.5px;color:#a8adbd;padding:7px 4px;border-bottom:1px dashed rgba(255,255,255,.08)}
#history-list li b{color:#e5e7eb;font-weight:600}
#toast{position:fixed;right:22px;bottom:22px;z-index:100;display:flex;flex-direction:column;gap:10px}
.toast-msg{background:rgba(16,20,36,.92);border:1px solid rgba(110,231,183,.45);color:#d1fae5;border-radius:14px;padding:12px 18px;font-size:13px;max-width:360px;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:slidein .25s ease}
.toast-msg.err{border-color:rgba(248,113,113,.55);color:#fecaca}
@keyframes slidein{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.footer{color:#69707f;font-size:12.5px;text-align:center;padding:10px 0 30px}
#login-gate{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(ellipse 55% 40% at 75% 8%,rgba(99,102,241,.28),transparent 70%),radial-gradient(ellipse 45% 35% at 12% 25%,rgba(34,211,238,.16),transparent 70%),rgba(0,0,0,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
#login-gate.hidden{display:none}
.login-card{width:380px;max-width:92vw;text-align:center;padding:40px 36px}
.login-card .logo{font-weight:800;font-size:22px;background:linear-gradient(90deg,#a5b4fc,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent}
.login-card .sub{color:#8b91a5;font-size:13px;margin:10px 0 22px}
#login-token{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);color:#fff;border-radius:12px;padding:12px 16px;font-size:14px;margin-bottom:14px;text-align:center}
#btn-login{width:100%;background:linear-gradient(92deg,#6366f1,#0ea5e9);color:#fff;border-radius:12px;padding:12px;font-size:15px;font-weight:600;cursor:pointer;border:none;box-shadow:0 6px 24px rgba(99,102,241,.45)}
#btn-login:disabled{opacity:.55;cursor:wait}
#login-err{color:#fca5a5;font-size:13px;min-height:20px;margin-top:12px}
.shake{animation:shake .4s ease}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
#console.hidden{display:none}
#btn-lock{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 18px;cursor:pointer;background:rgba(255,255,255,.06);font-size:13px;color:#ddd}
#btn-lock:hover{background:rgba(255,255,255,.14)}
@media(max-width:768px){#hero-kicker{font-size:34px}.wrap{padding:20px 14px 44px}.stats{grid-template-columns:repeat(2,1fr)}#topnav .links{display:none}}
#bench-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
table.bench{min-width:560px}
table.bench td.op a{display:inline-block;padding:6px 10px;margin-right:4px;border-radius:8px}
table.bench td.op a.disabled{opacity:.38;cursor:not-allowed;text-decoration:none}
table.bench td.op a.disabled:hover{text-decoration:none}
@media(max-width:640px){.wrap{padding:16px 12px 40px}.glass-card{padding:20px 16px;border-radius:18px}#hero-kicker{font-size:30px}.stats{gap:10px}.stat{padding:12px 14px}.stat .v{font-size:20px}#node-search{width:100%;max-width:none}.actions .btn{flex:1 1 100%;text-align:center}#topnav{padding:12px 16px;gap:14px}#topnav .live{display:none}.glass-card,.stat{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}#toast{right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));left:max(12px,env(safe-area-inset-left))}.toast-msg{max-width:none}}
/* v2 新增元素（与深色皮肤同语言） */
.num,.stat .v{font-variant-numeric:tabular-nums}
#topnav .links a{color:#ccc;text-decoration:none;font-size:13px;padding:6px 12px;border-radius:10px}
#topnav .links a:hover{color:#fff;background:rgba(255,255,255,.07)}
#topnav .links a.on{color:#fff;background:rgba(255,255,255,.1)}
#btn-theme{border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 18px;cursor:pointer;background:rgba(255,255,255,.06);font-size:13px;color:#ddd}
#btn-theme:hover{background:rgba(255,255,255,.14)}
#statusbar{position:sticky;top:57px;z-index:49;display:flex;gap:20px;align-items:center;flex-wrap:wrap;background:rgba(10,12,24,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);padding:9px 32px;border-bottom:1px solid rgba(255,255,255,.09);font-size:12.5px;color:#a8adbd}
#statusbar b{color:#fff;font-weight:600;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px}
#statusbar .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#6ee7b7;margin-right:6px;box-shadow:0 0 8px #6ee7b7}
#statusbar .sp{flex:1}
section{scroll-margin-top:130px}
.route-strip{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
.route-strip .rt{flex:1;min-width:230px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:10px 16px;font-size:12.5px;color:#c2c7d6}
.route-strip .rt b{display:block;font-size:11.5px;color:#8b91a5;font-weight:600;margin-bottom:2px}
.route-strip .rt code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#7dd3fc}
#spark{width:100%;height:64px;display:block}
.rate-legend{display:flex;gap:18px;font-size:12px;color:#8b91a5;margin-top:8px}
.rate-legend i{display:inline-block;width:18px;height:2px;vertical-align:middle;margin-right:6px}
#sortsel{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:10px;padding:8px 10px;font-size:13px}
#sortsel option{background:#121826}
.node-count{margin-left:auto;font-size:12px;color:#8b91a5}
table.bench th.sortable{cursor:pointer;user-select:none}
table.bench th.sortable:hover{color:#fff}
table.bench tr.pinned td{background:rgba(99,102,241,.12)}
table.bench tr.pending td{opacity:.55}
.cc{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#7dd3fc;border:1px solid rgba(125,211,252,.35);border-radius:6px;padding:1px 7px;margin-right:8px}
.badge.unmeasured{background:rgba(125,211,252,.13);color:#7dd3fc}
.lat{display:flex;align-items:center;gap:9px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px}
.lat .bar{width:66px;height:6px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}
.lat .bar i{display:block;height:100%;border-radius:999px}
.l-good{color:#6ee7b7}.l-mid{color:#fbbf24}.l-bad{color:#fca5a5}.l-na{color:#69707f}
tr.skel td{padding:13px 14px}
.skel .sk{height:13px;border-radius:6px;background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(255,255,255,.14),rgba(255,255,255,.05));background-size:200% 100%;animation:sh 1.1s linear infinite}
@keyframes sh{to{background-position:-200% 0}}
.empty{padding:30px;text-align:center;color:#8b91a5;font-size:13px}
#logbox{background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px 18px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.8;max-height:300px;overflow:auto}
#logbox .t{color:#69707f}#logbox .ok{color:#6ee7b7}#logbox .warn{color:#fbbf24}#logbox .err{color:#fca5a5}
.subrow{display:flex;gap:12px;align-items:center;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:11px 16px;margin-bottom:10px}
.subrow code{flex:1;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;color:#8b91a5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.subrow .btn{padding:7px 18px;font-size:12.5px}
:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}
/* 浅色模式：同一套架构，纸面皮肤 */
html[data-theme="light"] body{background:#eef1f7;color:#0f172a}
html[data-theme="light"] body::before{background:radial-gradient(ellipse 55% 40% at 75% 8%,rgba(99,102,241,.14),transparent 70%),radial-gradient(ellipse 45% 35% at 12% 25%,rgba(34,211,238,.12),transparent 70%),radial-gradient(ellipse 50% 45% at 50% 100%,rgba(16,185,129,.1),transparent 70%),#eef1f7}
html[data-theme="light"] #topnav,html[data-theme="light"] #statusbar{background:rgba(255,255,255,.78);border-bottom-color:rgba(15,23,42,.09)}
html[data-theme="light"] #topnav .links a,html[data-theme="light"] #statusbar{color:#52607a}
html[data-theme="light"] #topnav .links a:hover{color:#0f172a;background:rgba(15,23,42,.06)}
html[data-theme="light"] #topnav .links a.on{color:#0f172a;background:rgba(15,23,42,.08)}
html[data-theme="light"] #btn-lock,html[data-theme="light"] #btn-theme{border-color:rgba(15,23,42,.18);background:rgba(15,23,42,.05);color:#334155}
html[data-theme="light"] #btn-lock:hover,html[data-theme="light"] #btn-theme:hover{background:rgba(15,23,42,.1)}
html[data-theme="light"] #topnav .live{color:#047857;border-color:rgba(4,120,87,.4)}
html[data-theme="light"] #topnav .logo{background:linear-gradient(90deg,#4f46e5,#0284c7);-webkit-background-clip:text;background-clip:text;color:transparent}
html[data-theme="light"] .glass-card,html[data-theme="light"] .stat{background:rgba(255,255,255,.72);border-color:rgba(15,23,42,.09);box-shadow:0 12px 32px rgba(15,23,42,.08)}
html[data-theme="light"] .glass-card .desc,html[data-theme="light"] .stat .k,html[data-theme="light"] table.bench th,html[data-theme="light"] #history-line,html[data-theme="light"] #history-list li,html[data-theme="light"] #probe-progress .txt,html[data-theme="light"] .rate-legend,html[data-theme="light"] .empty,html[data-theme="light"] .footer{color:#5b6b85}
html[data-theme="light"] #history-list li b{color:#1e293b}
html[data-theme="light"] #hero-kicker{background:linear-gradient(92deg,#0f172a,#4f46e5 60%,#0284c7);-webkit-background-clip:text;background-clip:text;color:transparent}
html[data-theme="light"] #hero-sub{color:#475569}
html[data-theme="light"] #verify-result{color:#047857}
html[data-theme="light"] .route-strip .rt{background:rgba(15,23,42,.04);border-color:rgba(15,23,42,.09);color:#334155}
html[data-theme="light"] .route-strip .rt b{color:#64748b}
html[data-theme="light"] .route-strip .rt code{color:#0284c7}
html[data-theme="light"] .btn{border-color:rgba(15,23,42,.18);color:#0f172a;background:rgba(15,23,42,.05)}
html[data-theme="light"] .btn:hover{background:rgba(15,23,42,.1)}
html[data-theme="light"] #node-search,html[data-theme="light"] #sortsel,html[data-theme="light"] #loglevel{background:rgba(15,23,42,.05);border-color:rgba(15,23,42,.14);color:#0f172a}
html[data-theme="light"] #sortsel option{background:#fff}
html[data-theme="light"] #pills span{border-color:rgba(15,23,42,.18);color:#475569;background:rgba(15,23,42,.04)}
html[data-theme="light"] table.bench th,html[data-theme="light"] table.bench td{border-bottom-color:rgba(15,23,42,.08)}
html[data-theme="light"] table.bench tr:hover td{background:rgba(15,23,42,.04)}
html[data-theme="light"] table.bench tr.pinned td{background:rgba(79,70,229,.09)}
html[data-theme="light"] table.bench td.hl{color:#0f172a}
html[data-theme="light"] table.bench td.op a{color:#1d4ed8}
html[data-theme="light"] table.bench th.sortable:hover{color:#0f172a}
html[data-theme="light"] .cc{color:#0284c7;border-color:rgba(2,132,199,.35)}
html[data-theme="light"] .badge.unmeasured{background:rgba(2,132,199,.12);color:#0284c7}
html[data-theme="light"] .lat .bar{background:rgba(15,23,42,.1)}
html[data-theme="light"] .l-good{color:#047857}html[data-theme="light"] .l-mid{color:#b45309}html[data-theme="light"] .l-bad{color:#dc2626}html[data-theme="light"] .l-na{color:#94a3b8}
html[data-theme="light"] .skel .sk{background:linear-gradient(90deg,rgba(15,23,42,.05),rgba(15,23,42,.12),rgba(15,23,42,.05));background-size:200% 100%}
html[data-theme="light"] .subrow{background:rgba(15,23,42,.04);border-color:rgba(15,23,42,.09)}
html[data-theme="light"] .subrow code{color:#64748b}
html[data-theme="light"] #statusbar b{color:#0f172a}
html[data-theme="light"] #statusbar .dot{background:#047857;box-shadow:0 0 8px #047857}
html[data-theme="light"] :focus-visible{outline-color:#4f46e5}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

</style></head>
<body>
<div id="topnav"><span class="logo">vpngate</span><span class="live">● LIVE</span><span class="links"><a href="#sec-overview">总览</a><a href="#sec-nodes">节点</a><a href="#sec-logs">日志</a><a href="#sec-sub">订阅</a><a href="#sec-hist">事件</a></span><span class="right"><button id="btn-theme" onclick="toggleTheme()">浅色</button><button id="btn-lock" onclick="lockConsole()">锁定</button></span></div>
<div id="statusbar" aria-label="实时状态"><span><span class="dot"></span>出口 <b id="sb-exit">—</b></span><span>节点 <b id="sb-node">—</b></span><span class="sp"></span><span>↓ <b id="rate-dn">—</b> Mb/s</span><span>↑ <b id="rate-up">—</b> Mb/s</span></div>
<div id="login-gate"><div class="login-card glass-card"><div class="logo">vpngate</div><div class="sub">输入 ADMIN_TOKEN 进入控制台</div><input id="login-token" type="password" autocomplete="off" aria-label="ADMIN_TOKEN" placeholder="ADMIN_TOKEN" onkeydown="if(event.key==='Enter')loginEnter()"><button id="btn-login" onclick="loginEnter()">进入控制台</button><p id="login-err"></p></div></div>
<div class="wrap" id="console" style="display:none">
<section id="sec-overview" aria-label="总览">
<div id="exit-card" class="glass-card">
<div id="hero-kicker">—<br>—</div>
<p id="hero-sub">loading…</p>
<p id="verify-result"></p>
<div class="route-strip" id="route-strip" hidden>
<div class="rt"><b>/ws-node → Railway 本机</b><code id="route-direct">—</code></div>
<div class="rt"><b>/ws-chain → VPN 节点</b><code id="route-chain">—</code></div>
</div>
<div class="actions"><button id="btn-verify" onclick="verifyExit()">验证出口 IP</button></div>
</div>
<div class="stats">
<div class="stat"><div class="k">可用节点</div><div class="v" id="stat-nodes">—</div></div>
<div class="stat"><div class="k">最优实测</div><div class="v" id="stat-best">—</div></div>
<div class="stat"><div class="k">运行时间</div><div class="v" id="stat-uptime">—</div></div>
<div class="stat"><div class="k">累计流量 ↓/↑</div><div class="v num" style="font-size:17px;padding-top:7px"><span id="stat-down">—</span> / <span id="stat-up">—</span></div></div>
<div class="stat"><div class="k">刷新成功/失败</div><div class="v" id="stat-refresh">—</div></div>
</div>
<div class="glass-card" id="rate-card" hidden>
<h2>实时速率</h2>
<p class="desc">由 traffic 计数器差分绘制，console 可见时每轮更新。</p>
<canvas id="spark" width="1000" height="64" aria-label="速率曲线"></canvas>
<div class="rate-legend"><span><i style="background:#6ee7b7"></i>下行</span><span><i style="background:#7dd3fc"></i>上行</span></div>
</div>
</section>
<section id="sec-nodes" aria-label="节点">
<div class="glass-card">
<h2>可用节点</h2>
<p class="desc">默认显示 Top30 实测节点（自动刷新只测前 30）。Speed 排名不等于可拨通，首选由 urltest 实测决定，多 endpoint 兜底；要测全部点「全量真测」。点击表头可排序，未测通节点不可切换。</p>
<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><input id="node-search" placeholder="搜索 tag / 国家…" oninput="debouncedRefresh()"><select id="sortsel" aria-label="排序"><option value="real">按实测延迟</option><option value="hand">按握手延迟</option><option value="country">按国家</option><option value="alive">按存活时间</option></select><button id="btn-refresh" class="btn" onclick="refreshNow()">刷新节点</button><button id="btn-fullprobe" class="btn" onclick="fullProbeNow()">全量真测</button><span class="node-count" id="node-count"></span></div>
<div id="pills"></div>
<div id="probe-progress"><div class="bar"><div class="fill" id="probe-fill" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div></div><div class="txt" id="probe-txt"></div></div>
<div id="bench-wrap"><table class="bench"><thead><tr><th class="sortable" data-k="tag">Endpoint</th><th class="sortable" data-k="country">国家</th><th class="sortable" data-k="hand">握手</th><th class="sortable" data-k="real">实测</th><th class="sortable" data-k="alive">存活</th><th>操作</th></tr></thead><tbody id="bench-body"></tbody></table></div>
</div>
</section>
<section id="sec-logs" aria-label="日志">
<div class="glass-card">
<h2>日志</h2>
<p class="desc">sing-box 最近输出，排查拨号失败时看这里。</p>
<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><select id="loglevel" aria-label="级别"><option value="">全部级别</option><option value="info">info</option><option value="warn">warn</option><option value="error">error</option></select><button class="btn" style="padding:7px 18px;font-size:12.5px" id="btn-logrefresh" onclick="refreshLogs(this)">刷新</button></div>
<div id="logbox" role="log" aria-label="服务日志"><div style="color:#8b91a5">loading…</div></div>
</div>
</section>
<section id="sec-sub" aria-label="订阅" hidden>
<div class="glass-card">
<h2>订阅</h2>
<p class="desc">双路 VLESS，一键复制。域名取当前访问 host。</p>
<div class="subrow"><code id="sub-direct">—</code><button class="btn" onclick="copySub('direct')">复制</button></div>
<div class="subrow"><code id="sub-chain">—</code><button class="btn" onclick="copySub('chain')">复制</button></div>
</div>
</section>
<section id="sec-hist" aria-label="事件">
<div class="glass-card">
<h2>事件</h2>
<p class="desc">刷新 / 切换 / 测速 / 验证记录，最近 20 条。</p>
<p id="history-line"></p>
<ul id="history-list"></ul>
</div>
</section>
<div class="footer"><span id="foot-status">—</span><span> · 自用调试 · sing-box 内部协议栈 · 无 TUN</span></div>
</div>
<div id="toast"></div>
<script>
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
  } catch (e) { if (isAbort(e)) return; toast("单测失败: " + e.message, true); }
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
