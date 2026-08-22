# FR-V1 cross-check worksheet (n=40, seed=2027)

Fill the two source columns by hand, then write the verdict. Pass bar:
**>= 95% element agreement**, and EVERY disagreement dispositioned in
REPORT.md with a root cause. Do not edit `data/` to make a row agree —
fix the rule or the code, or footnote a genuine vakya/drik divergence.

Source A: **done, 40/40** — filled 2026-08-22 from drikpanchang day-panchang
pages. Every link below now carries its own `geoname-id`, so the city is in
the URL and cannot be left over from the previous row. Re-checking a row is a
click.  
Source B: printed Tamil panchangam (edition recorded in REPORT.md header).

Do not cross-check against a *marriage muhurat* listing. Those name the
element prevailing at the muhurat window, not at sunrise, and will appear to
disagree with almost every row. Use the day-panchang page, which publishes
start and end times.

Regenerate: `./.venv/bin/python pipeline/make_samples.py`

| # | City | Date | Ours: tithi | Ours: nakshatra | Sunrise | A: tithi/nak | B: tithi/nak | Verdict | Note |
|--:|---|---|---|---|---|---|---|---|---|
| 1 | New Jersey | [2027-02-25](https://www.drikpanchang.com/panchang/day-panchang.html?date=25/02/2027&geoname-id=5099133) | Panchami | Swathi | 06:36 | Panchami / Swati | Panchami / Swathi | ✓✓ | sunrise +0 min, B +4 min |
| 2 | Bay Area | [2028-08-25](https://www.drikpanchang.com/panchang/day-panchang.html?date=25/08/2028&geoname-id=5392171) | Sashti | Swathi | 06:32 | Shashthi / Swati | Shashthi / Swathi | ✓✓ | sunrise +1 min, B +5 min |
| 3 | Chicago | [2027-02-20](https://www.drikpanchang.com/panchang/day-panchang.html?date=20/02/2027&geoname-id=4887398) | Pournami | Magham | 06:39 | Purnima / Magha | Pournami / Makam | ✓✓ | sunrise +0 min, B +4 min |
| 4 | Dallas | [2028-01-07](https://www.drikpanchang.com/panchang/day-panchang.html?date=07/01/2028&geoname-id=4684888) | Dasami | Bharani | 07:30 | Dashami / Bharani | Dashami / Bharani | ✓✓ | sunrise +0 min, B +5 min |
| 5 | Toronto | [2027-10-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2027&geoname-id=6167865) | Thrithiyai | Anusham | 07:51 | Tritiya / Anuradha | Trithiya / Anusham | ✓✓ | sunrise +1 min, B +6 min |
| 6 | London | [2028-06-14](https://www.drikpanchang.com/panchang/day-panchang.html?date=14/06/2028&geoname-id=2643743) | Sapthami | Sadhayam | 04:42 | Saptami / Shatabhisha | Sapthami / Sadhayam | ✓✓ | sunrise +1 min, B +8 min |
| 7 | Singapore | [2027-07-14](https://www.drikpanchang.com/panchang/day-panchang.html?date=14/07/2027&geoname-id=1880252) | Ekadasi | Anusham | 07:04 | Ekadashi / Anuradha | Ekadashi / Anusham | ✓✓ | sunrise +1 min, B +4 min |
| 8 | Sydney | [2028-11-16](https://www.drikpanchang.com/panchang/day-panchang.html?date=16/11/2028&geoname-id=2147714) | Amavasai | Swathi | 05:42 | Amavasya / Swati | Amavasai / Swathi | ✓✓ | sunrise +1 min, B +5 min |
| 9 | Melbourne | [2027-12-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/12/2027&geoname-id=2158177) | Thrithiyai | Thiruvonam | 06:00 | Tritiya / Shravana | Trithiya / Tiruvonam | ✓✓ | sunrise +0 min, B +5 min |
| 10 | Dubai | [2028-04-03](https://www.drikpanchang.com/panchang/day-panchang.html?date=03/04/2028&geoname-id=292223) | Ashtami | Punarpoosam | 06:07 | Ashtami / Punarvasu | Ashtami / Punarpoosam | ✓✓ | sunrise +2 min, B +4 min |
| 11 | Kuala Lumpur | [2027-05-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/05/2027&geoname-id=1735161) | Thrithiyai | Mrigasheersham | 07:02 | Tritiya / Mrigashira | Trithiya / Mrigashirsham | ✓✓ | sunrise +0 min, B +4 min |
| 12 | Chennai | [2028-04-02](https://www.drikpanchang.com/panchang/day-panchang.html?date=02/04/2028&geoname-id=1264527) | Sapthami | Thiruvathirai | 06:04 | Saptami / Ardra | Sapthami / Thiruvathirai | ✓✓ | sunrise +0 min, B +3 min |
| 13 | New Jersey | [2027-05-23](https://www.drikpanchang.com/panchang/day-panchang.html?date=23/05/2027&geoname-id=5099133) | Thrithiyai | Moolam | 05:32 | Tritiya / Mula | Trithiya / Moolam | ✓✓ | sunrise +0 min, B +5 min |
| 14 | Bay Area | [2028-10-31](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2028&geoname-id=5392171) | Chathurdasi | Revathi | 07:32 | Chaturdashi / Revati | Chaturdashi / Revathi | ✓✓ | sunrise +0 min, B +4 min |
| 15 | Chicago | [2027-04-07](https://www.drikpanchang.com/panchang/day-panchang.html?date=07/04/2027&geoname-id=4887398) | Prathamai | Revathi | 06:23 | Pratipada / Revati | Pradhamai / Revathi | ✓✓ | sunrise +1 min, B +4 min |
| 16 | Dallas | [2028-05-21](https://www.drikpanchang.com/panchang/day-panchang.html?date=21/05/2028&geoname-id=4684888) | Thrayodasi | Ashwini | 06:24 | Trayodashi / Ashwini | Trayodashi / Asvini | ✓✓ | sunrise +0 min, B +4 min |
| 17 | Toronto | [2027-07-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/07/2027&geoname-id=6167865) | Sapthami | Uthiram | 05:44 | Saptami / Uttara Phalguni | Sapthami / Uthiram | ✓✓ | sunrise +1 min, B +6 min |
| 18 | London | [2028-12-17](https://www.drikpanchang.com/panchang/day-panchang.html?date=17/12/2028&geoname-id=2643743) | Dwithiyai | Pooradam | 08:01 | Dwitiya / Purva Ashadha | Dwithiya / Pooradam | ✓✓ | sunrise +1 min, B +7 min |
| 19 | Singapore | [2027-10-01](https://www.drikpanchang.com/panchang/day-panchang.html?date=01/10/2027&geoname-id=1880252) | Prathamai | Chithirai | 06:51 | Pratipada / Chitra | Pradhamai / Chithirai | ✓✓ | sunrise +0 min, B +3 min |
| 20 | Sydney | [2028-02-09](https://www.drikpanchang.com/panchang/day-panchang.html?date=09/02/2028&geoname-id=2147714) | Thrayodasi | Punarpoosam | 06:23 | Trayodashi / Punarvasu | Trayodashi / Punarpoosam | ✓✓ | sunrise +1 min, B +5 min |
| 21 | Melbourne | [2027-11-11](https://www.drikpanchang.com/panchang/day-panchang.html?date=11/11/2027&geoname-id=2158177) | Dwadasi | Uthirattathi | 06:03 | Dwadashi / Uttara Bhadrapada | Dwadashi / Uthirattadhi | ✓✓ | sunrise +1 min, B +5 min |
| 22 | Dubai | [2028-12-04](https://www.drikpanchang.com/panchang/day-panchang.html?date=04/12/2028&geoname-id=292223) | Thrithiyai | Thiruvathirai | 06:49 | Tritiya / Ardra | Trithiya / Thiruvathirai | ✓✓ | sunrise +1 min, B +4 min |
| 23 | Kuala Lumpur | [2027-04-28](https://www.drikpanchang.com/panchang/day-panchang.html?date=28/04/2027&geoname-id=1735161) | Sapthami | Uthiradam | 07:04 | Saptami / Uttara Ashadha | Sapthami / Uthiradam | ✓✓ | sunrise +0 min, B +3 min |
| 24 | Chennai | [2028-06-03](https://www.drikpanchang.com/panchang/day-panchang.html?date=03/06/2028&geoname-id=1264527) | Ekadasi | Chithirai | 05:41 | Ekadashi / Chitra | Ekadashi / Chithirai | ✓✓ | sunrise +0 min, B +4 min |
| 25 | New Jersey | [2027-03-10](https://www.drikpanchang.com/panchang/day-panchang.html?date=10/03/2027&geoname-id=5099133) | Thrithiyai | Revathi | 06:16 | Tritiya / Revati | Trithiya / Revathi | ✓✓ | sunrise +0 min, B +4 min |
| 26 | Bay Area | [2028-05-10](https://www.drikpanchang.com/panchang/day-panchang.html?date=10/05/2028&geoname-id=5392171) | Dwithiyai | Kettai | 06:02 | Dwitiya / Jyeshtha | Dwithiya / Kettai | ✓✓ | sunrise +1 min, B +5 min |
| 27 | Chicago | [2027-07-05](https://www.drikpanchang.com/panchang/day-panchang.html?date=05/07/2027&geoname-id=4887398) | Dwithiyai | Poosam | 05:21 | Dwitiya / Pushya | Dwithiya / Poosam | ✓✓ | sunrise +0 min, B +6 min |
| 28 | Dallas | [2028-08-05](https://www.drikpanchang.com/panchang/day-panchang.html?date=05/08/2028&geoname-id=4684888) | Prathamai | Thiruvonam | 06:44 | Pratipada / Shravana | Pradhamai / Tiruvonam | ✓✓ | sunrise +0 min, B +4 min |
| 29 | Toronto | [2027-09-12](https://www.drikpanchang.com/panchang/day-panchang.html?date=12/09/2027&geoname-id=6167865) | Dwadasi | Thiruvonam | 06:53 | Dwadashi / Shravana | Dwadashi / Tiruvonam | ✓✓ | sunrise +1 min, B +5 min |
| 30 | London | [2028-04-26](https://www.drikpanchang.com/panchang/day-panchang.html?date=26/04/2028&geoname-id=2643743) | Dwithiyai | Karthigai | 05:40 | Dwitiya / Krittika | Dwithiya / Karthikai | ✓✓ | sunrise +1 min, B +6 min |
| 31 | Singapore | [2027-03-11](https://www.drikpanchang.com/panchang/day-panchang.html?date=11/03/2027&geoname-id=1880252) | Thrithiyai | Revathi | 07:11 | Tritiya / Revati | Trithiya / Revathi | ✓✓ | sunrise +1 min, B +4 min |
| 32 | Sydney | [2028-06-21](https://www.drikpanchang.com/panchang/day-panchang.html?date=21/06/2028&geoname-id=2147714) | Thrayodasi | Rohini | 06:59 | Trayodashi / Rohini | Trayodashi / Rohini | ✓✓ | sunrise +1 min, B +5 min |
| 33 | Melbourne | [2027-04-26](https://www.drikpanchang.com/panchang/day-panchang.html?date=26/04/2027&geoname-id=2158177) | Panchami | Moolam | 06:55 | Panchami / Mula | Panchami / Moolam | ✓✓ | sunrise +1 min, B +5 min |
| 34 | Dubai | [2028-04-22](https://www.drikpanchang.com/panchang/day-panchang.html?date=22/04/2028&geoname-id=292223) | Thrayodasi | Uthirattathi | 05:49 | Trayodashi / Uttara Bhadrapada | Trayodashi / Uthirattadhi | ✓✓ | sunrise +2 min, B +4 min |
| 35 | Kuala Lumpur | [2027-11-01](https://www.drikpanchang.com/panchang/day-panchang.html?date=01/11/2027&geoname-id=1735161) | Thrithiyai | Anusham | 06:56 | Tritiya / Anuradha | Trithiya / Anusham | ✓✓ | sunrise +1 min, B +4 min |
| 36 | Chennai | [2028-08-20](https://www.drikpanchang.com/panchang/day-panchang.html?date=20/08/2028&geoname-id=1264527) | Amavasai | Ayilyam | 05:56 | Amavasya / Ashlesha | Amavasai / Ayilyam | ✓✓ | sunrise +1 min, B +4 min |
| 37 | New Jersey | [2027-09-12](https://www.drikpanchang.com/panchang/day-panchang.html?date=12/09/2027&geoname-id=5099133) | Dwadasi | Thiruvonam | 06:34 | Dwadashi / Shravana | Dwadashi / Tiruvonam | ✓✓ | sunrise +0 min, B +4 min |
| 38 | Bay Area | [2028-03-24](https://www.drikpanchang.com/panchang/day-panchang.html?date=24/03/2028&geoname-id=5392171) | Chathurdasi | Poorattathi | 07:04 | Chaturdashi / Purva Bhadrapada | Chaturdashi / Poorattadhi | ✓✓ | sunrise +0 min, B +4 min |
| 39 | Chicago | [2027-12-30](https://www.drikpanchang.com/panchang/day-panchang.html?date=30/12/2027&geoname-id=4887398) | Thrithiyai | Thiruvonam | 07:17 | Tritiya / Shravana | Trithiya / Tiruvonam | ✓✓ | sunrise +1 min, B +6 min |
| 40 | Dallas | [2028-08-27](https://www.drikpanchang.com/panchang/day-panchang.html?date=27/08/2028&geoname-id=4684888) | Ashtami | Anusham | 06:58 | Ashtami / Anuradha | Ashtami / Anusham | ✓✓ | sunrise +1 min, B +5 min |

Cities covered: 12 / 12.
