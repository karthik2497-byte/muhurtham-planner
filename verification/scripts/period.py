"""Does 91 days of drift actually discriminate between the candidate cycles?
Report residual RMS at each named period, not just at the grid minimum."""
import subprocess, re, math, datetime as dt, sys
S=sys.argv[1]
out=subprocess.run([".venv/bin/python", f"{S}/three_way.py"],capture_output=True,text=True).stdout
# re-derive the series inside this process instead of scraping
import json
sys.path.insert(0,"pipeline"); import core
dp=json.load(open(f"{S}/dp_chennai.json"))
ours={d["date"]:d for y in (2026,2027) for d in json.load(open(f"data/{y}/chennai.json"))["days"]}
def our_end(o,k): return dt.datetime.fromisoformat(o[k]).replace(tzinfo=None)
def dp_dt(date,hhmm,sr):
    h,m=(int(x) for x in hhmm.split(":")); d=dt.date.fromisoformat(date)
    sh,sm=(int(x) for x in sr.split(":"))
    if (h,m)<=(sh,sm): d+=dt.timedelta(1)
    return dt.datetime.combine(d,dt.time(h,m))
series={"tithi":[], "nakshatram":[]}
for k in sorted(dp):
    date,mode=k.split("|")
    if mode!="suryasiddhanta" or date not in ours: continue
    o,x=ours[date],dp[k]
    if o["tithi"]==x["tithi"] and x["tithi_end"]:
        series["tithi"].append((date,(dp_dt(date,x["tithi_end"],o["sunrise"])-our_end(o,"tithi_end")).total_seconds()/60))
    if o["nakshatra"]==x["nak"] and x["nak_end"]:
        series["nakshatram"].append((date,(dp_dt(date,x["nak_end"],o["sunrise"])-our_end(o,"nakshatra_end")).total_seconds()/60))
def rms_at(xs,P):
    t0=dt.date.fromisoformat(xs[0][0])
    T=[(dt.date.fromisoformat(d)-t0).days for d,_ in xs]; Y=[v for _,v in xs]
    c=[math.cos(2*math.pi*t/P) for t in T]; s=[math.sin(2*math.pi*t/P) for t in T]; n=len(T)
    A=[[sum(u*v for u,v in zip(a,b)) for b in (c,s,[1]*n)] for a in (c,s,[1]*n)]
    B=[sum(u*v for u,v in zip(a,Y)) for a in (c,s,[1]*n)]
    for i in range(3):
        p=max(range(i,3),key=lambda r:abs(A[r][i])); A[i],A[p]=A[p],A[i]; B[i],B[p]=B[p],B[i]
        for r in range(i+1,3):
            f=A[r][i]/A[i][i]
            for j in range(i,3): A[r][j]-=f*A[i][j]
            B[r]-=f*B[i]
    z=[0]*3
    for i in (2,1,0): z[i]=(B[i]-sum(A[i][j]*z[j] for j in range(i+1,3)))/A[i][i]
    return math.sqrt(sum((y-(z[0]*ci+z[1]*si+z[2]))**2 for y,ci,si in zip(Y,c,s))/n), math.hypot(z[0],z[1])
NAMED=[("anomalistic month",27.55),("synodic month",29.53),("evection",31.81),("best fit",None)]
for name,xs in series.items():
    best=min(((rms_at(xs,p/10)[0],p/10) for p in range(200,400)))
    print(f"\n{name}  n={len(xs)}")
    for lbl,P in NAMED:
        P = best[1] if P is None else P
        r,a=rms_at(xs,P)
        print(f"  {lbl:18s} P={P:5.2f} d   amplitude +-{a:3.0f} min   residual RMS {r:4.0f} min")
