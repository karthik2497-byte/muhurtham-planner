import { SITE } from '../../site.config.mjs';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// The nav lists whatever years the pipeline actually produced. build.mjs sets
// this once before rendering anything — hardcoding the list here is how a nav
// ends up advertising 2027 on a site that also publishes 2029.
let YEARS = [];
export const setYears = (years) => { YEARS = years; };

const ga = () =>
  SITE.ga4Id
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga4Id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.ga4Id}')</script>`
    : '';

// FR-8: reserved, fixed-height, empty. Adding ad code later cannot shift text.
const adSlot = (id) =>
  SITE.adsEnabled ? `<div class="ad-slot" id="${id}"></div>` : '';

export function layout({ title, description, path, body, jsonld = [], scripts = '', noindex = false }) {
  const canonical = SITE.origin + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site.css">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
${ga()}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <a class="brand" href="/"><span class="mark">✳</span> ${esc(SITE.name)}</a>
  <nav>${YEARS.map((y) => `<a href="/${y}/">${y}</a>`).join('')}<a href="/how-dates-are-computed/">How we compute</a></nav>
</header>
${adSlot('ad-top')}
<main id="main">
${body}
</main>
<footer class="site">
  <p>${esc(SITE.name)} — dates computed from the Swiss Ephemeris at each city’s own sunrise.
  <a href="/how-dates-are-computed/">How we compute these</a>.</p>
  <p class="fine">Not affiliated with any temple or astrological service. No horoscope matching — see the methodology page.</p>
</footer>
${scripts}
</body>
</html>
`;
}

export function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map((i, n) =>
      n === items.length - 1
        ? `<span aria-current="page">${esc(i.label)}</span>`
        : `<a href="${i.href}">${esc(i.label)}</a>`)
    .join('<span class="sep">›</span>')}</nav>`;
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, n) => ({
      '@type': 'ListItem',
      position: n + 1,
      name: i.label,
      item: SITE.origin + i.href,
    })),
  };
}
