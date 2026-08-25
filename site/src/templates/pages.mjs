import { SITE, PUROHIT_LINE } from '../../site.config.mjs';
import { layout, esc, breadcrumbs, breadcrumbLd } from './layout.mjs';

const MONTH_ORDER = [
  'Chithirai', 'Vaikasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi',
  'Aippasi', 'Karthigai', 'Margazhi', 'Thai', 'Maasi', 'Panguni',
];

const pretty = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
};

// What the nakshatram actually does over the day. Sunrise attribution is
// correct for reading a panchangam, but a nakshatram that turns 40 minutes
// after sunrise is not the one the ceremony happens under, and a table that
// prints only the sunrise value quietly implies otherwise.
const changeover = (r) => {
  if (r.nakshatra_end.slice(0, 10) !== r.date) return 'all day';
  const t = r.nakshatra_end.slice(11, 16);
  return `until ${t}, then ${r.nakshatra_next}`;
};

const groupByMonth = (dates) => {
  const groups = new Map();
  for (const d of dates) {
    if (!groups.has(d.tamil_month)) groups.set(d.tamil_month, []);
    groups.get(d.tamil_month).push(d);
  }
  // Calendar order, not Tamil-year order — the reader is scanning a Gregorian
  // year and expects January first.
  return [...groups.entries()].sort(
    (a, b) => a[1][0].date.localeCompare(b[1][0].date));
};

// FR-7 — wedding and engagement only, and only when configured.
const storeBanner = (event) => {
  const b = SITE.storeBanner;
  if (!b.href || !['wedding', 'engagement'].includes(event)) return '';
  return `<aside class="banner">
  ${b.image ? `<img src="${esc(b.image)}" alt="" width="96" height="96" loading="lazy">` : ''}
  <p>${esc(b.line)}</p>
  <a class="btn" href="${esc(b.href + b.utm)}" rel="sponsored noopener" target="_blank">${esc(b.cta)}</a>
</aside>`;
};

// FR-6
const emailCapture = (city, year) => {
  const heading = SITE.email.heading.replace('{year}', year).replace('{city}', city.short || city.name);
  if (!SITE.email.action) {
    return `<aside class="capture pending"><h2>${esc(heading)}</h2>
    <p>${esc(SITE.email.blurb)} <em>Sign-up opens shortly.</em></p></aside>`;
  }
  const hidden = Object.entries(SITE.email.hiddenFields)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('');
  return `<aside class="capture"><h2>${esc(heading)}</h2>
  <p>${esc(SITE.email.blurb)}</p>
  <form method="post" action="${esc(SITE.email.action)}">
    ${hidden}
    <input type="hidden" name="city" value="${esc(city.slug)}">
    <input type="hidden" name="year" value="${year}">
    <input class="sr" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="sr" for="em">Email address</label>
    <input id="em" type="email" name="email" required placeholder="you@example.com" autocomplete="email">
    <button type="submit">Send me the PDF</button>
  </form></aside>`;
};

const purohit = () => `<p class="purohit">${esc(PUROHIT_LINE)}</p>`;

// Who this is for. Answers the two questions a stranger asks in the first five
// seconds — "is this my tradition?" and "is my city here?" — before they act on
// a date that was computed for somebody else's convention. The astronomy is
// pan-Indian; the month rules are not, and saying so is cheaper than a wrong
// wedding date. Support for the other traditions is planned.
const scope = () => `
<section class="scope">
  <h2>Who these dates are for</h2>
  <p><strong>These lists follow Tamil practice.</strong> The months avoided for a
  wedding — Aadi, Purattasi and Margazhi — and the rule against Tuesday are Tamil
  convention, and the calendar months are the Tamil solar ones.</p>
  <p><strong>Telugu, Kannada and Malayalam families:</strong> the astronomy is
  identical, and the nakshatram rules are close to what your family uses. The month
  blocks are not — your tradition counts months differently, so treat these as a
  strong shortlist rather than a final answer, and check the months with your
  purohit. Lists that follow those conventions properly are planned.</p>
  <p><strong>North Indian families:</strong> your practice is built around
  Chaturmas and a different month reckoning, so these dates will not match. Please
  don’t plan from them.</p>
  <p><strong>Not one of the 12 cities?</strong> Use the nearest city in your own
  timezone — Houston reads with Dallas, Boston with New York, Perth with Sydney.
  Dates only shift when a tithi ends close to sunrise, and every page shows the
  sunrise it used so you can check.</p>
</section>`;

