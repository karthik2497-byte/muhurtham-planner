"""Is drikpanchang's Vakyam mode a usable stand-in for the printed almanac?

drikpanchang calls its old-algorithm mode Surya Siddhantic; Pambu is the Tamil
vakya (Parahita) lineage. They are not the same tradition, so this has to be
measured before dp-vakyam is used at scale. Test set: the 29 Karthigai days
transcribed from the print.
"""
import os, json, sys, datetime as dt
sys.path.insert(0, "pipeline"); import core

S = os.path.dirname(os.path.abspath(__file__))
pambu = json.load(open(f"{S}/pambu_karthigai.json"))
dp = json.load(open(f"{S}/dp_chennai.json"))
ours = {d["date"]: d for d in json.load(open("data/2026/chennai.json"))["days"]}

def naz_to_dt(date, sunrise, nv):
    n, v = (int(x) for x in nv.split("-"))
    h, m = (int(x) for x in sunrise.split(":"))
    return (dt.datetime.combine(dt.date.fromisoformat(date), dt.time(h, m))
            + dt.timedelta(minutes=24*n, seconds=24*v))

def dp_dt(date, hhmm, sunrise):
    h, m = (int(x) for x in hhmm.split(":"))
    d = dt.date.fromisoformat(date)
    sh, sm = (int(x) for x in sunrise.split(":"))
    if (h, m) <= (sh, sm): d += dt.timedelta(1)
    return dt.datetime.combine(d, dt.time(h, m))

t_ok = n_ok = n = 0; t_gap = []; n_gap = []; diff = []
for date, p in sorted(pambu.items()):
    k = f"{date}|suryasiddhanta"
    if k not in dp: continue
    n += 1
    v, o = dp[k], ours[date]
    for elem, pname, pnaz, vidx, vend, gap in (
        ("tithi", p["tithi"], p["tithi_naz"], v["tithi"], v["tithi_end"], t_gap),
        ("nakshatram", p["nakshatra"], p["nak_naz"], v["nak"], v["nak_end"], n_gap),
    ):
        vname = core.tithi_name(vidx) if elem == "tithi" else core.NAKSHATRA_NAMES[vidx-1]
        if vname == pname:
            if elem == "tithi": t_ok += 1
            else: n_ok += 1
            if vend and pnaz != "60-00":
                gap.append((dp_dt(date, vend, o["sunrise"])
                            - naz_to_dt(date, o["sunrise"], pnaz)).total_seconds()/60)
        else:
            diff.append((date, elem, pname, vname))

print(f"printed Pambu vs drikpanchang VAKYAM, Karthigai 2026, n={n} days")
print(f"  tithi      {t_ok}/{n}")
print(f"  nakshatram {n_ok}/{n}")
for lbl, g in (("tithi end", t_gap), ("nakshatram end", n_gap)):
    if not g: continue
    g = sorted(g)
    med = g[len(g)//2]
    print(f"  {lbl:15s} n={len(g):2d}  median {med:+5.0f} min   "
          f"range {g[0]:+.0f} .. {g[-1]:+.0f}   within 60 min: "
          f"{sum(1 for x in g if abs(x)<60)}/{len(g)}")
if diff:
    print(f"\n  element disagreements ({len(diff)}):")
    for r in diff: print("   ", *r)
