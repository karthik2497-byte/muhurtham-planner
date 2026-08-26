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
| `email.action` | `/api/subscribe` to turn signup on, empty to keep it off (see 5) |
| `storeBanner.href` / `.image` / `.line` | The saree store's international page. Leave `href` empty and no banner renders anywhere. |

### 4. Repo and hosting — 20 minutes

Push to GitHub. **Public** — `RESEARCH-1` concluded the pipeline repo is AGPL
by way of Swiss Ephemeris, and an open pipeline is a trust signal on a site
whose entire pitch is shown work. Add the licence with GitHub's own "Add file →
Create new file → LICENSE" flow and pick **GNU AGPLv3** from the template
picker; that inserts the canonical text, which is the only version worth having.

Deploy from the CLI, not the Git integration — HOSTING.md explains why, and the
other apps in the account are wired the same way. Cloudflare is then never
granted access to the repo at all.

```sh
cd site
npm run check                 # build + invariants + ics tests
npx wrangler pages deploy dist --project-name muhurtham-dates --branch main
```

The project was created once with:

```sh
npx wrangler pages project create muhurtham-dates --production-branch main
```

There is no build on Cloudflare's side, so no root directory, no build command
and no `NODE_VERSION` to set. `build.mjs` reads `../data`, `../cities.json` and
`../verification/REPORT.md`; it runs locally where those always exist. `data/`
and the PDFs are committed, so the build needs no Python and no secrets.

**Custom domain.** Attaching the domain to the project does *not* create the DNS
record, even when the zone is in the same Cloudflare account — the domain sits
at `status: pending` indefinitely until the record exists. Add both in
DNS → Records:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `muhurtham-dates.pages.dev` | Proxied |
| CNAME | `www` | `muhurtham-dates.pages.dev` | Proxied |

CNAME flattening handles the apex. HTTPS provisions itself once the records
resolve. Until then the deployed pages still declare canonicals pointing at the
custom domain, so the `.pages.dev` copy will not be indexed in its place.

### 5. Email capture — ✅ live 2026-08-26

There is no hosted signup form. `functions/api/subscribe.js` is the site's only
server-side code: it validates the submission, sends the PDF through Resend and
records the contact. Everything else stays static.

**Verify the sending domain first.** Resend → Domains → Add, apex only, region
`us-east-1`, Return-Path `send`, Tracking Subdomain empty and both tracking
options off — click tracking rewrites the PDF link through a redirect domain,
which is what phishing looks like coming from a domain with no reputation.
Resend's Cloudflare auto-configure writes the three records; take it rather than
retyping a 216-character DKIM key by hand.

Resend does not add DMARC. Add it yourself or a new domain gets treated with
suspicion by Gmail and Yahoo:

| Type | Name | Content |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none` |

`p=none` is monitoring only and cannot bounce real mail. Skip `rua` — reports to
an address on another domain need that domain to publish an authorisation record
(RFC 7489 §7.1), which Gmail will not do for you, so you would get silently
partial data you were never going to read.

Then the API key, scoped to **Sending access** on this domain only:

```sh
npx wrangler pages secret put RESEND_API_KEY --project-name muhurtham-dates
```

The name goes **on the command line**. Run it bare and wrangler prompts for the
name first, so the key lands in the name field — and secret names are stored in
clear text and printed by `secret list`. That happened here; the key had to be
revoked. If the prompt asks for anything but a secret value, Ctrl-C.

`RESEND_AUDIENCE_ID` is optional; set it to file contacts in a specific audience
rather than the team default.

Only then set `email.action` to `/api/subscribe`. That one string is the switch —
empty renders "Sign-up opens shortly", so the form cannot exist before the key
does. Rebuild, deploy, and check the endpoint's whole matrix against production,
not just the happy path:

| POST | Expected |
|---|---|
| malformed email | `303 → /thank-you/?state=bad-email` |
| `company` filled (honeypot) | `303 → /thank-you/`, no send |
| city not in `cities.json` | `303 → /` |
| year with no data | `303 → /` |
| GET | `303 → /` |
| valid | `303 → /thank-you/?pdf=…`, mail sent |

A `405` means that request hit the static handler instead of the Function —
usually deploy propagation. Retry before debugging it.

Finally, open the delivered mail on **Gmail web** (the iOS and Android apps have
no "Show original") and confirm SPF, DKIM and DMARC all say PASS.

### 6. Search — ✅ both submitted 2026-08-26

**Google Search Console.** A *Domain* property needs the full sitemap URL —
`https://yourdomain.com/sitemap.xml`, not the relative path a URL-prefix
property accepts. "Couldn't fetch" straight after submitting usually means
Google has not crawled yet, not that anything is wrong; check the sitemap
returns 200 and parses, then leave it.

**Bing Webmaster Tools.** Bing's import-from-Search-Console button is two
clicks, but it grants Microsoft read access to *every* property on the Google
account. Add the site manually instead and verify with the meta tag —
`bingVerification` in `site.config.mjs` puts it in every page's `<head>`, so
it costs one config field and grants nothing. Bing's DNS alternative uses a
CNAME to `verify.bing.com`, not a TXT record like Google's.

Sitemaps are submitted separately in each tool; they share nothing. Both
submissions are idempotent, so resubmitting is harmless. `robots.txt` already
advertises the sitemap, so both engines find it eventually either way.

This audience uses default browsers more than you would guess, which is the
whole reason Bing is worth the five minutes.

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
