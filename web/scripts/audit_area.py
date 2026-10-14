#!/usr/bin/env python3
"""Check area content files against the master prompt (content/prompts/service-area-page-prompt.md).

  python scripts/audit_area.py content/areas/pilsen.json [more files…]

Checks the Step 5 skeleton (every key, no extras, nothing empty), the character limits, the fixed
values and patterns, building-type consistency, review rules, banned words, British spellings and
other-area leftovers. Exit code 1 if any file has problems.
"""
import csv, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(HERE, '..', 'content')

AREA_KEYS = ['_area', '_area_the', '_slug', 'hero.breadcrumb', 'hero.pill', 'hero.h1', 'hero.lede', 'form.title',
             'form.building_default', 'services.heading', 'who.copy']
AREA_KEYS += [f'reviews.{i}.{k}' for i in range(1, 5) for k in ('tag', 'quote', 'by')]
AREA_KEYS += ['scope.heading'] + [f'scope.{i}.{k}' for i in range(1, 7) for k in ('factor', 'why')]
AREA_KEYS += ['choose.heading', 'districts.label', 'districts.heading', 'districts.chip1', 'districts.chip2', 'districts.chip3']
AREA_KEYS += [f'districts.{i}.{k}' for i in range(1, 4) for k in ('name', 'intro', 'hvac')] + ['districts.4.name', 'districts.4.intro']
AREA_KEYS += ['buildings.heading'] + [f'buildings.{i}.{k}' for i in range(1, 5) for k in ('tag', 'title', 'body')]
AREA_KEYS += ['permits.area_count', 'permits.area_text', 'faq.heading', 'faq.1.q', 'faq.1.a', 'faq.2.q', 'faq.3.q',
              'faq.4.q', 'faq.5.q', 'cta.body']
EXTRA_KEYS = ['buildingTypeOptions', 'districts.4.hvac', 'faq.2.a', 'faq.3.a', 'faq.4.a', 'faq.5.a', 'seo.title',
              'seo.description'] + [f'reviews.{i}.url' for i in range(1, 5)] + ['confirmNotes', '_sources']
SOURCE_KEYS = ['permits', 'shop_location', 'wards', 'boundaries', 'districts', 'buildings']
PERMIT_KEYS = ['source', 'window', 'permits_in_box', 'hvac_mentions', 'by_equipment', 'cs_permits', 'citywide_context']

LIMITS = {'hero.h1': 60, 'hero.lede': 260, 'who.copy': 230, 'scope.heading': 80, 'faq.1.a': 220, 'cta.body': 200,
          'seo.title': 60, 'seo.description': 155, 'districts.4.hvac': 90}
for i in range(1, 5):
    LIMITS[f'reviews.{i}.quote'] = 520
    LIMITS[f'buildings.{i}.tag'] = 12
    LIMITS[f'buildings.{i}.title'] = 26
    LIMITS[f'buildings.{i}.body'] = 120
    LIMITS[f'districts.{i}.name'] = 24
    LIMITS[f'districts.{i}.intro'] = 110
for i in range(1, 4):
    LIMITS[f'districts.{i}.hvac'] = 90
for i in range(1, 6):
    LIMITS[f'scope.{i}.factor'] = 32
    LIMITS[f'scope.{i}.why'] = 140

FIXED = {
    'scope.6.factor': 'Repair or replace',
    'scope.6.why': 'The biggest swing of all. Where the unit has years left, we say so.',
    'faq.4.q': 'Does HVAC repair in Chicago need a permit?',
    'faq.5.q': 'What are your hours?',
    'faq.4.a': "No. Chicago doesn't require a permit to repair, diagnose or maintain heating and cooling. Permits cover installs and construction, so a company's permit count says little about its repair work.",
    'faq.5.a': 'Monday to Friday, 6:00 AM to 6:00 PM, and Saturday, 6:00 AM to 3:30 PM. Call (773) 238-3838.',
}
BANNED = ['nestled', 'vibrant', 'bustling', 'premier', 'top-rated', 'best-in-class', 'one-stop', 'warranty', 'guarantee',
          'commission', 'licence', 'license']
