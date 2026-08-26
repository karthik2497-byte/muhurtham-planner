# vakya cross-check scripts

Reproduce the numbers in [`../vakya-crosscheck.md`](../vakya-crosscheck.md).
Run from the repo root with the venv python.

| Script | What it does |
|---|---|
| `fetch_dp.py` | Pulls drikpanchang's Tamil day panchangam for Chennai in both arithmetics. Resumable; writes `dp_chennai.json`. Only needed to refresh the cache. |
| `validate.py` | §7b — printed Pambu vs drikpanchang vakyam on the Karthigai days. |
| `three_way.py` | §7a and §7c — ours vs dp-drik and ours vs dp-vakyam. |
| `period.py` | §7c — residual RMS at each candidate physical period. |
| `exposure.py` | §6 — how many published dates the fitted window could move. |

`pambu_karthigai.json` is the Karthigai 2026 month transcribed from p18 of the
printed almanac: tithi and nakshatram with endings in nazhikai-vinadi. It is
transcription, not computation — the reading checks are in §1.

`dp_chennai.json` is a cached scrape, 91 days x 2 arithmetics. Re-fetching is
182 requests at one per second; don't do it casually.

Two things to know before touching `fetch_dp.py`: drikpanchang's
`data-element-info` stamp has no AM/PM, so `drik-time-format=24hour` must be
set or every afternoon ending reads twelve hours early; and an element that
spans the whole day carries a string id instead of a time.
