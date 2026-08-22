// Everything an owner might change without touching a template.
export const SITE = {
  // "Dates", not "Planner". The site finds dates; it does not plan a wedding,
  // and a name that promises planning promises work this does not do.
  name: 'Muhurtham Dates',
  // Set to the real domain before the first deploy — it is used for canonical
  // URLs, the sitemap and JSON-LD, and a wrong value here is invisible in dev
  // and wrong in Search Console.
  origin: 'https://muhurthamdates.com',
  // "Tamil" is in the tagline deliberately: the rules are Tamil convention, and
  // a stranger has to learn that before they act on a date, not three clicks in.
  tagline: 'Tamil auspicious dates, computed for your city',
  // No year list here on purpose — it would go stale the first time the annual
  // precompute adds one, and nothing would fail to tell you.
  description:
    'Tamil wedding, engagement, housewarming, seemantham and shop-opening ' +
    'dates, computed from the Swiss Ephemeris at your city’s own sunrise — ' +
    'not copied from an India-only calendar.',

  // FR-9. Empty string = no analytics injected at all.
  ga4Id: '',

  // FR-6. Empty action = the form renders as a plain "coming soon" note rather
  // than a broken POST. Fill in when the provider audience exists.
  email: {
    action: '',
    hiddenFields: {}, // e.g. { 'audience': 'xxx' }
    heading: 'Get the {year} {city} dates as a PDF',
    blurb: 'One email, the PDF attached, nothing else. Unsubscribe in a click.',
  },

  // FR-7. Empty `href` removes the banner site-wide, on every page, with no
  // other edit. It only ever renders on wedding and engagement pages.
  storeBanner: {
    href: '',
    image: '',
    line: '',
    cta: 'Browse',
    utm: '?utm_source=muhurtham&utm_medium=banner&utm_campaign=dates',
  },

  // FR-8. Slots are reserved in the layout with fixed height so adding ad code
  // later cannot shift content (CLS). Nothing is injected while this is false.
  adsEnabled: false,
};

// NG1. Load-bearing sentence, on every date page.
export const PUROHIT_LINE =
  'These are dates a family would normally consider — confirm the final ' +
  'date and the muhurtham time with your family purohit.';
