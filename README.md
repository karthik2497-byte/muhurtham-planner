# Muhurtham Planner (diaspora good-dates site)

**A muhurtham / nalla neram / good-dates planner for the Indian diaspora**:
wedding muhurtham lists, griha pravesam, engagement, and new-venture dates
for 2027–2028, computed for the cities the diaspora actually lives in
(local sunrise, local timezone) — with the astronomical working shown.

## Why this survives the AI flood

Religious/cultural dates are a domain where **being wrong has real cost to
the reader and AI slop is actively distrusted** — families cross-check
wedding dates against printed panchangams and elders. Trust requires:
(a) real drik-ganita computation from ephemeris data localized to the
reader's city (a generic "muhurtham dates 2027" listicle computed for
Chennai sunrise is simply wrong in New Jersey — most sites are exactly
that), and (b) shown work: every date lists its nakshatra, tithi, and
weekday and the rule that qualified it, cross-checked against published
panchangams before shipping (the verification protocol in SPEC.md).
This is a "real implementation required" niche: the barrier isn't code
volume, it's caring enough to verify against tradition — which is also
why big content farms leave it alone.

Bonus moat: the owner is Tamil, runs a wedding-adjacent business (silk
sarees), and can culturally sanity-check output — and the site cross-sells
the store to the exact audience (diaspora families planning weddings).

## Revenue model

1. **Display ads** once traffic qualifies (search "muhurtham dates 2027
   usa" peaks Oct–Dec 2026 for 2027 planning — ship before October).
2. **Affiliates:** gold/jewellery, wedding services, remittance CPAs
   (RESEARCH-2 picks two respectable ones; nothing spammy near a
   religious context).
3. **First-party cross-sell:** tasteful banner to the owner's saree store
   (ships internationally) on wedding-date pages + an email capture
   ("download the 2027 PDF") that feeds the store's festival campaigns.
   Even at $0 direct revenue this channel value can carry the project.

## Success criteria

- Ship before 2026-10-01 (the 2027-planning search season).
- Month 6 (≈ Jan 2027): ≥ 2,000 sessions/mo. Gate: else leave it up
  (zero cost), fold the email list into the store, stop investing.
- Maintenance: ZERO weekly. One annual half-day: precompute the next
  year, review, publish.

## Relationship to other projects

Cheapest build (~2 weekends), zero ongoing ops — the portfolio's "ship
between bigger things" project. Email capture rides the store's existing
Resend; no new services. Pure static output like calculator-hub/file-
tools, but with a verification moat those lack.

---

## Build status

Pipeline, rules, site, PDFs and CI are built and green. **The site is not
launchable yet** — `verification/REPORT.md` records two human gates
(cross-check + cultural review) that are unfilled, and SPEC GATE-A blocks
launch until they pass. See DEPLOYMENT.md for the owner's remaining steps.

## Quickstart

```bash
python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt

./.venv/bin/python pipeline/compute.py 2027 2028    # ephemeris -> data/
./.venv/bin/python pipeline/qualify.py 2027 2028    # rules -> qualified dates
./.venv/bin/python pipeline/make_pdf.py 2027 2028   # one PDF per city-year
./.venv/bin/python pipeline/tests/test_core.py      # 17 unit tests
./.venv/bin/python pipeline/validate.py             # schema + determinism + rules

cd site && npm run check    # build 148 pages + gate + .ics conformance
cd site && npm run dev      # http://localhost:4321
```

No npm dependencies. No build toolchain. `npm run check` is the whole gate.

## Layout

```
pipeline/       core.py (astronomy) · compute.py · qualify.py · make_pdf.py
                validate.py (CI gate) · make_samples.py · tests/
rules/          five YAML files — the cultural rules, as reviewable data
cities.json     12 cities: lat/lon/elevation/timezone
data/<year>/    committed pipeline output + qualified dates (the git diff IS the review)
schema/         the JSON contract between pipeline and site
verification/   REPORT.md (the launch gate) + samples.md (n=40 worksheet)
site/           zero-dependency static generator -> site/dist
OPS.md          the annual runbook
```

## The one thing to understand

`pipeline/core.py` reads every element at **local sunrise** — the Hindu day
runs sunrise to sunrise, so a tithi ending at 6:20am is in force in Chennai
and already gone in New Jersey. That single decision is why 12 cities give 12
different lists, and it is the thing nearly every diaspora site gets wrong.
It has its own unit tests and its own section on the public methodology page.

## License

AGPL-3.0. The Swiss Ephemeris that `pipeline/` depends on is dual-licensed
AGPL/commercial, so this repository is public — see `research/NOTES.md`
RESEARCH-1 for the reasoning. The generated site in `site/dist` contains no
ephemeris code; it is static HTML and JSON.
