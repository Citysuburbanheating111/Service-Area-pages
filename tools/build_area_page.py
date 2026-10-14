#!/usr/bin/env python3
"""Build a working (not exported) City & Suburban service area page for the design-system site.

Usage:
  python tools/build_area_page.py web/content/areas/west-town.json

Reads an area content file in the city-suburban-service-area-page skill's format
({"area": {flat skill fields}, "extras": {...}}) and writes
services-v1/service-areas/<slug>/index.html. Same blocks, order and design system as the Paper
template and the Next.js template, but with real links, a real form, working tabs, accordions and
scrollable tracks. Styles: assets/area-page.css (page) + assets/live-chrome.css (live-site header and footer).
Behaviour: assets/area-page.js.
"""
import html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = '../../../'          # services-v1/service-areas/<slug>/ -> site root
A = UP + 'assets/'
LIVE = 'https://citysuburbanheating.com'
PHONE, TEL = '(773) 238-3838', 'tel:+17732383838'
# City of Chicago licence number for the B3 tile. None hides the tile: nothing verifiable is on the
# City's business licence register for 1225 N Cleaver St (checked 2026-10-13, dataset r5kz-chrr).
LICENCE = None

e = lambda s: html.escape(str(s), quote=True)

ICONS = {
    'heating': '<path d="M12 21c-3.3 0-6-2.4-6-5.5 0-3 2.5-4.5 3-7.5 2 1 3 3 3 4.5 1-1 1.5-2.5 1.5-4 2.5 1.5 4.5 4.3 4.5 7 0 3.1-2.7 5.5-6 5.5z"/>',
    'cooling': '<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5M9 4l3 2 3-2M9 20l3-2 3 2"/>',
    'airQuality': '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
    'commercial': '<path d="M4 21V8l8-4 8 4v13M4 21h16M9 21v-5h6v5M8 10h2M14 10h2M8 13h2M14 13h2"/>',
    'wrench': '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    'boiler': '<rect x="6" y="3" width="12" height="17" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M9 15h6M8 21h8"/>',
    'install': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M12 15v3M10.5 16.5 12 18l1.5-1.5"/>',
    'maintenance': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 12l2.5 2.5L16 9.5"/>',
    'heatPump': '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="10" cy="12" r="4"/><path d="M10 8v8M6 12h8M17 9v6"/>',
    'hybrid': '<path d="M8 21c-2.2 0-4-1.6-4-3.7 0-2 1.7-3 2-5 1.3.7 2 2 2 3 .7-.7 1-1.7 1-2.7"/><path d="M14 4v8M10.5 6l7 4M17.5 6l-7 4"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
    'phone': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    'left': '<path d="m15 6-6 6 6 6"/>',
    'right': '<path d="m9 6 6 6-6 6"/>',
}


def icon(name, size=20, sw=1.8):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


