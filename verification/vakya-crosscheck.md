# Vakya cross-check — printed Pambu Panchangam, Parapava 2026–27

**STATUS: DRAFT. NOT SIGNED OFF.** This is the follow-up GATE-A1 left
open: a test against a *printed vakya almanac* rather than a second drik
implementation. It is evidence for review, not a cleared gate.

## Source

*Pambu Panchangam*, Parapava varusham 2026–27, ₹82. The cover states
**சுத்த வாக்கிய பஞ்சாங்கம்** — pure vakya reckoning — which is exactly the
system GATE-A1 could not test against. Read from a compressed scan, 36 pages
at 902 px wide (~75 dpi).

**Correction to the first draft of this file.** It recorded that the edition
was abridged and carried "no day-by-day panchangam tables", so ending times
could not be compared. That was wrong: pages 11–22 are one full month each,
Chithirai through Panguni, and every day carries tithi and nakshatram with
their ending *times*. The first draft had only looked at the muhurtham list
on page 2 and the festival pages. Everything below §3 rests on those daily
tables and could have been measured from the start.

Endings are printed the vakya way — nazhikai and vinadi elapsed since that
day's sunrise (1 nazhikai = 24 min, 1 vinadi = 24 s) — with the clock time in
brackets and a part-of-day suffix (கா morning, ப afternoon, மா evening,
இ night, அகா early morning). `60-00 (முழு)` means the element runs the whole
day and is not an ending at all; those rows are excluded from drift figures.

## 1. Reading validation

Tamil script read off a compressed scan is not self-evidently reliable, so
the transcription was checked before any comparison:

| Check | Result |
|---|---|
| Printed weekday vs. actual weekday, muhurtham list | 19/19 |
| Printed weekday vs. actual weekday, Karthigai daily table | 29/29 |
| Printed Tamil day number vs. Chithirai 1 = 14 Apr 2026 | consistent throughout |
| Tithi sequence within the month, unbroken and correctly paksha-switched | yes |
| Largest disagreement anywhere in either sample | 1 step |

Two of these are strong. Every disagreement is exactly one position on an
ordered cycle — the signature of systematic drift, not of transcription
error, which would produce arbitrary wrong names. And the drift itself turns
out to be a smooth curve (§3); random misreadings cannot produce one.

A by-product worth recording: the Tamil day numbers confirm our solar month
boundaries agree with the almanac's, and page 11 independently confirms
Chithirai 1 = Tue 14 Apr 2026 (தமிழ்வருஷப்பிறப்பு).

## 2. Karthigai 2026 daily table — n = 29 consecutive days

The whole month, 17 Nov – 15 Dec 2026, every day compared at Chennai sunrise.

| | agree |
|---|---|
| weekday | 29/29 |
| tithi | 24/29 |
| nakshatram | 26/29 |

Eight sunrise flips, all one step, and they cluster:

| Date | Element | Ours at sunrise | Pambu | Our boundary | Sunrise |
|---|---|---|---|---|---|
| 2026-11-19 | tithi | Navami | Dasami | 07:06 | 06:09 |
| 2026-11-19 | nakshatram | Sadhayam | Poorattathi | 06:10 | 06:09 |
| 2026-11-20 | tithi | Dasami | Ekadasi | 07:16 | 06:09 |
| 2026-11-20 | nakshatram | Poorattathi | Uthirattathi | 06:56 | 06:09 |
| 2026-11-21 | tithi | Ekadasi | Dwadasi | 06:31 | 06:10 |
| 2026-11-21 | nakshatram | Uthirattathi | Revathi | 06:50 | 06:10 |
| 2026-11-29 | tithi | Sashti | Panchami | 01:47 (+1) | 06:14 |
| 2026-11-30 | tithi | Sapthami | Sashti | 00:12 (+1) | 06:14 |

Read the two right-hand columns. On 19, 20 and 21 November our boundary falls
1, 47 and 41 minutes after sunrise. A three-hour shift in either direction
moves it across sunrise and the printed element changes. **Nothing is wrong
on either side of these rows; the boundary is simply sitting on top of
sunrise.**

## 3. The drift, measured

