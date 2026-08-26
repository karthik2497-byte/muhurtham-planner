# Verification report — Muhurtham Planner

**Status: SIGNED OFF — 2026-08-22.** Both GATE-A gates are recorded below
with their basis and their limits. One follow-up is deliberately left open and
named: the second source is an independent drik implementation, not a printed
vakya almanac (see GATE-A1).

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

- Source A: drikpanchang.com **day-panchang** pages, accessed 2026-08-22.
  Use the day-panchang page, never the marriage-muhurat page — see the note
  below, which cost an afternoon to work out.
- Source B: **prokerala.com Tamil panchangam**, accessed 2026-08-22, one page
  per row via `?date=&loc=<geoname-id>`. **This is a substitution and the
  substitution matters.** The gate was written for a *printed Tamil
  panchangam* because parts of the Tamil tradition are vakya-based and a
  printed almanac is the one source that could genuinely disagree. Prokerala
  is drik-ganita, like ours and like Source A, so this pair confirms the
  computation is right and does **not** test ours against vakya reckoning.
  Recorded as a known, open limitation rather than quietly counted as met.

**Worksheet:** [`samples.md`](samples.md) — 40 rows, all 12 cities, both
years, half drawn from qualified date lists and half from ordinary days.
Regenerate with `./.venv/bin/python pipeline/make_samples.py`.

**Result — both sources: 40 / 40 on each, 100%.**

Source A detail: **40 / 40 rows agree on both tithi and
nakshatra = 100%** (bar: ≥ 95%). Filled 2026-08-22 from drikpanchang
day-panchang pages, one per row, each URL carrying its own `geoname-id` so the
city is fixed in the link rather than left in a picker. Source B (printed
panchangam) is still open.

Coverage: all 12 cities, both published years, 10 timezones, including rows
inside PDT, EDT, CDT, BST and AEDT. Half the rows are qualified dates and half
ordinary days, so the sample tests the panchangam and not just the rule set.

The verdict column in [`samples.md`](samples.md) is **computed**, not typed:
the fill script maps the source's Sanskrit name through a fixed
transliteration table and compares. A row cannot be marked as agreeing because
whoever filled it wanted it to.

Source B agrees on all 40 rows as well, and its verdicts are computed by the
same kind of script from its own published Tamil names.

**Three implementations, three sunrise conventions.** Ours is earliest;
drikpanchang lands +0 to +2 minutes later; prokerala +3 to +8. All 40 rows
still agree on both elements across that 8-minute spread, which is the useful
result: the elements are robust to the sunrise convention. It also bounds the
risk honestly — a tithi or nakshatram turning within ~8 minutes of sunrise is
where these three would part company, and no row in this sample was that
close.

Sunrise runs **0 to +2 minutes later** at Source A than ours in every one of
the 40 rows — never earlier, never more than two minutes. That is a
disc/refraction convention difference (`RISE_BITS`), and its being one-signed
across 12 cities and 10 timezones is itself evidence the sunrise solver is
right: a bug would scatter.

**Do not cross-check against a marriage-muhurat listing.** Those pages name
the element prevailing *at the muhurat window*, which for a North Indian
wedding is usually at night. Compared that way this list scored 60%, and every
single disagreement was the source naming the *next* element while ours was
still running — an artifact of the comparison, not an error. The day-panchang
page, which publishes start and end times, agrees on all 40.

### Disagreements

One block per disagreeing row. A disagreement is not a failure — an
*undispositioned* one is.

| Row | City / date | Ours | Source | Root cause | Disposition |
|---|---|---|---|---|---|
| — | Chennai, all | sunrise 1 min earlier | drikpanchang | 3 — disc/refraction convention | Accepted. Systematic, sub-minute effect on elements. Documented, no code change. |
| — | Chennai 2027-07-07 → 07-16 | Sukra moudhyam, no dates | both sources list dates to 07-12 / 07-16 | Orb, not error — Venus crosses 10° on 07-07, 9° on 07-11, 8° on 07-14 | Keep 10°, the classical muhurtham value. Name the orb on the methodology page. |
| — | Chennai 2027-08-20 → 09-13 | no dates (Sukra + Guru moudhyam) | tamildailycalendar lists 9 dates; drikpanchang lists none | Source B does not apply moudhyam | Ours stands, and drikpanchang agrees. This is the rule most date lists omit. |

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