# B2: Heating copy is from the approved template; the other groups list the live site's service pages.
S = LIVE + '/services/'
GROUPS = [
    ('heating', 'Heating', 'Heating: furnaces, boilers and heat pumps',
     "A furnace that won't light, a boiler losing pressure, a unit that short-cycles. Diagnosis comes first, and replacement only if the unit is genuinely done.",
     LIVE + '/services/heating/', [
         ('wrench', 'Furnace and heater repair', 'Ignition, flame sensors, inducer motors and limit switches, found and fixed on the first visit where the part is on the van.', S + 'heating/heater-repair/'),
         ('boiler', 'Boiler service', 'Hot-water and steam boilers in vintage two-flats and converted lofts: pressure, circulators, zone valves, venting.', S + 'heating/boiler-service/'),
         ('install', 'Furnace installation and replacement', 'Sized to the unit, not the brochure. In a high-rise, routed around building rules on venting and access.', S + 'heating/heater-installation/'),
         ('maintenance', 'Heater maintenance', 'An autumn tune-up before the first cold snap: burners, heat exchanger check, filters, safeties.', S + 'heating/heater-maintenance/'),
         ('heatPump', 'Heat pumps', 'Repair and installation, including cold-climate units for townhomes moving off gas.', S + 'heating/heat-pump/'),
         ('hybrid', 'Hybrid heating systems', 'A heat pump paired with a gas furnace, switching over on the coldest days.', S + 'heating/hybrid-heating-systems/'),
         ('calendar', 'HVAC maintenance plans', 'Scheduled heating and cooling visits for buildings that want them on the calendar.', S + 'heating/hvac-maintenance-plans/'),
     ]),
    ('cooling', 'Cooling', 'Cooling', '', LIVE + '/services/cooling/', [
        ('cooling', 'Ductless HVAC services', '', S + 'cooling/ductless-hvac-service/'),
        ('cooling', 'Air conditioning repair', '', S + 'cooling/air-conditioning-repair/'),
        ('cooling', 'Air conditioning maintenance', '', S + 'cooling/air-conditioning-maintenance/'),
        ('cooling', 'Air conditioning installation', '', S + 'cooling/air-conditioning-installation/'),
        ('cooling', 'Cooling maintenance plans', '', S + 'cooling/cooling-maintenance-plans/'),
        ('cooling', 'Heat pump services', '', S + 'cooling/heat-pump-services/'),
    ]),
    ('airQuality', 'Air quality', 'Air quality', '', LIVE + '/services/air-quality/', [
        ('airQuality', 'Dehumidifier installation', '', S + 'air-quality/dehumidifier-installation/'),
        ('airQuality', 'Indoor air quality test', '', S + 'air-quality/indoor-air-quality-test/'),
        ('airQuality', 'Duct repair', '', S + 'air-quality/duct-repair/'),
        ('airQuality', 'Duct maintenance', '', S + 'air-quality/duct-maintenance/'),
        ('airQuality', 'Humidifier & air cleaner', '', S + 'air-quality/humidifier-air-cleaner/'),
    ]),
    ('commercial', 'Commercial', 'Commercial', '', LIVE + '/services/commercial/', [
        ('commercial', 'Commercial HVAC system installation', '', S + 'commercial/commercial-hvac-system-installation/'),
        ('commercial', 'Commercial HVAC system replacement', '', S + 'commercial/commercial-hvac-system-replacement/'),
        ('commercial', 'Emergency & routine commercial HVAC repairs', '', S + 'commercial/emergency-routine-commercial-hvac-repairs/'),
        ('commercial', 'Energy-efficient HVAC upgrades', '', S + 'commercial/energy-efficient-hvac-upgrades/'),
        ('commercial', 'Custom HVAC maintenance plan', '', S + 'commercial/custom-hvac-maintenance-plan/'),
        ('commercial', 'Ductwork design & repair services', '', S + 'commercial/ductwork-design-repair-services/'),
    ]),
]

