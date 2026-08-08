// "Add to calendar" — builds an .ics in the browser from the row's data
// attributes. No dependency, no server, works offline.
//
// The event is an ALL-DAY VEVENT (VALUE=DATE), deliberately. A muhurtham date
// is a date; the hour is chosen with a purohit and we do not invent one. All-day
// events also carry no timezone, which is what makes this correct in every city
// including across a DST transition — a timed VEVENT would need a VTIMEZONE
// block per city and is the single most common way .ics downloads land an hour
// out. Sunrise, sunset and the rahu kalam window are in the description as
// local clock times, which is where a reader actually wants them.
(function () {
  const pad = (n) => String(n).padStart(2, '0');

  function nextDay(iso) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  }

  // RFC 5545: escape, then fold at 75 octets.
  const escapeText = (s) =>
    String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;')
      .replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  // RFC 5545 folds at 75 OCTETS, not characters, and a fold must never split a
  // multi-byte sequence. Our text is mostly ASCII but the rahu kalam window
  // carries an en-dash (3 bytes in UTF-8), which is exactly enough to push a
  // character-counted fold over the limit on the longer city names.
  function fold(line) {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const decoder = new TextDecoder();
    const out = [];
    let start = 0;
    let limit = 75;
    while (start < bytes.length) {
      let end = Math.min(start + limit, bytes.length);
      // Back off to a code-point boundary (continuation bytes are 10xxxxxx).
      while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
      out.push((out.length ? ' ' : '') + decoder.decode(bytes.subarray(start, end)));
      start = end;
      limit = 74; // continuation lines spend one octet on the leading space
    }
    return out.join('\r\n');
  }

  function build(row) {
    const date = row.dataset.date;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${date}-${Math.random().toString(36).slice(2, 10)}@muhurtham`;
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Muhurtham Planner//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${nextDay(date)}`,
      fold(`SUMMARY:${escapeText(row.dataset.title)}`),
      fold(`DESCRIPTION:${escapeText(row.dataset.desc)}`),
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return lines.join('\r\n') + '\r\n';
  }

  // One global so scripts/test-ics.mjs can exercise the builder without a DOM.
  // Cheaper than either shipping a module bundle or leaving the RFC 5545
  // formatting untested, and .ics bugs are invisible until a user's calendar
  // silently drops the event.
  globalThis.__buildIcs = build;

  if (typeof document === 'undefined') return;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button.ics');
    if (!btn) return;
    const row = btn.closest('tr');
    const blob = new Blob([build(row)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${row.dataset.date}-muhurtham.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