// ---------------------------------------------------------------------------

export function eventPage({ year, city, event, data, events, cities }) {
  const label = data.label;
  const cityName = city.short || city.name;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: String(year), href: `/${year}/` },
    { label: cityName, href: `/${year}/${city.slug}/` },
    { label: data.short, href: `/${year}/${city.slug}/${event}/` },
  ];

  // Optional dates sit in the same month tables, in date order, hidden until
  // the visitor switches their relaxation on. Rendering them in place rather
  // than in a separate block is the point — "is there anything in April?" is
  // the question being asked, and a second table further down does not answer
  // it. They are marked, so nobody mistakes one for a default date.
  const optional = data.optional || [];
  const relaxations = data.relaxations || {};
  const all = [...data.dates, ...optional].sort((a, b) => a.date.localeCompare(b.date));

  const groups = groupByMonth(all);
  const tables = groups.map(([month, rows]) => `
<section class="month" data-strict="${rows.filter((r) => !r.needs).length}">
  <h3>${esc(month)} <span class="count">${rows.filter((r) => !r.needs).length} date${rows.filter((r) => !r.needs).length === 1 ? '' : 's'}</span></h3>
  <div class="scroll">
  <table>
    <thead><tr>
      <th scope="col">Date</th><th scope="col">Day</th>
      <th scope="col">Nakshatram</th><th scope="col">Tithi</th>
      <th scope="col">Avoid (rahu kalam)</th><th scope="col"><span class="sr">Calendar</span></th>
    </tr></thead>
    <tbody>
${rows.map((r) => `      <tr${r.needs ? ` class="opt" hidden data-needs="${r.needs.join(' ')}"` : ''} data-date="${r.date}" data-title="${esc(label)} — ${esc(cityName)}" data-desc="${esc(`${r.reason}. Sunrise ${r.sunrise}, sunset ${r.sunset}. Avoid rahu kalam ${r.rahu_kalam[0]}–${r.rahu_kalam[1]}. ${PUROHIT_LINE}`)}">
        <td><time datetime="${r.date}">${pretty(r.date)}</time>${r.needs ? ' <span class="tag">optional</span>' : ''}</td>
        <td>${esc(r.weekday)} <span class="ta">${esc(r.weekday_tamil)}</span></td>
        <td>${esc(r.nakshatra)} <span class="pada">pada ${r.nakshatra_pada}</span>
          <span class="turns">${esc(changeover(r))}</span></td>
        <td>${esc(r.tithi)} <span class="ta">${esc(r.paksha)}</span></td>
        <td class="rahu">${esc(r.rahu_kalam[0])}–${esc(r.rahu_kalam[1])}</td>
        <td><button class="ics" type="button">Add to calendar</button></td>
      </tr>`).join('\n')}
    </tbody>
  </table>
  </div>
</section>`).join('\n');

  // Only offer a switch that would actually reveal something in this city-year.
  // A checkbox that does nothing is worse than no checkbox — it reads as broken.
  const offered = Object.entries(relaxations)
    .filter(([key]) => optional.some((d) => d.needs.includes(key)));
  const optionsPanel = offered.length ? `
<form class="opts" id="opts">
  <h2>Your family may also accept these</h2>
  <p>These are the rules Tamil families genuinely differ on. The dates above follow
  the stricter reading, which is what most houses keep. Switch one on to see the
  extra dates it opens up — they appear in the tables, marked
  <span class="tag">optional</span>. Check any of them with your purohit.</p>
  ${offered.map(([key, r]) => `<label>
    <input type="checkbox" name="${key}">
    <span><strong>${esc(r.label)}</strong> — ${esc(r.note)}
    <em>${optional.filter((d) => d.needs.includes(key)).length} more date${
      optional.filter((d) => d.needs.includes(key)).length === 1 ? '' : 's'}</em></span>
  </label>`).join('')}
</form>` : '';

  const others = Object.entries(events)
    .filter(([slug]) => slug !== event)
    .map(([slug, e]) => `<a href="/${year}/${city.slug}/${slug}/">${esc(e.short)}</a>`)
    .join('');

  const otherCities = cities
    .filter((c) => c.slug !== city.slug)
    .map((c) => `<a href="/${year}/${c.slug}/${event}/">${esc(c.short || c.name)}</a>`)
    .join('');

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Why are the ${data.short.toLowerCase()} dates for ${cityName} different from an Indian calendar?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The Hindu day runs from local sunrise to local sunrise, so the tithi and nakshatram in force on a given date in ${cityName} are read at ${cityName}'s sunrise — not Chennai's. On days where an element changes near dawn the two calendars simply land on different dates. Every date on this page is computed for ${cityName} specifically.`,
        },
      },
      {
        '@type': 'Question',
        name: `How many ${data.short.toLowerCase()} dates are there in ${year} for ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${data.count} in ${year}. ${data.blurb}`,
        },
      },
      {
        '@type': 'Question',
        name: 'Is this a substitute for asking a purohit?',
        acceptedAnswer: { '@type': 'Answer', text: PUROHIT_LINE },
      },
    ],
  };

  const body = `
