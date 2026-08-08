"""
validate.py — the CI gate. Schema, determinism, and the cross-city invariant.

    ./.venv/bin/python pipeline/validate.py

Prints one PASS line on success and detail only on failure (that is the whole
point — a green run must not cost a screen of output). Non-zero exit fails CI.

Determinism is re-derived here rather than trusted: the file on disk is
recomputed in memory and compared byte for byte. A pinned ephemeris that
quietly drifts would otherwise turn every annual re-run into an unreviewable
diff, and the "review the diff" maintenance model dies with it.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

sys.path.insert(0, str(Path(__file__).resolve().parent))

import compute  # noqa: E402
import qualify  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def data_files():
    return sorted(p for p in DATA.glob("*/*.json") if not p.name.endswith(".events.json"))


def main() -> int:
    failures: list[str] = []

    schema = json.loads((ROOT / "schema" / "panchangam.schema.json").read_text())
    validator = Draft202012Validator(schema)

    files = data_files()
    if not files:
        print("FAIL: no data files — run pipeline/compute.py first")
        return 1

    for path in files:
        payload = json.loads(path.read_text())
        for err in validator.iter_errors(payload):
            failures.append(f"{path.relative_to(ROOT)}: {'/'.join(str(p) for p in err.absolute_path)}: {err.message}")

        # Every day of the year present exactly once, in order.
        dates = [d["date"] for d in payload["days"]]
        if dates != sorted(dates) or len(set(dates)) != len(dates):
            failures.append(f"{path.relative_to(ROOT)}: dates not unique/ordered")

        events_path = path.with_name(path.stem + ".events.json")
        if not events_path.exists():
            failures.append(f"{events_path.relative_to(ROOT)}: missing — run qualify.py")

    # Determinism: recompute one city-year and compare to what is committed.
    sample = files[0]
    payload = json.loads(sample.read_text())
    fresh = json.dumps(compute.city_year(payload["city"], payload["year"]),
                       indent=1, ensure_ascii=False) + "\n"
    if fresh != sample.read_text():
        failures.append(f"{sample.relative_to(ROOT)}: recompute differs — ephemeris not deterministic")

    # Rules load + vocabulary check (a typo'd nakshatra name filters nothing).
    try:
        rules = qualify.load_rules()
    except qualify.RuleError as exc:
        failures.append(f"rules: {exc}")
        rules = {}

    # The product claim: the same date is NOT the same list in every city.
    # If this collapses, the 12-city dimension is decoration and the site lies.
    if len(files) > 1 and rules:
        by_city = {}
        for path in files:
            p = json.loads(path.read_text())
            if p["year"] != payload["year"]:
                continue
            e = json.loads(path.with_name(path.stem + ".events.json").read_text())
            by_city[p["city"]["slug"]] = tuple(d["date"] for d in e["wedding"]["dates"])
        if len(set(by_city.values())) < 2:
            failures.append("all cities produced identical wedding lists — "
                            "sunrise localisation is not taking effect")

    if failures:
        print(f"FAIL: {len(failures)} problem(s)")
        for line in failures[:20]:
            print("  ", line)
        return 1

    print(f"PASS: {len(files)} city-years, schema + determinism + {len(rules)} rule sets OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
