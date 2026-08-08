"""
make_samples.py — build the FR-V1 n=40 cross-check worksheet.

    ./.venv/bin/python pipeline/make_samples.py            # n=40, seed 2027
    ./.venv/bin/python pipeline/make_samples.py --n 20     # annual re-check

Writes verification/samples.md: one row per sample, pre-filled with OUR values
and a deep link per source, with the two source columns left blank for a human
to fill in. That is the whole job — the sampling and the typing are mechanical,
the dispositioning is not, and only the human half is worth anyone's evening.

Sampling is seeded and stratified: every city appears, both years appear, and
half the rows are dates that made a qualified list (where being wrong is
expensive) while half are ordinary days (where a systematic tithi/day-boundary
error would hide). An unstratified random sample of 40 out of 8,760 city-days
would leave four cities untested.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import core  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "verification" / "samples.md"

# RESEARCH-3 sources. Source A is queried by date; the city is set once in the
# site's own city picker and it remembers — there is no stable per-city URL
# parameter, so the runbook says "set the city first" rather than pretending.
SOURCE_A = "https://www.drikpanchang.com/panchang/day-panchang.html?date={d}/{m}/{y}"
SOURCE_B_NOTE = "printed Tamil panchangam (edition recorded in REPORT.md header)"


def load(year: int, slug: str) -> dict:
    return json.loads((ROOT / "data" / str(year) / f"{slug}.json").read_text())


def sample_rows(n: int, seed: int) -> list[dict]:
    rng = random.Random(seed)
    cities = json.loads((ROOT / "cities.json").read_text())
    years = sorted(int(p.name) for p in (ROOT / "data").iterdir() if p.name.isdigit())

    rows = []
    for i in range(n):
        city = cities[i % len(cities)]
        year = years[i % len(years)]
        payload = load(year, city["slug"])
        events = json.loads(
            (ROOT / "data" / str(year) / f"{city['slug']}.events.json").read_text())

        # Alternate: qualified dates (expensive to get wrong) / ordinary days
        # (where a systematic error hides).
        pool = None
        if i % 2 == 0:
            event = ["wedding", "engagement", "grihapravesam",
                     "seemantham", "venture"][i // 2 % 5]
            picked = events[event]["dates"]
            if picked:
                pool = [rng.choice(picked)["date"]]
        if pool is None:
            pool = [rng.choice(payload["days"])["date"]]

        date = pool[0]
        day = next(d for d in payload["days"] if d["date"] == date)
        y, m, dd = date.split("-")
        rows.append({
            "city": city["short"] if "short" in city else city["name"],
            "slug": city["slug"],
            "date": date,
            "tithi": core.tithi_name(day["tithi"]),
            "nakshatra": core.NAKSHATRA_NAMES[day["nakshatra"] - 1],
            "sunrise": day["sunrise"],
            "link": SOURCE_A.format(d=dd, m=m, y=y),
        })
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--seed", type=int, default=2027)
    args = ap.parse_args()

    rows = sample_rows(args.n, args.seed)
    lines = [
        f"# FR-V1 cross-check worksheet (n={args.n}, seed={args.seed})",
        "",
        "Fill the two source columns by hand, then write the verdict. Pass bar:",
        "**>= 95% element agreement**, and EVERY disagreement dispositioned in",
        "REPORT.md with a root cause. Do not edit `data/` to make a row agree —",
        "fix the rule or the code, or footnote a genuine vakya/drik divergence.",
        "",
        f"Source A: drikpanchang (set the city in their picker first — it persists).  ",
        f"Source B: {SOURCE_B_NOTE}.",
        "",
        "Regenerate: `./.venv/bin/python pipeline/make_samples.py`",
        "",
        "| # | City | Date | Ours: tithi | Ours: nakshatra | Sunrise | A: tithi/nak | B: tithi/nak | Verdict | Note |",
        "|--:|---|---|---|---|---|---|---|---|---|",
    ]
    for i, r in enumerate(rows, 1):
        lines.append(
            f"| {i} | {r['city']} | [{r['date']}]({r['link']}) | {r['tithi']} | "
            f"{r['nakshatra']} | {r['sunrise']} |  |  |  |  |"
        )
    lines += ["", f"Cities covered: {len({r['slug'] for r in rows})} / 12."]

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} — {len(rows)} rows, "
          f"{len({r['slug'] for r in rows})} cities")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
