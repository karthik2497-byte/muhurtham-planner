# SPEC — Muhurtham Planner

Spec-driven development: every requirement has an ID. The verification
protocol (FR-V*) gates launch: computed dates that haven't passed
cross-checking do not ship. Cultural review (OWNER-1) is mandatory.

## Goals

- G1: A diaspora family shortlisting wedding/function dates finds
  city-correct dates with the reasoning visible, in two clicks
  (year → city).
- G2: Every published date is reproducible from the data pipeline and
  cross-checked against published panchangams (FR-V1).
- G3: After launch, the site needs zero attention until next year's
  precompute.

## Non-goals

- NG1: No personalized horoscope matching / jathagam porutham — that's
  astrologer territory, liability, and support load. A respectful line on
  every page: "final date: confirm with your family purohit." This
  sentence is load-bearing — it sets the product's role honestly (a
  shortlisting tool, not an authority) and disarms the main objection.
- NG2: No user accounts, no server, no runtime computation. Everything
  precomputed to static JSON at build time.
- NG3: No Hindi/Tamil localization in v1 (English UI with Tamil terms
  inline; diaspora 2nd-gen reads English).
- NG4: No monetization that conflicts with the context (no loan ads, no
  astrology-call services).

## Scope v1

- Years: **2027 and 2028** (two years so the site is never "expiring" at
  launch; add a year each autumn). **2026 was added during the build** so
  that FR-5 works from launch day — a "today's panchangam" widget on a site
  launching in October 2026 has nothing to show until January otherwise, which
  removes the daily-return hook for the site's whole first season. It costs 4
  seconds of pipeline and ~2.5 MB; drop it by deleting `data/2026/` and
  rebuilding.
- Cities (12): New York/NJ, San Francisco Bay, Chicago, Dallas, Toronto,
  London, Singapore, Sydney, Melbourne, Dubai, Kuala Lumpur, Chennai
  (reference city for cross-checking + homeland traffic).
- Event types (5): wedding muhurtham, engagement/nichayathartham,
  griha pravesam (housewarming), seemantham/valaikappu, new venture
  (office/shop opening).
- Per city per year: panchangam elements per day (tithi, nakshatra,
  weekday, rahu kalam, yamagandam window) + qualified-date lists per
  event type with the qualifying rule named.

## Pipeline requirements

- **FR-1 Computation.** Offline Python pipeline using a drik-ganita
  library (RESEARCH-1 selects: candidates `drik-panchanga` +
  Swiss Ephemeris via `pyswisseph`, or equivalent) computing per city
  (lat/long/tz, local sunrise-based day boundaries): tithi, nakshatra
  (with padam where cheaply available), weekday, rahu kalam/yamagandam
  (standard eighth-division formula from local sunrise/sunset). Output:
  `data/<year>/<city>.json`. Deterministic: same inputs → same output;
  version-pin the ephemeris.
- **FR-2 Rules engine.** Event-type rules in `rules/<event>.yaml` — data,
  not code: allowed nakshatras, allowed/blocked tithis, blocked weekdays,
  blocked months/periods (e.g. Aadi for weddings per Tamil convention,
  Margazhi conventions, eclipse days blocked, muhurtham-season notes).
  Rules are drafted from standard published references and REVIEWED by
  OWNER-1 (below). Each rule row carries a `basis` note ("per <ref>").
  The engine filters FR-1 output → qualified dates with reasons attached.
- **FR-3 License compliance.** RESEARCH-1 must record the license of the
  chosen ephemeris/lib (Swiss Ephemeris is dual AGPL/commercial).
  Precompute-offline + ship-static-JSON keeps runtime clean, but comply
  with the SOURCE license for the pipeline repo itself: if AGPL applies,
  the pipeline repo is public (fine — the moat is verification, not
  code); decision recorded in NOTES.md.

## Verification protocol (FR-V — gates launch)

- **FR-V1 Cross-check.** Sample n=40 dates across years/cities/events;
  compare tithi+nakshatra against ≥ 2 independent published panchangam
  sources (RESEARCH-3 lists candidates: established drik-based sites and
  a printed Tamil panchangam the owner's family uses). Pass: ≥ 95%
  element agreement; every disagreement investigated and dispositioned
  in `verification/REPORT.md` (known vakya-vs-drik divergence gets a
  footnote on affected pages — transparency, not hand-waving).
- **FR-V2 Cultural review (OWNER-1).** Owner reviews the rules YAML +
  one full month of output per event type against family/community
  practice; every change goes into the YAML (never hand-edited output).
  ~2 hours. Sign-off recorded in REPORT.md.
- **FR-V3 Methodology page.** Public `/how-dates-are-computed/`: library,
  ephemeris, day-boundary convention, rule sources, the n=40 report
  summary, and the NG1 purohit line. The shown work IS the SEO/trust
  differentiator.

## Site requirements

- **FR-4 Pages.** `/[year]/[city]/[event]/` (2y × 12 cities × 5 events =
  120 pages) + city hubs + year hubs + methodology ≈ 150 static pages.
  Each event page: qualified dates table (date, weekday, nakshatra,
  tithi, reason chip, rahu kalam note), month grouping, .ics download
  per date (client-generated), "why these dates" explainer paragraph
  unique per event type.
- **FR-5 Daily panchangam widget.** City hub shows today's tithi/
  nakshatra/rahu kalam (client-side from the bundled year JSON — still
  static hosting, no server) — the daily-return-visit hook.
- **FR-6 Email capture.** "Get the 2027 <city> dates PDF" → provider form
  (store's Resend audience or Buttondown per duty-radar RESEARCH-5) →
  auto-delivery of a generated PDF (built in the pipeline, one per
  city/year). Tag subscribers by city for the store's later campaigns.
- **FR-7 Store cross-sell.** One tasteful banner component on wedding/
  engagement pages only (image + one line + UTM-tagged link to the
  store's international page). Config in one file; removable site-wide
  by emptying it.
- **FR-8 Ads readiness.** Semantic HTML with reserved slots (CLS-safe)
  but NO ad code at launch; apply to AdSense/Ezoic once ≥ 100 sessions/
  day (their review likes clean sites; ads-before-traffic is pointless).
- **FR-9 Performance/SEO.** Static, < 50KB JS on content pages,
  Lighthouse mobile ≥ 95, `Event`/`FAQPage` JSON-LD, per-page unique
  titles ("Muhurtham dates 2027 in New Jersey — with nakshatram").

## Acceptance (v1 ships when)

- FR-V1 report ≥ 95% + all disagreements dispositioned; FR-V2 signed.
- 150 pages build; 3 spot-checked .ics files import correctly into
  Google Calendar with correct local times.
- Methodology page complete; NG1 line present on every date page.
- Email capture delivers the right city PDF (test 3 cities).