Where both almanacs name the same element, its ending is the same event on
both sides, so the difference is directly comparable. Rebuilding Pambu's
ending from the printed nazhikai and our sunrise:

| | n | period | amplitude | offset | residual RMS |
|---|---|---|---|---|---|
| tithi end | 23 | 30.0 d | ±243 min | +37 min | 53 min (9.3% of spread) |
| nakshatram end | 25 | 26.9 d | ±240 min | +103 min | 41 min (7.4% of spread) |

The series is not scatter. It rises monotonically from −184 min on 18 Nov to
+374 min on 29 Nov and falls monotonically back to −155 by 15 Dec: one clean
cycle per lunar month, amplitude about **±4 hours**, fitted by a single
sinusoid with under 10% residual.

That is the expected shape. Vakya advances the moon by memorised mean-motion
tables with a coarse correction; the residual against true longitude is
dominated by the lunar equation of centre, which cycles once per anomalistic
month with an amplitude of a few hours in time-of-crossing. Twenty-nine days
of data constrain the amplitude well and the period poorly — the recovered
26.9 d and 30.0 d bracket the anomalistic month (27.55 d), and should not be
read as measuring it.

**This is the headline result. The divergence is not error on either side.
It is a known, bounded, periodic property of vakya reckoning, and it only
becomes visible when a boundary lands within about four hours of sunrise.**

## 4. Muhurtham list, page 2 — n = 19

The original sample, retained. **12 of 19 rows agree on both tithi and
nakshatram; all seven disagreements are a single step.**

| Date | Day | Pambu tithi | Pambu nak. | Ours tithi | Ours nak. | Verdict | On our list |
|---|---|---|---|---|---|---|---|
| 2026-04-20 | Mon | Dwithiyai | Rohini | Thrithiyai | Rohini | tithi ±1 | yes |
| 2026-05-08 | Fri | Sashti | Uthiradam | Sashti | Uthiradam | agree | yes |
| 2026-05-13 | Wed | Ekadasi | Uthirattathi | Ekadasi | Uthirattathi | agree | yes |
| 2026-05-18 | Mon | Dwithiyai | Rohini | Dwithiyai | Rohini | agree | yes |
| 2026-05-28 | Thu | Ekadasi | Chithirai | Dwadasi | Chithirai | tithi ±1 | no |
| 2026-06-11 | Thu | Ekadasi | Ashwini | Ekadasi | Revathi | nakshatram ±1 | yes |
| 2026-06-25 | Thu | Ekadasi | Swathi | Ekadasi | Swathi | agree | yes |
| 2026-07-05 | Sun | Panchami | Sadayam | Panchami | Sadhayam | agree | no |
| 2026-07-12 | Sun | Thrayodasi | Mrigasheersham | Thrayodasi | Rohini | nakshatram ±1 | yes |
| 2026-08-23 | Sun | Ekadasi | Moolam | Ekadasi | Moolam | agree | yes |
| 2026-08-31 | Mon | Chathurthi | Revathi | Thrithiyai | Revathi | tithi ±1 | yes |
| 2026-09-07 | Mon | Ekadasi | Punarpoosam | Ekadasi | Punarpoosam | agree | no |
| 2026-11-11 | Wed | Dwithiyai | Anusham | Dwithiyai | Anusham | agree | yes |
| 2026-11-15 | Sun | Sashti | Uthiradam | Sashti | Uthiradam | agree | yes |
| 2026-11-20 | Fri | Ekadasi | Uthirattathi | Dasami | Poorattathi | both ±1 | no |
| 2026-11-29 | Sun | Panchami | Poosam | Sashti | Poosam | tithi ±1 | no |
| 2026-12-06 | Sun | Thrayodasi | Swathi | Thrayodasi | Swathi | agree | yes |
| 2027-02-26 | Fri | Sashti | Swathi | Sashti | Swathi | agree | yes |
| 2027-03-10 | Wed | Dwithiyai | Uthirattathi | Dwithiyai | Uthirattathi | agree | yes |

The daily table confirms this list independently for November: page 18 gives
20 Nov as Karthigai 4, Friday, Ekadasi, Uthirattathi — matching page 2 exactly.

## 5. The five dates Pambu prints that we do not

