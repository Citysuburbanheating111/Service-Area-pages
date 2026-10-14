#!/usr/bin/env python3
"""Full-page text preview of an area content file, in the 16-block order of the approved reference page.

  python scripts/area_preview.py content/areas/pilsen.json --shared <scrape.txt> --images <scrape.images.tsv> --out <file.md>

<scrape.txt> and <scrape.images.tsv> come from scraping the live v1 West Loop reference page
(one line per text element: section<TAB>tag<TAB>text). Shared blocks are printed from the scrape,
character for character, and marked (shared). Area-specific text comes from the content file.
"""
import argparse, json

BASE = 'https://logeshmaximus.github.io/city-suburban/'


def load_scrape(path):
    rows = [l.rstrip('\n').split('\t') for l in open(path, encoding='utf-8')]
    sec = {}
    for s, tag, txt in (r + ['', ''])[:3] and rows:
        sec.setdefault(s, []).append((tag, txt))
    return rows, sec


def lines_between(rows, start_sec, end_sec):
    out, on = [], False
    for s, tag, txt in rows:
        if s == start_sec and tag == 'SECTION':
            on = True
            continue
        if on and s == end_sec and tag == 'SECTION':
            break
        if on and tag not in ('SECTION', 'href'):
            out.append((tag, txt))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('content')
    ap.add_argument('--shared', required=True)
    ap.add_argument('--images', required=True)
    ap.add_argument('--out', required=True)
    o = ap.parse_args()
    d = json.load(open(o.content, encoding='utf-8'))
    a, x = d['area'], d['extras']
    rows = [(l.rstrip('\n').split('\t') + ['', ''])[:3] for l in open(o.shared, encoding='utf-8')]

    def block(start, end):
        return lines_between(rows, start, end)

    md = []
    w = md.append
    A = a['_area']
    w(f"# {A}: full page preview\n")
    w(f"Content file: `content/areas/{a['_slug']}.json`. Shared text is copied from the live West Loop reference page "
      f"({BASE}services-v1/service-areas/west-loop/) and marked **(shared)**.\n")

    w('## 1. Header and navbar (shared)')
    util = [t for s, tag, t in rows if s == 'top' and tag in ('span', 'a')][3:]
    w('Utility bar: ' + ' · '.join(util))
    w('Navbar: Heating ▾ · Cooling ▾ · Air Quality ▾ · Commercial ▾ · Services ▾ · Service Areas ▾ · Call (773) 238-3838 · Schedule Service')
    w('Service Areas dropdown: Wicker Park · West Loop · West Town · Lincoln Park · Pilsen · Rogers Park · Bucktown · Logan Square · Humboldt Park · All Service Areas →\n')

    w('## 2. Hero')
    w(f"- Breadcrumb: {a['hero.breadcrumb']}")
    w(f"- Area pill: {a['hero.pill']}")
    w(f"- **H1:** {a['hero.h1']}")
    w(f"- Lede: {a['hero.lede']}")
    w('- Buttons (shared): Call (773) 238-3838 · Schedule service')
    w('- Background image (shared): see image table\n')

    w('## 3. Booking form')
    w(f"- Title: {a['form.title']}")
    w('- Promise line (shared): The person who diagnoses your system is the person who quotes it.')
    w('- Fields (shared): Name · Phone ("Enter a phone number so Rob can call you back.")')
    w(f"- Building type (default **{a['form.building_default']}**): " + ' · '.join(x['buildingTypeOptions']))
    hero = block('section:hero-title', 'section:services-title')
    opts = [t for tag, t in hero if tag == 'option'][4:]
    w("- What's happening? (shared): " + ' · '.join(opts))
    w('- Button and note (shared): Request a diagnosis · Price agreed before any work starts.\n')

    w('## 4. Trust strip (shared)')
    w('Chicago local · Family owned · Since 1952 · 4.98 ★★★★★ 204 Google reviews\n')

    w('## 5. Services catalogue')
    w('- Eyebrow (shared): From city to suburbs')
    w(f"- **H2:** {a['services.heading']}")
    svc = block('section:services-title', 'section:owner-title')
    texts = [(tag, t) for tag, t in svc]
    intro = next(t for tag, t in texts if tag == 'p')
    w(f'- Intro (shared): {intro}')
    w('- Tabs (shared): Heating 7 · Cooling 6 · Air quality 5 · Commercial 6')
    w('- Urgent note (shared): No heat in January? Call (773) 238-3838. Tell us the furnace or boiler make and what it\'s doing.')
    w('- Services (shared): ' + ' · '.join(t for tag, t in texts if tag == 'h4'))
    heat = [(tag, t) for tag, t in texts if tag in ('h3', 'h4', 'p')][1:17]
    w('- Heating panel text (shared):')
    for tag, t in heat:
        w(f'  - {"**" + t + "**" if tag != "p" else t}')
    w('')

    w("## 6. Who you're calling")
    w('- Eyebrow / H2 (shared): Who you\'re calling · One family. Second generation. Since 1952.')
    w(f"- Owner copy: {a['who.copy']}")
    w('- Names our reviewers remember (shared): Rob · Eddie · Carissa · Frank · Nate · Sam · Andy · Mike')
    w('- Tiles (shared): Founded 1952, "74 years, family owned, now in its second generation." · Google rating 4.98, '
      '"Across 204 Google reviews, as of 31 Aug 2026." · Who answers: Rob, the owner, "Owner-operator. He runs the calls himself, so the person who quotes is the person accountable." '
      '(The licence tile is hidden until a verified number exists.)\n')

    w('## 7. Reviews')
    w('- Eyebrow / H2 / intro (shared): What customers say · Why Chicago homeowners keep calling the same family · '
      'Quoted word for word from Google, never edited. Several reviewers were told their old unit still had years left.')
    for i in range(1, 5):
        w(f"- **Card {i} · {a[f'reviews.{i}.tag']}** ★★★★★")
        w(f"  > {a[f'reviews.{i}.quote']}")
        w(f"  {a[f'reviews.{i}.by']} · [Read on Google]({x[f'reviews.{i}.url']})")
    w('')

    w('## 8. Process (shared)')
    proc = block('section:process-title', 'section:price-title')
    pt = [t for tag, t in proc if tag in ('p', 'h2', 'h3', 'span')]
    w(f'{pt[0]} · **{pt[1]}**')
    steps = [(tag, t) for tag, t in proc][2:]
    i = 0
    while i < len(steps):
        num, title, text = steps[i][1], steps[i + 1][1], steps[i + 2][1]
        w(f'- {num} **{title}**: {text}')
        i += 3
    w('')

    w('## 9. What changes the price')
    w('- Eyebrow (shared): What changes the price')
    w(f"- **H2:** {a['scope.heading']}")
    price = block('section:price-title', 'section:choose-title')
    pp = [t for tag, t in price]
    w(f'- Intro (shared): {pp[2]}')
    w(f'- Median (shared): **{pp[3]}**, {pp[4]}')
    w('- Factor · Why it changes the work:')
    for i in range(1, 7):
        w(f"  {i}. **{a[f'scope.{i}.factor']}**: {a[f'scope.{i}.why']}")
    w('')

    w('## 10. How to choose')
    w(f"- **H2:** {a['choose.heading']}")
    ch = [t for tag, t in block('section:choose-title', 'section:companies-title')]
    w(f'- Eyebrow and note (shared): {ch[0]} · {ch[2]}')
    for i in range(3, len(ch), 3):
        w(f'  - {ch[i]} **{ch[i + 1]}** {ch[i + 2]}')
    w('')

    w('## 11. Kinds of HVAC company (shared)')
    co = [t for tag, t in block('section:companies-title', 'section:districts-title')]
    w(f'{co[0]} · **{co[1]}**')
    w(f'- [{co[2]}] **{co[3]}**: {co[4]}')
    for i in range(5, len(co), 2):
        w(f'- **{co[i]}**: {co[i + 1]}')
    w('')

    w('## 12. Districts')
    w(f"- Label: {a['districts.label']}")
    w(f"- **H2:** {a['districts.heading']}")
    w(f"- Chips: {a['districts.chip1']} · {a['districts.chip2']} · {a['districts.chip3']}")
    for i in range(1, 5):
        hv = a.get(f'districts.{i}.hvac') or x.get(f'districts.{i}.hvac')
        w(f"  {i}. **{a[f'districts.{i}.name']}**: {a[f'districts.{i}.intro']} _{hv}_")
    w('')

    w('## 13. Building types')
    w('- Eyebrow (shared): Your building type')
    w(f"- **H2:** {a['buildings.heading']}")
    for i in range(1, 5):
        w(f"  {i}. [{a[f'buildings.{i}.tag']}] **{a[f'buildings.{i}.title']}**: {a[f'buildings.{i}.body']}")
    w('')

    w('## 14. Permit record')
    pr = [t for tag, t in block('section:permits-title', 'section:faq-title')]
    w(f'- Eyebrow / H2 / text (shared): {pr[0]} · **{pr[1]}** · {pr[2]}')
    w(f"- **{a['permits.area_count']}** {a['permits.area_text']} (market context only)")
    w(f'- (shared) **{pr[5]}** {pr[6]}')
    w(f'- (shared) **{pr[7]}** {pr[8]}\n')

    w('## 15. FAQ')
    w('- Eyebrow (shared): Questions')
    w(f"- **H2:** {a['faq.heading']}")
    for i in range(1, 6):
        ans = a.get(f'faq.{i}.a') or x.get(f'faq.{i}.a')
        tag = ' (shared)' if i > 3 else ''
        w(f"  {i}. **{a[f'faq.{i}.q']}**{tag} {ans}")
    w('')

    w('## 16. Final CTA and footer')
    w('- H2 (shared): No heat, no cooling, or just a question?')
    w(f"- CTA body: {a['cta.body']}")
    w('- Buttons (shared): Call (773) 238-3838 · Schedule service')
    w('- Footer (shared): live-site footer: services links, 773-238-3838, Apply for Financing, service@citysuburbanheating.com, '
      '1225 North Cleaver Street, Chicago, Illinois 60642, United States, Privacy Policy, Terms Of Use.\n')

    w('## SEO')
    w(f"- Title: {x['seo.title']}")
    w(f"- Description: {x['seo.description']}\n")

    w('## Images')
    w('| Block | Image URL | Alt | Status |')
    w('|---|---|---|---|')
    where = {'header:site-header': '1 Header logo', 'section:hero-title': '2 Hero / 4 Trust strip', 'header:': '8 Process step',
             'footer:live-site-footer': '16 Footer logo'}
    for line in open(o.images, encoding='utf-8'):
        sec, src, alt, cls = (line.rstrip('\n').split('\t') + ['', '', ''])[:4]
        if sec == 'style':
            continue
        url = BASE + src.replace('../../../', '')
        blk = where.get(sec, sec)
        if 'cs-hero' in cls:
            blk, status = '2 Hero background', 'Reused. **Needs replacing**: ask for a City & Suburban-owned or licensed photo of ' + A
        elif blk.startswith('2 Hero'):
            blk, status = '4 Trust strip icon', 'Reused (shared)'
        else:
            status = 'Reused (shared)'
        w(f'| {blk} | {url} | {alt or "(decorative, no alt)"} | {status} |')
    w('')

    w('## Open items (confirm notes)')
    for n in x.get('confirmNotes', []):
        w(f"- **{n['block']}**: {n['note']}")
    open(o.out, 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print('wrote', o.out)


if __name__ == '__main__':
    main()