${breadcrumbs(crumbs)}
<h1>${esc(label)} dates ${year} in ${esc(cityName)}</h1>
<p class="lede">${esc(data.blurb)}</p>
<p class="meta"><strong id="total">${data.count}</strong> dates in ${year}, computed at ${esc(cityName)} sunrise.
${data.count === 0 ? 'None this year — see the explanation below.' : ''}</p>
${purohit()}
${optionsPanel}
${all.length ? tables : '<p class="empty">No dates qualify in this city for this year under the rules on the <a href="/how-dates-are-computed/">methodology page</a>. That is a real result, not a missing file — the month blocks and the planetary combustion periods can close out a whole year.</p>'}
${storeBanner(event)}
${emailCapture(city, year)}
<section class="explain">
  <h2>Why these dates</h2>
  <p>${esc(data.blurb)}</p>
  <p>Each date above passed every rule for a ${esc(data.short.toLowerCase())} in
  <a href="/how-dates-are-computed/">our published rule set</a> — the nakshatram and tithi
  prevailing at sunrise in ${esc(cityName)}, the weekday, the Tamil month, and where it applies
  the planetary combustion (moudhyam) periods and eclipse days. The rahu kalam column is a
  caution rather than a filter: the date can be good and the hour still needs choosing.</p>
</section>
<nav class="related">
  <h2>Other dates for ${esc(cityName)} in ${year}</h2>
  <div class="chips">${others}</div>
  <h2>${esc(data.short)} dates ${year} in other cities</h2>
  <div class="chips">${otherCities}</div>
</nav>`;

  return layout({
    title: `${label} dates ${year} in ${cityName} — with nakshatram`,
    description: `${data.count} ${data.short.toLowerCase()} dates for ${year} in ${cityName}, with nakshatram, tithi and rahu kalam, computed at ${cityName} sunrise.`,
    path: `/${year}/${city.slug}/${event}/`,
    body,
    jsonld: [breadcrumbLd(crumbs), faq],
    scripts: `<script src="/ics.js" defer></script>${
      offered.length ? '\n<script src="/options.js" defer></script>' : ''}`,
  });
}

// ---------------------------------------------------------------------------

export function cityPage({ year, city, events, years, cities }) {
  const cityName = city.short || city.name;
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: String(year), href: `/${year}/` },
    { label: cityName, href: `/${year}/${city.slug}/` },
  ];

  const cards = Object.entries(events).map(([slug, e]) => `
  <a class="card" href="/${year}/${city.slug}/${slug}/">
    <h3>${esc(e.label)}</h3>
    <p class="n">${e.count} date${e.count === 1 ? '' : 's'} in ${year}</p>
    <p>${esc(e.blurb.split('. ').slice(0, 2).join('. ').replace(/\.*$/, '.'))}</p>
  </a>`).join('');

  const body = `
