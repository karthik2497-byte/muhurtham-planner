# ARCHITECTURE — Muhurtham Planner

## Stack

Two rows below changed during the build; both are marked and the reason is
recorded rather than quietly applied.

| Layer | Choice | Rationale |
|---|---|---|
| Pipeline | Python 3.14 + `pyswisseph` called directly (RESEARCH-1), run OFFLINE | Astronomy libs live in Python; runs once a year on the owner's machine. **Changed** from "3.12 + a drik-ganita wrapper": the wrappers bake in their own day-boundary and sunrise conventions, which are the two things this project most needs to own, document and test. 3.14 is what the committed data was generated with. |
| Rules | YAML per event type | Reviewable by a human (OWNER-1) without reading code |
| Site | Zero-dependency Node generator, vanilla JS islands (widget, .ics) | **Changed** from Astro 5. The site is data → HTML plus two small islands; a framework buys nothing here and costs a `node_modules` tree to maintain. G3 says the site should need zero attention after launch, and a generator with no dependencies is the version of that still true in three years. Same `dist/`, same Cloudflare Pages deploy. Matches the sibling import-duty-radar app. |
| Hosting | Cloudflare Pages | $0, fast globally (audience IS global) |
| Email/PDF | Provider form + pipeline-generated PDFs committed to the repo | No server; PDF is a build artifact |
| Analytics | GA4 | Owner's existing tooling |

## Data flow (runs once per year)

```
ephemeris + cities.json + rules/*.yaml
        │  python pipeline (offline, deterministic, version-pinned)
        ▼
data/<year>/<city>.json  +  pdf/<year>-<city>.pdf
        │  git commit (diff IS the review surface)
        ▼
verification/REPORT.md  (n=40 cross-check + owner sign-off)   ← GATE
        ▼
Astro build → 150 static pages → Cloudflare Pages
```

The pipeline and the site are decoupled by the JSON contract
(`schema/panchangam.schema.json`, checked in CI). A lower model can work
on either side independently against the schema.

## Key design decisions

- **Precompute everything; the site is dumb.** No runtime astronomy = no
  runtime bugs, no license questions at serve time, no server. The
  entire annual maintenance is: run pipeline → review diff → merge.
- **Rules as data with `basis` citations.** The cultural knowledge —
  the actual moat — lives in reviewable YAML, not in code branches.
  Owner review (FR-V2) edits YAML; the pipeline re-derives. Output is
  never hand-edited (hand-edits are unverifiable and rot).
- **Day-boundary convention documented once.** Sunrise-to-sunrise local
  day attribution (the classic gotcha where a tithi "date" differs by
  timezone) is implemented in ONE function with its own unit tests and
  explained on the methodology page. Most wrong sites are wrong exactly
  here — it's the technical heart of the correctness claim.
- **Two years live at all times.** Never let the site look expired;
  each autumn's precompute adds year N+2 and the changelog notes it.
- **PDFs are committed artifacts.** Reproducible from the pipeline, but
  committed so the email provider links never depend on a build.

## Repo layout

```
muhurtham-planner/
  pipeline/
    compute.py            # ephemeris → daily elements per city
    qualify.py            # rules YAML → qualified dates + reasons
    make_pdf.py
    tests/                # day-boundary, rahu kalam, golden vectors
  rules/{wedding,engagement,grihapravesam,seemantham,venture}.yaml
  cities.json             # 12 cities: lat/long/tz
  data/<year>/<city>.json # committed pipeline output
  verification/REPORT.md
  site/                   # Astro app (pages, widget, ics, banner config)
  schema/panchangam.schema.json
```