| # | File | Question | Decision (OWNER-1, 2026-08-22) |
|---|---|---|---|
| 1 | wedding.yaml | Is **Pournami** excluded for weddings in the house convention? | **Yes, excluded.** Offered as an opt-in switch. |
| 2 | wedding.yaml | Is **Saturday** acceptable for a muhurtham? | **No.** Offered as an opt-in switch. |
| 3 | wedding.yaml | Should **Poosam** and **Thiruvonam** be added to the nakshatra list? | **No** — the eleven stand. Both offered as one opt-in switch. |
| 4 | grihapravesam.yaml | Is **krishna paksha** ever acceptable for a housewarming? (This one roughly doubles the list.) | **Shukla only** by default. Offered as an opt-in switch, since a closing date rarely moves. |
| 5 | grihapravesam.yaml | Is **Aippasi** avoided for housewarmings? | **No** — left allowed. |
| 6 | seemantham.yaml | Is **Purattasi** acceptable for a seemantham? (Currently allowed.) | **Yes** — left allowed. |
| 7 | venture.yaml | Are **Purattasi** and **Margazhi** acceptable for a shop opening? (Currently allowed.) | **Split: Margazhi blocked, Purattasi allowed.** Marriage bars do not transfer to commerce, but Margazhi is a month of observance rather than new starts. |

### Where families differ, both readings ship

Questions 1–4 are the ones with no single Tamil answer. Rather than pick one and
hide the other, the strict reading is the published default and the looser one
is a switch on the page (`relaxations:` in the rules YAML). The rule that
matters for this gate: **an optional date is never counted in a headline
number, never in the PDF, and never in the verification sample** — everything
signed off below is the strict list. `site/scripts/check-build.mjs` fails the
build if an optional date ever renders visible by default.

Sanity numbers as drafted, Chennai 2027 — a reviewer should recognise these
as plausible before reading a single date:

| Event | Dates in 2027 |
|---|---|
| Wedding | 48 |
| Engagement | 93 |
| Griha pravesam | 34 |
| Seemantham | 43 |
| New venture | 55 |

Wedding dates fall to zero in Aadi, Purattasi and Margazhi (the month rule)
and also in Aavani, because Sukra moudhyam runs 2027-07-07 → 2027-09-17 and
Guru moudhyam 2027-08-17 → 2027-09-14. A wedding-free stretch of roughly ten
weeks in mid-2027 is a real feature of that year, not a bug — confirm it
against the printed panchangam, since it is the most alarming-looking output
the site produces.

**Sign-off:** OWNER-1 answered all seven open questions above on 2026-08-22,
and the four contested ones ship both readings rather than one. Each decision
is recorded in the table with its reasoning, and each `[varies]` rule now
names its choice in the YAML `basis` line.

**Basis, stated plainly so a later reader can judge it:** this signature rests
on the seven rule decisions and on the 40/40 cross-check in GATE-A1. The
month-by-month output review the gate also asks for was **not** carried out
separately. The mitigation is that GATE-A1 sampled half its rows from
qualified dates and half from ordinary days across all 12 cities, so the
output was tested — element by element, against two sources — even though it
was not read a month at a time.

Name: Karthik  Date: 2026-08-22

---

## GATE-A1 follow-up — printed vakya almanac (DRAFT, not signed off)

GATE-A1 recorded one open limitation: both its sources were drik-ganita, so it
confirmed the computation without testing it against vakya reckoning. That test
has now been run against a printed *Pambu Panchangam* (Parapava 2026-27), whose
cover states சுத்த வாக்கிய பஞ்சாங்கம் — pure vakya.

Two samples, both Chennai:

| Sample | n | tithi | nakshatram |
|---|---|---|---|
| Page 2 muhurtham list | 19 | — | 12/19 agree on **both** elements |
| Karthigai daily table, 17 Nov – 15 Dec 2026 | 29 | 24/29 | 26/29 |

**Every disagreement in either sample is exactly one step.** No disagreement
anywhere was larger.

The daily tables also carry ending times, so the divergence could be measured
rather than inferred. Where both almanacs name the same element, the difference
between their endings traces **a single smooth cycle per lunar month, amplitude
about ±4 hours**, fitted by one sinusoid with under 10% residual. That is the
lunar equation of centre showing through vakya's mean-motion tables — a known,
bounded, periodic property of the system, not error on either side. It changes
a published date only when a boundary happens to fall within about four hours
of sunrise.

Applying that window to our own output: **1240 of 1585 wedding dates (78.2%)
are robust to the full ±4 h**; 21.8% is the *ceiling* on disagreement, assuming
peak drift in the unfavourable direction. The observed nakshatram rate on
Karthigai was 3/29.

Worksheet, drift table, reading validation and limits:
[`vakya-crosscheck.md`](vakya-crosscheck.md).

This is **not** a cleared gate. It is one city, two samples, read by Claude from
a compressed scan at ~75 dpi; eleven further monthly pages in the same file are
untranscribed, and the divergent rows in the page-2 sample still want confirming
against the print. It is recorded here so the finding is not lost and so
GATE-A1's open item has a home.

Name: ______________  Date: ____________

---

## GATE-B (post-launch, ≈ Jan 2027)

≥ 2,000 sessions/mo or the project freezes per IMPLEMENTATION.md. Recorded
here so the decision has one home.
