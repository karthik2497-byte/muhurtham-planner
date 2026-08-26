# Vakya cross-check — printed Pambu Panchangam, Parapava 2026–27

**STATUS: DRAFT. NOT SIGNED OFF.** This is the follow-up GATE-A1 left
open: a test against a *printed vakya almanac* rather than a second drik
implementation. It is evidence for review, not a cleared gate.

## Source

*Pambu Panchangam*, Parapava varusham 2026–27, ₹82. The cover states
**சுத்த வாக்கிய பஞ்சாங்கம்** — pure vakya reckoning — which is exactly the
system GATE-A1 could not test against. Read from a compressed scan (902 px
wide) of the printed subha-muhurtham list on page 2.

This edition is abridged: it carries muhurtham lists, predictions and a
festival calendar, but **no day-by-day panchangam tables**. Tithi and
nakshatram ending *times* therefore could not be compared — only which
element was in force, as printed against the muhurtham date.

## Reading validation

Tamil script read off a compressed scan is not self-evidently reliable, so
the transcription was checked three ways before any comparison:

| Check | Result |
|---|---|
| Printed weekday vs. actual weekday of each Gregorian date | 19/19 |
| Printed Tamil day number vs. Chithirai 1 = 14 Apr 2026 | consistent throughout |
| Largest disagreement anywhere in the sample | 1 step |

The third is the strongest of the three. A misread Tamil name would produce
an arbitrary wrong name; **every** disagreement here is exactly one position
on an ordered cycle, which is the signature of systematic drift rather than
of transcription error.

A by-product worth recording: the Tamil day numbers confirm that our solar
month boundaries agree with the almanac's for Chithirai, Vaikasi and Aani.

## Result

**12 of 19 rows agree on both tithi and nakshatram.** All
seven disagreements are a single step.

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

## The five dates Pambu prints that we do not

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

**2026-11-20 is different and is the important row.** Pambu prints
*Uthirattathi*, which **is** on the allowlist. We compute *Poorattathi*,
which is not. The date is excluded by a one-step nakshatram divergence, not
by any rule disagreement — the first concrete case where vakya-vs-drik
changes what a family is shown.

## Limits — read before citing this

- One city (Chennai), one occasion (wedding), one Tamil year.
- n=19 comparable rows. GATE-A1 used n=40 against two sources.
- The almanac's list is a *selection* of prime muhurthams with lagna windows;
  ours is every date passing the rule set. Set equality is not the test and
  was not measured. Only rows present in both were compared.
- Read by Claude from a compressed scan. The seven divergent rows should be
  confirmed against the print or a higher-resolution scan before publication.
- Ending times were not compared, because this edition has no daily tables.
  That is the measurement that would quantify drift in minutes rather than
  inferring it from a flip.

## If accepted, what changes

The methodology page currently says the vakya check "is still outstanding".
It could instead state the measured result. Do not republish the almanac's
date list itself — the selection is their compilation work; this is internal
verification only.

Name: ______________  Date: ____________
