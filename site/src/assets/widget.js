// FR-5 — today's panchangam for this city. The daily-return hook.
//
// "Today" means today IN THE CITY, not in the visitor's browser: someone in
// London checking the Sydney page wants Sydney's day. Intl gives us that date
// without shipping a timezone library.
(function () {
  const el = document.getElementById('widget');
  if (!el) return;

  const tz = el.dataset.tz;
  const todayThere = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()); // en-CA gives YYYY-MM-DD

  const pretty = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    });
  };

  fetch(`/widget/${el.dataset.city}.json`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rows) => {
      const row = rows.find((x) => x.d === todayThere);
      if (!row) {
        el.querySelector('.loading').textContent =
          'Today falls outside the years published so far — the next year is added each autumn.';
        return;
      }
      el.innerHTML = `<h2>Today in ${el.dataset.name}</h2>
      <p class="w-date">${pretty(row.d)} <span class="ta">${row.m}</span></p>
      <dl class="w-grid">
        <div><dt>Nakshatram</dt><dd>${row.n}</dd></div>
        <div><dt>Tithi</dt><dd>${row.t}</dd></div>
        <div><dt>Sunrise</dt><dd>${row.r}</dd></div>
        <div><dt>Sunset</dt><dd>${row.s}</dd></div>
        <div class="w-rahu"><dt>Rahu kalam</dt><dd>${row.k[0]}–${row.k[1]}</dd></div>
      </dl>
      <p class="fine">All times are ${tz} local.</p>`;
    })
    .catch(() => {
      el.querySelector('.loading').textContent =
        'Could not load today’s panchangam. The dated lists below are unaffected.';
    });
})();
