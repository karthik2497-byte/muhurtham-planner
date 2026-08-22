#!/usr/bin/env node
// Post-build gate. Runs in CI; prints one PASS line, detail only on failure.
//
// These are the checks whose absence would ship a plausible-looking broken
// site: a dead internal link, two pages sharing a <title>, a date page that
// lost the purohit line, an .ics the calendar app silently rejects.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const OUT = join(dirname(new URL(import.meta.url).pathname), '..', 'dist');
const fails = [];
const fail = (m) => fails.push(m);

if (!existsSync(OUT)) {
  console.log('FAIL: dist/ missing — run npm run build');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT);
const htmls = files.map((f) => f).filter((f) => f.endsWith('.html'));
const routes = new Set(htmls.map((f) =>
  f.slice(OUT.length).replace(/index\.html$/, '').replace(/\\/g, '/') || '/'));
const assets = new Set(files.map((f) => f.slice(OUT.length)));

if (htmls.length < 140) fail(`only ${htmls.length} pages built, expected ~148`);

const titles = new Map();
let biggest = 0;

for (const file of htmls) {
  const route = file.slice(OUT.length).replace(/index\.html$/, '') || '/';
  const html = readFileSync(file, 'utf8');
  biggest = Math.max(biggest, html.length);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) fail(`${route}: no <title>`);
  else if (titles.has(title)) fail(`${route}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, route);

  if (!/<meta name="description" content="[^"]{60,}"/.test(html))
    fail(`${route}: missing or too-short meta description`);
  if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html))
    fail(`${route}: no canonical`);
  if ((html.match(/<h1[ >]/g) || []).length !== 1)
    fail(`${route}: needs exactly one <h1>`);

  // NG1 is load-bearing: it must be on every date-bearing page.
  const isDatePage = /^\/\d{4}\/[a-z-]+\//.test(route) || route === '/';
  if (isDatePage && !/class="purohit"/.test(html))
    fail(`${route}: purohit line missing (NG1)`);

  // JSON-LD must parse — a malformed block is worse than none.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(`${route}: unparseable JSON-LD`); }
  }

  // Internal links resolve.
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const target = m[1];
    if (!routes.has(target) && !assets.has(target)) fail(`${route}: dead link ${target}`);
  }
}

// Every event page must carry .ics-ready rows, and the row payload must have
// what ics.js needs — the button is useless if the dataset is empty.
const sample = join(OUT, '2027', 'chennai', 'wedding', 'index.html');
if (existsSync(sample)) {
  const html = readFileSync(sample, 'utf8');
  const rows = [...html.matchAll(/<tr[^>]*\sdata-date="(\d{4}-\d{2}-\d{2})" data-title="([^"]+)" data-desc="([^"]+)"/g)];
  if (rows.length < 10) fail(`sample event page has only ${rows.length} .ics rows`);
  if (rows.some((r) => !r[3].includes('rahu kalam'))) fail('an .ics description lost its rahu kalam note');
  if ((html.match(/<button class="ics"/g) || []).length !== rows.length)
    fail('.ics button count does not match row count');

  // Optional dates must ship hidden and must have a switch that reveals them.
  // A relaxed date rendered visible is the one failure mode that would publish
  // a looser list than the owner signed off on.
  const opt = [...html.matchAll(/<tr class="opt"([^>]*)>/g)].map((m) => m[1]);
  if (!opt.length) fail('sample event page has no optional rows — toggles lost');
  if (opt.some((a) => !a.includes(' hidden '))) fail('an optional row renders visible by default');
  const boxes = [...html.matchAll(/<input type="checkbox" name="(\w+)"/g)].map((m) => m[1]);
  const needs = new Set(opt.flatMap((a) => (a.match(/data-needs="([^"]+)"/) || [, ''])[1].split(' ')));
  for (const key of needs)
    if (!boxes.includes(key)) fail(`optional rows need '${key}' but no switch offers it`);
} else {
  fail('sample page /2027/chennai/wedding/ missing');
}

// FR-9 JS budget on content pages.
const js = ['ics.js', 'widget.js']
  .reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
if (js > 50_000) fail(`JS budget blown: ${js} bytes across islands (limit 50 KB)`);

for (const required of ['sitemap.xml', 'robots.txt', 'favicon.svg', 'site.css']) {
  if (!existsSync(join(OUT, required))) fail(`missing ${required}`);
}
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
if ((sitemap.match(/<loc>/g) || []).length !== htmls.length)
  fail('sitemap entry count does not match page count');

if (fails.length) {
  console.log(`FAIL: ${fails.length} problem(s)`);
  for (const f of fails.slice(0, 25)) console.log('  ', f);
  process.exit(1);
}
console.log(`PASS: ${htmls.length} pages, unique titles, links resolve, `
  + `${(js / 1024).toFixed(1)} KB JS, largest page ${(biggest / 1024).toFixed(0)} KB`);
