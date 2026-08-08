"""
core.py — panchangam elements for one city-day, from the Swiss Ephemeris.

Pure functions: (city, civil date) -> numbers. No I/O, no formatting, no
network. compute.py wraps this into the committed JSON contract.

Conventions (all restated publicly on /how-dates-are-computed/):

  * Sidereal zodiac, Lahiri (Chitrapaksha) ayanamsa — the Indian standard,
    and what every drik-based published panchangam uses.
  * The Hindu day runs LOCAL SUNRISE -> next local sunrise. A date's tithi
    and nakshatra are the ones prevailing AT LOCAL SUNRISE in that city.
    This is the whole product: a "muhurtham dates 2027" list computed for
    Chennai sunrise is simply a different list in New Jersey, and nearly
    every diaspora-facing site gets this wrong.
  * Sunrise/sunset = upper limb of the disc, with atmospheric refraction —
    the standard almanac convention that drik-based panchangams publish.
  * A Tamil solar month begins on the day whose SUNSET falls after the
    sankranti (the Tamil/Kerala rule: sankranti before sunset -> that same
    day is day 1 of the new month). This is why the month field is read at
    sunset while everything else is read at sunrise; it decides the Aadi
    and Margazhi boundaries, which are the load-bearing wedding blocks.
"""

from __future__ import annotations

import datetime as dt
from zoneinfo import ZoneInfo

import swisseph as swe

# ---------------------------------------------------------------------------
# Ephemeris configuration — the calibration knobs live here, all three of them
# ---------------------------------------------------------------------------

swe.set_sid_mode(swe.SIDM_LAHIRI)

# ponytail: Moshier (FLG_MOSEPH) is pinned deliberately, not by accident.
# pyswisseph ships no .se1 data files, so FLG_SWIEPH silently falls back to
# Moshier anyway — pinning it makes that visible and reproducible from
# `pip install` alone, with no 90 MB of ephemeris data to commit. Moshier is
# within ~1 arcsecond of DE431 for the Moon over 1900-2100, i.e. ~2 seconds
# of clock error on a tithi boundary: invisible at date granularity.
# Upgrade path if a cross-check ever needs it: drop the Swiss .se1 files in,
# call swe.set_ephe_path(dir), and change this one constant to FLG_SWIEPH.
EPHEMERIS = swe.FLG_MOSEPH
_CALC = EPHEMERIS | swe.FLG_SIDEREAL | swe.FLG_SPEED

# ponytail: 0 == upper limb + refraction (standard almanac sunrise).
# For the traditional "Hindu sunrise" (centre of disc, no refraction) set
# this to swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION — a ~3 minute shift
# that can move a tithi across the sunrise boundary on marginal days. If a
# FR-V1 cross-check disagreement ever roots to sunrise, this is the knob.
RISE_BITS = 0

# Combustion ("moudhyam"/"astam") orbs in degrees of elongation from the Sun.
# Venus takes the tighter orb when retrograde. Standard muhurtham values.
COMBUST_ORB = {"venus": (10.0, 8.0), "jupiter": (11.0, 11.0)}

# ---------------------------------------------------------------------------
# Names. Tamil transliteration — the audience is the Tamil diaspora, and the
# site's UI is English with these terms inline (SPEC NG3).
# ---------------------------------------------------------------------------

TITHI_NAMES = [
    "Prathamai", "Dwithiyai", "Thrithiyai", "Chathurthi", "Panchami",
    "Sashti", "Sapthami", "Ashtami", "Navami", "Dasami",
    "Ekadasi", "Dwadasi", "Thrayodasi", "Chathurdasi",
]  # 15th is Pournami (shukla) / Amavasai (krishna) — see tithi_name()

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Karthigai", "Rohini", "Mrigasheersham",
    "Thiruvathirai", "Punarpoosam", "Poosam", "Ayilyam", "Magham",
    "Pooram", "Uthiram", "Hastham", "Chithirai", "Swathi",
    "Visakam", "Anusham", "Kettai", "Moolam", "Pooradam",
    "Uthiradam", "Thiruvonam", "Avittam", "Sadhayam", "Poorattathi",
    "Uthirattathi", "Revathi",
]

YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti",
]

KARANA_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"]
KARANA_FIXED = {1: "Kimstughna", 58: "Shakuni", 59: "Chatushpada", 60: "Naga"}

RASI_NAMES = [
    "Mesham", "Rishabam", "Mithunam", "Kadagam", "Simmam", "Kanni",
    "Thulam", "Viruchigam", "Dhanusu", "Magaram", "Kumbam", "Meenam",
]

# Tamil solar months, aligned index-for-index with RASI_NAMES.
TAMIL_MONTHS = [
    "Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi",
    "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni",
]

WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                 "Friday", "Saturday"]
WEEKDAY_TAMIL = ["Nyayiru", "Thingal", "Chevvai", "Budhan", "Vyazhan",
                 "Velli", "Sani"]

# Which eighth-part of the daylight span each inauspicious window occupies,
# indexed by weekday with Sunday = 0. Verified against the standard published
# table for a nominal 06:00-18:00 day (Rahu kalam: Mon 07:30, Tue 15:00,
# Wed 12:00, Thu 13:30, Fri 10:30, Sat 09:00, Sun 16:30).
RAHU_PART = [7, 1, 6, 4, 5, 3, 2]
YAMA_PART = [4, 3, 2, 1, 0, 6, 5]
GULIKA_PART = [6, 5, 4, 3, 2, 1, 0]


class NoSunriseError(RuntimeError):
    """The Sun does not rise or set on this date at this latitude."""


# ---------------------------------------------------------------------------
# Time conversion
# ---------------------------------------------------------------------------

def to_jd(when: dt.datetime) -> float:
    """Timezone-aware datetime -> Julian Day in UT."""
    if when.tzinfo is None:
        raise ValueError("naive datetime; pass an aware one")
    u = when.astimezone(dt.timezone.utc)
    hours = u.hour + u.minute / 60 + (u.second + u.microsecond / 1e6) / 3600
    return swe.julday(u.year, u.month, u.day, hours)


def from_jd(jd: float, tz: ZoneInfo) -> dt.datetime:
    """Julian Day in UT -> aware datetime in `tz`, rounded to the second."""
    y, m, d, hours = swe.revjul(jd)
    whole = int(hours)
    seconds = round((hours - whole) * 3600)
    base = dt.datetime(y, m, d, tzinfo=dt.timezone.utc) + dt.timedelta(
        hours=whole, seconds=seconds
    )
    return base.astimezone(tz)


# ---------------------------------------------------------------------------
# Longitudes
# ---------------------------------------------------------------------------

def longitude(jd: float, body: int) -> tuple[float, float]:
    """Sidereal ecliptic longitude and its daily speed, in degrees."""
    values, _ = swe.calc_ut(jd, body, _CALC)
    return values[0], values[3]


def sun_long(jd: float) -> float:
    return longitude(jd, swe.SUN)[0]


def moon_long(jd: float) -> float:
    return longitude(jd, swe.MOON)[0]


def elongation(jd: float) -> float:
    """Moon minus Sun, 0-360. Drives tithi and karana."""
    return (moon_long(jd) - sun_long(jd)) % 360


def yoga_angle(jd: float) -> float:
    """Sun plus Moon, 0-360. Drives yoga."""
    return (sun_long(jd) + moon_long(jd)) % 360


# ---------------------------------------------------------------------------
# Division boundaries
#
# Tithi, nakshatra, yoga and karana are all "which N-degree slice of a
# monotonically increasing angle are we in", so they share one solver.
# Each of those three angles only ever increases (the Moon never retrogrades
# in longitude), which is what makes a plain bisection safe here.
# ---------------------------------------------------------------------------

def division(angle: float, span: float) -> int:
    """1-based index of the `span`-degree division containing `angle`."""
    return int(angle / span) + 1