${breadcrumbs(crumbs)}
<h1>Muhurtham dates ${year} — ${esc(cityName)}</h1>
<p class="lede">Every date on this site is computed at ${esc(cityName)}’s own sunrise
(${esc(city.tz)}), which is what makes it different from a calendar printed for India.</p>

<!-- FR-5: the daily-return hook. Reads a small per-city file, not the year JSON. -->
<section class="widget" id="widget" data-city="${city.slug}" data-tz="${esc(city.tz)}" data-name="${esc(cityName)}">
  <h2>Today in ${esc(cityName)}</h2>
  <p class="loading">Loading today’s panchangam…</p>
</section>

<h2>Choose an occasion</h2>
<div class="cards">${cards}</div>

<nav class="related">
  <h2>Other years</h2>
  <div class="chips">${years.map((y) => `<a href="/${y}/${city.slug}/">${y}</a>`).join('')}</div>
  <h2>Other cities</h2>
  <div class="chips">${cities.filter((c) => c.slug !== city.slug)
    .map((c) => `<a href="/${year}/${c.slug}/">${esc(c.short || c.name)}</a>`).join('')}</div>
</nav>
${purohit()}`;

  return layout({
    title: `Muhurtham dates ${year} in ${cityName} — wedding, housewarming and more`,
    description: `Auspicious dates for ${year} computed at ${cityName} sunrise: wedding muhurtham, engagement, griha pravesam, seemantham and shop opening, each with nakshatram and tithi.`,
    path: `/${year}/${city.slug}/`,
    body,
    jsonld: [breadcrumbLd(crumbs)],
    scripts: '<script src="/widget.js" defer></script>',
  });
}

// ---------------------------------------------------------------------------

export function yearPage({ year, cities, years, counts }) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: String(year), href: `/${year}/` }];
  const rows = cities.map((c) => `
    <tr>
      <th scope="row"><a href="/${year}/${c.slug}/">${esc(c.short || c.name)}</a></th>
      <td>${esc(c.country)}</td>
      ${Object.keys(counts[c.slug]).map((e) =>
        `<td><a href="/${year}/${c.slug}/${e}/">${counts[c.slug][e]}</a></td>`).join('')}
    </tr>`).join('');
  const eventNames = Object.keys(counts[cities[0].slug]);

  const body = `
