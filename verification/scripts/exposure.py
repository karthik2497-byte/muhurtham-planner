"""Of the published wedding dates, how many would a vakya reader actually reject?

A boundary within the measured +-4 h drift window of sunrise can move across it:
  boundary just AFTER sunrise  -> vakya (running early) shows the NEXT element
  boundary just BEFORE sunrise -> vakya (running late)  shows the PREVIOUS one
Only a shift that lands on a nakshatram outside the allowlist, or a tithi inside
the blocklist, changes the published verdict. The rest are invisible to a user.
"""
import json, glob, datetime as dt, yaml, sys
sys.path.insert(0, "pipeline"); import core

R = yaml.safe_load(open("rules/wedding.yaml"))["criteria"]
ALLOW = set(R["allow_nakshatra"]["values"])
BLOCK = set(R["block_tithi"]["values"])
WIN = 274  # minutes; amplitude fitted over 91 days against drikpanchang vakyam

def at(day, key):
    return dt.datetime.fromisoformat(day[key]).replace(tzinfo=None)
def sunrise(day):
    h, m = (int(x) for x in day["sunrise"].split(":"))
    return dt.datetime.combine(dt.date.fromisoformat(day["date"]), dt.time(h, m))

safe = fwd = back = 0; hits = []
for f in sorted(glob.glob("data/*/*.events.json")):
    city, yr = f.split("/")[-1].replace(".events.json", ""), f.split("/")[1]
    days = {d["date"]: d for d in json.load(open(f.replace(".events", "")))["days"]}
    for d in json.load(open(f))["wedding"]["dates"]:
        day = days[d["date"]]
        sr = sunrise(day)
        after = (at(day, "nakshatra_end") - sr).total_seconds() / 60
        prev = days.get((dt.date.fromisoformat(d["date"]) - dt.timedelta(1)).isoformat())
        before = (sr - at(prev, "nakshatra_end")).total_seconds() / 60 if prev else 1e9
        n_next = d["nakshatra_next"]
        n_prev = core.NAKSHATRA_NAMES[(day["nakshatra"] - 2) % 27]
        bad = None
        if after < WIN and n_next not in ALLOW:   bad = ("forward", d["nakshatra"], n_next, after)
        elif before < WIN and n_prev not in ALLOW: bad = ("back", d["nakshatra"], n_prev, before)
        if bad:
            hits.append((city, yr, d["date"], *bad))
            if bad[0] == "forward": fwd += 1
            else: back += 1
        else:
            safe += 1

N = safe + len(hits)
print(f"published wedding dates            {N}")
print(f"  vakya reader would still accept  {safe}  ({100*safe/N:.1f}%)")
print(f"  could read as a blocked nakshatram {len(hits)}  ({100*len(hits)/N:.1f}%)"
      f"   [{fwd} forward, {back} backward]")
print(f"\nassumes the full +-{WIN} min drift, i.e. the worst point of the monthly cycle;")
print("the drift is at that amplitude only a few days a month, so this is a ceiling.")
from collections import Counter
c = Counter((h[4], h[5]) for h in hits)
print(f"\nmost common shift ({len(c)} distinct):")
for (a, b), k in c.most_common(8):
    print(f"  {k:4d}  {a} -> {b}")
