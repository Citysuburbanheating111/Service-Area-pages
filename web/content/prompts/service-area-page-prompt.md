# Master prompt: City & Suburban service area pages

Saved 2026-10-14 from the user; updated the same day for the v3 standard design (Highlights Chicago layout, with the permit bar graph). Use it for every service area page. Ask the user which areas first,
put them in the AREAS line, then follow the prompt with the city-suburban-service-area-page skill.
Repo specifics for this project are at the end.

---

Use the **city-suburban-service-area-page** skill to write City & Suburban Heating & Cooling service area landing pages for these areas:

**AREAS:** <Area 1>, <Area 2>, …

Write one page per area, one area at a time, in the order given. Each page must be an exact structural copy of the approved reference page. Every section, every field and every shared value must be there, with only the area-specific content changed. Don't skip, merge, reorder or add sections.

## Attachments in this chat
- google-reviews-*.csv: City & Suburban's Google reviews export. This is the only source for review cards. It replaces the HVAC_Keyword_Clusters.xlsx workbook that the skill mentions, so don't ask for that workbook.
- picks.json (if attached): the reviews already used on earlier pages, listed by area. A review may appear on two pages at most, counting the pages you write in this chat.
- If the CSV is missing, fill the review cards with the [CONFIRM: …] placeholder text from the skill's examples and say so in your handover.

## Reference pages (public, scrape these first)
- Approved reference page (v3 standard design, West Loop): https://logeshmaximus.github.io/city-suburban/west-loop-v3.html (exported 1:1 from the Paper template, https://app.paper.design/file/01M4X2DQFNVXA75B9MRX99QYFG/p-1-0)
- The same page on the site, from Sanity: https://service-area-pages.vercel.app/service-area/west-loop/
- Design system and tokens: https://logeshmaximus.github.io/city-suburban/
- The skill's references/content-fields.md, references/examples/west-loop.json and references/examples/west-town.json.

## Step 0: How the skill applies here
- Follow the skill's workflow steps 1–5: research, permits, reviews, write the content file, check it.
- Skip steps 6–8 (the Paper steps). Don't copy artboards or call Paper tools. The deliverable is the content file described under "Output". It gets loaded into the site's CMS after review.
- The skill's non-negotiables apply in full. They're repeated in Step 6.

## Step 1: Scrape the reference page before you write anything
Open the West Loop reference page and record the following:

1. Every section, in order, with its eyebrow and heading. Confirm the page still has these 16 blocks (header, 14 sections, footer). If the live page differs from this list, the live page wins; tell me what changed.