Every one is rejected by the **nakshatram allowlist and nothing else**. No
tithi, weekday, blocked-month, combustion or eclipse rule disagreed with the
almanac on any of them — the filters doing the heavy lifting are not in
dispute.

| Date | Our nakshatram | Why rejected |
|---|---|---|
| 2026-05-28 | Chithirai | not among the eleven |
| 2026-07-05 | Sadhayam | not among the eleven |
| 2026-09-07 | Punarpoosam | not among the eleven |
| 2026-11-20 | Poorattathi | not among the eleven — **but see below** |
| 2026-11-29 | Poosam | not among the eleven; already an opt-in relaxation |

Four are a scope decision: Pambu admits Chithirai, Sadhayam, Punarpoosam and
Poosam for weddings; `allow_nakshatra` takes the stricter eleven. That is a
`[varies]` call for OWNER-1 — widen `extra_nakshatra`, or keep the strict
list and state that a vakya almanac is more permissive here.

**2026-11-20 is different, and §2 now explains it fully.** Pambu prints
*Uthirattathi*, which **is** on the allowlist. We compute *Poorattathi*,
which is not. Our Poorattathi boundary is at 06:56 against a 06:09 sunrise —
47 minutes. On that date the drift ran roughly −200 min, which moves the
boundary to about 03:40, before sunrise. So the exclusion is not a rule
disagreement and not a bug; it is the four-hour cycle catching a boundary
that happened to sit next to sunrise.

## 6. What this costs the site

Applying the measured ±4 h window to every published date — a boundary within
that distance of sunrise on either side can move across it:

| Event | Dates | Boundary <1 h | <2 h | <4 h |
|---|---|---|---|---|
| wedding | 1585 | 7.9% | 14.7% | 29.7% |
| engagement | 3270 | 7.3% | 14.2% | 28.7% |
| seemantham | 1343 | 8.1% | 14.3% | 28.4% |
| venture | 1863 | 7.2% | 14.0% | 28.4% |
| grihapravesam | 1084 | 8.6% | 14.3% | 28.0% |
| **all** | **9145** | **7.7%** | **14.3%** | **28.7%** |

But a shift only matters if it lands somewhere the rules reject. Most do not
— the adjacent nakshatram is often also on the allowlist, and the user sees
no difference. For wedding dates specifically:

- **1240 of 1585 (78.2%) are robust**: a vakya reader gets the same verdict
  even at the full ±4 h.
- **345 (21.8%) could read as a blocked nakshatram** (193 forward, 152
  backward). This is a **ceiling**, not an estimate: it assumes the drift is
  at peak amplitude in the unfavourable direction, which holds only a few
  days per month. The measured rate on Karthigai was 3/29 for nakshatram.

The most common vulnerable shifts are Uthirattathi→Poorattathi (36),
Magham→Pooram (29) and Mrigasheersham→Thiruvathirai (28).

## Limits — read before citing this

- Two samples, both Chennai: the page-2 muhurtham list (n=19, one Tamil year)
  and the Karthigai daily table (n=29 consecutive days). Eleven further
  monthly pages are in the same file and are not yet transcribed.
- The page-2 list is a *selection* of prime muhurthams with lagna windows;
  ours is every date passing the rule set. Set equality is not the test and
  was not measured. Only rows present in both were compared.
- Pambu's ending times were rebuilt using **our** Chennai sunrise, not the
  almanac's reference sunrise, which appears to run about 9 minutes earlier.
  Irrelevant against a ±240 min signal; it would matter if anyone tried to
  read the residual RMS as a precision figure.
- Read by Claude from a compressed scan at ~75 dpi. The divergent rows in §4
  should still be confirmed against print or a better scan. §2 and §3 are
  more robust to this, because a misread would break the smooth curve.
- §6 is arithmetic on our own data under a measured assumption, not an
  observation. It has not been checked against the almanac for any month
  other than Karthigai.

## If accepted, what changes

The methodology page currently says the vakya check "is still outstanding".
It can instead state the measured result: that we compute drik, that a vakya
almanac differs by a bounded periodic ±4 h, and that the disagreement is
under a quarter of dates at worst. Do not republish the almanac's date list
itself — the selection is their compilation work; this is internal
verification only.

Name: ______________  Date: ____________
