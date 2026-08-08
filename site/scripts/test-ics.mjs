#!/usr/bin/env node
// RFC 5545 conformance for the client-generated .ics, checked against real rows
// from the built site. A calendar app that dislikes an .ics usually just drops
// the event with no error, so this is the only place the format gets caught.
//
//   node --test scripts/test-ics.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const here = dirname(new URL(import.meta.url).pathname);
const OUT = join(here, '..', 'dist');

// Load the browser file into this realm; it publishes globalThis.__buildIcs.
new Function(readFileSync(join(here, '..', 'src/assets/ics.js'), 'utf8'))();
const build = globalThis.__buildIcs;

function rowsFromBuiltPage(path) {
  const file = join(OUT, path, 'index.html');
  if (!existsSync(file)) return [];
  const html = readFileSync(file, 'utf8');
  const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return [...html.matchAll(/<tr data-date="([^"]+)" data-title="([^"]+)" data-desc="([^"]+)">/g)]
    .map((m) => ({ dataset: { date: m[1], title: unesc(m[2]), desc: unesc(m[3]) } }));
}

// A DST-observing city, a half-hour-offset city and a southern-hemisphere one —
// the three shapes that break naive date handling.
const PAGES = [
  '/2027/new-jersey/wedding/',
  '/2027/chennai/wedding/',
  '/2027/sydney/engagement/',
];

test('builder is loadable without a DOM', () => {
  assert.equal(typeof build, 'function');
});

for (const page of PAGES) {
  const rows = rowsFromBuiltPage(page);

  test(`${page} has rows to test`, () => {
    assert.ok(rows.length > 3, `only ${rows.length} rows — build the site first`);
  });

  test(`${page} produces conformant VEVENTs`, () => {
    for (const row of rows) {
      const ics = build(row);

      // Line endings and structure.
      assert.ok(ics.endsWith('\r\n'), 'must end with CRLF');
      assert.ok(!/[^\r]\n/.test(ics), 'every line ending must be CRLF');
      const lines = ics.split('\r\n');
      assert.equal(lines[0], 'BEGIN:VCALENDAR');
      assert.equal(lines.at(-2), 'END:VCALENDAR');
      for (const required of ['VERSION:2.0', 'BEGIN:VEVENT', 'END:VEVENT']) {
        assert.ok(lines.includes(required), `missing ${required}`);
      }
      for (const prop of ['UID:', 'DTSTAMP:', 'DTSTART;VALUE=DATE:', 'SUMMARY:', 'DESCRIPTION:']) {
        assert.ok(lines.some((l) => l.startsWith(prop)), `missing ${prop}`);
      }

      // Folding: no content line over 75 octets.
      for (const line of lines) {
        assert.ok(Buffer.byteLength(line, 'utf8') <= 75,
          `line over 75 octets: ${line.slice(0, 40)}…`);
      }

      // All-day semantics: DTEND is exactly the next day, exclusive.
      const start = lines.find((l) => l.startsWith('DTSTART;VALUE=DATE:')).slice(19);
      const end = lines.find((l) => l.startsWith('DTEND;VALUE=DATE:')).slice(17);
      assert.equal(start, row.dataset.date.replace(/-/g, ''));
      const next = new Date(row.dataset.date + 'T00:00:00Z');
      next.setUTCDate(next.getUTCDate() + 1);
      assert.equal(end, next.toISOString().slice(0, 10).replace(/-/g, ''),
        'DTEND must be the day after DTSTART for an all-day event');

      // No timezone anywhere: that is what makes this DST-proof.
      assert.ok(!/TZID/.test(ics), 'all-day events must carry no TZID');

      // The description survives escaping and unfolding intact.
      const unfolded = ics.replace(/\r\n /g, '');
      const desc = unfolded.match(/^DESCRIPTION:(.*)$/m)[1];
      assert.ok(desc.includes('rahu kalam'), 'lost the rahu kalam note');
      assert.ok(desc.includes('purohit'), 'lost the purohit line');
      assert.ok(!/(?<!\\);/.test(desc), 'unescaped semicolon in DESCRIPTION');
      assert.ok(!/(?<!\\),/.test(desc), 'unescaped comma in DESCRIPTION');
    }
  });
}

test('month-end and leap-adjacent dates roll over correctly', () => {
  for (const date of ['2027-01-31', '2027-02-28', '2027-12-31', '2028-02-29']) {
    const ics = build({ dataset: { date, title: 'x', desc: 'rahu kalam purohit' } });
    const end = ics.match(/DTEND;VALUE=DATE:(\d{8})/)[1];
    const expected = new Date(date + 'T00:00:00Z');
    expected.setUTCDate(expected.getUTCDate() + 1);
    assert.equal(end, expected.toISOString().slice(0, 10).replace(/-/g, ''), date);
  }
});
