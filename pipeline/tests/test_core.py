"""
Unit tests for core.py — the two classic bug sites (day boundary, rahu kalam)
plus the division solver and the Tamil month rule.

Run: ./.venv/bin/python -m pytest pipeline/tests -q
  or ./.venv/bin/python pipeline/tests/test_core.py   (assert-only, no pytest)

External anchors used here are things that are true independent of this code:
published rahu kalam eighth-parts, Puthandu = 14 April, Chennai sunrise ~05:57.
Broad agreement with published panchangams is NOT this file's job — that is the
n=40 cross-check in verification/ (FR-V1), which a human dispositions.
"""

import datetime as dt
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import core  # noqa: E402

CHENNAI = (13.0827, 80.2707, 16.0, ZoneInfo("Asia/Kolkata"))
NEWARK = (40.7357, -74.1724, 10.0, ZoneInfo("America/New_York"))
SYDNEY = (-33.8688, 151.2093, 25.0, ZoneInfo("Australia/Sydney"))


def hhmm(s):
    h, m = s.split(":")
    return int(h) * 60 + int(m)


# --- rahu kalam / yamagandam / gulikai -------------------------------------

def test_eighth_part_tables_match_published_nominal_day():
    """
    On a nominal 06:00-18:00 day the published tables are exact clock times.
    Any permutation error in RAHU_PART/YAMA_PART/GULIKA_PART shows up here.
    """
    published_rahu = {  # weekday index (Sun=0) -> start hour
        0: 16.5, 1: 7.5, 2: 15.0, 3: 12.0, 4: 13.5, 5: 10.5, 6: 9.0,
    }
    published_yama = {
        0: 12.0, 1: 10.5, 2: 9.0, 3: 7.5, 4: 6.0, 5: 15.0, 6: 13.5,
    }
    published_gulika = {
        0: 15.0, 1: 13.5, 2: 12.0, 3: 10.5, 4: 9.0, 5: 7.5, 6: 6.0,
    }
    rise, sett = 0.0, 0.5  # a JD "day" of 12 daylight hours starting at 06:00
    for table, published in ((core.RAHU_PART, published_rahu),
                             (core.YAMA_PART, published_yama),
                             (core.GULIKA_PART, published_gulika)):
        for weekday, start_hour in published.items():
            a, _ = core.eighth_part(rise, sett, table[weekday])
            got = 6.0 + (a - rise) * 24
            assert abs(got - start_hour) < 1e-9, (table, weekday, got, start_hour)


def test_eighth_part_rejects_out_of_range():
    for bad in (-1, 8):
        try:
            core.eighth_part(0.0, 0.5, bad)
        except ValueError:
            continue
        raise AssertionError(f"part={bad} should have raised")


def test_rahu_kalam_is_an_eighth_of_real_daylight():
    d = core.day_elements(*CHENNAI, dt.date(2027, 6, 15))
    span = hhmm(d["sunset"]) - hhmm(d["sunrise"])
    for key in ("rahu_kalam", "yamagandam", "gulikai"):
        a, b = (hhmm(x) for x in d[key])
        assert abs((b - a) - span / 8) <= 1, (key, a, b, span)
        assert hhmm(d["sunrise"]) <= a < b <= hhmm(d["sunset"]), (key, d)


# --- day boundary ----------------------------------------------------------

def test_sunrise_is_after_local_midnight_not_utc_midnight():
    """
    The classic bug: seeding the sunrise search from UTC midnight. In Newark
    (UTC-4/-5) that lands the search in the PREVIOUS local day and returns the
    wrong sunrise; in Sydney (UTC+10/+11) it overshoots into the next one.
    """
    for lat, lon, elev, tz in (NEWARK, SYDNEY, CHENNAI):
        for date in (dt.date(2027, 1, 20), dt.date(2027, 7, 20)):
            d = core.day_elements(lat, lon, elev, tz, date)
            assert d["date"] == date.isoformat()
            assert 3 * 60 <= hhmm(d["sunrise"]) <= 9 * 60, (tz, date, d["sunrise"])
            assert 15 * 60 <= hhmm(d["sunset"]) <= 22 * 60, (tz, date, d["sunset"])


def test_dst_transition_days_stay_sane():
    """US spring-forward (2027-03-14) and fall-back (2027-11-07)."""
    for date in (dt.date(2027, 3, 14), dt.date(2027, 11, 7)):
        d = core.day_elements(*NEWARK, date)
        assert d["date"] == date.isoformat()
        assert hhmm(d["sunset"]) > hhmm(d["sunrise"])
    spring = core.day_elements(*NEWARK, dt.date(2027, 3, 14))["sunrise"]
    before = core.day_elements(*NEWARK, dt.date(2027, 3, 13))["sunrise"]
    # Clocks jump forward one hour, so sunrise reads ~1h later than the day before.
    assert 50 <= hhmm(spring) - hhmm(before) <= 70, (before, spring)


