#!/usr/bin/env python3
"""Refresh only the mining snapshot while preserving every other daily dataset."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from update_daily_data import mining_profitability


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "daily-data.js"
PREFIX = "window.KAUFMAN_DAILY_DATA = "


def main() -> None:
    raw = OUTPUT.read_text(encoding="utf-8").strip()
    if not raw.startswith(PREFIX) or not raw.endswith(";"):
        raise ValueError("daily-data.js does not match the expected generated format")
    snapshot = json.loads(raw[len(PREFIX) : -1])
    mining = mining_profitability()
    if mining.get("status") != "auto":
        raise RuntimeError("fresh mining snapshot unavailable; previous verified data retained")
    snapshot["mining_profitability"] = mining
    snapshot["mining_refreshed_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    payload = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(f"{PREFIX}{payload};\n", encoding="utf-8")


if __name__ == "__main__":
    main()
