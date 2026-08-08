# IMPLEMENTATION — Muhurtham Planner

SDD workflow: research → pipeline with golden tests → rules + review →
site → verify → ship. ~2 weekends + owner review hours. Target live
before 2026-10-01 (search season for 2027 dates).

## Phase R — Research (1 evening)

- **RESEARCH-1 Library + license.** Evaluate `drik-panchanga` (GitHub)
  + `pyswisseph`, and any maintained alternative. Criteria: computes
  tithi/nakshatra from ephemeris, city lat/long/tz input, actively
  buildable on Python 3.12. Record the license decision per SPEC FR-3
  (public pipeline repo if AGPL — default answer: public; the code is
  not the moat).
- **RESEARCH-2 Affiliates.** (Tracked privately.) Shortlist 2 respectable programs (gold/
  jewellery retail, wedding registry/services, remittance CPA). Criteria:
  brand-safe next to religious content, ≥ $15 CPA or equivalent. Record;
  do not integrate until traffic exists (FR-8 logic applies).
- **RESEARCH-3 Cross-check sources.** Pick 2 independent panchangam
  references for FR-V1 (one drik-computation site of standing, one
  printed Tamil panchangam the owner's family trusts). Record edition/
  URLs in verification/REPORT.md header.

## Phase 1 — Pipeline (weekend 1)

- T1.1 `compute.py`: daily elements for Chennai 2027 first (reference
  city = easiest to verify against printed sources). Golden tests: pin
  10 known dates from RESEARCH-3 sources (e.g., known festival dates:
  Tamil New Year, Deepavali 2027, a known ekadashi) — pipeline must
  reproduce their tithi/nakshatra. DoD: golden tests green.
- T1.2 Day-boundary + rahu kalam functions with unit tests (the two
  classic bug sites). DoD: rahu kalam for a known city/date matches a
  published table within 2 minutes.
- T1.3 Scale to 12 cities × 2027–2028; JSON schema + CI validation.
  DoD: deterministic re-run produces byte-identical output.
- T1.4 `qualify.py` + rules YAML drafts for the 5 event types with
  `basis` citations. DoD: wedding-2027-Chennai output eyeballed by
  owner against a printed panchangam's muhurtham list — overlap should
  be obvious and disagreements explainable (this is a smoke test;
  formal check is FR-V1).

## Phase 2 — Verification (the moat work, ~3 evenings incl. owner)

- T2.1 FR-V1 n=40 cross-check → `verification/REPORT.md` with a row per
  sample (city, date, our tithi/nakshatra, source A, source B, verdict).
  Investigate every mismatch to root cause (tz? day boundary? ayanamsa
  setting? genuine vakya/drik divergence?). Fix code or footnote —
  never fudge data.
- T2.2 FR-V2 owner cultural review of rules YAML + one month of output
  per event. Changes → YAML → re-derive → re-spot-check.
- **GATE-A: REPORT.md ≥ 95% + sign-off. No site launch before this.**

## Phase 3 — Site (weekend 2)

- T3.1 Astro pages (FR-4): year/city/event pages, hubs, methodology
  (FR-V3). DoD: 150 pages build; unique titles/meta; Lighthouse ≥ 95.
- T3.2 Daily widget (FR-5) + .ics download (FR-6's sibling; client-side
  generation, correct TZID). DoD: .ics imports with correct local time
  in Google Calendar for 3 cities (including a DST-observing one — DST
  is where .ics breaks).
- T3.3 PDFs (`make_pdf.py`, one per city/year) + email capture form
  (FR-6) + store banner (FR-7, config file) + GA4. DoD: form delivers
  correct PDF; banner renders only on wedding/engagement pages.

## Phase 4 — Ship + seed (2 evenings, one-time)

- T4.1 Deploy (DEPLOYMENT.md), Search Console, sitemap.
- T4.2 One-time launch seeding (tracked privately).
- T4.3 OPS.md: the annual runbook (run pipeline for N+2, review diff,
  REPORT for new year sampling n=20, publish, email list "2029 dates
  are up"), plus the ads-application trigger (≥ 100 sessions/day).

## Gates

- GATE-A: verification report (above).
- GATE-B (month 6, ≈ Jan 2027): ≥ 2,000 sessions/mo else freeze (site
  stays; list folds into the store; zero further hours).