def test_same_instant_different_city_can_be_a_different_tithi_date():
    """
    The product claim: a date's tithi is read at LOCAL sunrise, so the same
    civil date can carry different elements in Chennai and Newark. If this ever
    stops being true across a whole year, the city dimension is a lie.
    """
    differences = 0
    for offset in range(0, 365, 7):
        date = dt.date(2027, 1, 1) + dt.timedelta(days=offset)
        a = core.day_elements(*CHENNAI, date)
        b = core.day_elements(*NEWARK, date)
        if (a["tithi"], a["nakshatra"]) != (b["tithi"], b["nakshatra"]):
            differences += 1
    assert differences > 10, differences


# --- divisions -------------------------------------------------------------

def test_division_indices_are_one_based_and_in_range():
    assert core.division(0.0, 12) == 1
    assert core.division(11.99, 12) == 1
    assert core.division(12.0, 12) == 2
    assert core.division(359.99, 12) == 30
    assert core.division(359.99, 360 / 27) == 27


def test_division_end_lands_on_the_boundary():
    """At the returned instant the division index must have just advanced."""
    jd = core.to_jd(dt.datetime(2027, 5, 3, 0, tzinfo=dt.timezone.utc))
    for angle_fn, span in ((core.elongation, 12.0),
                           (core.moon_long, 360 / 27),
                           (core.yoga_angle, 360 / 27)):
        end = core.division_end(jd, angle_fn, span)
        assert jd < end < jd + 2
        before = core.division(angle_fn(end - 60 / 86400), span)
        after = core.division(angle_fn(end + 60 / 86400), span)
        assert after == before % int(360 / span) + 1, (angle_fn, before, after)


def test_tithi_and_karana_are_consistent():
    """Karana is the half-tithi, so ceil(karana/2) == tithi, always."""
    for offset in range(0, 60, 3):
        d = core.day_elements(*CHENNAI, dt.date(2027, 2, 1) + dt.timedelta(days=offset))
        assert (d["karana"] + 1) // 2 == d["tithi"], d


def test_tithi_names():
    assert core.tithi_name(1) == "Prathamai"
    assert core.tithi_name(15) == "Pournami"
    assert core.tithi_name(16) == "Prathamai"
    assert core.tithi_name(30) == "Amavasai"
    assert core.karana_name(1) == "Kimstughna"
    assert core.karana_name(2) == "Bava"
    assert core.karana_name(58) == "Shakuni"


# --- Tamil month rule ------------------------------------------------------

def test_puthandu_2027_is_chithirai_1_in_chennai():
    """
    Tamil New Year is 14 April 2027 (fixed by the Mesha sankranti + the Tamil
    sunset rule). On the 13th the month must still read Panguni, on the 14th
    Chithirai. This is the single assertion that pins the sunset-read rule.
    """
    assert core.day_elements(*CHENNAI, dt.date(2027, 4, 13))["tamil_month"] == 12
    assert core.day_elements(*CHENNAI, dt.date(2027, 4, 14))["tamil_month"] == 1
    assert core.TAMIL_MONTHS[0] == "Chithirai"


def test_chennai_sunrise_matches_published_almanac():
    """Published Chennai sunrise for 2027-04-14 is 05:57 IST."""
    assert core.day_elements(*CHENNAI, dt.date(2027, 4, 14))["sunrise"] == "05:57"


def test_solar_month_advances_once_per_sankranti_in_order():
    """
    A Gregorian year starts mid-Margazhi and ends mid-Margazhi, so it contains
    13 runs covering all 12 months in strict cyclic order with no skips and no
    flapping back — the failure mode if the sunset read ever straddles a
    sankranti wrongly.
    """
    seen, prev = [], None
    for offset in range(365):
        m = core.day_elements(*CHENNAI, dt.date(2027, 1, 1) + dt.timedelta(days=offset))["tamil_month"]
        if m != prev:
            seen.append(m)
            prev = m
    assert len(seen) == 13, seen
    assert seen[0] == seen[-1] == 9, seen  # Margazhi both ends
    assert all(b == a % 12 + 1 for a, b in zip(seen, seen[1:])), seen


# --- determinism -----------------------------------------------------------

def test_determinism():
    date = dt.date(2027, 9, 9)
    assert core.day_elements(*CHENNAI, date) == core.day_elements(*CHENNAI, date)


def test_eclipses_2027():
    """
    2027 has two solar eclipses (6 Feb annular, 2 Aug total) and three lunar
    ones, all penumbral — so the grahan list must contain the two solar and no
    lunar. If a future refactor lets penumbral events back in, this fails.
    """
    ecl = core.eclipse_instants(2027)
    dates = {core.from_jd(jd, ZoneInfo("UTC")).date(): kind for jd, kind in ecl}
    assert dates == {dt.date(2027, 2, 6): "solar", dt.date(2027, 8, 2): "solar"}, dates


def test_eclipses_2028_includes_umbral_lunar():
    """2028 does have umbral lunar eclipses (12 Jan partial, 6 Jul partial)."""
    kinds = [k for _, k in core.eclipse_instants(2028)]
    assert kinds.count("lunar") >= 2, kinds


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
    print("all passed")
