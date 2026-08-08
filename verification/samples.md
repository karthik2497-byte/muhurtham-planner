# FR-V1 cross-check worksheet (n=40, seed=2027)

Fill the two source columns by hand, then write the verdict. Pass bar:
**>= 95% element agreement**, and EVERY disagreement dispositioned in
REPORT.md with a root cause. Do not edit `data/` to make a row agree —
fix the rule or the code, or footnote a genuine vakya/drik divergence.

Source A: drikpanchang (set the city in their picker first — it persists).  
Source B: printed Tamil panchangam (edition recorded in REPORT.md header).

Regenerate: `./.venv/bin/python pipeline/make_samples.py`

| # | City | Date | Ours: tithi | Ours: nakshatra | Sunrise | A: tithi/nak | B: tithi/nak | Verdict | Note |
|--:|---|---|---|---|---|---|---|---|---|
| 1 | New Jersey | [2027-02-25](https://www.drikpanchang.com/panchang/day-panchang.html?date=25/02/2027) | Panchami | Swathi | 06:36 |  |  |  |  |
| 2 | Bay Area | [2028-08-25](https://www.drikpanchang.com/panchang/day-panchang.html?date=25/08/2028) | Sashti | Swathi | 06:32 |  |  |  |  |
| 3 | Chicago | [2027-02-20](https://www.drikpanchang.com/panchang/day-panchang.html?date=20/02/2027) | Pournami | Magham | 06:39 |  |  |  |  |
| 4 | Dallas | [2028-01-07](https://www.drikpanchang.com/panchang/day-panchang.html?date=07/01/2028) | Dasami | Bharani | 07:30 |  |  |  |  |
| 5 | Toronto | [2027-10-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2027) | Thrithiyai | Anusham | 07:51 |  |  |  |  |
| 6 | London | [2028-06-14](https://www.drikpanchang.com/panchang/day-panchang.html?date=14/06/2028) | Sapthami | Sadhayam | 04:42 |  |  |  |  |
| 7 | Singapore | [2027-07-14](https://www.drikpanchang.com/panchang/day-panchang.html?date=14/07/2027) | Ekadasi | Anusham | 07:04 |  |  |  |  |
| 8 | Sydney | [2028-11-16](https://www.drikpanchang.com/panchang/day-panchang.html?date=16/11/2028) | Amavasai | Swathi | 05:42 |  |  |  |  |
| 9 | Melbourne | [2027-12-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/12/2027) | Thrithiyai | Thiruvonam | 06:00 |  |  |  |  |
| 10 | Dubai | [2028-04-03](https://www.drikpanchang.com/panchang/day-panchang.html?date=03/04/2028) | Ashtami | Punarpoosam | 06:07 |  |  |  |  |
| 11 | Kuala Lumpur | [2027-05-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/05/2027) | Thrithiyai | Mrigasheersham | 07:02 |  |  |  |  |
| 12 | Chennai | [2028-04-02](https://www.drikpanchang.com/panchang/day-panchang.html?date=02/04/2028) | Sapthami | Thiruvathirai | 06:04 |  |  |  |  |
| 13 | New Jersey | [2027-05-23](https://www.drikpanchang.com/panchang/day-panchang.html?date=23/05/2027) | Thrithiyai | Moolam | 05:32 |  |  |  |  |
| 14 | Bay Area | [2028-10-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2028) | Chathurdasi | Revathi | 07:32 |  |  |  |  |
| 15 | Chicago | [2027-04-07](https://www.drikpanchang.com/panchang/day-panchang.html?date=07/04/2027) | Prathamai | Revathi | 06:23 |  |  |  |  |
| 16 | Dallas | [2028-05-21](https://www.drikpanchang.com/panchang/day-panchang.html?date=21/05/2028) | Thrayodasi | Ashwini | 06:24 |  |  |  |  |
| 17 | Toronto | [2027-07-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/07/2027) | Sapthami | Uthiram | 05:44 |  |  |  |  |
| 18 | London | [2028-12-17](https://www.drikpanchang.com/panchang/day-panchang.html?date=17/12/2028) | Dwithiyai | Pooradam | 08:01 |  |  |  |  |
| 19 | Singapore | [2027-10-01](https://www.drikpanchang.com/panchang/day-panchang.html?date=01/10/2027) | Prathamai | Chithirai | 06:51 |  |  |  |  |
| 20 | Sydney | [2028-02-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/02/2028) | Thrayodasi | Punarpoosam | 06:23 |  |  |  |  |
| 21 | Melbourne | [2027-11-11](https://www.drikpanchang.com/panchang/day-panchang.html?date=11/11/2027) | Dwadasi | Uthirattathi | 06:03 |  |  |  |  |
| 22 | Dubai | [2028-12-04](https://www.drikpanchang.com/panchang/day-panchang.html?date=04/12/2028) | Thrithiyai | Thiruvathirai | 06:49 |  |  |  |  |
| 23 | Kuala Lumpur | [2027-04-28](https://www.drikpanchang.com/panchang/day-panchang.html?date=28/04/2027) | Sapthami | Uthiradam | 07:04 |  |  |  |  |
| 24 | Chennai | [2028-06-03](https://www.drikpanchang.com/panchang/day-panchang.html?date=03/06/2028) | Ekadasi | Chithirai | 05:41 |  |  |  |  |
| 25 | New Jersey | [2027-03-10](https://www.drikpanchang.com/panchang/day-panchang.html?date=10/03/2027) | Thrithiyai | Revathi | 06:16 |  |  |  |  |
| 26 | Bay Area | [2028-05-10](https://www.drikpanchang.com/panchang/day-panchang.html?date=10/05/2028) | Dwithiyai | Kettai | 06:02 |  |  |  |  |
| 27 | Chicago | [2027-07-05](https://www.drikpanchang.com/panchang/day-panchang.html?date=05/07/2027) | Dwithiyai | Poosam | 05:21 |  |  |  |  |
| 28 | Dallas | [2028-08-05](https://www.drikpanchang.com/panchang/day-panchang.html?date=05/08/2028) | Prathamai | Thiruvonam | 06:44 |  |  |  |  |
| 29 | Toronto | [2027-09-12](https://www.drikpanchang.com/panchang/day-panchang.html?date=12/09/2027) | Dwadasi | Thiruvonam | 06:53 |  |  |  |  |
| 30 | London | [2028-04-26](https://www.drikpanchang.com/panchang/day-panchang.html?date=26/04/2028) | Dwithiyai | Karthigai | 05:40 |  |  |  |  |
| 31 | Singapore | [2027-03-11](https://www.drikpanchang.com/panchang/day-panchang.html?date=11/03/2027) | Thrithiyai | Revathi | 07:11 |  |  |  |  |
| 32 | Sydney | [2028-06-21](https://www.drikpanchang.com/panchang/day-panchang.html?date=21/06/2028) | Thrayodasi | Rohini | 06:59 |  |  |  |  |
| 33 | Melbourne | [2027-04-26](https://www.drikpanchang.com/panchang/day-panchang.html?date=26/04/2027) | Panchami | Moolam | 06:55 |  |  |  |  |
| 34 | Dubai | [2028-04-22](https://www.drikpanchang.com/panchang/day-panchang.html?date=22/04/2028) | Thrayodasi | Uthirattathi | 05:49 |  |  |  |  |
| 35 | Kuala Lumpur | [2027-11-01](https://www.drikpanchang.com/panchang/day-panchang.html?date=01/11/2027) | Thrithiyai | Anusham | 06:56 |  |  |  |  |
| 36 | Chennai | [2028-08-20](https://www.drikpanchang.com/panchang/day-panchang.html?date=20/08/2028) | Amavasai | Ayilyam | 05:56 |  |  |  |  |
| 37 | New Jersey | [2027-09-12](https://www.drikpanchang.com/panchang/day-panchang.html?date=12/09/2027) | Dwadasi | Thiruvonam | 06:34 |  |  |  |  |
| 38 | Bay Area | [2028-03-24](https://www.drikpanchang.com/panchang/day-panchang.html?date=24/03/2028) | Chathurdasi | Poorattathi | 07:04 |  |  |  |  |
| 39 | Chicago | [2027-12-30](https://www.drikpanchang.com/panchang/day-panchang.html?date=30/12/2027) | Thrithiyai | Thiruvonam | 07:17 |  |  |  |  |
| 40 | Dallas | [2028-08-27](https://www.drikpanchang.com/panchang/day-panchang.html?date=27/08/2028) | Ashtami | Anusham | 06:58 |  |  |  |  |

Cities covered: 12 / 12.