${breadcrumbs(crumbs)}
<h1>Tamil muhurtham dates ${year}, by city</h1>
<p class="lede">The counts differ by city because the tithi and nakshatram are read at each
city’s own sunrise. Pick your city.</p>
<div class="scroll">
<table class="matrix">
  <thead><tr><th scope="col">City</th><th scope="col">Country</th>
  ${eventNames.map((e) => `<th scope="col">${esc(e)}</th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody>
</table>
</div>
<nav class="related"><h2>Other years</h2>
<div class="chips">${years.filter((y) => y !== year).map((y) => `<a href="/${y}/">${y}</a>`).join('')}</div></nav>
${scope()}
${purohit()}`;

  return layout({
    title: `Tamil muhurtham dates ${year} — by city, for the diaspora`,
    description: `Tamil wedding, engagement, housewarming, seemantham and venture dates for ${year} across 12 cities, each computed at local sunrise.`,
    path: `/${year}/`,
    body,
    jsonld: [breadcrumbLd(crumbs)],
  });
}

// ---------------------------------------------------------------------------

export function homePage({ years, cities, planningYear }) {
  const body = `
<h1>${esc(SITE.tagline)}</h1>
<p class="lede">${esc(SITE.description)}</p>
<div class="cta-years">${years.map((y) =>
  `<a class="btn big${y === planningYear ? ' primary' : ''}" href="/${y}/">${y} dates</a>`).join('')}</div>

<h2>Your city</h2>
<div class="chips wide">${cities.map((c) =>
  `<a href="/${planningYear}/${c.slug}/">${esc(c.short || c.name)}<span class="ta">${esc(c.country)}</span></a>`).join('')}</div>
<p class="fine">Every city&rsquo;s dates are also available as a printable PDF, free, on that city&rsquo;s page.</p>

<section class="explain">
  <h2>Why a separate list per city</h2>
  <p>The Hindu day runs sunrise to sunrise. A tithi that ends at 6:20am is in force at
  Chennai’s sunrise but long gone by the time the sun comes up in New Jersey — so the two
  cities are genuinely on different dates, and a calendar printed for India is quietly wrong
  abroad. Most diaspora-facing sites republish the Indian list anyway. We compute each city
  from the ephemeris at its own sunrise.</p>
  <p><a href="/how-dates-are-computed/">See exactly how these are computed →</a></p>
</section>
${scope()}
${purohit()}`;

  return layout({
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    path: '/',
    body,
    jsonld: [{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.origin,
      description: SITE.description,
    }],
  });
}

// ---------------------------------------------------------------------------

export function methodologyPage({ rulesSummary, generatedWith, verification }) {
  const crumbs = [{ label: 'Home', href: '/' },
    { label: 'How we compute', href: '/how-dates-are-computed/' }];
  const body = `
${breadcrumbs(crumbs)}
<h1>How these dates are computed</h1>
<p class="lede">The whole method, in public. If you disagree with a rule you can see exactly
which one it is — that is the point of publishing this page.</p>

<h2>The astronomy</h2>
<dl class="spec">
  <dt>Ephemeris</dt><dd>Swiss Ephemeris ${esc(generatedWith.swisseph)} (Moshier analytical mode — within about a second of clock time on a tithi boundary, which is invisible at date granularity).</dd>
  <dt>Zodiac</dt><dd>Sidereal, Lahiri (Chitrapaksha) ayanamsa — the Indian standard.</dd>
  <dt>Day boundary</dt><dd>Local sunrise to the next local sunrise. A date’s tithi and nakshatram are the ones in force <em>at your city’s sunrise</em>.</dd>
  <dt>Sunrise</dt><dd>Upper limb of the disc with atmospheric refraction — the standard almanac convention.</dd>
  <dt>Tamil month</dt><dd>Begins on the day whose <em>sunset</em> follows the sankranti (the Tamil and Kerala rule). This is what fixes the Aadi and Margazhi boundaries.</dd>
  <dt>Rahu kalam, yamagandam, gulikai</dt><dd>The standard eighth-part division of the real local daylight span, not a fixed 6am–6pm table.</dd>
  <dt>Eclipses</dt><dd>Solar and umbral lunar eclipses count as grahan. Penumbral lunar eclipses do not — they are invisible to the eye and are not observed as grahan.</dd>
</dl>

<h2>The rules</h2>
<p>Each occasion has its own written rule list — which nakshatrams are allowed, which tithis
and months are avoided — and every rule records where it comes from. The lists are checked
against family practice before publication, and where families genuinely differ the page
says so rather than pretending there is one answer. The rules are public, so anything you
disagree with, you can see and tell us about.</p>
<p><strong>Combustion (moudhyam).</strong> Weddings are suspended while Sukra or Guru is
combust. We treat a planet as combust inside <strong>10&deg; for Venus</strong> (8&deg; when
retrograde) and <strong>11&deg; for Jupiter</strong> — the conventional muhurtham orbs. Some
published lists use a tighter orb and so keep printing dates for a few days after we stop.
That is a difference of convention, not of arithmetic: the orb we use is stated here so you
can see exactly where our list ends and why.</p>
<p>Where a rule is one families split on — Pournami and Saturday for a wedding, the waning
fortnight for a housewarming — the date lists follow the stricter reading, and the looser
one is offered as a switch on the page itself. Turning it on adds dates, each marked
<span class="tag">optional</span>. Nothing is hidden either way: both readings are in the
published rule files, with the reason for each.</p>
${rulesSummary}

<h2>Cross-checking</h2>
${verification}

<h2>What this is not</h2>
<p>No horoscope matching, no jathagam porutham, no personalised prediction. This is a
shortlisting tool: it narrows a year to the dates worth discussing.</p>
<p class="purohit">${esc(PUROHIT_LINE)}</p>`;

  return layout({
    title: 'How these muhurtham dates are computed — method, rules and sources',
    description: 'The full method: Swiss Ephemeris, Lahiri ayanamsa, sunrise-to-sunrise day boundary, the rule set per occasion, and the cross-check against published panchangams.',
    path: '/how-dates-are-computed/',
    body,
    jsonld: [breadcrumbLd(crumbs)],
  });
}

// ---------------------------------------------------------------------------

// Cloudflare Pages serves the root index.html with a 200 for any unmatched
// path unless a 404.html exists. Our URLs are guessable (/2029/mumbai/wedding/),
// so without this every wrong guess is indexed as a duplicate homepage.
export function notFoundPage({ years, cities, planningYear }) {
  const body = `
<h1>No dates at this address</h1>
<p class="lede">That page doesn’t exist — most likely the year or the city isn’t one we
publish yet. Everything we do have is one click away.</p>

<h2>Years</h2>
<div class="cta-years">${years.map((y) =>
  `<a class="btn big${y === planningYear ? ' primary' : ''}" href="/${y}/">${y} dates</a>`).join('')}</div>

<h2>Cities</h2>
<div class="chips wide">${cities.map((c) =>
  `<a href="/${planningYear}/${c.slug}/">${esc(c.short || c.name)}<span class="ta">${esc(c.country)}</span></a>`).join('')}</div>

<p><a href="/how-dates-are-computed/">How these dates are computed →</a></p>`;

  return layout({
    title: `Page not found — ${SITE.name}`,
    description: 'That page does not exist. Browse the years and cities we publish.',
    path: '/404',
    body,
    noindex: true,
  });
}

// ---------------------------------------------------------------------------

// Where /api/subscribe sends the browser. Kept out of the sitemap: it is a
// destination, not a page anyone should arrive at from search.
export function thanksPage() {
  const body = `
<h1>Check your inbox</h1>
<p class="lede">The PDF is on its way. If it hasn’t arrived in a few minutes,
look in spam — and the direct link below works either way.</p>

<p><a class="btn big primary" id="pdf" href="/">Download the PDF</a></p>

<p id="note" hidden></p>

<p><a href="/">Back to all cities and years</a> ·
<a href="/how-dates-are-computed/">How these dates are computed</a></p>`;

  // The query string is attacker-controlled, so the path is matched against the
  // exact shape the build emits before it is ever put in an href.
  const script = `<script>
(function () {
  var q = new URLSearchParams(location.search);
  var p = q.get('pdf') || '';
  var a = document.getElementById('pdf');
  if (/^\\/pdf\\/\\d{4}-[a-z-]+\\.pdf$/.test(p)) { a.href = p; } else { a.hidden = true; }
  var note = document.getElementById('note');
  var state = q.get('state');
  if (state === 'bad-email') {
    note.textContent = 'That address did not look right, so nothing was sent. Try again from your city’s page.';
    note.hidden = false;
  } else if (state === 'mail-failed') {
    note.textContent = 'The email could not be sent just now — use the link above, and do try again later.';
    note.hidden = false;
  }
}());
</script>`;

  return layout({
    title: `Check your inbox — ${SITE.name}`,
    description: 'Your dates PDF is on its way.',
    path: '/thank-you/',
    body,
    noindex: true,
    scripts: script,
  });
}
