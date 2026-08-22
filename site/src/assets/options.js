// The "your family may also accept these" switches on an event page.
//
// Every optional date is already in the HTML, hidden — this only flips
// visibility, so the page works with JS off (you get the strict list, which is
// the correct default) and there is nothing to fetch. Choices are remembered
// across pages because a family that accepts Saturday accepts it in every city
// and every year, and re-ticking a box on each page would be a small insult.
(function () {
  var form = document.getElementById('opts');
  if (!form) return;
  var KEY = 'muhurtham.opts';

  function saved() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(keys) {
    try { localStorage.setItem(KEY, JSON.stringify(keys)); } catch (e) { /* private mode */ }
  }

  function apply() {
    var on = {};
    var keys = [];
    form.querySelectorAll('input[type=checkbox]').forEach(function (box) {
      on[box.name] = box.checked;
      if (box.checked) keys.push(box.name);
    });

    document.querySelectorAll('tr.opt').forEach(function (row) {
      // A date can need two relaxations at once (a Saturday that is also
      // Poosam). It shows only when the visitor has accepted both.
      row.hidden = !row.dataset.needs.split(' ').every(function (k) { return on[k]; });
    });

    var total = 0;
    document.querySelectorAll('section.month').forEach(function (section) {
      var n = section.querySelectorAll('tbody tr:not([hidden])').length;
      total += n;
      section.querySelector('.count').textContent = n + (n === 1 ? ' date' : ' dates');
      // A month can be empty in the strict list and have optional dates in it.
      section.hidden = n === 0;
    });
    var box = document.getElementById('total');
    if (box) box.textContent = total;
    document.body.classList.toggle('has-opts', keys.length > 0);
    save(keys);
  }

  saved().forEach(function (key) {
    var box = form.querySelector('input[name="' + key + '"]');
    if (box) box.checked = true;
  });
  form.addEventListener('change', apply);
  apply();
})();
