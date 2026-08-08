"""
qualify.py — rules/<event>.yaml + data/<year>/<city>.json -> qualified dates.

    ./.venv/bin/python pipeline/qualify.py 2027 2028

Writes data/<year>/<city>.events.json:

    {"<event>": {"label": ..., "blurb": ..., "dates": [ {date, reasons, ...} ]}}

The rules are DATA (ARCHITECTURE: "rules as data with basis citations"), so the
owner's cultural review edits YAML and re-runs — output is never hand-edited.
Every criterion name below has exactly one handler here; an unknown key in a
YAML file is an error rather than a silent no-op, because a typo'd rule that
quietly stops filtering is the worst failure this pipeline can have.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))

import core  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
RULES_DIR = ROOT / "rules"
PAKSHA_NAMES = ["shukla", "krishna"]


class RuleError(ValueError):
    """A rules YAML file is malformed. Fail the run; never publish."""


def load_rules() -> dict:
    rules = {}
    for path in sorted(RULES_DIR.glob("*.yaml")):
        spec = yaml.safe_load(path.read_text())
        for key in ("event", "label", "blurb", "criteria"):
            if key not in spec:
                raise RuleError(f"{path.name}: missing '{key}'")
        for name, body in spec["criteria"].items():
            if name not in CRITERIA:
                raise RuleError(f"{path.name}: unknown criterion '{name}' "
                                f"(known: {', '.join(sorted(CRITERIA))})")
            if "basis" not in body:
                raise RuleError(f"{path.name}: criterion '{name}' has no basis "
                                "citation — every rule row must carry one")
            check_values(path.name, name, body)
        rules[spec["event"]] = spec
    if not rules:
        raise RuleError(f"no rules found in {RULES_DIR}")
    return rules


VOCAB = {
    "allow_nakshatra": core.NAKSHATRA_NAMES,
    "block_tithi": [core.tithi_name(i) for i in range(1, 31)],
    "allow_weekday": core.WEEKDAY_NAMES,
    "block_tamil_month": core.TAMIL_MONTHS,
    "allow_paksha": PAKSHA_NAMES,
    "block_combust": ["venus", "jupiter"],
}


def check_values(filename: str, name: str, body: dict) -> None:
    """A misspelt nakshatra silently filters nothing. Catch it at load time."""
    if name not in VOCAB:
        return
    values = body.get("values")
    if not isinstance(values, list) or not values:
        raise RuleError(f"{filename}: criterion '{name}' needs a non-empty list")
    unknown = [v for v in values if v not in VOCAB[name]]
    if unknown:
        raise RuleError(f"{filename}: criterion '{name}' has unknown value(s) "
                        f"{unknown}; allowed: {VOCAB[name]}")


# ---------------------------------------------------------------------------
# Criterion handlers: (day, values-or-window, context) -> failure reason or None
# ---------------------------------------------------------------------------

def _allow_nakshatra(day, body, ctx):
    name = core.NAKSHATRA_NAMES[day["nakshatra"] - 1]
    return None if name in body["values"] else f"nakshatra {name}"


def _block_tithi(day, body, ctx):
    name = core.tithi_name(day["tithi"])
    return f"tithi {name}" if name in body["values"] else None


def _allow_weekday(day, body, ctx):
    name = core.WEEKDAY_NAMES[day["weekday"]]
    return None if name in body["values"] else name


def _block_tamil_month(day, body, ctx):
    name = core.TAMIL_MONTHS[day["tamil_month"] - 1]
    return f"month {name}" if name in body["values"] else None


def _allow_paksha(day, body, ctx):
    name = PAKSHA_NAMES[day["paksha"]]
    return None if name in body["values"] else f"{name} paksha"


def _block_combust(day, body, ctx):
    for planet in body["values"]:
        if day[f"{planet}_combust"]:
            return f"{planet.title()} combust (moudhyam)"
    return None


def _block_eclipse_days(day, body, ctx):
    window = int(body["window_days"])
    date = dt.date.fromisoformat(day["date"])
    for offset in range(-window, window + 1):
        kinds = ctx["eclipses"].get((date + dt.timedelta(days=offset)).isoformat())
        if kinds:
            when = "on this day" if offset == 0 else f"{abs(offset)}d away"
            return f"{kinds[0]} eclipse {when}"
    return None


CRITERIA = {
    "allow_nakshatra": _allow_nakshatra,
    "block_tithi": _block_tithi,
    "allow_weekday": _allow_weekday,
    "block_tamil_month": _block_tamil_month,
    "allow_paksha": _allow_paksha,
    "block_combust": _block_combust,
    "block_eclipse_days": _block_eclipse_days,
}


def qualify_day(day: dict, spec: dict, ctx: dict) -> dict | None:
    """The day, with its reasons attached — or None if any criterion rejects it."""
    for name, body in spec["criteria"].items():
        if CRITERIA[name](day, body, ctx) is not None:
            return None

    nakshatra = core.NAKSHATRA_NAMES[day["nakshatra"] - 1]
    tithi = core.tithi_name(day["tithi"])
    weekday = core.WEEKDAY_NAMES[day["weekday"]]
    return {
        "date": day["date"],
        "weekday": weekday,
        "weekday_tamil": core.WEEKDAY_TAMIL[day["weekday"]],
        "tamil_month": core.TAMIL_MONTHS[day["tamil_month"] - 1],
        "nakshatra": nakshatra,
        "nakshatra_pada": day["nakshatra_pada"],
        "nakshatra_end": day["nakshatra_end"],
        "tithi": tithi,
        "tithi_end": day["tithi_end"],
        "paksha": PAKSHA_NAMES[day["paksha"]],
        "sunrise": day["sunrise"],
        "sunset": day["sunset"],
        "rahu_kalam": day["rahu_kalam"],
        # The chip the page shows: why this date is on the list at all.
        "reason": f"{nakshatra} nakshatram, {tithi}, {weekday}",
    }


def rejections(day: dict, spec: dict, ctx: dict) -> list[str]:
    """Every reason a day was rejected — used by the verification harness."""
    out = []
    for name, body in spec["criteria"].items():
        why = CRITERIA[name](day, body, ctx)
        if why is not None:
            out.append(why)
    return out


def qualify_city_year(payload: dict, rules: dict) -> dict:
    ctx = {"eclipses": payload["eclipses"]}
    out = {}
    for event, spec in rules.items():
        dates = [q for q in (qualify_day(d, spec, ctx) for d in payload["days"]) if q]
        out[event] = {
            "label": spec["label"],
            "short": spec.get("short", spec["label"]),
            "blurb": " ".join(spec["blurb"].split()),
            "count": len(dates),
            "dates": dates,
        }
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("years", nargs="+", type=int)
    args = ap.parse_args()

    rules = load_rules()
    thin = []
    for year in args.years:
        for path in sorted((ROOT / "data" / str(year)).glob("*.json")):
            if path.name.endswith(".events.json"):
                continue
            payload = json.loads(path.read_text())
            events = qualify_city_year(payload, rules)
            out = path.with_suffix("")  # strip .json
            out = out.with_name(out.name + ".events.json")
            out.write_text(json.dumps(events, indent=1, ensure_ascii=False) + "\n")
            for event, body in events.items():
                if body["count"] < 5:
                    thin.append(f"{year} {path.stem} {event}: {body['count']}")

    print(f"qualified {len(args.years)} year(s) x {len(rules)} event types")
    if thin:
        # Not an error — Aadi/Purattasi/Margazhi plus a long moudhyam really can
        # leave a city with almost nothing. But it is always worth a human look.
        print(f"thin lists ({len(thin)}), check these are genuine:")
        for line in thin[:10]:
            print("  ", line)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
