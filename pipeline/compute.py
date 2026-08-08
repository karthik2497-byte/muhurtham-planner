"""
compute.py — run core.day_elements over every city x year and commit the JSON.

    ./.venv/bin/python pipeline/compute.py 2027 2028
    ./.venv/bin/python pipeline/compute.py 2027 --city chennai

Writes data/<year>/<city>.json (the contract the site reads) and data/names.json
(generated from core.py so the names live in exactly one place).

Output is deterministic: same pin, same input -> byte-identical file. That is
what makes the annual re-run reviewable as a git diff (ARCHITECTURE).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))

import core  # noqa: E402
import swisseph as swe  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
CITIES = json.loads((ROOT / "cities.json").read_text())


def city_year(city: dict, year: int) -> dict:
    tz = ZoneInfo(city["tz"])
    lat, lon, elev = city["lat"], city["lon"], city.get("elevation_m", 0)

    # Eclipse instants are global; a grahan blocks the LOCAL date it falls on,
    # which is not the same civil date in every city — hence the conversion here
    # and not in core.
    eclipses = {}
    for jd, kind in core.eclipse_instants(year):
        eclipses.setdefault(core.from_jd(jd, tz).date().isoformat(), []).append(kind)

    days, date = [], dt.date(year, 1, 1)
    while date.year == year:
        day = core.day_elements(lat, lon, elev, tz, date)
        if date.isoformat() in eclipses:
            day["eclipse"] = eclipses[date.isoformat()]
        days.append(day)
        date += dt.timedelta(days=1)

    return {
        "city": city,
        "year": year,
        "generated_with": {
            "swisseph": swe.version,
            "ephemeris": "moshier",
            "ayanamsa": "lahiri",
            "day_boundary": "local sunrise",
            "sunrise_convention": "upper limb, with refraction",
        },
        "eclipses": eclipses,
        "days": days,
    }


def write_json(path: Path, payload) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, indent=1, sort_keys=False, ensure_ascii=False) + "\n"
    path.write_text(text)
    return len(text)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("years", nargs="+", type=int)
    ap.add_argument("--city", action="append", help="slug; repeatable (default: all)")
    args = ap.parse_args()

    cities = [c for c in CITIES if not args.city or c["slug"] in args.city]
    if not cities:
        print(f"no city matched {args.city}", file=sys.stderr)
        return 1

    write_json(ROOT / "data" / "names.json", {
        "tithi": [core.tithi_name(i) for i in range(1, 31)],
        "nakshatra": core.NAKSHATRA_NAMES,
        "yoga": core.YOGA_NAMES,
        "karana": [core.karana_name(i) for i in range(1, 61)],
        "rasi": core.RASI_NAMES,
        "tamil_month": core.TAMIL_MONTHS,
        "weekday": core.WEEKDAY_NAMES,
        "weekday_tamil": core.WEEKDAY_TAMIL,
    })

    total = 0
    for year in args.years:
        for city in cities:
            n = write_json(ROOT / "data" / str(year) / f"{city['slug']}.json",
                           city_year(city, year))
            total += n
    print(f"wrote {len(cities) * len(args.years)} city-years, {total // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