def division_end(jd: float, angle_fn, span: float, tol_seconds: float = 1.0) -> float:
    """
    JD (UT) at which the division currently in progress ends.

    Solved by bisection on an unwrapped offset: at `jd` the offset into the
    current division is f(jd) < 0, and it climbs monotonically through 0 at
    the boundary. The 2-day bracket is comfortably wider than the slowest
    possible division (~1.13 days for a nakshatra at minimum lunar speed)
    and far too narrow for the angle to lap 360, so no wrap can alias.
    """
    a0 = angle_fn(jd)
    offset = a0 % span

    def f(t: float) -> float:
        return ((angle_fn(t) - a0 + offset) % 360) - span

    lo, hi = jd, jd + 2.0
    if f(hi) < 0:
        raise RuntimeError("division did not end within 2 days — check inputs")
    tol = tol_seconds / 86400
    while hi - lo > tol:
        mid = (lo + hi) / 2
        if f(mid) < 0:
            lo = mid
        else:
            hi = mid
    return hi


# ---------------------------------------------------------------------------
# Rise and set
# ---------------------------------------------------------------------------

def _rise_or_set(jd_from: float, lat: float, lon: float, elev: float, which: int) -> float:
    flag, times = swe.rise_trans(
        jd_from, swe.SUN, which | RISE_BITS, (lon, lat, elev), 0.0, 0.0, EPHEMERIS
    )
    if flag < 0 or not times or times[0] == 0.0:
        raise NoSunriseError(f"no event {which} after JD {jd_from}")
    return times[0]


def sunrise_after(jd_from: float, lat: float, lon: float, elev: float = 0.0) -> float:
    return _rise_or_set(jd_from, lat, lon, elev, swe.CALC_RISE)


def sunset_after(jd_from: float, lat: float, lon: float, elev: float = 0.0) -> float:
    return _rise_or_set(jd_from, lat, lon, elev, swe.CALC_SET)


# ---------------------------------------------------------------------------
# Naming
# ---------------------------------------------------------------------------

def tithi_name(index: int) -> str:
    """`index` is 1-30. 15 is Pournami (full moon), 30 is Amavasai (new)."""
    if index == 15:
        return "Pournami"
    if index == 30:
        return "Amavasai"
    return TITHI_NAMES[(index - 1) % 15]


def karana_name(index: int) -> str:
    """`index` is 1-60 (half-tithis). Four are fixed, the rest cycle in 7s."""
    if index in KARANA_FIXED:
        return KARANA_FIXED[index]
    return KARANA_MOVABLE[(index - 2) % 7]


# ---------------------------------------------------------------------------
# Inauspicious daylight windows
# ---------------------------------------------------------------------------

def eighth_part(jd_rise: float, jd_set: float, part: int) -> tuple[float, float]:
    """Start and end JD of the `part`-th (0-based) eighth of the daylight span."""
    if not 0 <= part <= 7:
        raise ValueError(f"part must be 0-7, got {part}")
    slice_len = (jd_set - jd_rise) / 8
    return jd_rise + part * slice_len, jd_rise + (part + 1) * slice_len


# ---------------------------------------------------------------------------
# Combustion
# ---------------------------------------------------------------------------

def is_combust(jd: float, body: int, orb_direct: float, orb_retro: float) -> bool:
    """
    True when the planet is within its combustion orb of the Sun.

    Venus or Jupiter combust ("Shukra/Guru moudhyam") suspends wedding
    muhurthams for weeks at a time in Tamil practice, so this is not a
    nicety — it is one of the two rules that shapes the calendar most.
    """
    lon, speed = longitude(jd, body)
    separation = abs((lon - sun_long(jd) + 180) % 360 - 180)
    return separation < (orb_retro if speed < 0 else orb_direct)


# ---------------------------------------------------------------------------
# The one call the pipeline makes
# ---------------------------------------------------------------------------

