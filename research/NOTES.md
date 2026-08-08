# Muhurtham Planner — Research Notes

## RESEARCH-1 — Library, ephemeris and license decision

**Chosen: `pyswisseph` 2.10.3.2** (Python binding to the Swiss Ephemeris),
calling it directly rather than through a wrapper such as `drik-panchanga`.

Why direct: the wrapper libraries are thin, unmaintained-to-lightly-maintained,
and each bakes in its own opinion about the day-boundary and sunrise
conventions — which are the two decisions this project most needs to own,
document publicly and unit-test. `pipeline/core.py` is ~360 lines and states
every convention in one place. A wrapper would have hidden exactly the thing
that is the product.

Verified on Python 3.14 before committing to it: installs from a wheel, Lahiri
ayanamsa matches the published value, `rise_trans` reproduces published Chennai
sunrise to the minute, and 24 city-years compute in 6.5 seconds.

**Ephemeris backend: Moshier (`FLG_MOSEPH`), pinned explicitly.** pyswisseph
ships no `.se1` data files, so `FLG_SWIEPH` silently degrades to Moshier
anyway — pinning it makes that visible, reproducible from `pip install` alone,
and keeps 90 MB of ephemeris data out of the repo. Moshier is within about an
arcsecond of DE431 for the Moon over 1900–2100, i.e. roughly two seconds of
clock error on a tithi boundary, which is invisible at date granularity. The
upgrade path is one constant, documented in OPS.md.

### License (SPEC FR-3)

Swiss Ephemeris is dual-licensed: **AGPL-3.0 or a paid commercial license**.
`pyswisseph` inherits this.

**Decision: the pipeline repository is public under AGPL-3.0.** No commercial
license is purchased.

Reasoning:

- The AGPL's distinguishing clause covers users *interacting with the software
  over a network*. Nothing about the deployed site does that — the site is
  static HTML and JSON generated offline, and no Swiss Ephemeris code exists
  anywhere in `site/dist`. The visitor never interacts with AGPL software.
- Even so, the pipeline itself is published rather than relying on that
  argument. It is the cheap answer to a question we do not want to have to
  litigate, it costs nothing (the code is not the moat — the verification and
  the reviewed rules are), and an open pipeline is a genuine trust signal on a
  site whose entire pitch is showing its working.
- Consequence for hosting: none. Cloudflare Pages serves committed static
  files; the build runs no Python.

Not legal advice; the position above is recorded so the reasoning is reviewable
rather than assumed.

## RESEARCH-3 — Cross-check source candidates

| Site | URL | Arbitrary city? | States ayanamsa / method? | Publishes 2027–2028? |
|---|---|---|---|---|
| Drik Panchang | https://www.drikpanchang.com/ | Yes — city dropdown plus "Add New Location" for anywhere in the world | Yes — Lahiri ayanamsa; Drik Ganita by default, with an explicit "Switch to Vakyam" toggle for Tamil Panchangam specifically | Yes — dedicated 2027 Hindu calendar page already live (`hinducalendar.html?year=2027`); site computes any date so 2028 is available the same way |
| Prokerala Panchang | https://www.prokerala.com/astrology/panchang/ | Yes — city name or raw lat/long entry | Yes — states Lahiri ayanamsa ("Govt. of India standard"), Drik-based tithi/nakshatra junctions | Not explicitly confirmed for named years; it's a live calculator for any entered date, so 2027–2028 output exists on demand but no dedicated advance calendar page was found |
| AstroSage Panchang | https://www.astrosage.com/panchang/ | Yes — city selector | Partial — site's separate Ayanamsa Calculator tool offers Lahiri/Raman/KP, but the panchang page itself doesn't clearly label which is its default | Unconfirmed — has yearly panchang pages by year but 2027/2028 availability not verified |
| Tamilcube Tamil Panchangam | https://astrology.tamilcube.com/tamil-panchangam/ | Yes — region/city dropdown or manual lat/long | Yes — explicitly states Lahiri Ayanamsa + Meeus astronomical algorithms, Thirukkanitha (drik-equivalent) system | Unconfirmed — only a general "works for any past/future date" claim, no 2027/2028 page found |

**Best primary cross-check: Drik Panchang.** It is the most widely cited reference among these, is the only one that explicitly names its ayanamsa *and* offers a direct Drik Ganita vs. Vakyam toggle scoped to Tamil Panchangam (directly relevant to this project), has the most mature arbitrary-location support (worldwide geoname database), and already has a live 2027 calendar page confirming forward coverage.

**Second source requirement:** The second independent source must be a printed Tamil panchangam the owner's family trusts (e.g. a Pambu Panchangam or Vakya Panchangam edition) — OWNER to supply edition name and year. Vakya-computed almanacs are EXPECTED to diverge from drik computation by up to a day on some tithis; this is a known divergence, not an error.

## Open questions for the owner

- Whether AstroSage's panchang page uses Lahiri ayanamsa by default (only confirmed via its separate ayanamsa-calculator tool, not the panchang page itself) — worth a manual check before treating it as a tertiary cross-check.
- Whether Prokerala, AstroSage, and Tamilcube have dedicated advance calendar pages for 2027–2028 specifically, or only compute those dates live on request — none of this was confirmable by search alone.
- Printed Tamil panchangam edition name/year for the required second cross-check source (Pambu Panchangam / Vakya Panchangam) — owner to supply.
