# DEPLOYMENT — Muhurtham Planner

## Costs

| Item | Cost |
|---|---|
| Domain (e.g. muhurthamdates.com / nallanaal.com) | ~$10/yr |
| Cloudflare Pages | $0 |
| Email form provider free tier | $0 |
| Python pipeline | $0 (runs on the owner's machine annually) |
| **Total** | **~$10/yr** |

---

## What is already done

Everything that is code. Pipeline, rules, 148 pages, 24 PDFs, CI, the annual
runbook. `cd site && npm run check` builds and gates the whole site in about
two seconds with no dependencies installed.

## What is required of you

Nothing below can be done by the pipeline. They are in the order they must
happen — **1 and 2 gate the launch and are the reason this project has a moat
at all.** Everything from 3 on is mechanical, roughly one evening.

### 1. Cultural review of the rules — ✅ DONE 2026-08-22 (GATE-A2)

Open `verification/REPORT.md` and work down the seven open questions in the
GATE-A2 table (Pournami for weddings? Saturday? krishna paksha for a
housewarming?). Each one names the file and the line it controls. Then read one
month of output per occasion — `data/2027/chennai.events.json` or the built
page at `/2027/chennai/wedding/` — against the family's printed panchangam.

Every correction goes into `rules/*.yaml`, never into `data/`. Then:

```bash
./.venv/bin/python pipeline/qualify.py 2027 2028
./.venv/bin/python pipeline/make_pdf.py 2027 2028
cd site && npm run check
```

Sign the sign-off block at the bottom of the GATE-A2 section.

The one output worth bracing for: **2027 has no wedding dates at all between
early July and late September** in Chennai. That is Sukra moudhyam
(2027-07-07 → 09-17) overlapping Aadi and Purattasi, and it is correct — but
confirm it against the printed panchangam before publishing, because it is the
result most likely to make a reader think the site is broken.

### 2. Cross-check 40 dates — ✅ DONE 2026-08-22, 40/40 on two sources (GATE-A1)

`verification/samples.md` is already generated: 40 rows, all 12 cities, both
years, our tithi and nakshatram pre-filled, each row deep-linked to
drikpanchang. Fill the two source columns, record the percentage in
`REPORT.md`, and give every disagreement a root cause from the list there.

Pass bar is ≥ 95%. Below it, do not launch — fix the cause first.

When both gates are signed, the methodology page automatically stops saying
"cross-check in progress" and starts describing a completed check; the build
reads `REPORT.md` to decide which. There is no separate flag to flip.

### 3. Domain and config — ✅ muhurthamdates.com bought 2026-08-22

Buy the domain (Cloudflare Registrar, ~$10). Then edit `site/site.config.mjs`:

| Field | Set to |
|---|---|
| `origin` | `https://yourdomain.com` — used for canonicals, sitemap and JSON-LD. Wrong here is invisible locally and wrong in Search Console. |
| `ga4Id` | Your GA4 measurement ID, or leave empty for no analytics at all |
| `email.action` | The provider's form POST URL (see 5) |
| `storeBanner.href` / `.image` / `.line` | The saree store's international page. Leave `href` empty and no banner renders anywhere. |

### 4. Repo and hosting — 20 minutes

Push to GitHub. **Public** — `RESEARCH-1` concluded the pipeline repo is AGPL
by way of Swiss Ephemeris, and an open pipeline is a trust signal on a site
whose entire pitch is shown work. Add the licence with GitHub's own "Add file →
Create new file → LICENSE" flow and pick **GNU AGPLv3** from the template
picker; that inserts the canonical text, which is the only version worth having.

Cloudflare Pages → Create project → connect the repo:

- Root directory: `site`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`

The output directory is **relative to the root directory**. Setting root to
`site` and output to `site/dist` makes Pages look for `site/site/dist` and the
deploy fails with an empty-output error that does not name the cause.

`build.mjs` reads `../data`, `../cities.json` and `../verification/REPORT.md`,
which sit outside the root directory. That is fine — Pages checks out the whole
repo and only changes the working directory. There are no dependencies to
install and no Python in the build; `data/` and the PDFs are committed.

Add the apex and `www`; HTTPS is automatic. `data/` and the PDFs are committed,
so the build needs no Python and no secrets.

### 5. Email capture — 20 minutes

Create the audience in Resend (or Buttondown) with a `city` and `year` tag —
the form already posts both as hidden fields. Set `email.action` to the form
URL. Point the delivery automation at the committed PDFs, which Pages serves at
`https://yourdomain.com/pdf/2027-<city>.pdf`.

Test three cities end to end, including one that is not Chennai, and confirm
the PDF that arrives matches the city that was submitted.

### 6. Search — 20 minutes

Search Console: verify the domain, submit `https://yourdomain.com/sitemap.xml`.
Bing Webmaster Tools: same, it imports from Search Console in two clicks. This
audience uses default browsers more than you would guess.

### 7. Calendar reminders — 5 minutes

Two recurring entries, both listed in `OPS.md`:

- **1 September, annually** — run the N+2 precompute.
- **January 2027** — check GA4 against the ads threshold (≥ 100 sessions/day)
  and GATE-B (≥ 2,000 sessions/month).

---

## Ads (later, not now)

`SITE.adsEnabled` is false and no ad code exists in the build. The slots are
reserved at fixed height so switching it on cannot shift text (CLS). Apply to
AdSense or Ezoic only once traffic clears the threshold — a clean site reviews
better, and ads before traffic earn nothing while costing trust.

## CI

`.github/workflows/ci.yml` runs on every push and PR: the 17 unit tests, the
schema and determinism gate, and the site build with its 148-page check and
`.ics` conformance tests. The Python pipeline itself is deliberately not in CI
— it runs annually on your machine and is reviewed as a diff.

## Rollback

Revert the commit, Pages redeploys. Data files are committed; there is nothing
else to restore.