STEPS = [
    ('1ZX1MZNPVM4QBDE0416B9TSFAE', 'You call, Rob listens', "Tell us the make of the furnace or condenser and what it's doing. A good description often narrows it down on the phone."),
    ('5R5WBATX6VT8MS1HWEGQP972J1', 'Pick a time', "We're available 24/7. If your building has rules on access, like elevator or work hours, tell us and we book around them."),
    ('0NY99S048Y1WPATAMB53MND9V4', 'On-site diagnosis', 'The technician finds the actual fault: ignition, pressure, refrigerant, airflow or controls.'),
    ('269649PEQD5G7XWGA0EE9AAH67', 'Honest price, repair first', 'You hear the price before any work. If the unit has years left, we say so and repair it.'),
    ('639HJXW5YG5799PS4X6V7WG89A', 'We fix it', 'Repairs done on the spot where the part is on the van. Installs are scheduled and quoted separately.'),
    ('4W6C9D3M0QTRJK8JVAH448ZBJX', 'Good to go', 'The system is tested through a full cycle before we leave, and you know what to watch for.'),
]
QUESTIONS = [
    ('Who diagnoses, and who quotes?', "If they're different people, ask who owns the outcome. Here it's Rob for both."),
    ('Is the technician on commission?', 'Commission on replacements changes what "your furnace is done" means.'),
    ('Does a permit count mean anything here?', "Not for repairs. Chicago doesn't permit HVAC repair or maintenance, so a permit count only measures installs."),
    ('What do the newest reviews say?', 'Read the last 20, not the top 5. Look for names and specifics.'),
    ('Will they tell you to keep it?', 'Ask if the unit has years left. Our reviewers record hearing "yes".'),
]
COMPANIES = [
    ('Family-owned, since 1952', "The owner answers and quotes. Limit: one family's capacity, so peak-winter days fill up.", True),
    ('National franchise', 'Response time is genuinely good. Limit: commission and price books shape the recommendation.', False),
    ('One-van independent', 'The work is often excellent. Limit: one person, so a January no-heat call can wait days.', False),
    ('Lead marketplace', "Several quotes fast. Limit: you don't choose who calls back, or who turns up.", False),
]
NAMES = ['Rob', 'Eddie', 'Carissa', 'Frank', 'Nate', 'Sam', 'Andy', 'Mike']


def live_chrome(name):
    """Live-site header or footer (assets/live/<name>.html, copied from citysuburbanheating.com/services/)."""
    return open(os.path.join(ROOT, 'assets', 'live', name + '.html'), encoding='utf-8').read().replace('{{ASSETS}}', A).replace('{{AREAS}}', '../')


def track_controls(label):
    return (f'<div class="cs-track-ctl"><div class="cs-progress" aria-hidden="true"><i></i></div>'
            f'<div class="cs-arrows"><button class="cs-arrow" type="button" data-prev aria-label="Previous {label}">{icon("left", 20, 2.2)}</button>'
            f'<button class="cs-arrow" type="button" data-next aria-label="Next {label}">{icon("right", 20, 2.2)}</button></div></div>')