def day_elements(lat: float, lon: float, elev: float, tz: ZoneInfo,
                 date: dt.date) -> dict:
    """
    Every panchangam element for one civil date in one city.

    Read at local sunrise, except the solar month, which is read at sunset
    (see the module docstring for why).
    """
    midnight = dt.datetime(date.year, date.month, date.day, tzinfo=tz)
    jd_rise = sunrise_after(to_jd(midnight), lat, lon, elev)
    jd_set = sunset_after(jd_rise, lat, lon, elev)

    elong = elongation(jd_rise)
    tithi = division(elong, 12)
    nak_long = moon_long(jd_rise)
    nakshatra = division(nak_long, 360 / 27)
    yoga = division(yoga_angle(jd_rise), 360 / 27)
    karana = division(elong, 6)

    weekday = (date.weekday() + 1) % 7  # Python has Monday=0; we want Sunday=0

    def window(table):
        a, b = eighth_part(jd_rise, jd_set, table[weekday])
        return [from_jd(a, tz).strftime("%H:%M"), from_jd(b, tz).strftime("%H:%M")]

    return {
        "date": date.isoformat(),
        "weekday": weekday,
        "sunrise": from_jd(jd_rise, tz).strftime("%H:%M"),
        "sunset": from_jd(jd_set, tz).strftime("%H:%M"),
        "tithi": tithi,
        "tithi_end": from_jd(division_end(jd_rise, elongation, 12), tz).isoformat(
            timespec="minutes"),
        "paksha": 0 if tithi <= 15 else 1,
        "nakshatra": nakshatra,
        "nakshatra_pada": int((nak_long % (360 / 27)) / (360 / 108)) + 1,
        "nakshatra_end": from_jd(
            division_end(jd_rise, moon_long, 360 / 27), tz).isoformat(timespec="minutes"),
        "yoga": yoga,
        "yoga_end": from_jd(
            division_end(jd_rise, yoga_angle, 360 / 27), tz).isoformat(timespec="minutes"),
        "karana": karana,
        "sun_rasi": division(sun_long(jd_rise), 30),
        "moon_rasi": division(nak_long, 30),
        # Read at SUNSET on purpose — the Tamil month-start rule. See docstring.
        "tamil_month": division(sun_long(jd_set), 30),
        "rahu_kalam": window(RAHU_PART),
        "yamagandam": window(YAMA_PART),
        "gulikai": window(GULIKA_PART),
        "venus_combust": is_combust(jd_rise, swe.VENUS, *COMBUST_ORB["venus"]),
        "jupiter_combust": is_combust(jd_rise, swe.JUPITER, *COMBUST_ORB["jupiter"]),
    }


# ---------------------------------------------------------------------------
# Eclipses — computed per year, not per day
# ---------------------------------------------------------------------------

def eclipse_instants(year: int) -> list[tuple[float, str]]:
    """
    (JD of greatest eclipse, "solar"|"lunar") for every eclipse in `year` that
    counts as a grahan.

    ponytail: penumbral lunar eclipses are excluded on purpose. Swiss Ephemeris
    reports them (2027 has three), but traditional practice observes sutak only
    for umbral events — a penumbral eclipse is not visible to the eye and does
    not block a muhurtham. Passing ECL_ALLTYPES_LUNAR here instead would blank
    out three otherwise-good weeks of 2027 for no reason a purohit would accept.
    """
    start = swe.julday(year, 1, 1, 0.0)
    end = swe.julday(year + 1, 1, 1, 0.0)
    lunar_types = swe.ECL_TOTAL | swe.ECL_PARTIAL
    found = []
    for kind, fn, ecltype in (("solar", swe.sol_eclipse_when_glob, 0),
                              ("lunar", swe.lun_eclipse_when, lunar_types)):
        jd = start
        while True:
            _, times = fn(jd, EPHEMERIS, ecltype, False)
            peak = times[0]
            if peak >= end:
                break
            found.append((peak, kind))
            jd = peak + 5  # eclipses never recur within 5 days
    return sorted(found)
