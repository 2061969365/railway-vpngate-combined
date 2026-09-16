"""Time real tunnel dials (CI instrumentation, informational only).

Reads a VPNGate snapshot CSV, handshake-ranks the top candidates, dials a
spread of them through the production measure_real_latency path (timeout
unchanged) and prints per-node elapsed + summary. Slow/dead nodes never
fail the run; exit nonzero only on infra errors (unreadable snapshot).
"""
from __future__ import annotations

import argparse
import os
import statistics
import sys
import time
from concurrent.futures import ThreadPoolExecutor

from vpngate_to_singbox import (
    measure_real_latency,
    snapshot_to_nodes,
)

SPREAD_INDEX = (0, 1, 2, 4, 6, 8)


def pick_spread(nodes: list[dict], count: int = 6) -> list[dict]:
    """Fast/mid/slow handshake samples: ranked indexes 0,1,2,4,6,8."""
    return [nodes[i] for i in SPREAD_INDEX if i < len(nodes)][:count]


def dial_one(node: dict, singbox_bin: str, timeout: int) -> dict:
    start = time.monotonic()
    ms = measure_real_latency(node["endpoint"], singbox_bin, timeout)
    return {"server": node.get("server"), "server_port": node.get("server_port"),
            "country_short": node.get("country_short"),
            "handshake_ms": node.get("latency_ms"),
            "elapsed_s": round(time.monotonic() - start, 1),
            "real_ms": ms}


def summarize_dials(rows: list[dict], timeout: int) -> dict:
    measured = [r["elapsed_s"] for r in rows if r["real_ms"] is not None]
    return {
        "n": len(rows),
        "measured": len(measured),
        "elapsed_min": min(measured) if measured else None,
        "elapsed_med": (statistics.median(measured) if measured else None),
        "elapsed_max": max(measured) if measured else None,
        "full_timeouts": sum(1 for r in rows if r["elapsed_s"] >= timeout - 1.0),
    }


def render_markdown(rows: list[dict], summary: dict, timeout: int) -> str:
    lines = []
    for r in rows:
        real = f'{r["real_ms"]}ms' if r["real_ms"] is not None else "TIMEOUT"
        lines.append(f'dial-times: {r["server"]}:{r["server_port"]} '
                     f'{r["country_short"] or "?"} '
                     f'handshake={r["handshake_ms"]}ms '
                     f'elapsed={r["elapsed_s"]}s real={real}')
    med = summary["elapsed_med"]
    lines.append(
        f'dial-times-summary: measured={summary["measured"]}/{summary["n"]} '
        f'elapsed_min={summary["elapsed_min"]}s '
        f'elapsed_med={med if med is not None else "-"}s '
        f'elapsed_max={summary["elapsed_max"]}s '
        f'full_timeouts={summary["full_timeouts"]} timeout={timeout}s')
    return "\n".join(lines) + "\n"


def run(csv_text: str, *, count: int, timeout: int, workers: int,
        limit: int, singbox_bin: str) -> tuple[int, str, list]:
    try:
        with open(csv_text, encoding="utf-8") as handle:
            text = handle.read()
    except OSError as exc:
        return 1, f"dial-times: cannot read snapshot: {exc}\n", []
    try:
        ranked = snapshot_to_nodes(text, limit=limit)
    except Exception as exc:  # noqa: BLE001 - informational tool, report it
        return 1, f"dial-times: snapshot unusable: {type(exc).__name__}: {exc}\n", []
    picked = pick_spread(ranked, count=count)
    if not picked:
        return 0, "dial-times: no handshake-alive nodes to dial\n", []
    with ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
        rows = list(executor.map(
            lambda node: dial_one(node, singbox_bin, timeout), picked))
    summary = summarize_dials(rows, timeout)
    return 0, render_markdown(rows, summary, timeout), rows


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Time real tunnel dials")
    parser.add_argument("--csv", required=True, help="VPNGate snapshot CSV path")
    parser.add_argument("--count", type=int, default=6)
    parser.add_argument("--timeout", type=int, default=90)
    parser.add_argument("--workers", type=int, default=5)
    parser.add_argument("--limit", type=int, default=12)
    parser.add_argument("--singbox-bin", default="sing-box")
    parser.add_argument("--summary-file", default=os.environ.get("GITHUB_STEP_SUMMARY"))
    args = parser.parse_args(argv)

    code, markdown, _ = run(args.csv, count=args.count, timeout=args.timeout,
                            workers=args.workers, limit=args.limit,
                            singbox_bin=args.singbox_bin)
    sys.stdout.write(markdown)
    if args.summary_file:
        with open(args.summary_file, "a", encoding="utf-8") as handle:
            handle.write("## Dial elapsed times\n\n```\n" + markdown + "```\n")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
