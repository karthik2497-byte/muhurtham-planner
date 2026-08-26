"""Three-way: our engine, drikpanchang drik, drikpanchang vakyam.

Purpose is two claims at once --
  ours vs dp-drik    : is the divergence ours, or is it drik-vs-vakya?
  ours vs dp-vakyam  : the same +-4 h cycle measured on 91 days instead of 29?
"""
import os, json, sys, datetime as dt, math
sys.path.insert(0, "pipeline"); import core

S = os.path.dirname(os.path.abspath(__file__))
dp = json.load(open(f"{S}/dp_chennai.json"))
ours = {d["date"]: d for d in json.load(open("data/2026/chennai.json"))["days"]}
ours.update({d["date"]: d for d in json.load(open("data/2027/chennai.json"))["days"]})

def our_end(day, key):
    return dt.datetime.fromisoformat(day[key]).replace(tzinfo=None)

def dp_end(date, hhmm, sunrise):
    """No date on dp's stamp; an ending before sunrise belongs to the next day."""
    h, m = (int(x) for x in hhmm.split(":"))
    d = dt.date.fromisoformat(date)
    sh, sm = (int(x) for x in sunrise.split(":"))
    if (h, m) <= (sh, sm): d += dt.timedelta(1)
    return dt.datetime.combine(d, dt.time(h, m))

dates = sorted({k.split("|")[0] for k in dp} & set(ours))
dates = [d for d in dates if f"{d}|drik" in dp and f"{d}|suryasiddhanta" in dp]

def compare(mode, label):
    same_t = same_n = 0; dt_drift = []; nk_drift = []; flips = []
    for date in dates:
        o, x = ours[date], dp[f"{date}|{mode}"]
        for elem, oi, ok, xi, xk, drift in (
            ("tithi", o["tithi"], "tithi_end", x["tithi"], "tithi_end", dt_drift),
            ("nakshatram", o["nakshatra"], "nakshatra_end", x["nak"], "nak_end", nk_drift),
        ):
            if oi == xi:
                # x[xk] is None when dp prints "Full Night": no ending to compare.
                if x[xk]:
                    delta = (dp_end(date, x[xk], o["sunrise"]) - our_end(o, ok)).total_seconds()/60
                    drift.append((date, delta))
                if elem == "tithi": same_t += 1
                else: same_n += 1
            else:
                nm = (lambda i: core.tithi_name(i)) if elem == "tithi" else (lambda i: core.NAKSHATRA_NAMES[i-1])
                flips.append((date, elem, nm(oi), nm(xi)))
    n = len(dates)
    print(f"\n--- ours vs {label}  (Chennai, {dates[0]} .. {dates[-1]}, n={n}) ---")
    print(f"  tithi {same_t}/{n}    nakshatram {same_n}/{n}")
    for lbl, xs in (("tithi end", dt_drift), ("nakshatram end", nk_drift)):
        if not xs: continue
        v = sorted(d for _, d in xs)
        big = [x for x in v if abs(x) > 2]
        print(f"  {lbl:15s} median {v[len(v)//2]:+6.1f} min  range {v[0]:+.0f} .. {v[-1]:+.0f}"
              f"   |drift|>2min on {len(big)}/{len(v)}")
    return flips, nk_drift

def fit(xs):
    """Least-squares single sinusoid; returns (period, amplitude, residual RMS)."""
    t0 = dt.date.fromisoformat(xs[0][0])
    T = [(dt.date.fromisoformat(d) - t0).days for d, _ in xs]; Y = [v for _, v in xs]
    best = None
    for P10 in range(200, 400):
        P = P10/10
        c = [math.cos(2*math.pi*t/P) for t in T]; s_ = [math.sin(2*math.pi*t/P) for t in T]
        nn = len(T); B = [sum(u*v for u, v in zip(x, Y)) for x in (c, s_, [1]*nn)]
        A = [[sum(u*v for u, v in zip(x, y)) for y in (c, s_, [1]*nn)] for x in (c, s_, [1]*nn)]
        for i in range(3):
            pv = max(range(i, 3), key=lambda r: abs(A[r][i]))
            A[i], A[pv] = A[pv], A[i]; B[i], B[pv] = B[pv], B[i]
            for r in range(i+1, 3):
                f = A[r][i]/A[i][i]
                for j in range(i, 3): A[r][j] -= f*A[i][j]
                B[r] -= f*B[i]
        z = [0]*3
        for i in (2, 1, 0): z[i] = (B[i] - sum(A[i][j]*z[j] for j in range(i+1, 3)))/A[i][i]
        rms = math.sqrt(sum((y-(z[0]*ci+z[1]*si+z[2]))**2 for y, ci, si in zip(Y, c, s_))/nn)
        if best is None or rms < best[2]: best = (P, math.hypot(z[0], z[1]), rms)
    return best

f_d, _ = compare("drik", "drikpanchang DRIK")
f_v, nkv = compare("suryasiddhanta", "drikpanchang VAKYAM")
if nkv:
    P, amp, rms = fit(nkv)
    spread = max(v for _, v in nkv) - min(v for _, v in nkv)
    print(f"\nvakyam nakshatram drift, single-sinusoid fit over {len(nkv)} points:")
    print(f"  period {P:.2f} d   amplitude +-{amp:.0f} min   residual RMS {rms:.0f} min"
          f" ({100*rms/spread:.0f}% of spread)")
if f_d:
    print(f"\n  ours vs dp-drik disagreements ({len(f_d)}):")
    for r in f_d[:15]: print("   ", *r)
print(f"\nvakyam flips: {len(f_v)}  (of {2*len(dates)} element-days)")
