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
| Humboldt Park | Boundary | City neighborhood outline (y6yq-dbs2): Bloomingdale, the Kinzie (UP) tracks, the tracks at Kenton, Rockwell. That is community area 23 plus the East Humboldt Park strip of West Town (24), so the chip names both. Permits counted inside the outline: 31 of 1,255. |
| Humboldt Park | ZIPs and wards | Chip lists ZIPs 60651, 60624, 60622 (77% of the area) and wards 26, 37, 27, 36. Ward 28 (6%, 18 of 1,255 permits) left off. |
| Humboldt Park | Paseo Boricua | Flags at Western and California, per the Chicago Landmarks report and Block Club (2022). |
| Old Town | Boundary | No legal boundary. Page follows the City outline (Armitage, Division, Halsted and Clybourn, Clark), the same lines as published neighborhood guides. Permits counted inside it: 20 of 756. |
| Old Town | Community areas | The outline is 52% Lincoln Park (7) (the Old Town Triangle) and 48% Near North Side (8); the chip names both. |
| Old Town | Landmarks answer | FAQ 3 says exterior work in the Old Town Triangle District "can need Landmarks review", as on the Wicker Park page. |
| Ukrainian Village | Boundary | City outline: Division, Chicago Ave, Rockwell, Damen. Wikipedia's Grand and Western (some maps Campbell) differ; the page follows the City outline so the boundary, wards (36, 1), ZIP (60622) and permit count (8 of 218) describe the same area. Ward 26 (3%) left off. |
| All three | Reviews | No unused boiler review exists, so cards match furnace, AC and general repair. Twelve reviews used for the first time. |
| Wrigleyville | Boundary | City outline (y6yq-dbs2): Irving Park, Addison (plus a short strip along Clark below it), Southport, Sheffield; edges read from permit addresses inside it. Permits: 4 of 241. All in Lake View (6), which has its own page. |
| Wrigleyville | Distance | "3 miles", measured to Addison and Sheffield, the corner named on the page (the polygon's Clark strip reaches 2.8 mi). |
| Wrigleyville | Game-day FAQ | Uses only page facts: 24/7 hours and "tell us the access rules and we book around them" (process step 2). |
| Skokie, Northbrook | Suburb version | User's choice (15 Oct 2026): H1 "…in <Suburb>, IL"; the permit graph is replaced by a note that the village issues its own permits and publishes no open data; township in place of community area; no wards; FAQ 4 asks about the village's permits. |
| Skokie | Boundary and facts | Census TIGERweb place 'Skokie village' (GEOID 1770122): neighbors Wilmette and Glenview (N), Lincolnwood (S), Morton Grove (W), Evanston along the North Shore Channel (E). Niles Township (100%), ZIPs 60076 and 60077 (94%; 60203 at 7% left off). Shop 7.8 mi to the nearest edge. |
| Northbrook | Boundary and facts | Census TIGERweb place 'Northbrook village' (GEOID 1753481): Deerfield (N), Glenview (S), Wheeling (W, past the Tri-State), Northfield (E). Northfield Township (99%), ZIP 60062. Shop 15.5 mi to the nearest edge. |
| Skokie, Northbrook | FAQ 4 | "It depends on the job": both villages run their own permits (Skokie: records in BS&A Online; Northbrook: Mechanical Application, Form 1.4). Neither publishes which HVAC repairs are exempt in a form we could verify, so the answer doesn't claim it. |
| Skokie, Northbrook | Reviews | No unused furnace reviews were left, so these use reviews already on one other page (two-page limit kept); #164 is new. |
| Glenview | Boundary and facts | Census place 'Glenview village': Northbrook and Northfield (N), Morton Grove, Niles and Golf (S), unincorporated Maine Township toward Des Plaines (W), Wilmette (E); much of the edge is unincorporated. Northfield Township (86%), ZIPs 60025 and 60026 (90%). Shop 12.1 mi to the nearest edge. |
| Glenview | FAQ 4 | The Village takes permit applications online and inspects every permit it issues (glenview.il.us); answer stays "it depends on the job". |
| Winnetka | Boundary and facts | Census place 'Winnetka village': Glencoe (N), Kenilworth and Wilmette (S), Northfield (W), Lake Michigan (E). New Trier Township, ZIP 60093. Shop 13.2 mi. |
| Winnetka | FAQ 4 | Verified: the Village requires a permit to install or replace a furnace or air conditioning (Building Permits page, furnace checklist). |
| Winnetka | Building types | Historic architects are sourced (Wikipedia); "older house" and "large newer house" are written with "often" and "can", as build years per house type aren't published. |
| Wilmette | Boundary and facts | Census place 'Wilmette village': Kenilworth and Winnetka (N), Evanston and Skokie (S), Glenview (W), Lake Michigan (E). New Trier Township (97%), ZIP 60091 (99%). Shop 11.4 mi. Ridge Rd split (older houses east, 1950s ranches and bi-levels west) is from Wikipedia. |
| Wilmette | FAQ 4 | No Wilmette HVAC permit guidance found, so the answer stays general. |
| Niles | Boundary and facts | Census place 'Niles village': Glenview and Morton Grove (N), Chicago and Park Ridge (S), Park Ridge (W), Skokie (E). Maine (52%) and Niles (48%) Townships, both on the chip; ZIP 60714. Shop 8.7 mi. Housing era from the population jump 3,587 (1950) to 31,432 (1970). |
| Park Ridge | Boundary and facts | Census place 'Park Ridge city' (a city, so "The City of Park Ridge"): Niles (N), Chicago's Norwood Park (S), Des Plaines across the river (W), Chicago's Edison Park (E). Maine Township (83%), ZIP 60068. Shop 9.9 mi. |
| Des Plaines | Boundary and facts | Census place 'Des Plaines city': Mount Prospect (N and W), Rosemont and O'Hare (S), Elk Grove Village (SW), Park Ridge across the river (E). Maine (79%) and Elk Grove (18%) Townships, ZIPs 60016 and 60018. Shop 12 mi. |
| Des Plaines | FAQ 4 | Verified: the City's on-demand permit covers a like-for-like furnace or AC replacement where the outdoor unit doesn't move, final inspection only (city handout, May 2023). |
| Niles, Park Ridge | FAQ 4 | No HVAC permit guidance found, so the answer stays general. |
| All suburbs | Template wording | Suburb text now says "each suburb" instead of "each village", since Park Ridge and Des Plaines are cities. |
