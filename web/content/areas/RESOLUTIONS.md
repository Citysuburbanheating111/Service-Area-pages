# How the "to confirm" notes were resolved (14 Oct 2026)

Every published area page now has **no open confirm notes**. Each item was decided from data and
sources, not sent to the client. From now on pages are written this way: `confirmNotes` stays empty
(`scripts/audit_area.py` fails otherwise, and `scripts/seed-area.mjs` refuses the file).

## On every page
| Item | Decision |
|---|---|
| Hero photo | Shared photo, set once in the **Service area template**. Not a per-page item. |
| Licence number | None is published on citysuburbanheating.com, so none is shown. The template says "Licensed, NATE-certified technicians", as the live site does. |
| Hours | **24/7**, as on citysuburbanheating.com ("Working Hours: 24/7"). Set in the template. |
| FAQ answers 2–5 | Checked: 2–3 use only facts on the page; 4–5 now come from the template. |
| SEO title and description | Checked against the pattern and limits (title ≤ 60, description ≤ 155). |

## Per page
| Page | Item | Decision |
|---|---|---|
| West Loop | Permit count (was 62) | **45**, re-pulled 14 Oct 2026 with the skill's `hvac_permits.py` on the page's own boundary (Grand Ave to I-290, Ashland to the river, community area 28). The City's West Loop outline gives 47 but reaches south of I-290. City & Suburban: 0. |
| West Loop | Form option vs building card | Card renamed "Converted warehouse loft" to match the form option. |
| West Loop | Greektown "HVAC here" note | Kept: restaurants below, condos above, as the district's own description says. |
| West Loop | Sources | Added (permits, wards, ZIPs, boundaries, districts, buildings). |
| West Town | River West "HVAC here" note | Kept: lofts and newer condos, from its building stock. |
| West Town | ZIP 60612 / 60647 edges | Chip stays 60622 · 60642, the ZIPs covering the area; the others only touch its edges. |
| West Town | Sources | Districts and buildings sources added. |
| Wicker Park | Landmarks review claim | Kept as written ("can need Landmarks review"): permits inside Chicago landmark districts are reviewed by the Commission on Chicago Landmarks (monthly permit reports). |
| Wicker Park | Boundary vs City outline | Page states the common boundary (The 606, Division, Western, Ashland); the permit count uses the City outline. Recorded in sources. |
| Wicker Park, Bucktown | "Along The 606" HVAC note | Kept: furnaces and central air in townhomes and new builds, from their building stock. |
| Pilsen | Boundary line | Kept: 16th St (BNSF) north, Stevenson south and Western west (the Heart of Chicago edges), the river east. |
| Pilsen | Wards 28 and 11 | Left off: 10 of 737 permits (under 2%). Chip stays Wards 25, 12. |
| Pilsen | Below-street houses | Kept: sourced to Chicago raising its streets in the 1850s (Gapers Block, Enjoy Illinois, The Jaxson). |
| Rogers Park | 7 miles from the shop | Kept: Rogers Park is on citysuburbanheating.com's own service-area list. |
| Rogers Park | Howard St / Juneway, Howard Street note | Kept: Wikipedia names Juneway Terrace and Howard Street as the north edge. |
| Bucktown | ZIP 60614 | Left off: it covers the strip east of the Kennedy, outside the page's boundary. |
| Bucktown | Permit count (5) | Re-pulled 14 Oct 2026: still 5 (City outline south of Fullerton). |
