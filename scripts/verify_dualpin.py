"""Verify auto dual-pin: serving chain matches measured best+backup (CI).

Reads an /api/status snapshot and the serving sing-box config, recomputes
the expected best/backup from measured real_latency_ms, and checks the
status pins plus the serving chain selector agree. Exit nonzero with a
report on any mismatch.
"""
from __future__ import annotations

import argparse
import json
import os
import sys


def expected(status: dict) -> tuple[str | None, str | None]:
    measured = sorted(
        (e for e in status.get("endpoints", [])
         if e.get("real_latency_ms") is not None and e.get("tag")),
        key=lambda e: (e["real_latency_ms"], e.get("tag") or ""))
    if not measured:
        return None, None
    best = measured[0].get("tag")
    second = measured[1].get("tag") if len(measured) > 1 else None
    return best, second


def run(status: dict, config: dict) -> tuple[int, str]:
    lines: list[str] = []
    problems: list[str] = []
    best, second = expected(status)
    if best is None:
        return 1, "dualpin: no measured endpoints to pin\n"
    preferred = status.get("preferred_tag")
    backup = status.get("backup_tag")
    lines.append(f"dualpin: measured best={best}"
                 + (f" second={second}" if second else " (only one measured)"))
    if preferred != best:
        problems.append(f"preferred_tag={preferred} != best={best}")
    if backup != second:
        problems.append(f"backup_tag={backup} != second={second}")
    chain = next((o for o in config.get("outbounds", [])
                  if o.get("tag") == "chain"), None)
    want = [best] + ([second] if second else []) + ["auto"]
    if config.get("route", {}).get("final") != "chain":
        problems.append(
            f'route.final={config.get("route", {}).get("final")} != "chain"')
    if (chain or {}).get("outbounds") != want:
        problems.append(f"chain outbounds={(chain or {}).get('outbounds')} "
                        f"!= {want}")
    lines.append(f'dualpin: chain outbounds={(chain or {}).get("outbounds")}')
    if problems:
        lines.extend(f"dualpin MISMATCH: {p}" for p in problems)
        return 1, "\n".join(lines) + "\n"
    lines.append("dualpin OK: serving chain matches measured best+backup")
    return 0, "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify auto dual-pin")
    parser.add_argument("--status", required=True, help="/api/status JSON path")
    parser.add_argument("--config", required=True,
                        help="serving sing-box JSON path")
    parser.add_argument("--summary-file", default=os.environ.get("GITHUB_STEP_SUMMARY"))
    args = parser.parse_args(argv)

    try:
        with open(args.status, encoding="utf-8") as handle:
            status = json.load(handle)
        with open(args.config, encoding="utf-8") as handle:
            config = json.load(handle)
    except (OSError, ValueError) as exc:
        sys.stdout.write(f"dualpin: cannot read inputs: {exc}\n")
        return 1
    code, markdown = run(status, config)
    sys.stdout.write(markdown)
    if args.summary_file:
        with open(args.summary_file, "a", encoding="utf-8") as handle:
            handle.write("## Dual-pin verification\n\n```\n" + markdown + "```\n")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
