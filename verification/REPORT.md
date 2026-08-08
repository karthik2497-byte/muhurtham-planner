# Verification report — Muhurtham Planner

**Status: NOT SIGNED OFF. The site must not go live until both gates below
are filled in and passing (SPEC GATE-A).**

Everything above the gates is machine-checked and already green. Everything
below needs a human, and no amount of code will change that — it is also
exactly the part competitors do not do, which is why it is the moat rather
than a chore.

---

## Automated checks (green, re-run any time)

| Check | Command | Status |
|---|---|---|
| Core unit tests (17) | `./.venv/bin/python pipeline/tests/test_core.py` | PASS |
| Schema + determinism + rules | `./.venv/bin/python pipeline/validate.py` | PASS |

What the automated side actually pins:

- Rahu kalam / yamagandam / gulikai eighth-parts against the published
  nominal-day table, for all seven weekdays.
- Sunrise seeded from **local** midnight, verified in three timezones
  including both US DST transition days.
- Puthandu 2027 = 14 April in Chennai, which pins the Tamil-month
  sunset-read rule; Chennai sunrise 2027-04-14 = 05:57 IST against the
  published almanac.
- 2027 grahan list = the two solar eclipses only (the three lunar ones are
  penumbral and are deliberately not treated as grahan).
- Determinism: a committed city-year recomputed in memory is byte-identical.
- The 12 cities do not produce identical lists (if they did, the whole
  product premise would be false).

---

## GATE-A1 — FR-V1 cross-check (n=40)

**Sources** (RESEARCH-3 — fill in before starting):

- Source A: drikpanchang.com, accessed ____________
- Source B: ______________________ (printed Tamil panchangam, edition
  ____________, publisher ____________)

**Worksheet:** [`samples.md`](samples.md) — 40 rows, all 12 cities, both
years, half drawn from qualified date lists and half from ordinary days.
Regenerate with `./.venv/bin/python pipeline/make_samples.py`.

**Result:** ____ / 40 rows agree on both tithi and nakshatra = ____ %
(bar: ≥ 95%).

### Disagreements

One block per disagreeing row. A disagreement is not a failure — an
*undispositioned* one is.

| Row | City / date | Ours | Source | Root cause | Disposition |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

Root causes worth checking first, in the order they actually occur:

1. **Source city mismatch** — Source A defaulted to a different city.
   By far the most common cause of a false disagreement; re-check before
   touching any code.
2. **Day-boundary** — the source attributes by midnight rather than
   sunrise. Expected on some diaspora sites; ours is correct by design.
3. **Sunrise convention** — the source uses centre-of-disc without
   refraction (~3 min), which can flip a tithi that ends near sunrise.
   Knob: `RISE_BITS` in `pipeline/core.py`.
4. **Vakya vs drik** — a genuine, well-known divergence in tradition, not
   an error. Disposition: footnote on affected pages, no code change.
5. **Ayanamsa** — only if the source is not Lahiri. Ours is Lahiri
   (`SIDM_LAHIRI`), stated on the methodology page.

---

## GATE-A2 — FR-V2 cultural review (owner)

Review target: the five files in `rules/` plus one full month of output per
event type. Budget ~2 hours. Rules are data — **every** change goes into the
YAML and the pipeline is re-run; output files are never hand-edited.

The drafted rules carry confidence tags. The `[varies]` ones are the ones
that need a decision; these are the specific open questions:

| # | File | Question | Decision |
|---|---|---|---|
| 1 | wedding.yaml | Is **Pournami** excluded for weddings in the house convention? | |
| 2 | wedding.yaml | Is **Saturday** acceptable for a muhurtham? | |
| 3 | wedding.yaml | Should **Poosam** and **Thiruvonam** be added to the nakshatra list? | |
| 4 | grihapravesam.yaml | Is **krishna paksha** ever acceptable for a housewarming? (This one roughly doubles the list.) | |
| 5 | grihapravesam.yaml | Is **Aippasi** avoided for housewarmings? | |
| 6 | seemantham.yaml | Is **Purattasi** acceptable for a seemantham? (Currently allowed.) | |
| 7 | venture.yaml | Are **Purattasi** and **Margazhi** acceptable for a shop opening? (Currently allowed.) | |

Sanity numbers as drafted, Chennai 2027 — a reviewer should recognise these
as plausible before reading a single date:

| Event | Dates in 2027 |
|---|---|
| Wedding | 48 |
| Engagement | 93 |
| Griha pravesam | 34 |
| Seemantham | 43 |
| New venture | 61 |

Wedding dates fall to zero in Aadi, Purattasi and Margazhi (the month rule)
and also in Aavani, because Sukra moudhyam runs 2027-07-07 → 2027-09-17 and
Guru moudhyam 2027-08-17 → 2027-09-14. A wedding-free stretch of roughly ten
weeks in mid-2027 is a real feature of that year, not a bug — confirm it
against the printed panchangam, since it is the most alarming-looking output
the site produces.

**Sign-off:** I have reviewed the rules and a month of output per event type.

Name: ______________  Date: ____________

---

## GATE-B (post-launch, ≈ Jan 2027)

≥ 2,000 sessions/mo or the project freezes per IMPLEMENTATION.md. Recorded
here so the decision has one home.
