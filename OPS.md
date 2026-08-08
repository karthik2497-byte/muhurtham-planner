# OPS — the annual runbook

The site is static and has no server, so there is nothing to monitor and
nothing to patch. The entire operational life of this project is the list
below. Budget: one evening a year, plus the owner's review hours.

## Calendar entries to create NOW (one-time)

| When | What |
|---|---|
| 1 September, every year | Run the N+2 precompute (below) |
| January 2027 | Check GA4: ≥ 100 sessions/day → apply to AdSense/Ezoic (FR-8). ≥ 2,000 sessions/month → GATE-B passes; below it, freeze per IMPLEMENTATION.md |

## The annual precompute (≈ 1 hour + review)

Two years are always live so the site never looks expired. Each September,
add year N+2 and drop nothing — old years stay up and keep their links.

```bash
cd muhurtham-planner
python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt   # first time only

./.venv/bin/python pipeline/compute.py 2029          # the new year
./.venv/bin/python pipeline/qualify.py 2027 2028 2029
./.venv/bin/python pipeline/make_pdf.py 2029
./.venv/bin/python pipeline/tests/test_core.py       # 17 tests
./.venv/bin/python pipeline/validate.py              # schema + determinism + rules

cd site && npm run check                             # build + 148-page gate + .ics tests
```

Then:

1. **Read the diff.** Existing years must not change at all. If `git diff`
   touches `data/2027/` or `data/2028/`, stop — either a pin moved or a rule
   changed, and either way the reason has to be understood before publishing.
   This is the whole review model; do not skip it because the tests are green.
2. **Sample the new year.** `./.venv/bin/python pipeline/make_samples.py --n 20
   --seed 2029` and cross-check as in `verification/REPORT.md`. n=20 is enough
   for an incremental year once the method itself has passed n=40 once.
3. **Append to REPORT.md** — a short section per year, not a rewrite.
4. Commit, push. Cloudflare Pages deploys on merge.
5. Email the list: "2029 dates are up." That send is the only growth action
   the project needs in a normal year.

## Changing a rule after the owner review

Rules are data. Never edit `data/`.

```bash
$EDITOR rules/wedding.yaml                       # change values + the basis note
./.venv/bin/python pipeline/qualify.py 2027 2028 # re-derive
./.venv/bin/python pipeline/make_pdf.py 2027 2028
cd site && npm run check
```

The diff on `data/*.events.json` is the review surface: it shows exactly which
dates the rule change added or removed. `qualify.py` refuses to run on a typo'd
nakshatra or a criterion with no `basis` note, so a bad edit fails loudly
rather than quietly filtering nothing.

## If a cross-check ever disagrees

Root causes in order of likelihood, with the knob for each:

1. The source site was set to a different city — re-check before anything else.
2. Source attributes by midnight rather than sunrise (ours is correct; footnote).
3. Sunrise convention: `RISE_BITS` in `pipeline/core.py` (upper limb + refraction
   vs centre of disc — about 3 minutes, enough to flip a marginal tithi).
4. Genuine vakya/drik divergence — footnote the affected pages, change nothing.
5. Ayanamsa, only if the source is not Lahiri.

Fix the code or footnote the divergence. Never edit `data/` to make a row agree.

## If accuracy ever needs to go up

`EPHEMERIS = swe.FLG_MOSEPH` in `pipeline/core.py` is the pin. To move to the
full Swiss ephemeris: drop the `.se1` files into a directory, call
`swe.set_ephe_path(dir)`, change that one constant to `swe.FLG_SWIEPH`, re-run,
and read the diff. Expect it to be empty at date granularity — Moshier is within
about a second of clock time on a tithi boundary — which is exactly why the
90 MB of data files is not committed today.

## What is deliberately not here

No uptime monitoring, no error tracking, no dependency bot. The site has zero
runtime dependencies and zero build dependencies; there is nothing for any of
those to watch.