BRITISH = ['neighbourhood', 'colour', 'centre', 'metre', 'favourite', 'organise', 'realise', 'licence', 'cafe ']
AREA_NAMES = ['West Loop', 'West Town', 'Lincoln Park', 'Wicker Park', 'Pilsen', 'Rogers Park', 'Bucktown',
              'Logan Square', 'Humboldt Park', 'Fulton Market', 'Greektown', 'Randolph', 'Ukrainian Village',
              'East Village', 'Noble Square', 'River West']


def get(a, x, k):
    return a[k] if k in a else x.get(k)


def audit(path, picks_count):
    d = json.load(open(path, encoding='utf-8'))
    a, x = d.get('area', {}), d.get('extras', {})
    p = []
    # skeleton
    p += [f'missing area key {k}' for k in AREA_KEYS if k not in a]
    p += [f'extra area key {k}' for k in a if k not in AREA_KEYS]
    p += [f'missing extras key {k}' for k in EXTRA_KEYS if k not in x]
    p += [f'extra extras key {k}' for k in x if k not in EXTRA_KEYS]
    for k in AREA_KEYS + EXTRA_KEYS:
        v = get(a, x, k)
        if v in ('', None, [], {}):
            p.append(f'empty {k}')
    s = x.get('_sources', {})
    p += [f'missing _sources.{k}' for k in SOURCE_KEYS if k not in s]
    p += [f'extra _sources.{k}' for k in s if k not in SOURCE_KEYS]
    pm = s.get('permits', {})
    p += [f'missing _sources.permits.{k}' for k in PERMIT_KEYS if k not in pm]
    if pm.get('cs_permits') != 0:
        p.append('cs_permits is not 0')
    if str(pm.get('hvac_mentions')) != str(a.get('permits.area_count')):
        p.append('permits.area_count differs from _sources hvac_mentions')
    cw = pm.get('citywide_context', {})
    if cw.get('hvac_firms') != 1539 or cw.get('hvac_permits_24m') != 4888:
        p.append('citywide_context should be 1539 firms / 4888 permits')
    # limits
    for k, lim in LIMITS.items():
        v = get(a, x, k)
        if isinstance(v, str) and len(v) > lim:
            p.append(f'{k} is {len(v)} chars (limit {lim})')
    # fixed values and patterns
    for k, v in FIXED.items():
        if get(a, x, k) != v:
            p.append(f'{k} must be exactly: {v}')
    A, T, slug = a.get('_area', ''), a.get('_area_the', ''), a.get('_slug', '')
    pat = {
        'hero.breadcrumb': f'Home  ›  Service area  ›  {A}',
        'hero.pill': A,
        'hero.h1': f'Heating and cooling repair in {T}, Chicago',
        'form.title': f'Book HVAC service in {T}',
        'services.heading': f'Every heating and cooling service we offer in {T}',
        'choose.heading': f'Five questions that sort {A} HVAC companies',
        'districts.label': f'{T.upper()}, DISTRICT BY DISTRICT',
        'buildings.heading': f'What heats and cools your {A} building',
        'permits.area_text': f'{A} permits in 24 months that even mention HVAC equipment.',
        'faq.heading': f'{A} HVAC, answered',
        'seo.title': f'HVAC Repair in {A}, Chicago | City & Suburban',
    }
    for k, v in pat.items():
        if get(a, x, k) != v:
            p.append(f'{k} should be: {v}')
    if not a.get('who.copy', '').startswith('City & Suburban is run from 1225 N Cleaver St, ') or \
            not a.get('who.copy', '').endswith('Rob, the owner, still runs the calls and does the diagnosis on the jobs that need it.'):
        p.append('who.copy must start "City & Suburban is run from 1225 N Cleaver St, " and end with the full Rob sentence')
    if not a.get('hero.lede', '').endswith('Family-owned since 1952, with the owner, Rob, still on the calls.'):
        p.append('hero.lede must end with the Rob sentence')
    if not re.match(r'^.+ to .+, .+ to .+$', a.get('districts.heading', '')):
        p.append('districts.heading should read "<north> to <south>, <west> to <east>"')
    if not a.get('districts.chip1', '').startswith('ZIP '):
        p.append('districts.chip1 should start "ZIP "')
    if not re.match(r'^Wards? \d', a.get('districts.chip2', '')):
        p.append('districts.chip2 should start "Wards "')
    if not re.match(r'^.+ \(\d+\)$', a.get('districts.chip3', '')):
        p.append('districts.chip3 should be "<Community area> (<number>)"')
    if not a.get('cta.body', '').startswith('Have the make of your '):
        p.append('cta.body should start "Have the make of your "')
    if not x.get('seo.description', '').endswith('Family-owned since 1952. Call (773) 238-3838.'):
        p.append('seo.description should end "Family-owned since 1952. Call (773) 238-3838."')
    if not a.get('scope.heading', '').startswith('The same repair costs differently in a'):
        p.append('scope.heading pattern')
    for i in range(1, 4):
        if not str(a.get(f'districts.{i}.hvac', '')).startswith('HVAC here: '):
            p.append(f'districts.{i}.hvac should start "HVAC here: "')
    if not str(x.get('districts.4.hvac', '')).startswith('HVAC here: '):
        p.append('districts.4.hvac should start "HVAC here: "')
    # buildings consistency
    titles = [a.get(f'buildings.{i}.title') for i in range(1, 5)]
    if x.get('buildingTypeOptions') != titles:
        p.append(f'buildingTypeOptions {x.get("buildingTypeOptions")} should equal building titles {titles}')
    if a.get('form.building_default') != (x.get('buildingTypeOptions') or [None])[0]:
        p.append('form.building_default must equal buildingTypeOptions[0]')
    for i in range(1, 5):
        tag = a.get(f'buildings.{i}.tag', '')
        if tag != tag.upper():
            p.append(f'buildings.{i}.tag should be caps')
    # reviews
    for i in range(1, 5):
        q = a.get(f'reviews.{i}.quote', '')
        if q.startswith('[CONFIRM'):
            p.append(f'review {i} is a placeholder')
        elif not 60 <= len(q.split()) <= 70:
            p.append(f'review {i} is {len(q.split())} words')
        if not re.match(r'^.+ · \d{4}$', a.get(f'reviews.{i}.by', '')):
            p.append(f'reviews.{i}.by should be "Author · year"')
    for rid, n in picks_count.items():
        if n > 2:
            p.append(f'review {rid} is on {n} pages')
    # words
    text = ' '.join(str(v) for k, v in {**a, **x}.items() if not k.startswith('_') and k not in ('confirmNotes',) and 'quote' not in k)
    low = text.lower()
    p += [f'banned word "{w}"' for w in BANNED if w in low]
    p += [f'British spelling "{w.strip()}"' for w in BRITISH if w in low]
    # Other places are fine where the page names the shop's location (West Town), the community area chip,
    # the area's own districts, or a neighbor used as a boundary in a district intro.
    allowed = {A} | {a.get(f'districts.{i}.name', '') for i in range(1, 5)}
    scan = ' '.join(str(v) for k, v in {**a, **x}.items()
                    if not k.startswith('_') and k not in ('confirmNotes', 'who.copy', 'districts.chip3', 'faq.2.a')
                    and 'quote' not in k and not k.startswith('districts.')).lower()
    for n in AREA_NAMES:
        if n.lower() in scan and n not in allowed:
            p.append(f'mentions another area: {n}')
    return p


def main():
    picks = json.load(open(os.path.join(CONTENT, 'reviews', 'picks.json'), encoding='utf-8'))
    counts = {}
    for slug, chosen in picks.items():
        if not slug.startswith('_'):
            for c in chosen:
                counts[c['num']] = counts.get(c['num'], 0) + 1
    bad = 0
    for path in sys.argv[1:]:
        probs = audit(path, counts)
        print(f"== {os.path.basename(path)}: {'OK' if not probs else str(len(probs)) + ' problems'}")
        for q in probs:
            print('  -', q)
        bad += bool(probs)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