| # | Block | Changes per area? |
|---|---|---|
| 1 | Header and navbar (Services and Service Areas dropdowns) | No |
| 2 | Hero: breadcrumb, eyebrow (area + first three districts), H1, lede, trust chips (licensing, family owned since 1952, price agreed before work, 4.98 · 204 Google reviews), Call and Schedule buttons, "On this page" links, booking form (title, building type, "What's happening?" options) | Yes: H1, lede, form title, building-type options and default |
| 3 | All services: heading, 24 services in four groups (Heating 7, Cooling 6, Air quality 5, Commercial 6) | Heading only |
| 4 | Who you're actually calling: owner copy, van photo, Owner Rob / 1952 / 0 permits / 24/7 cards, Google rating, why family-owned matters, how we work | Owner copy only |
| 5 | What customers say: four review stats (counts across all 204 reviews), four review cards with tag, verbatim quote, "Author · year" | Yes: all four cards |
| 6 | What happens when you call: six steps | No |
| 7 | What changes the price: heading, How we price, $6,807 median, six factor cards | Yes: heading and factors 1–5. Factor 6 is always "Repair or replace". |
| 8 | How to choose: heading, five-row table (what to check, why it matters, how to verify, City & Suburban's answer) | Heading only |
| 9 | Kinds of HVAC company: five company types, "Where we fit, honestly" | No |
| 10 | District by district: label, boundaries heading, map, area facts (community area, ZIPs, wards, our shop, permits), four district cards with "What the HVAC work looks like" | Yes: all |
| 11 | Your building type: four cards (tag, title, what heats and cools it) | Yes: all |
| 12 | Neighbourhoods next to the area: 3–6 cards | Yes: all |
| 13 | Permit record: data-source line, area permit count and line, **bar graph of the area's HVAC permits by equipment**, the honest context (0 for City & Suburban, 1,539 firms / 4,888 permits citywide) | Yes: count, line, data-source numbers and the graph |
| 14 | FAQ: heading, five questions and answers | Yes: heading, Q1–Q3 and their answers. Q4 and Q5 stay fixed. |
| 15 | Next step: call buttons, proof strip, "Have these ready when you call" | CTA body only |
| 16 | Footer | No |

2. Every image. For each one, record its src URL, alt text, which block it sits in and what it shows. That covers the hero background, the three images beside the form, the six process-step images and the logos. These are shared assets: reuse the same URLs on the new page, don't swap or generate images, and don't take photos from other websites. The hero photo is shared by every page: it's set once in the Service area template in Sanity. Don't add a hero-photo note.

3. Every shared value, copied character for character from the page. Don't retype these from memory. They include the phone number, address, hours, rating, review count, founding year, reviewer names, service names and counts, process steps, Q1–Q5, company types, citywide permit figures, the $6,807 median and its caption, and the FAQ 4 and FAQ 5 answers. If any value on the page differs from this prompt, use the page's value and flag the difference.

## Step 2: Research the area (skill step 1)
Use web search, and keep everything specific to this area. Record every source you use.
- Boundaries on four sides (north, south, east, west), the official Chicago community area name and number, ZIP codes and wards. Use the City of Chicago data portal, the Encyclopedia of Chicago and the City's ward maps. If the area is a sub-neighbourhood with no community area of its own (for example Wicker Park or Bucktown), say which community area it sits in.
- Four districts or sub-neighbourhoods that people actually search by.
- The 3–6 neighbourhoods that border the area, with the street or landmark that divides each one and how its buildings differ.
- The building stock and what heats and cools it, for example: boilers and radiators in greystones, two-flats and courtyard buildings; furnaces in cottages and newer mid-rises; fan coils in high-rises; rooftop units and make-up air in commercial buildings.
- Where 1225 N Cleaver St (the shop, 41.9043, -87.6637) sits relative to the area. Measure the distance and direction with a map tool. Don't guess.

## Step 3: Permit context (skill step 2)
- Run the skill's scripts/hvac_permits.py with the area's bounding box (and --community-area N when there is one). If scripts can't run, query the City of Chicago building permits dataset (ydr8-5enu) directly for the last 24 months.
- For a sub-neighbourhood without a community area, count permits inside the City's neighbourhood polygon (dataset y6yq-dbs2), not a rough box.
- From the same run, unchanged: permits.area_count = hvac_mentions, permits.total = permits_in_box, permits.window_from / permits.window_to = window.from / window.to, permits.by_equipment = by_equipment. These draw the permit section's data-source line and bar graph. Also keep the full output in _sources.permits.
- City & Suburban must come out at 0 permits. If it doesn't, stop and tell me before writing anything.
- Area permit numbers are market context only. Never present them as City & Suburban's record.

## Step 4: Reviews (skill step 3, from the attached CSV)
- Use only 5-star reviews of 60 words or more.
- Rank them by match to the area's main equipment (boiler, radiator, steam, furnace, AC, ductless, rooftop and so on), then by area or neighbourhood mention, then newest first.
- Skip any review already used on two pages, using picks.json plus the pages written in this chat.
- Card text is the review's opening 60–70 words, verbatim, cut at a sentence end inside that window. If there's no sentence end, cut at word 70 and add "…". Never edit, splice, fix typos or pad a review.
- Each card needs a short equipment tag ("Boiler repair", "Condo AC repair"), "Author · year" from date_utc, and the review_url. Note each pick's num from the CSV.

## Step 5: Write the content file (skill step 4)
Copy the structure of references/examples/west-loop.json and wrap it as shown below. Every key must be present, with no extras and nothing left empty. The numbers are character limits.

```json
{
 "area": {
  "_area": "<Area>", "_area_the": "<'the West Loop' or 'Pilsen'>", "_slug": "<area-slug>",
  "hero.h1": "Heating and cooling repair in <area_the>, Chicago",                     // ≤60
  "hero.lede": "<equipment>, for <Area> <building types>. Family-owned since 1952, with the owner, Rob, still on the calls.",  // ≤260
  "form.title": "Book HVAC service in <area_the>",
  "form.building_default": "<most common building type; must equal buildingTypeOptions[0]>",
  "services.heading": "Every heating and cooling service we offer in <area_the>",
  "who.copy": "City & Suburban is run from 1225 N Cleaver St, <measured distance and direction>. Rob, the owner, still runs the calls and does the diagnosis on the jobs that need it.",  // ≤230
  "reviews.1.tag": "", "reviews.1.quote": "", "reviews.1.by": "<Author> · <year>",   // quote ≤520, same for cards 2-4
  "reviews.2.tag": "", "reviews.2.quote": "", "reviews.2.by": "",
  "reviews.3.tag": "", "reviews.3.quote": "", "reviews.3.by": "",
  "reviews.4.tag": "", "reviews.4.quote": "", "reviews.4.by": "",
  "scope.heading": "The same repair costs differently in a <type>, a <type> and a <type>",  // ≤80
  "scope.1.factor": "", "scope.1.why": "",                                             // factor ≤32, why ≤140, rows 1-5
  "scope.2.factor": "", "scope.2.why": "",
  "scope.3.factor": "", "scope.3.why": "",
  "scope.4.factor": "", "scope.4.why": "",
  "scope.5.factor": "", "scope.5.why": "",
  "scope.6.factor": "Repair or replace",
  "scope.6.why": "The biggest swing of all. Where the unit has years left, we say so.",
  "choose.heading": "Five questions that sort <Area> HVAC companies",
  "districts.label": "<AREA_THE IN CAPS>, DISTRICT BY DISTRICT",
  "districts.heading": "<north> to <south>, <west> to <east>",
  "districts.chip1": "ZIP <zip> · <zip>",
  "districts.chip2": "Wards <n>, <n>",
  "districts.chip3": "<Community area name> (<number>)",
  "districts.1.name": "", "districts.1.intro": "", "districts.1.hvac": "HVAC here: …",  // name ≤24, intro ≤110, hvac ≤90
  "districts.2.name": "", "districts.2.intro": "", "districts.2.hvac": "HVAC here: …",
  "districts.3.name": "", "districts.3.intro": "", "districts.3.hvac": "HVAC here: …",
  "districts.4.name": "", "districts.4.intro": "", "districts.4.hvac": "HVAC here: …",
  "buildings.heading": "What heats and cools your <Area> building",
  "buildings.1.tag": "", "buildings.1.title": "", "buildings.1.body": "",              // tag ≤12 CAPS, title ≤26, body ≤120
  "buildings.2.tag": "", "buildings.2.title": "", "buildings.2.body": "",
  "buildings.3.tag": "", "buildings.3.title": "", "buildings.3.body": "",
  "buildings.4.tag": "", "buildings.4.title": "", "buildings.4.body": "",
  "nearby.1.name": "", "nearby.1.text": "",                                             // name ≤26, text ≤110; 3-6 bordering neighbourhoods
  "nearby.2.name": "", "nearby.2.text": "",
  "nearby.3.name": "", "nearby.3.text": "",
  "permits.area_count": <hvac_mentions>,
  "permits.area_text": "<Area> permits in 24 months that even mention HVAC equipment.",
  "permits.total": <permits_in_box>,
  "permits.window_from": "<window.from, YYYY-MM-DD>", "permits.window_to": "<window.to>",
  "permits.by_equipment": {"Furnace": 0, "Boiler": 0, "Air conditioning / condensing units": 0, "Rooftop units": 0, "Ductwork": 0, "Heat pump / mini-split": 0, "Kitchen exhaust / make-up air": 0},
  "faq.heading": "<Area> HVAC, answered",
  "faq.1.q": "<repair-or-replace question about the area's main equipment>",
  "faq.1.a": "",                                                                        // ≤220
  "faq.2.q": "<a question people here actually ask>",
  "faq.3.q": "<a question people here actually ask>",
  "faq.4.q": "Does HVAC repair in Chicago need a permit?",
  "faq.5.q": "What are your hours?",
  "cta.body": "Have the make of your <equipment> to hand, and tell us what it's doing. <one area-specific line>"  // ≤200
 },
 "extras": {
  "buildingTypeOptions": ["<4 options, same order as buildings 1-4, first = form.building_default>"],
  "faq.2.a": "", "faq.3.a": "",
  "faq.4.a": "No. Chicago doesn't require a permit to repair, diagnose or maintain heating and cooling. Permits cover installs and construction, so a company's permit count says little about its repair work.",
  "faq.5.a": "Our working hours are 24/7. Call (773) 238-3838.",
  "seo.title": "HVAC Repair in <Area>, Chicago | City & Suburban",                     // ≤60
  "seo.description": "<equipment> repair for <Area> <building types>. Family-owned since 1952. Call (773) 238-3838.",  // ≤155
  "reviews.1.url": "", "reviews.2.url": "", "reviews.3.url": "", "reviews.4.url": "",
  "confirmNotes": [],   // stays empty: resolve every open item before handover (Step 6)
  "_sources": {
   "permits": { "source": "City of Chicago building permits (ydr8-5enu)", "window": {"from": "", "to": ""},
                "permits_in_box": 0, "hvac_mentions": 0, "by_equipment": {}, "cs_permits": 0,
                "citywide_context": {"hvac_firms": 1539, "hvac_permits_24m": 4888} },
   "shop_location": "<how the distance was measured>",
   "wards": "<source>", "boundaries": "<source>", "districts": "<sources>", "buildings": "<sources>"
  }
 }
}
```
(The // comments are notes for you. Leave them out of the real file, which must be valid JSON.)

Writing rules:
- Area-specificity test: every district, building, nearby, scope row, FAQ and CTA line must be wrong if pasted onto another area. Use real street names, landmarks and building types from your research.
- Building types 1–4, buildingTypeOptions and the building-type examples in the lede must describe the same four buildings.
- Use plain, specific sentences. Claim numbers, not adjectives. No "nestled", "vibrant", "bustling", "premier" or "top-rated".
- FAQ answers 2 and 3 may use only facts on this page or in the reference pages' answers. Don't invent services, response times, prices or guarantees.
- Write in American English, and use the same punctuation style as the reference page (curly apostrophes inside review quotes stay exactly as in the CSV).

## Step 6: Check before you hand over (skill step 5)
Run `python scripts/plan.py --content <area-only json> --out check.json` on the area object and fix every problem it reports. Then confirm each of these yourself:
- [ ] All 16 blocks from Step 1 are accounted for, and every key in the Step 5 skeleton is present and filled.
- [ ] Nothing is left to confirm: `confirmNotes` is empty. Decide every edge case yourself from data and sources (ZIP or ward edges: list the ones covering most of the area; boundary lines: follow the City outline or a cited source; drafted FAQ answers and SEO meta: check them against this page's facts). If a claim can't be verified, soften or drop it. Hero photo, licence and hours are template facts taken from citysuburbanheating.com; never ask the client for them.
- [ ] Every length limit is met. Fix overflow by rewriting shorter, never by dropping content.
- [ ] No leftover West Loop, West Town or other-area wording (street names, districts, "Fulton Market", "high-rise" where it doesn't apply).
- [ ] 0 permits for City & Suburban. Area permit numbers are labelled as market context only.
- [ ] permits.area_count, permits.total, the window and permits.by_equipment all come from the same hvac_permits.py run, copied unchanged. No equipment row is larger than the area count.
- [ ] Rating is 4.98 across 204 Google reviews: never 5.0, never merged with Yelp.
- [ ] Founded 1952, family owned, second generation, owner-operator Rob, 1225 N Cleaver St, (773) 238-3838.
- [ ] No licence numbers (they're unverified). No commission claims, "most common call" claims, price books or warranties. Competitors are criticised for their set-up and incentives, never their workmanship.
- [ ] Reviews are verbatim 60–70-word openings, 5-star, and no review appears on more than two pages.
- [ ] Shared values and image URLs match the scraped reference page exactly.

## Output (for each area)
1. <area-slug>.json, the complete content file from Step 5, as a downloadable file.
2. A full page preview: all 16 blocks in page order, including the permit bar graph rows (equipment · count), each with its heading and every piece of text exactly as it will appear. Area-specific text is shown in full; shared blocks are shown with their scraped text and marked (shared). Include an image table (block · image URL · alt · reused or needs replacing).
3. Review picks as a picks.json entry: "<area-slug>": [{"num": <n>, "tag": "<tag>"}, …].
4. Handover notes: what's specific to this area (districts, building types, the permit line), the decisions you made on edge cases (ZIP or ward edges, boundary lines, drafted FAQ answers, SEO meta) and why. Nothing is left open, any difference between the live page and this prompt, and the source list.

When all areas are done, finish with a one-line summary per area: slug, permit count, the four review numbers and the decisions made.

---

## Repo specifics (how this project runs the prompt)
- Content files: `web/content/areas/<slug>.json`. Review picks: `web/content/reviews/picks.json`, then `python web/scripts/apply_reviews.py` (cuts quotes, writes ledger.json, enforces the two-page limit).
- Reviews CSV: `web/content/reviews/google-reviews-*.csv` (newest export). Don't ask for the workbook.
- Skill scripts: if the installed skill folder is missing, unzip `C:\Citysuburban\city-suburban-service-area-page.skill`.
- Shared content (business facts from citysuburbanheating.com, section intros, review stats, the 5 questions and their table columns, the 6 process steps, kinds of company, About tiles, the permit record text, FAQ 4 and 5, the call checklist) lives in ONE Sanity document, the **Service area template** (`areaTemplate`). `seed-area.mjs` writes only the area's own fields, including the permit graph (`permits.byEquipment`, `totalPermits`, the window), the nearby neighbourhoods and FAQ 1–3. Pages render through `web/src/components/area/AreaPageV3.tsx`. Don't flag hero photos, licence numbers or hours per page: they're template facts, taken from the live site.
- After review, load into Sanity as a draft: `node --env-file=.env.local scripts/seed-area.mjs content/areas/<slug>.json` (from `web/`). Check in the Studio's Preview tool at http://localhost:3000/studio (launch config `web-dev`).
