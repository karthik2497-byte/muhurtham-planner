// FR-6. The only server-side code on this site.
//
// Resend is an API, not a hosted form, so the API key cannot live in the page.
// This endpoint holds it, validates what the browser sent, mails the PDF and
// records the contact. Everything else about the site stays static.

const FROM = 'Muhurtham Dates <dates@muhurthamdates.com>';
const API = 'https://api.resend.com';

const seeOther = (url) => new Response(null, { status: 303, headers: { Location: url } });

// Deliberately loose: the address is proven by whether the mail arrives, not by
// a regex. This only rejects what obviously cannot be an address.
const looksLikeEmail = (s) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(s) && s.length <= 254;

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  if (!form) return seeOther('/');

  // Honeypot: a real browser never fills a hidden field, bots fill everything.
  // Answer them exactly as we answer a success so they learn nothing.
  // ponytail: good enough until it isn't — Turnstile is the upgrade if the
  // daily send quota starts getting burned by signups nobody made.
  if (form.get('company')) return seeOther('/thank-you/');

  const email = String(form.get('email') || '').trim().toLowerCase();
  const city = String(form.get('city') || '').trim();
  const year = String(form.get('year') || '').trim();

  if (!looksLikeEmail(email)) return seeOther(`/thank-you/?state=bad-email`);
  if (!/^[a-z][a-z-]{1,30}$/.test(city) || !/^\d{4}$/.test(year)) return seeOther('/');

  // The PDF's existence *is* the validation for city and year — no second list
  // of cities to drift out of step with the one the build already used.
  const pdfPath = `/pdf/${year}-${city}.pdf`;
  const pdf = await env.ASSETS.fetch(new URL(pdfPath, url.origin));
  if (!pdf.ok) return seeOther('/');

  const link = `${url.origin}${pdfPath}`;
  const pretty = city.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const sent = await fetch(`${API}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: `Your ${year} ${pretty} muhurtham dates`,
      html: `<p>Here are the ${year} dates for ${pretty}:</p>
<p><a href="${link}">Download the PDF</a></p>
<p>Every date was computed from the Swiss Ephemeris at ${pretty}'s own sunrise.
<a href="${url.origin}/how-dates-are-computed/">How these are computed</a>.</p>
<p>Confirm the final date and the muhurtham time with your family purohit.</p>`,
    }),
  }).catch(() => null);

  if (!sent || !sent.ok) {
    console.log('resend send failed', sent && sent.status, sent && (await sent.text()));
    // The visitor still gets what they came for; the list entry is the loss.
    return seeOther(`/thank-you/?state=mail-failed&pdf=${encodeURIComponent(pdfPath)}`);
  }

  // Segmentation is the reason this list is worth more than the ads, so record
  // it — but never at the cost of the delivery that already succeeded.
  const stored = await fetch(`${API}/contacts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      ...(env.RESEND_AUDIENCE_ID ? { audience_id: env.RESEND_AUDIENCE_ID } : {}),
      properties: { city, year },
    }),
  }).catch(() => null);

  if (!stored || !stored.ok) {
    console.log('resend contact failed', stored && stored.status, stored && (await stored.text()));
  }

  return seeOther(`/thank-you/?pdf=${encodeURIComponent(pdfPath)}`);
}

// A GET here means someone typed the URL, or a form posted without JS to the
// wrong verb. Neither is an error worth a stack trace.
export const onRequestGet = () => seeOther('/');
