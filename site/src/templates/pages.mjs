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

  const groups = groupByMonth(data.dates);
  const tables = groups.map(([month, rows]) => `
<section class="month">
  <h3>${esc(month)} <span class="count">${rows.length} date${rows.length === 1 ? '' : 's'}</span></h3>
  <div class="scroll">
  <table>
    <thead><tr>
      <th scope="col">Date</th><th scope="col">Day</th>
      <th scope="col">Nakshatram</th><th scope="col">Tithi</th>
      <th scope="col">Avoid (rahu kalam)</th><th scope="col"><span class="sr">Calendar</span></th>
    </tr></thead>
    <tbody>
${rows.map((r) => `      <tr data-date="${r.date}" data-title="${esc(label)} — ${esc(cityName)}" data-desc="${esc(`${r.reason}. Sunrise ${r.sunrise}, sunset ${r.sunset}. Avoid rahu kalam ${r.rahu_kalam[0]}–${r.rahu_kalam[1]}. ${PUROHIT_LINE}`)}">
        <td><time datetime="${r.date}">${pretty(r.date)}</time></td>
        <td>${esc(r.weekday)} <span class="ta">${esc(r.weekday_tamil)}</span></td>
        <td>${esc(r.nakshatra)} <span class="pada">pada ${r.nakshatra_pada}</span></td>
        <td>${esc(r.tithi)} <span class="ta">${esc(r.paksha)}</span></td>
        <td class="rahu">${esc(r.rahu_kalam[0])}–${esc(r.rahu_kalam[1])}</td>
        <td><button class="ics" type="button">Add to calendar</button></td>
      </tr>`).join('\n')}
    </tbody>
  </table>
  </div>
</section>`).join('\n');

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
<p class="meta"><strong>${data.count}</strong> dates in ${year}, computed at ${esc(cityName)} sunrise.
${data.count === 0 ? 'None this year — see the explanation below.' : ''}</p>
${purohit()}
${data.count ? tables : '<p class="empty">No dates qualify in this city for this year under the rules on the <a href="/how-dates-are-computed/">methodology page</a>. That is a real result, not a missing file — the month blocks and the planetary combustion periods can close out a whole year.</p>'}
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
    scripts: '<script src="/ics.js" defer></script>',
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