def build(path):
    data = json.load(open(path, encoding='utf-8'))
    a, x = data['area'], data['extras']
    area, slug = a['_area'], a['_slug']
    get = lambda k: a.get(k, x.get(k, ''))
    building_opts = x.get('buildingTypeOptions') or [a['form.building_default']]

    # ── B1 Hero ──
    opts = ''.join(f'<option{" selected" if o == a["form.building_default"] else ""}>{e(o)}</option>' for o in building_opts)
    hero = f'''
<section class="cs-hero on-dark" style="background-image:linear-gradient(90deg,rgb(9 38 58 / 96%) 0%,rgb(9 38 58 / 88%) 55%,rgb(9 38 58 / 62%) 100%),url({A}5X6SBXHGCABFYFB3GFJ2CY4MYM.webp)" aria-labelledby="hero-title">
  <div class="cs-hero-copy">
    <nav class="cs-crumbs" aria-label="Breadcrumb">
      <ol><li><a href="{LIVE}/">Home</a></li><li><a href="../">Service area</a></li><li aria-current="page">{e(area)}</li></ol>
      <span class="cs-pill-red">{e(a["hero.pill"])}</span>
    </nav>
    <h1 class="cs-h1" id="hero-title">{e(a["hero.h1"])}</h1>
    <p class="cs-lede">{e(a["hero.lede"])}</p>
    <div class="cs-actions">
      <a class="cs-btn cs-btn-red" href="{TEL}">{icon("phone", 18, 2)}Call {PHONE}</a>
      <a class="cs-btn cs-btn-ghost" href="#request">Schedule service</a>
    </div>
  </div>
  <form class="cs-form" id="request" data-request novalidate aria-labelledby="request-title">
    <h2 id="request-title">{e(a["form.title"])}</h2>
    <p>The person who diagnoses your system is the person who quotes it.</p>
    <div class="cs-field"><label for="rq-name">Name</label><input id="rq-name" name="name" autocomplete="name"></div>
    <div class="cs-field"><label for="rq-phone">Phone</label><input id="rq-phone" name="phone" type="tel" autocomplete="tel" required aria-describedby="rq-phone-err"><span class="err" id="rq-phone-err" hidden>Enter a phone number so Rob can call you back.</span></div>
    <div class="cs-field"><label for="rq-building">Building type</label><select id="rq-building" name="building">{opts}</select></div>
    <div class="cs-field"><label for="rq-issue">What&#x27;s happening?</label><select id="rq-issue" name="issue"><option>No heat or no cooling</option><option>Strange noise or smell</option><option>Tune-up or maintenance</option><option>Replacement quote</option><option>Something else</option></select></div>
    <button class="cs-btn cs-btn-red" type="submit">Request a diagnosis</button>
    <p class="note">Price agreed before any work starts.</p>
    <p class="cs-form-msg" role="status" tabindex="-1" hidden>Thanks. This preview form isn&#x27;t connected yet, so nothing was sent. To book now, call <a href="{TEL}">{PHONE}</a>.</p>
  </form>
  <ul class="cs-trust" aria-label="Why City &amp; Suburban">
    <li><img src="{A}0Y37P9YTPNH15ZDCE4PW12VG43.webp" alt="" width="30" height="30">Chicago local</li>
    <li class="sep" aria-hidden="true"></li>
    <li><img src="{A}0R2Q53YS21PSNM0F8J8YP2J7GK.webp" alt="" width="30" height="30">Family owned</li>
    <li class="sep" aria-hidden="true"></li>
    <li><img src="{A}7C75KE7W0X79KM9WDYFEMBBMPZ.webp" alt="" width="30" height="30">Since 1952</li>
    <li class="sep" aria-hidden="true"></li>
    <li class="rating"><b>4.98</b><span class="cs-stars" aria-label="5 stars">★★★★★</span><small>204 Google reviews</small></li>
  </ul>
</section>'''

    # ── B2 Services ──
    tabs, panels = [], []
    for i, (key, name, title, lede, group_url, items) in enumerate(GROUPS):
        sel = 'true' if i == 0 else 'false'
        tabs.append(f'<button class="cs-tab" role="tab" type="button" id="tab-{key}" aria-controls="panel-{key}" aria-selected="{sel}" tabindex="{0 if i == 0 else -1}">'
                    f'<span class="ic">{icon(key)}</span><span class="name">{e(name)}</span><span class="count">{len(items)}</span></button>')
        tiles = ''.join(
            f'<li><a class="cs-tile" href="{u}"><span class="ic">{icon(ic, 22, 1.7)}</span><div><h4>{e(t)}</h4>'
            + (f'<p>{e(d)}</p>' if d else '<span class="more">See the service →</span>') + '</div></a></li>'
            for ic, t, d, u in items)
        lede_html = f'<p>{e(lede)}</p>' if lede else f'<p><a href="{group_url}" style="color:var(--color-blue);font-weight:600">All {e(name.lower())} services →</a></p>'
        panels.append(f'<div class="cs-panel" role="tabpanel" id="panel-{key}" aria-labelledby="tab-{key}"{"" if i == 0 else " hidden"}>'
                      f'<div><h3>{e(title)}</h3>{lede_html}</div><ul class="cs-tiles">{tiles}</ul></div>')
    services = f'''
<section class="cs-services" aria-labelledby="services-title">
  <div class="cs-services-head">
    <span class="cs-pill-light">From city to suburbs</span>
    <h2 id="services-title">{e(a["services.heading"])}</h2>
    <p>24 services in four groups, from a furnace that won&#x27;t light to a restaurant&#x27;s make-up air unit.</p>
  </div>
  <div class="cs-services-card" data-tabs>
    <div class="cs-tabs">
      <div class="cs-tablist" role="tablist" aria-orientation="vertical" aria-label="Service groups">{"".join(tabs)}</div>
      <div class="cs-urgent"><b>No heat in January?</b><span>Call <a href="{TEL}" style="font-weight:700;color:var(--color-navy)">{PHONE}</a>. Tell us the furnace or boiler make and what it&#x27;s doing.</span></div>
    </div>
    {"".join(panels)}
  </div>
</section>'''

    # ── B3 Who you're calling ──
    licence_tile = ('\n    <div class="cs-fact fog"><span class="label">Licence</span>'
                    f'<div><div class="mid">{e(LICENCE)}</div><p>City of Chicago business licence.</p></div></div>') if LICENCE else ''
    owner = f'''
<section class="cs-sec cs-owner" aria-labelledby="owner-title">
  <div class="cs-owner-copy">
    <p class="cs-eyebrow">Who you&#x27;re calling</p>
    <h2 id="owner-title" class="cs-h2">One family. Second generation. Since 1952.</h2>
    <p>{e(a["who.copy"])}</p>
    <div class="cs-names"><small>Names our reviewers remember</small><ul>{"".join(f"<li>{n}</li>" for n in NAMES)}</ul></div>
  </div>
  <div class="cs-facts">
    <div class="cs-fact navy"><span class="label">Founded</span><div><div class="big">1952</div><p>74 years, family owned, now in its second generation.</p></div></div>
    <div class="cs-fact red"><span class="label">Google rating</span><div><div class="big">4.98</div><p>Across 204 Google reviews, as of 31 Aug 2026.</p></div></div>
    <div class="cs-fact fog{'' if LICENCE else ' wide'}"><span class="label">Who answers</span><div><div class="mid">Rob, the owner</div><p>Owner-operator. He runs the calls himself, so the person who quotes is the person accountable.</p></div></div>{licence_tile}
  </div>
</section>'''

    # ── B4 Reviews ──
    cards = []
    for i in range(1, 5):
        quote, by, tag, url = a[f'reviews.{i}.quote'], a[f'reviews.{i}.by'], a[f'reviews.{i}.tag'], x.get(f'reviews.{i}.url')
        body = f'<p class="cs-confirm">{e(quote)}</p>' if quote.startswith('[CONFIRM') else f'<blockquote>{e(quote)}</blockquote>'
        link = f'<a href="{e(url)}" target="_blank" rel="noopener">Read on Google</a>' if url else '<span style="color:var(--color-muted);font-size:14px;font-weight:600">Read on Google</span>'
        cards.append(f'<li class="cs-review"><header><span class="cs-stars" aria-label="5 stars">★★★★★</span><span class="cs-tag">{e(tag)}</span></header>{body}<footer><b>{e(by)}</b>{link}</footer></li>')
    reviews = f'''
<section class="cs-sec cs-fog cs-reviews" aria-labelledby="reviews-title">
  <div class="cs-head-row">
    <div class="cs-head"><p class="cs-eyebrow">What customers say</p><h2 id="reviews-title" class="cs-h2">Why Chicago homeowners keep calling the same family</h2></div>
    <p class="cs-aside">Quoted word for word from Google, never edited. Several reviewers were told their old unit still had years left.</p>
  </div>
  <div class="cs-track-wrap" data-track>
    <ul class="cs-track" tabindex="0" aria-label="Reviews: use the arrows or scroll sideways">{"".join(cards)}</ul>
    {track_controls("review")}
  </div>
</section>'''

    process = '''
<section class="cs-sec cs-stack" aria-labelledby="process-title">
  <div class="cs-head"><p class="cs-eyebrow">What happens when you call</p><h2 id="process-title" class="cs-h2">From the first call to a warm apartment, in six steps</h2></div>
  <ol class="cs-steps">''' + ''.join(
        f'<li class="cs-step"><header><img src="{A}{img}.webp" alt="" height="52"><span>{n:02d}</span></header><h3>{e(t)}</h3><p>{e(d)}</p></li>'
        for n, (img, t, d) in enumerate(STEPS, 1)) + '</ol>\n</section>'

    factors = ''.join(f'<div class="row" role="row"><span class="k" role="cell">{e(a[f"scope.{i}.factor"])}</span><span class="v" role="cell">{e(a[f"scope.{i}.why"])}</span></div>' for i in range(1, 7))
    price = f'''
<section class="cs-sec cs-navy cs-price on-dark" aria-labelledby="price-title">
  <div class="cs-price-copy">
    <p class="cs-eyebrow">What changes the price</p>
    <h2 id="price-title" class="cs-h2">{e(a["scope.heading"])}</h2>
    <p>We don&#x27;t publish a price book, and we&#x27;re not going to invent one here. What we can show you is what moves the number.</p>
    <div class="cs-median"><b>$6,807</b><p>Median reported value of 81 central-furnace replacement permits in Chicago over 24 months. That&#x27;s the whole project&#x27;s construction value, not a quote.</p></div>
  </div>
  <div class="cs-factors" role="table" aria-label="What moves the price">
    <div class="row th" role="row"><span class="k" role="columnheader">Factor</span><span class="v" role="columnheader">Why it changes the work</span></div>{factors}
  </div>
</section>'''

    choose = f'''
<section class="cs-sec cs-fog cs-stack" aria-labelledby="choose-title">
  <div class="cs-head-row">
    <div class="cs-head"><p class="cs-eyebrow">How to choose</p><h2 id="choose-title" class="cs-h2">{e(a["choose.heading"])}</h2></div>
    <p class="cs-aside">Ask them of anyone you call, including us.</p>
  </div>
  <ol class="cs-cards">''' + ''.join(f'<li class="cs-q"><span class="n">Q{i}</span><h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, (t, d) in enumerate(QUESTIONS, 1)) + '</ol>\n</section>'

    companies = '''
<section class="cs-sec cs-stack" aria-labelledby="companies-title">
  <div class="cs-head"><p class="cs-eyebrow">Kinds of HVAC company</p><h2 id="companies-title" class="cs-h2">Who you&#x27;ll meet, and what limits each of them</h2></div>
  <ul class="cs-cards">''' + ''.join(
        f'<li class="cs-co{" us" if us else ""}">{"<span class=flag>This is us</span>" if us else ""}<h3>{e(t)}</h3><p>{e(d)}</p></li>' for t, d, us in COMPANIES) + '</ul>\n</section>'

    dcards = ''
    for i in range(1, 5):
        hv = get(f'districts.{i}.hvac')
        dcards += (f'<li class="cs-district"><h3>{e(a[f"districts.{i}.name"])}</h3><p>{e(a[f"districts.{i}.intro"])}</p>'
                   + (f'<p class="here">{e(hv)}</p>' if hv else '') + '</li>')
    label = a['districts.label'].lower().replace(area.lower(), area)
    label = label[0].upper() + label[1:]
    districts = f'''
<section class="cs-sec cs-fog cs-stack" style="gap:32px" aria-labelledby="districts-title">
  <div class="cs-head-row">
    <div class="cs-head"><p class="cs-eyebrow">{e(label)}</p><h2 id="districts-title" class="cs-h2">{e(a["districts.heading"])}</h2></div>
    <ul class="cs-chips"><li>{e(a["districts.chip1"])}</li><li>{e(a["districts.chip2"])}</li><li>{e(a["districts.chip3"])}</li></ul>
  </div>
  <div class="cs-track-wrap" data-track>
    <ul class="cs-track" style="gap:16px" tabindex="0" aria-label="Districts: use the arrows or scroll sideways">{dcards}</ul>
    {track_controls("district")}
  </div>
</section>'''

    buildings = f'''
<section class="cs-sec cs-stack" style="gap:32px" aria-labelledby="buildings-title">
  <div class="cs-head"><p class="cs-eyebrow">Your building type</p><h2 id="buildings-title" class="cs-h2">{e(a["buildings.heading"])}</h2></div>
  <ul class="cs-cards">''' + ''.join(
        f'<li class="cs-bt"><span class="tag">{e(a[f"buildings.{i}.tag"])}</span><h3>{e(a[f"buildings.{i}.title"])}</h3><p>{e(a[f"buildings.{i}.body"])}</p></li>' for i in range(1, 5)) + '</ul>\n</section>'

    permits = f'''
<section class="cs-sec cs-permits on-dark" aria-labelledby="permits-title">
  <div class="cs-permits-copy">
    <p class="cs-eyebrow">The permit record, honestly</p>
    <h2 id="permits-title" class="cs-h2">Why you won&#x27;t find us in the City&#x27;s permit file</h2>
    <p>Chicago doesn&#x27;t require a permit to repair, diagnose or maintain heating and cooling, which is most of what we do. The permit file measures construction, not service. So when a company waves a permit count at you, ask how much of their work is repair.</p>
  </div>
  <ul class="cs-stats">
    <li><b>{e(a["permits.area_count"])}</b><span>{e(a["permits.area_text"])}</span></li>
    <li><b>1,539</b><span>Firms that pull HVAC permits citywide, across 4,888 permits in 24 months.</span></li>
    <li><b>0</b><span>Permits on record for City &amp; Suburban. We said we&#x27;d be honest.</span></li>
  </ul>
</section>'''

    faqs = ''.join(f'<details{" open" if i == 1 else ""}><summary>{e(a[f"faq.{i}.q"])}</summary><p>{e(get(f"faq.{i}.a"))}</p></details>' for i in range(1, 6))
    faq = f'''
<section class="cs-sec cs-faq" aria-labelledby="faq-title">
  <div class="cs-head"><p class="cs-eyebrow">Questions</p><h2 id="faq-title" class="cs-h2">{e(a["faq.heading"])}</h2></div>
  <div class="cs-faq-list">{faqs}</div>
</section>'''

    cta = f'''
<section class="cs-cta-wrap" aria-labelledby="cta-title">
  <div class="cs-cta on-dark">
    <div><h2 id="cta-title">No heat, no cooling, or just a question?</h2><p>{e(a["cta.body"])}</p></div>
    <div class="cs-actions">
      <a class="cs-btn cs-btn-red" href="{TEL}">{icon("phone", 18, 2)}Call {PHONE}</a>
      <a class="cs-btn cs-btn-ghost" href="#request">Schedule service</a>
    </div>
  </div>
</section>'''

    title = x.get('seo.title') or a['hero.h1']
    desc = x.get('seo.description') or a['hero.lede']
    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="icon" href="{A}6FN1CP4RYC9MBCFR4H39DJ8HAE.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Ubuntu:wght@500;700&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="{A}5X6SBXHGCABFYFB3GFJ2CY4MYM.webp">
<link rel="stylesheet" href="{A}live-chrome.css">
<link rel="stylesheet" href="{A}area-page.css">
</head>
<body>
<div class="pbar">
  <span class="t">Service area page · {e(area)} · draft v1</span>
  <span class="acts"><a href="../">&larr; All service areas</a><a href="{UP}playbook/">Playbook</a></span>
</div>
{live_chrome("header")}
<div class="cs">
<main>{hero}{services}{owner}{reviews}{process}{price}{choose}{companies}{districts}{buildings}{permits}{faq}{cta}
</main>
</div>
{live_chrome("footer")}
<script src="{A}area-page.js"></script>
</body>
</html>
'''
    out = os.path.join(ROOT, 'services-v1', 'service-areas', slug, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page)
    print('wrote', os.path.relpath(out, ROOT), len(page))


if __name__ == '__main__':
    build(sys.argv[1])
