"""Pull drikpanchang's Tamil day panchangam for Chennai in both arithmetics.

The 'Change to Vakyam' toolbar button just sets a cookie, drik-arithmetic, so
the same URL serves either reckoning. Both are scraped from the machine-readable
data-element-info attributes rather than the rendered text:
    0x30bb0006=<tithi 1-30>;<HH:MM>      0x30bb000f=<nakshatra 1-27>;<HH:MM>
The stamp carries no AM/PM, so drik-time-format=24hour is set as well -- without
it every afternoon ending reads twelve hours early.
One request per day per mode, one second apart.
"""
import json, re, time, urllib.request, datetime as dt, os, sys

OUT = os.path.join(os.path.dirname(__file__), "dp_chennai.json")
START, DAYS = dt.date(2026, 11, 17), 91
URL = ("https://www.drikpanchang.com/tamil/tamil-day-panchangam.html"
       "?date={d:%d/%m/%Y}&geoname-id=1264527")
# The end field is a clock time, or a string id when the element spans the whole
# day ("upto Full Night") -- dp's equivalent of the almanac's 60-00 (muzhu).
PAT = {"tithi": re.compile(r"0x30bb0006=(\d+);(\d\d:\d\d|0x[0-9a-f]+)"),
       "nak":   re.compile(r"0x30bb000f=(\d+);(\d\d:\d\d|0x[0-9a-f]+)")}

got = json.load(open(OUT)) if os.path.exists(OUT) else {}
for i in range(DAYS):
    d = START + dt.timedelta(i)
    for mode in ("drik", "suryasiddhanta"):
        key = f"{d.isoformat()}|{mode}"
        if key in got: continue
        req = urllib.request.Request(URL.format(d=d), headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Cookie": f"drik-arithmetic={mode}; drik-time-format=24hour"})
        try:
            body = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
        except Exception as e:
            print("ERR", key, e, flush=True); continue
        rec = {}
        for name, pat in PAT.items():
            m = pat.search(body)
            if m:
                rec[name] = int(m.group(1))
                rec[name + "_end"] = None if m.group(2).startswith("0x") else m.group(2)
        if len(rec) == 4:
            got[key] = rec
        else:
            print("PARSE-FAIL", key, sorted(rec), flush=True)
        time.sleep(1.0)
    if i % 10 == 0:
        json.dump(got, open(OUT, "w")); print(f"{i:3d}/{DAYS} {d}", flush=True)
json.dump(got, open(OUT, "w"))
print(f"done: {len(got)} records -> {OUT}")
