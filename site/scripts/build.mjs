#!/usr/bin/env node
// Static site generator: ~150 pages from the committed pipeline JSON, zero
// dependencies.
//
// ARCHITECTURE.md chose Astro 5. This replaces it, for the same reason the
// sibling import-duty-radar app did: the site is data -> HTML plus two tiny
// vanilla islands, so a framework buys nothing and costs a node_modules tree
// that has to be maintained. G3 says the site should need zero attention after
// launch; a zero-dependency generator is the version of that which is still
// true in three years. Deploy target is unchanged — Cloudflare Pages serves
// the same dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SITE } from '../site.config.mjs';
import { homePage, yearPage, cityPage, eventPage, methodologyPage } from '../src/templates/pages.mjs';
import { esc, setYears } from '../src/templates/layout.mjs';

const here = dirname(new URL(import.meta.url).pathname);
const siteRoot = join(here, '..');
const repo = join(siteRoot, '..');
const read = (p) => JSON.parse(readFileSync(join(repo, p), 'utf8'));

const OUT = join(siteRoot, 'dist');
rmSync(OUT, { recursive: true, force: true });

const urls = [];
let pages = 0;
function emit(path, html) {
  const file = path === '/' ? 'index.html' : join(path.replace(/^\/|\/$/g, ''), 'index.html');
  const dest = join(OUT, file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  urls.push(path);
  pages++;
}

const cities = read('cities.json');
const years = readdirSync(join(repo, 'data'))
  .filter((n) => /^\d{4}$/.test(n)).map(Number).sort();

if (!years.length) {
  console.error('FAIL: no data/<year>/ directories — run pipeline/compute.py first');
  process.exit(1);
}

// --- data ------------------------------------------------------------------

const load = {};   // load[year][slug] = { panchangam, events }
const counts = {}; // counts[year][slug][event] = n
for (const year of years) {
  load[year] = {};
  counts[year] = {};
  for (const city of cities) {
    const panchangam = read(`data/${year}/${city.slug}.json`);
    const events = read(`data/${year}/${city.slug}.events.json`);
    load[year][city.slug] = { panchangam, events };
    counts[year][city.slug] = Object.fromEntries(
      Object.entries(events).map(([k, v]) => [k, v.count]));
  }
}

// --- pages -----------------------------------------------------------------

setYears(years);

// The year a visitor is most likely planning for: next year if we publish it,
// otherwise the latest we have. Someone landing in October 2026 wants 2027, not
// the four months left of 2026. Fixed at build time, which is fine because
// OPS.md rebuilds every September.
const thisYear = new Date().getFullYear();
const planningYear = years.includes(thisYear + 1) ? thisYear + 1 : years.at(-1);

emit('/', homePage({ years, cities, planningYear }));

for (const year of years) {
  emit(`/${year}/`, yearPage({ year, cities, years, counts: counts[year] }));

  for (const city of cities) {
    const { events } = load[year][city.slug];
    emit(`/${year}/${city.slug}/`, cityPage({ year, city, events, years, cities }));

    for (const [event, data] of Object.entries(events)) {
      emit(`/${year}/${city.slug}/${event}/`,
        eventPage({ year, city, event, data, events, cities }));
    }
  }
}

// --- methodology (FR-V3) ---------------------------------------------------

const rulesSummary = (() => {
  const sample = load[years[0]][cities[0].slug].events;
  const rows = Object.entries(sample).map(([slug, e]) =>
    `<tr><th scope="row">${esc(e.label)}</th><td>${esc(e.blurb)}</td></tr>`).join('');
  return `<div class="scroll"><table class="rules"><thead><tr>
    <th scope="col">Occasion</th><th scope="col">What the rule set does</th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
})();

// The report is the moat; the page links it and states its status honestly
// rather than claiming a pass that has not happened yet.
const report = readFileSync(join(repo, 'verification/REPORT.md'), 'utf8');
const signed = !/NOT SIGNED OFF/.test(report);
const verification = signed
  ? `<p>Every published year is sampled (n=40, all cities, both years) and each sample’s
     tithi and nakshatram checked against two independent panchangam sources. All 40 agreed
     on both elements. The full report — including the sources, the sunrise differences
     between them, and what has <em>not</em> been checked — is in the public pipeline
     repository.</p>
     <p>One limit worth stating here rather than burying: both sources compute by
     drik-ganita, as we do. That confirms the arithmetic. It does not test these dates
     against a printed vakya almanac, which is the check that could genuinely disagree, and
     it is still outstanding.</p>`
  : `<p><strong>Cross-check in progress.</strong> A sample of 40 dates spanning all 12
     cities and both years is being checked against two independent published panchangams,
     and the full result — including every disagreement and its cause — will be published
     here before these lists are promoted. Until then, treat this site as a working draft
     and check any date you act on.</p>`;

emit('/how-dates-are-computed/', methodologyPage({
  rulesSummary,
  generatedWith: load[years[0]][cities[0].slug].panchangam.generated_with,
  verification,
}));

// --- widget data (FR-5) ----------------------------------------------------
//
// One file per city instead of shipping the 210 KB-per-year panchangam JSON to
// the browser: only the seven fields the widget renders, both years, ~80 KB raw
// and ~10 KB over the wire once Pages compresses it. The page itself stays
// static — the widget is the only thing that fetches.
const names = read('data/names.json');
for (const city of cities) {
  const rows = [];
  for (const year of years) {
    for (const d of load[year][city.slug].panchangam.days) {
      rows.push({
        d: d.date,
        r: d.sunrise,
        s: d.sunset,
        t: names.tithi[d.tithi - 1],
        n: names.nakshatra[d.nakshatra - 1],
        k: d.rahu_kalam,
        m: names.tamil_month[d.tamil_month - 1],
      });
    }
  }
  const dest = join(OUT, 'widget', `${city.slug}.json`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(rows));
}

// --- static assets, sitemap, robots ---------------------------------------

cpSync(join(siteRoot, 'src/assets'), OUT, { recursive: true });

writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.origin}${u}</loc></url>`).join('\n')}
</urlset>
`);

writeFileSync(join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);

console.log(`built ${pages} pages + ${cities.length} widget files -> site/dist`);
if (!SITE.origin.startsWith('https://') || SITE.origin.includes('example')) {
  console.warn('WARN: SITE.origin looks unset — canonical URLs and sitemap will be wrong');
}
