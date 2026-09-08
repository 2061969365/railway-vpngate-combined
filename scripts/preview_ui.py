"""Local preview for the /ui console: serves UI_HTML with mock /api/* data.

No VPN, no Railway, no token needed -- every POST is stubbed and the
background jobs (probe / full probe / verify) complete on timers so all
buttons, progress bars and toasts can be exercised in a browser:

    python scripts/preview_ui.py
    -> open http://127.0.0.1:8137/ui
"""
import json
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from railway_manager import UI_HTML

STATE = {
    "preferred_tag": "vpngate-1",
    "refresh_ok": 12,
    "refresh_fail": 0,
    "last_error": None,
    "started_at": "2026-09-08T05:00:00Z",
    "uptime_seconds": 5400,
    "full_probe": {"state": "idle", "done": 0, "total": 0},
    "probe": {"state": "idle", "tag": None, "ms": None, "error": None},
    "verify": {"state": "idle", "exit_ip": None, "ms": None,
               "via_tag": None, "error": None},
    "refresh_history": [
        {"ts": "2026-09-08T06:30:00Z", "event": "refresh",
         "detail": "8 endpoints"},
        {"ts": "2026-09-08T06:20:00Z", "event": "switch",
         "detail": "vpngate-1 pinned"},
        {"ts": "2026-09-08T06:10:00Z", "event": "single-probe",
         "detail": "vpngate-2 ms=812"},
    ],
}
LOCK = threading.Lock()
COUNTRIES = [("日本", "JP"), ("韩国", "KR"), ("美国", "US"), ("新加坡", "SG")]


def _mock_endpoints():
    eps = []
    for i in range(8):
        name, code = COUNTRIES[i % len(COUNTRIES)]
        eps.append({
            "tag": f"vpngate-{i}",
            "server": f"203.0.113.{10 + i}",
            "server_port": 443,
            "country": name,
            "country_short": code,
            "latency_ms": 90 + i * 7,
            "real_latency_ms": (700 + i * 53) if i < 3 else None,
            "alive_seconds": 1200 + i * 60,
            "first_seen": "2026-09-08T05:00:00Z",
        })
    return eps


def _status():
    with LOCK:
        doc = dict(STATE)
        doc["endpoints"] = _mock_endpoints()
        doc["countries"] = [{"name": n, "code": c} for n, c in COUNTRIES]
        doc["proxy"] = "127.0.0.1:40000"
        doc["traffic"] = {"connections": 3, "bytes_up": 12345,
                          "bytes_down": 67890}
        doc["last_refresh"] = "2026-09-08T06:30:00Z"
    return doc


def _run_single_probe(tag):
    time.sleep(4)
    with LOCK:
        STATE["probe"] = {"state": "done", "tag": tag, "ms": 812,
                          "error": None}
        STATE["refresh_history"].append(
            {"ts": "2026-09-08T06:35:00Z", "event": "single-probe",
             "detail": f"{tag} ms=812"})


def _run_full_probe():
    with LOCK:
        STATE["full_probe"] = {"state": "running", "done": 0, "total": 8}
    for i in range(8):
        time.sleep(1.5)
        with LOCK:
            STATE["full_probe"]["done"] = i + 1
    with LOCK:
        STATE["full_probe"]["state"] = "done"
        STATE["refresh_history"].append(
            {"ts": "2026-09-08T06:36:00Z", "event": "full-probe-done",
             "detail": "8 nodes dialed"})


def _run_verify(via_tag):
    time.sleep(5)
    with LOCK:
        STATE["verify"] = {"state": "done", "exit_ip": "203.0.113.99",
                           "ms": 812, "via_tag": via_tag, "error": None}
        STATE["refresh_history"].append(
            {"ts": "2026-09-08T06:37:00Z", "event": "verify-done",
             "detail": f"{via_tag} exit=203.0.113.99 ms=812"})


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # quiet
        pass

    def _send(self, code, ctype, payload):
        raw = payload if isinstance(payload, bytes) else payload.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path in ("/ui", "/"):
            self._send(200, "text/html; charset=utf-8", UI_HTML.encode())
        elif self.path == "/api/status":
            self._send(200, "application/json", json.dumps(_status()))
        elif self.path == "/healthz":
            self._send(200, "text/plain", b"ok")
        else:
            self._send(404, "text/plain", b"not found")

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode() or "{}")
        except ValueError:
            payload = {}
        if self.path == "/api/switch":
            with LOCK:
                STATE["preferred_tag"] = payload.get("tag")
            self._send(200, "application/json", json.dumps(
                {"ok": True, "preferred_tag": STATE["preferred_tag"],
                 "detail": "preview"}))
        elif self.path == "/api/probe":
            tag = payload.get("tag")
            with LOCK:
                STATE["probe"] = {"state": "running", "tag": tag,
                                  "ms": None, "error": None}
            threading.Thread(target=_run_single_probe, args=(tag,),
                             daemon=True).start()
            self._send(202, "application/json", json.dumps(
                {"accepted": True, "tag": tag}))
        elif self.path == "/api/full_probe":
            threading.Thread(target=_run_full_probe, daemon=True).start()
            self._send(202, "application/json", json.dumps(
                {"accepted": True}))
        elif self.path == "/api/refresh":
            self._send(200, "application/json", json.dumps({"ok": True}))
        elif self.path == "/api/verify":
            with LOCK:
                via = STATE["preferred_tag"]
                STATE["verify"] = {"state": "running", "exit_ip": None,
                                   "ms": None, "via_tag": via,
                                   "error": None}
            threading.Thread(target=_run_verify, args=(via,),
                             daemon=True).start()
            self._send(202, "application/json", json.dumps(
                {"accepted": True, "via_tag": via}))
        else:
            self._send(405, "text/plain", b"method not allowed")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8137), Handler)
    server.daemon_threads = True
    print("preview at http://127.0.0.1:8137/ui", flush=True)
    server.serve_forever()
